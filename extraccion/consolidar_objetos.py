# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27", "pyyaml>=6.0", "jsonschema>=4.0"]
# ///
"""
DEPRECADO — consumía la capa de "ideas", ya no usada. Hoy las políticas + instrumentos salen directo
del markdown con el workflow de Claude (extraccion/rebuild-ctei-claude.workflow.js; antes,
extraer_instrumentos.py). Se conserva como referencia histórica. Ver docs/pipeline-extraccion.md.

Consolidación de INSTRUMENTOS DE POLÍTICA PÚBLICA (capa de análisis del mapa del laboratorio).

Marco: "instrumento de política pública" (Lascoumes & Le Galès, 2004; Hood, 1983). En el código
el nodo se llama `objeto` por compatibilidad histórica con el schema; el término de dominio es
instrumento de política pública.

La extracción produce IDEAS (evidencia, por-entidad/periodo/chunk). Este paso ve TODAS
las ideas de las dos vigencias a la vez y las consolida en INSTRUMENTOS DE POLÍTICA PÚBLICA:
entidades con nombre e identidad propia que persisten (o no) entre gobiernos — programas, normas,
fuentes de financiación, apuestas, sistemas. La idea queda como su evidencia.

Dos pasadas de Gemini:
  1) inducir + resolución de entidades: ideas -> catálogo canónico de objetos (con clase y
     alias), cada uno con los ids de idea que lo evidencian. Con tope (guardarraíl anti-ruido).
  2) relacionar objetos: aristas dirigidas entre objetos DISTINTOS (sinergia/financia/
     habilita/depende-de) + marca de tensión (objeto que persiste pero invierte de rumbo).

Todo lo que los datos ya determinan es DETERMINISTA (sin LLM): presencia por vigencia,
diacronía (redundancia/unicidad), facetas, entidades, evidencia con página y cifras.

Salida: data/sectores/<slug>/objetos.{yaml,json}, conforme a data/schema/objeto.schema.json.

Uso: uv run consolidar_objetos.py --slug ciencia-tecnologia
"""
from __future__ import annotations
import argparse, json, os, sys, time, unicodedata, re
from collections import Counter
from pathlib import Path
import httpx, yaml
from jsonschema import Draft202012Validator

sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def _load_key():
    """Key de Gemini. Convención del proyecto: .env con GEMINI_API_KEY=...
    Fallback a la variable de entorno y a .secrets/gemini_key.txt (legacy) para no romper."""
    env = Path(".env")
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            s = line.strip()
            if s.startswith("GEMINI_API_KEY") and "=" in s:
                return s.split("=", 1)[1].strip().strip('"').strip("'")
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()
    legacy = Path(".secrets/gemini_key.txt")
    if legacy.exists():
        return legacy.read_text(encoding="utf-8").strip()
    sys.exit("Falta la key de Gemini: crea un .env con GEMINI_API_KEY=... (ver .env.example)")


KEY = _load_key()
TAX = yaml.safe_load(Path("data/schema/taxonomia.yaml").read_text(encoding="utf-8"))
SCHEMA = json.loads(Path("data/schema/objeto.schema.json").read_text(encoding="utf-8"))
PERIODOS = ["2018-2022", "2022-2026"]
CLASES = list(TAX["objetos"]["clase"]["valores"].keys())
REL_OBJ = list(TAX["objetos"]["relaciones"].keys())
# prioridad de 'modo' para elegir el dominante de un objeto en un periodo (más fuerte primero)
PRIO_TIPO = ["apuesta", "estructura", "programa", "logro", "pendiente", "diagnostico"]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "objeto"


def call_gemini(modelo, prompt, response_schema, max_tokens=40000, thinking=4096):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent"
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": max_tokens,
                                 "responseMimeType": "application/json",
                                 "responseSchema": response_schema,
                                 "thinkingConfig": {"thinkingBudget": thinking}}}
    for intento in range(4):
        try:
            r = httpx.post(url, headers={"x-goog-api-key": KEY}, json=body, timeout=600.0, verify=False)
            if r.status_code == 200:
                raw = "".join(p.get("text", "") for p in r.json()["candidates"][0]["content"]["parts"])
                return json.loads(raw)
            print(f"  HTTP {r.status_code}: {r.text[:180]}", file=sys.stderr)
        except Exception as e:
            print(f"  error: {e}", file=sys.stderr)
        time.sleep(2 ** intento * 3)
    return None


# ---------------------------------------------------------------- pasada 1: inducir objetos
def schema_induccion():
    S = lambda **k: k
    return {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
        "nombre": S(type="STRING"),
        "clase": S(type="STRING", enum=CLASES),
        "alias": S(type="ARRAY", items=S(type="STRING")),
        "evidencia_ids": S(type="ARRAY", items=S(type="STRING")),
    }, "required": ["nombre", "clase", "evidencia_ids"],
        "propertyOrdering": ["nombre", "clase", "alias", "evidencia_ids"]}}


def prompt_induccion(ideas, tope):
    voc = "; ".join(f"{k}={v}" for k, v in TAX["objetos"]["clase"]["valores"].items())
    compact = [{"id": x["id"], "vigencia": x.get("_vigencia", ""),
                "tema": x["tema"], "tipo": x["tipo"], "enunciado": x["enunciado"],
                "tags": x.get("tags", [])} for x in ideas]
    return f"""Estas son IDEAS extraídas de informes de empalme de dos gobiernos de un mismo sector
colombiano. Induce los INSTRUMENTOS DE POLÍTICA PÚBLICA subyacentes: entidades con nombre e
identidad propia que existen independientes de cualquier idea y que pueden persistir entre
gobiernos — programas, misiones, normas, fuentes de financiación, apuestas temáticas, sistemas.

Reglas:
- RESOLUCIÓN DE ENTIDADES: si un mismo instrumento aparece nombrado de formas distintas (en tags o
  en el enunciado), fúndelo en UNA sola entrada con su nombre canónico y las variantes en 'alias'.
- Asigna 'clase' (una de: {voc}).
- 'evidencia_ids': los ids de TODAS las ideas que evidencian ese instrumento (de una o ambas vigencias).
  Una idea puede evidenciar varios instrumentos; un instrumento se apoya en varias ideas.
- Extrae solo instrumentos de PRIMER NIVEL con identidad real. NO crees uno por cada idea ni por
  menciones genéricas ("gestión", "seguimiento"). Máximo {tope} instrumentos; prioriza los que cruzan
  ambos gobiernos y los sustantivos (apuestas, normas estructurantes, programas insignia, fuentes).
- Usa EXCLUSIVAMENTE ids que aparezcan en la lista. No inventes ids.

IDEAS:
{json.dumps(compact, ensure_ascii=False)}"""


# ---------------------------------------------------------------- pasada 2: relacionar objetos
def schema_relaciones():
    S = lambda **k: k
    return {"type": "OBJECT", "properties": {
        "relaciones": S(type="ARRAY", items={"type": "OBJECT", "properties": {
            "source": S(type="STRING"), "target": S(type="STRING"),
            "tipo": S(type="STRING", enum=REL_OBJ), "nota": S(type="STRING"),
        }, "required": ["source", "target", "tipo"],
            "propertyOrdering": ["source", "target", "tipo", "nota"]}),
        "tensiones": S(type="ARRAY", items=S(type="STRING")),
    }, "propertyOrdering": ["relaciones", "tensiones"]}


def prompt_relaciones(objetos):
    voc = "; ".join(f"{k}={v}" for k, v in TAX["objetos"]["relaciones"].items())
    cat = [{"id": o["id"], "nombre": o["nombre"], "clase": o["clase"],
            "vigencias": sorted(o["presencia"].keys())} for o in objetos]
    return f"""Estos son INSTRUMENTOS DE POLÍTICA PÚBLICA de un sector colombiano a lo largo de dos gobiernos.
Identifica RELACIONES DIRIGIDAS entre instrumentos DISTINTOS (nunca de uno consigo mismo).
Tipos (usa exactamente estos): {voc}.
Cada relación: 'source' y 'target' (ids del catálogo), 'tipo', y 'nota' breve.

Además, en 'tensiones' lista los ids de instrumentos que están presentes en AMBAS vigencias pero que
INVIERTEN de rumbo/signo entre gobiernos (una política que se revierte, se reemplaza o cambia de
sentido). Solo esos; no los de simple continuidad.

Usa EXCLUSIVAMENTE ids del catálogo. Apunta a las relaciones sustantivas, no exhaustivas.

CATÁLOGO DE INSTRUMENTOS:
{json.dumps(cat, ensure_ascii=False)}"""


# ---------------------------------------------------------------- consolidación determinista
def consolidar(slug_sector, ideas_por_periodo, inducidos):
    idx = {it["id"]: (per, it) for per, ideas in ideas_por_periodo.items() for it in ideas}
    objetos, ids_vistos = [], set()
    descartados_sin_evidencia = 0
    for obj in inducidos:
        ev_ids = [i for i in dict.fromkeys(obj.get("evidencia_ids", [])) if i in idx]  # dedup + real
        if not ev_ids:
            descartados_sin_evidencia += 1
            continue
        oid = slug(obj["nombre"])
        while oid in ids_vistos:
            oid += "-x"
        ids_vistos.add(oid)

        por_per = {}   # periodo -> lista de ideas evidencia
        for i in ev_ids:
            per, it = idx[i]
            por_per.setdefault(per, []).append(it)

        presencia = {}
        for per, its in por_per.items():
            tipos = [x["tipo"] for x in its]
            modo = min((t for t in tipos), key=lambda t: PRIO_TIPO.index(t) if t in PRIO_TIPO else 99)
            presencia[per] = {"activo": True, "modo": modo}

        facetas = sorted({x["tema"] for i in ev_ids for _, x in [idx[i]]})
        entidades = sorted({x.get("entidad", "") for i in ev_ids for _, x in [idx[i]] if x.get("entidad")})
        evidencia = [{"idea_id": i, "vigencia": idx[i][0],
                      "paginas": idx[i][1].get("evidencia", {}).get("paginas", []),
                      "cifras": idx[i][1].get("cifras", [])} for i in ev_ids]
        diacronia = "redundancia" if len(presencia) == 2 else "unicidad"

        objetos.append({
            "id": oid, "nombre": obj["nombre"], "clase": obj["clase"],
            "alias": obj.get("alias", []), "presencia": presencia, "diacronia": diacronia,
            "facetas": facetas, "entidades": entidades, "evidencia": evidencia,
        })
    return objetos, descartados_sin_evidencia


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--modelo", default="gemini-flash-latest")
    ap.add_argument("--tope", type=int, default=40, help="máximo de objetos (guardarraíl anti-ruido)")
    args = ap.parse_args()
    base = Path("data/sectores") / args.slug

    ideas_por_periodo, todas = {}, []
    for per in PERIODOS:
        p = base / per / "ideas.yaml"
        if p.exists():
            ideas = yaml.safe_load(p.read_text(encoding="utf-8"))
            for it in ideas:
                it["_vigencia"] = per
            ideas_por_periodo[per] = ideas
            todas += ideas
    if not todas:
        print(f"! {args.slug}: sin ideas.yaml", file=sys.stderr); sys.exit(2)
    print(f"Consolidando objetos de {len(todas)} ideas ({', '.join(f'{p}:{len(v)}' for p,v in ideas_por_periodo.items())})...")

    # pasada 1
    inducidos = call_gemini(args.modelo, prompt_induccion(todas, args.tope), schema_induccion())
    if inducidos is None:
        print("FALLÓ la inducción de objetos", file=sys.stderr); sys.exit(1)
    print(f"  inducidos: {len(inducidos)} candidatos")
    objetos, descartados = consolidar(args.slug, ideas_por_periodo, inducidos)
    ids = {o["id"] for o in objetos}
    print(f"  consolidados: {len(objetos)} objetos ({descartados} descartados sin evidencia válida)")

    # pasada 2
    rel_doc = call_gemini(args.modelo, prompt_relaciones(objetos), schema_relaciones()) or {}
    relaciones = [r for r in rel_doc.get("relaciones", [])
                  if r.get("source") in ids and r.get("target") in ids and r["source"] != r["target"]]
    tensiones = {t for t in rel_doc.get("tensiones", []) if t in ids}
    redundantes = {o["id"] for o in objetos if o["diacronia"] == "redundancia"}
    for o in objetos:                                   # tensión solo sobre objetos que persisten
        if o["id"] in tensiones and o["id"] in redundantes:
            o["diacronia"] = "tension"
    print(f"  relaciones entre objetos: {len(relaciones)} | tensiones marcadas: {len(tensiones & redundantes)}")

    doc = {"sector": args.slug, "objetos": objetos, "relaciones": relaciones}
    errs = sorted(Draft202012Validator(SCHEMA).iter_errors(doc), key=lambda e: list(e.path))
    if errs:
        print(f"⚠ {len(errs)} problemas de validación; primero: {errs[0].message[:120]}", file=sys.stderr)

    (base / "objetos.yaml").write_text(
        yaml.safe_dump(doc, allow_unicode=True, sort_keys=False, width=100), encoding="utf-8")
    (base / "objetos.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n{len(objetos)} objetos -> {base}/objetos.yaml")
    print("por clase:", dict(Counter(o["clase"] for o in objetos)))
    print("por diacronía:", dict(Counter(o["diacronia"] for o in objetos)))


if __name__ == "__main__":
    main()
