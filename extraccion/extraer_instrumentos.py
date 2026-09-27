# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27", "pyyaml>=6.0", "jsonschema>=4.0"]
# ///
"""
Extracción de POLÍTICAS PÚBLICAS + INSTRUMENTOS directo de los informes de empalme.

Reemplaza el pipeline heredado (ideas -> objetos). Va del markdown a la capa de análisis del mapa
usando el vocabulario del encuadre (docs/encuadre-actividad-trama.md):

  - Instrumento clasificado por TIPO NATO (Hood): nodalidad / autoridad / tesoro / organizacion.
  - Objetivo de política vs instrumento; ambos agrupados por POLÍTICA PÚBLICA.
  - Presencia por vigencia con modo (propuesto / logrado / pendiente).
  - MODO DE CAMBIO entre gobiernos (Mahoney & Thelen + deriva): terminacion/estratificacion
    (deterministas, por presencia) y continuidad-estable/conversion/reversion/deriva (semántico).
  - Relaciones dirigidas entre instrumentos: habilita / financia / depende-de / encadena.

Tres etapas de Gemini + consolidación determinista:
  A) por vigencia: markdown del informe principal -> políticas + instrumentos de ESE periodo.
  B1) resolución de entidades: unifica el mismo instrumento entre vigencias -> catálogo canónico.
  B2) relaciones + modo de cambio (para los presentes en ambas vigencias).

Salida: data/sectores/<slug>/objetos.{yaml,json}, conforme a data/schema/objeto.schema.json.
Intermedios: data/sectores/<slug>/<periodo>/instrumentos.json.

Uso:
  uv run extraccion/extraer_instrumentos.py --slug ciencia-tecnologia --match Ciencia

La key de Gemini sale de .env (GEMINI_API_KEY=...), o de la variable de entorno, o de
.secrets/gemini_key.txt (legacy).
"""
from __future__ import annotations
import argparse, json, os, re, sys, time, unicodedata
from collections import Counter
from pathlib import Path
import httpx, yaml
from jsonschema import Draft202012Validator

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(".")
PERIODOS = ["2018-2022", "2022-2026"]
MAX_CHARS = 900_000  # tope por informe; los de CTeI (~257KB/455KB) caben enteros


def _load_key() -> str:
    """Convención del proyecto: .env con GEMINI_API_KEY=... (fallback a env var y .secrets/)."""
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
NATO = list(TAX["objetos"]["tipo_nato"]["valores"].keys())
MODO_PRES = list(TAX["objetos"]["modo_presencia"]["valores"].keys())
REL = list(TAX["objetos"]["relaciones"].keys())
# modo_cambio para los que están en AMBAS vigencias (los de un solo periodo son deterministas)
CAMBIO_AMBAS = ["continuidad-estable", "conversion", "reversion", "deriva"]
# prioridad para elegir el modo dominante de una vigencia si hay varias evidencias
PRIO_MODO = ["logrado", "propuesto", "pendiente"]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "x"


def call_gemini(modelo, prompt, response_schema, max_tokens=45000, thinking=2048):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent"
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": max_tokens,
                                 "responseMimeType": "application/json",
                                 "responseSchema": response_schema,
                                 "thinkingConfig": {"thinkingBudget": thinking}}}
    for intento in range(6):
        try:
            r = httpx.post(url, headers={"x-goog-api-key": KEY}, json=body, timeout=600.0, verify=False)
            if r.status_code == 200:
                cand = r.json()["candidates"][0]
                raw = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
                fr = cand.get("finishReason", "")
                if fr not in ("STOP", ""):
                    print(f"    ⚠ finishReason={fr} (puede venir truncado)", file=sys.stderr)
                return json.loads(raw) if raw.strip() else None
            print(f"  HTTP {r.status_code}: {r.text[:200]}", file=sys.stderr)
        except Exception as e:
            print(f"  error: {e}", file=sys.stderr)
        time.sleep(min(2 ** intento * 3, 45))
    return None


def discover(match: str):
    """(periodo, entidad, path_md) de los informes PRINCIPALES de un sector (excluye anexos)."""
    out, m = [], slug(match)
    for periodo in PERIODOS:
        base = ROOT / "markdown" / periodo
        if not base.exists():
            continue
        for sect_dir in base.iterdir():
            if m not in slug(sect_dir.name):
                continue
            for ent_dir in sect_dir.iterdir():
                if not ent_dir.is_dir():
                    continue
                for p in ent_dir.glob("*.pdf.md"):
                    if not p.name.lower().startswith("anexo"):
                        out.append((periodo, ent_dir.name.replace("_", " "), p))
    return out


def _cifras(raw):
    return [c for c in (raw or []) if isinstance(c, dict) and c.get("texto")]


# ---------------------------------------------------------------- etapa A: inducir por vigencia
def schema_periodo():
    S = lambda **k: k
    instrumento = S(type="OBJECT", properties={
        "nombre": S(type="STRING"),
        "es_objetivo": S(type="BOOLEAN"),
        "tipo_nato": S(type="STRING", enum=NATO),
        "politica": S(type="STRING"),
        "modo_presencia": S(type="STRING", enum=MODO_PRES),
        "paginas": S(type="ARRAY", items=S(type="INTEGER")),
        "cifras": S(type="ARRAY", items=S(type="OBJECT", properties={
            "metrica": S(type="STRING"), "valor": S(type="NUMBER"),
            "unidad": S(type="STRING"), "texto": S(type="STRING")}, required=["texto"])),
        "alias": S(type="ARRAY", items=S(type="STRING")),
        "entidades": S(type="ARRAY", items=S(type="STRING")),
    }, required=["nombre", "es_objetivo", "politica", "modo_presencia"],
        propertyOrdering=["nombre", "es_objetivo", "tipo_nato", "politica", "modo_presencia",
                          "paginas", "cifras", "alias", "entidades"])
    return S(type="OBJECT", properties={
        "politicas": S(type="ARRAY", items=S(type="OBJECT", properties={
            "nombre": S(type="STRING"), "objetivo": S(type="STRING")},
            required=["nombre"], propertyOrdering=["nombre", "objetivo"])),
        "instrumentos": S(type="ARRAY", items=instrumento),
    }, required=["politicas", "instrumentos"], propertyOrdering=["politicas", "instrumentos"])


def prompt_periodo(entidad, periodo, texto):
    nato = "; ".join(f"{k}={v}" for k, v in TAX["objetos"]["tipo_nato"]["valores"].items())
    pres = "; ".join(f"{k}={v}" for k, v in TAX["objetos"]["modo_presencia"]["valores"].items())
    return f"""Eres analista de política pública colombiana. Lee este informe de empalme de "{entidad}"
del periodo {periodo} e identifica las POLÍTICAS PÚBLICAS y sus INSTRUMENTOS.

Una POLÍTICA PÚBLICA es un objetivo/problema público que se persigue con VARIOS instrumentos
(p. ej. una Misión, una apuesta temática como Inteligencia Artificial). Devuelve en 'politicas'
cada una con 'nombre' y 'objetivo' (el problema o prioridad que persigue).

Un INSTRUMENTO de política pública es el medio concreto con que el Estado actúa. Clasifícalo por
TIPO NATO (el recurso que moviliza): {nato}.
Distingue 'es_objetivo': true si el ítem es el OBJETIVO/apuesta de política (no lleva tipo_nato);
false si es un instrumento (programa, norma, fondo, convocatoria, sistema — sí lleva tipo_nato).

Para cada instrumento u objetivo:
- 'politica': el nombre de la política a la que pertenece (debe estar en 'politicas').
- 'modo_presencia' (cómo se manifestó en ESTE periodo): {pres}.
- 'paginas': números de página (## Página N) que lo evidencian.
- 'cifras': cantidades citadas (con 'texto' tal cual; metrica/valor/unidad si se pueden).
- 'alias': variantes de nombre; 'entidades': entidad(es) responsable(s).

Reglas: extrae solo instrumentos de PRIMER NIVEL con identidad propia (no menciones genéricas como
"gestión" o "seguimiento"). Sé exhaustivo pero sin redundancia. Usa EXACTAMENTE los códigos dados.

===INFORME ({periodo})===
{texto}"""


# ---------------------------------------------------------------- etapa B1: resolución de entidades
def schema_resolucion():
    S = lambda **k: k
    return S(type="OBJECT", properties={
        "politicas": S(type="ARRAY", items=S(type="OBJECT", properties={
            "nombre": S(type="STRING"), "objetivo": S(type="STRING")},
            required=["nombre"], propertyOrdering=["nombre", "objetivo"])),
        "canonicos": S(type="ARRAY", items=S(type="OBJECT", properties={
            "nombre": S(type="STRING"),
            "es_objetivo": S(type="BOOLEAN"),
            "tipo_nato": S(type="STRING", enum=NATO),
            "politicas": S(type="ARRAY", items=S(type="STRING")),
            "alias": S(type="ARRAY", items=S(type="STRING")),
            "miembros": S(type="ARRAY", items=S(type="STRING")),
        }, required=["nombre", "es_objetivo", "politicas", "miembros"],
            propertyOrdering=["nombre", "es_objetivo", "tipo_nato", "politicas", "alias", "miembros"])),
    }, required=["canonicos"], propertyOrdering=["politicas", "canonicos"])


def prompt_resolucion(items, politicas):
    compact = [{"ref": it["_ref"], "vigencia": it["_vigencia"], "nombre": it["nombre"],
                "es_objetivo": it.get("es_objetivo", False), "tipo_nato": it.get("tipo_nato"),
                "politica": it.get("politica", ""), "alias": it.get("alias", [])} for it in items]
    return f"""Estos son instrumentos y objetivos de política extraídos de DOS gobiernos de un mismo
sector colombiano (cada uno con su 'ref' y 'vigencia'). El resultado es una RED BIPARTITA entre
políticas e instrumentos. Resuelve entidades con PRECISIÓN: ni sobre-fusionar ni sub-fusionar.

1) FUSIONA dos o más 'ref' en UN canónico SOLO si son el MISMO instrumento concreto (el mismo fondo,
   programa, norma o sistema), aunque lo renombren entre gobiernos. Requisitos para fusionar:
   - mismo 'tipo_nato' y misma FUNCIÓN/mecanismo (no solo el mismo tema o palabras compartidas), y
   - misma identidad institucional (mismo fondo/sistema/programa), no solo parecido de nombre.
   SÍ fusiona (busca activamente estas continuidades reales entre gobiernos, aunque cambie el nombre o
   el año/número de la convocatoria):
   - un fondo o fuente de larga data y sus convocatorias/OCAD como UNA sola fuente (p. ej. la
     Asignación CTeI del SGR y sus OCAD/convocatorias anuales = un instrumento de tesoro);
   - un sistema de información o plataforma que persiste; un programa insignia recurrente
     (p. ej. ONDAS, Colombia BIO); un régimen normativo o de beneficios que continúa (p. ej.
     Beneficios Tributarios en CTeI); la diplomacia/cooperación científica.
   Es decir: agrupa las INSTANCIAS del mismo mecanismo, pero NO cruces mecanismos distintos.

2) NO FUSIONES (déjalos como canónicos separados) cuando:
   - Son instrumentos distintos que comparten tema o palabras. Ej.: una CONVOCATORIA o FONDO (p. ej.
     "Convocatorias Asignación CTeI del SGR", "Convocatoria Pacífico") NO es un PROGRAMA de becas;
     "Ideas para el Cambio" (apropiación) NO es "Becas para el Cambio" (formación).
   - Es una convocatoria/instrumento puntual frente a un programa permanente.
   - Pertenecen a políticas distintas por razones temáticas, sin ser el mismo mecanismo.
   - Un gobierno REEMPLAZÓ un programa por otro de MODELO distinto (p. ej. "Becas/Crédito-beca
     reembolsable" -> "Becas para el Cambio no reembolsable"): trátalos como el MISMO canónico SOLO si
     es claramente la misma línea; en ese caso el cambio se marca luego como conversión o reversión,
     NUNCA como continuidad. Si el mecanismo cambió de fondo, déjalos SEPARADOS (uno termina, otro se
     estratifica).

3) Para cada canónico:
   - 'nombre': el nombre canónico más claro; 'alias': SOLO variantes del MISMO instrumento (no metas
     nombres de otros instrumentos).
   - 'es_objetivo' y 'tipo_nato' (si es instrumento): coherentes con los miembros.
   - 'politicas': TODAS las políticas a las que sirve ese instrumento (muchos-a-muchos). Un fondo o un
     sistema transversal sirve a varias; inclúyelas todas. Usa nombres del catálogo unificado.
   - 'miembros': la lista de 'ref' que agrupa (usa EXCLUSIVAMENTE refs de la lista; no inventes).

4) En 'politicas' (nivel raíz) devuelve el catálogo UNIFICADO de políticas (nombre + objetivo),
   DEDUPLICADO entre vigencias: si dos políticas de distinto gobierno son la misma (p. ej. dos
   variantes de "Bioeconomía" o de "Diplomacia científica"), fúndelas en una.

POLÍTICAS POR VIGENCIA:
{json.dumps(politicas, ensure_ascii=False)}

INSTRUMENTOS/OBJETIVOS:
{json.dumps(compact, ensure_ascii=False)}"""


# ---------------------------------------------------------------- etapa B2: relaciones + cambio
def schema_relaciones():
    S = lambda **k: k
    return S(type="OBJECT", properties={
        "relaciones": S(type="ARRAY", items=S(type="OBJECT", properties={
            "source": S(type="STRING"), "target": S(type="STRING"),
            "tipo": S(type="STRING", enum=REL), "nota": S(type="STRING")},
            required=["source", "target", "tipo"],
            propertyOrdering=["source", "target", "tipo", "nota"])),
        "cambios": S(type="ARRAY", items=S(type="OBJECT", properties={
            "id": S(type="STRING"), "modo_cambio": S(type="STRING", enum=CAMBIO_AMBAS)},
            required=["id", "modo_cambio"], propertyOrdering=["id", "modo_cambio"])),
    }, propertyOrdering=["relaciones", "cambios"])


def prompt_relaciones(objetos):
    voc = "; ".join(f"{k}={v}" for k, v in TAX["objetos"]["relaciones"].items())
    cam = "; ".join(f"{k}={TAX['objetos']['modo_cambio']['valores'][k]}" for k in CAMBIO_AMBAS)
    ambas = [o["id"] for o in objetos if len(o["presencia"]) == 2]
    cat = [{"id": o["id"], "nombre": o["nombre"], "es_objetivo": o["es_objetivo"],
            "tipo_nato": o.get("tipo_nato"), "politicas": o.get("politicas", []),
            "vigencias": sorted(o["presencia"].keys())} for o in objetos]
    return f"""Estos son instrumentos y objetivos de política de un sector colombiano en dos gobiernos.

1) RELACIONES: identifica relaciones DIRIGIDAS entre instrumentos DISTINTOS (nunca de uno consigo
   mismo). Tipos (usa exactamente estos): {voc}. Cada relación: 'source', 'target' (ids del catálogo),
   'tipo' y 'nota' breve. Apunta a las sustantivas, no exhaustivas.

2) MODO DE CAMBIO: para los instrumentos presentes en AMBAS vigencias, clasifica cómo cambiaron:
   {cam}. Devuélvelo en 'cambios' con 'id' y 'modo_cambio'. Solo estos ids: {json.dumps(ambas, ensure_ascii=False)}.
   NO uses 'continuidad-estable' por defecto: resérvala para cuando el instrumento mantuvo el MISMO
   modelo y rumbo. Si cambió de uso/modelo -> conversion; si invirtió el rumbo (p. ej. de crédito
   reembolsable a beca no reembolsable, o de competitivo a asignación directa) -> reversion; si
   persiste en la forma pero su efecto/alcance cambió con el entorno -> deriva.

Usa EXCLUSIVAMENTE ids del catálogo.

CATÁLOGO:
{json.dumps(cat, ensure_ascii=False)}"""


# ---------------------------------------------------------------- consolidación determinista
def consolidar(canonicos, idx_items, pol_ids):
    """Construye objetos canónicos con presencia/evidencia/modo_cambio determinista.
    pol_ids: set de ids de política válidos (para filtrar refs colgantes)."""
    objetos, vistos = [], set()
    for c in canonicos:
        miembros = [idx_items[r] for r in c.get("miembros", []) if r in idx_items]
        if not miembros:
            continue
        oid = slug(c["nombre"])
        while oid in vistos:
            oid += "-x"
        vistos.add(oid)

        por_per = {}
        for it in miembros:
            por_per.setdefault(it["_vigencia"], []).append(it)

        presencia, evidencia = {}, []
        for per, its in por_per.items():
            modos = [it.get("modo_presencia") for it in its if it.get("modo_presencia")]
            modo = min(modos, key=lambda m: PRIO_MODO.index(m) if m in PRIO_MODO else 99) if modos else None
            presencia[per] = {"activo": True}
            if modo:
                presencia[per]["modo"] = modo
            paginas = sorted({p for it in its for p in (it.get("paginas") or []) if isinstance(p, int)})
            cifras = [cf for it in its for cf in _cifras(it.get("cifras"))]
            ev = {"vigencia": per}
            if paginas:
                ev["paginas"] = paginas
            if cifras:
                ev["cifras"] = cifras
            evidencia.append(ev)

        # modo_cambio determinista para un solo periodo; los de ambas los fija B2 (default provisional)
        if len(presencia) == 1:
            modo_cambio = "terminacion" if "2018-2022" in presencia else "estratificacion"
        else:
            modo_cambio = "continuidad-estable"

        pols = []
        for p in c.get("politicas", []):
            pid = slug(p)
            if pid and pid in pol_ids and pid not in pols:
                pols.append(pid)

        obj = {
            "id": oid, "nombre": c["nombre"], "es_objetivo": bool(c.get("es_objetivo")),
            "politicas": pols,
            "alias": sorted({a for a in c.get("alias", []) if a}),
            "presencia": presencia, "modo_cambio": modo_cambio,
            "entidades": sorted({e for it in miembros for e in (it.get("entidades") or []) if e}),
            "evidencia": evidencia,
        }
        if not obj["es_objetivo"] and c.get("tipo_nato") in NATO:
            obj["tipo_nato"] = c["tipo_nato"]
        objetos.append(obj)
    return objetos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="slug del sector, p.ej. ciencia-tecnologia")
    ap.add_argument("--match", required=True, help="substring del nombre de sector en markdown/")
    ap.add_argument("--modelo", default="gemini-flash-latest")
    ap.add_argument("--rehacer-a", action="store_true", help="ignora el cache y rehace la etapa A")
    ap.add_argument("--rehacer-b1", action="store_true", help="ignora el cache y rehace la resolución (B1)")
    args = ap.parse_args()
    base = ROOT / "data" / "sectores" / args.slug

    informes = discover(args.match)
    if not informes:
        sys.exit(f"No se hallaron informes principales para match='{args.match}' en markdown/")
    print(f"Informes hallados: {len(informes)}")

    # ---- etapa A: por vigencia (con resume: reusa el instrumentos.json del periodo si existe)
    items, politicas_raw = [], []
    for periodo, entidad, p in informes:
        out_per = base / periodo
        cache = out_per / "instrumentos.json"
        if cache.exists() and not args.rehacer_a:
            doc = json.loads(cache.read_text(encoding="utf-8"))
            per_items = doc.get("instrumentos", [])
            print(f"  A · {periodo} | (cache: {cache}) -> {len(doc.get('politicas', []))} políticas, {len(per_items)} instrumentos")
        else:
            texto = p.read_text(encoding="utf-8")[:MAX_CHARS]
            print(f"  A · {periodo} | {entidad[:40]:40} ({len(texto):,} chars)")
            doc = call_gemini(args.modelo, prompt_periodo(entidad, periodo, texto), schema_periodo())
            if not doc:
                print(f"    FALLÓ la extracción de {periodo}", file=sys.stderr); continue
            per_items = []
            for j, it in enumerate(doc.get("instrumentos", [])):
                it["_vigencia"] = periodo
                it["_ref"] = f"{periodo}#{j}"
                it["entidades"] = it.get("entidades") or [entidad]
                per_items.append(it)
            doc["instrumentos"] = per_items
            print(f"    -> {len(doc.get('politicas', []))} políticas, {len(per_items)} instrumentos")
            out_per.mkdir(parents=True, exist_ok=True)
            cache.write_text(json.dumps({"politicas": doc.get("politicas", []), "instrumentos": per_items},
                                        ensure_ascii=False, indent=2), encoding="utf-8")
        for pol in doc.get("politicas", []):
            politicas_raw.append({"vigencia": periodo, **pol})
        items.extend(per_items)
    if not items:
        sys.exit("Sin instrumentos extraídos en ninguna vigencia.")

    # ---- etapa B1: resolución de entidades (con cache: congela una buena fusión)
    res_cache = base / "_resolucion.json"
    if res_cache.exists() and not args.rehacer_b1:
        res = json.loads(res_cache.read_text(encoding="utf-8"))
        print(f"  B1 · (cache: {res_cache}) -> {len(res.get('canonicos', []))} canónicos")
    else:
        print(f"  B1 · resolución de entidades sobre {len(items)} ítems…")
        res = call_gemini(args.modelo, prompt_resolucion(items, politicas_raw), schema_resolucion())
        if not res or not res.get("canonicos"):
            sys.exit("FALLÓ la resolución de entidades.")
        base.mkdir(parents=True, exist_ok=True)
        res_cache.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf-8")
    idx_items = {it["_ref"]: it for it in items}

    # políticas: unificadas por B1 (o derivadas de las crudas si faltan)
    pol_src = res.get("politicas") or [{"nombre": p["nombre"], "objetivo": p.get("objetivo", "")}
                                       for p in politicas_raw]
    politicas, vistos_pol = [], set()
    for p in pol_src:
        pid = slug(p["nombre"])
        if pid in vistos_pol:
            continue
        vistos_pol.add(pid)
        reg = {"id": pid, "nombre": p["nombre"]}
        if p.get("objetivo"):
            reg["objetivo"] = p["objetivo"]
        politicas.append(reg)

    objetos = consolidar(res["canonicos"], idx_items, vistos_pol)
    ids = {o["id"] for o in objetos}
    print(f"    -> {len(objetos)} instrumentos canónicos, {len(politicas)} políticas")

    # ---- etapa B2: relaciones + modo de cambio (para los de ambas vigencias)
    print("  B2 · relaciones + modo de cambio…")
    rel_doc = call_gemini(args.modelo, prompt_relaciones(objetos), schema_relaciones()) or {}
    relaciones = [r for r in rel_doc.get("relaciones", [])
                  if r.get("source") in ids and r.get("target") in ids and r["source"] != r["target"]]
    cambios = {c["id"]: c["modo_cambio"] for c in rel_doc.get("cambios", [])
               if c.get("id") in ids and c.get("modo_cambio") in CAMBIO_AMBAS}
    for o in objetos:
        if len(o["presencia"]) == 2 and o["id"] in cambios:
            o["modo_cambio"] = cambios[o["id"]]
    print(f"    -> {len(relaciones)} relaciones, {len(cambios)} modos de cambio asignados")

    # ---- ensamblar + validar
    doc = {"sector": args.slug, "politicas": politicas, "objetos": objetos, "relaciones": relaciones}
    errs = sorted(Draft202012Validator(SCHEMA).iter_errors(doc), key=lambda e: list(e.path))
    if errs:
        print(f"⚠ {len(errs)} problemas de validación; primero: {errs[0].message[:160]}", file=sys.stderr)

    base.mkdir(parents=True, exist_ok=True)
    (base / "objetos.yaml").write_text(
        yaml.safe_dump(doc, allow_unicode=True, sort_keys=False, width=100), encoding="utf-8")
    (base / "objetos.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n{len(objetos)} instrumentos, {len(politicas)} políticas -> {base}/objetos.yaml")
    print("por tipo_nato:", dict(Counter(o.get("tipo_nato", "(objetivo)") for o in objetos)))
    print("por modo_cambio:", dict(Counter(o["modo_cambio"] for o in objetos)))


if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")
    main()
