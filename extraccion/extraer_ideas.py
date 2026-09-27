# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27", "pyyaml>=6.0", "jsonschema>=4.0"]
# ///
"""
DEPRECADO — la capa de "ideas" ya no se usa. El pipeline extrae directo políticas +
instrumentos con el vocabulario del encuadre (NATO + modos de cambio): ver
extraccion/extraer_instrumentos.py. Se conserva como referencia histórica.

Extracción ESCALABLE de ideas estructuradas desde los informes de empalme.

Para cada informe (markdown) llama a Gemini con `responseSchema` (JSON estructurado) y
obtiene ideas conformes al contrato `data/schema/idea.schema.json`, clasificadas con la
taxonomía facetada de `data/schema/taxonomia.yaml` (fuente única de los vocabularios).

Sector-agnóstico: descubre los informes de un sector en `markdown/`, extrae por entidad,
fusiona por periodo y escribe `data/sectores/<slug>/<periodo>/ideas.yaml` (+ .json).

Uso:
  uv run extraer_ideas.py --slug ciencia-tecnologia --match Ciencia
  uv run extraer_ideas.py --slug cultura --match Cultura --modelo gemini-flash-lite-latest

La API key se lee de `GEMINI_API_KEY` (o de `.secrets/gemini_key.txt`, gitignored).
"""
from __future__ import annotations
import argparse, json, os, re, sys, time, unicodedata
from pathlib import Path
import httpx, yaml
from jsonschema import Draft202012Validator

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(".")

def gemini_key():
    """La key sale de GEMINI_API_KEY; si no está, de .secrets/gemini_key.txt (gitignored)."""
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        return k
    f = Path(".secrets/gemini_key.txt")
    if f.exists():
        return f.read_text(encoding="utf-8").strip()
    sys.exit("Falta la API key de Gemini: definí GEMINI_API_KEY o creá .secrets/gemini_key.txt "
             "(ver .secrets/gemini_key.txt.example).")

KEY = gemini_key()
TAX = yaml.safe_load(Path("data/schema/taxonomia.yaml").read_text(encoding="utf-8"))
SCHEMA = json.loads(Path("data/schema/idea.schema.json").read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA)
MAX_CHARS = 550_000  # ~180k tokens; cabe en el contexto de 1M de flash

def enum(faceta): return list(TAX["facetas"][faceta]["valores"].keys())

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return "-".join(re.sub(r"[^a-z0-9]+", " ", s.lower()).split())

# ---- responseSchema de Gemini (subconjunto OpenAPI) ----
def response_schema():
    S = lambda **k: k
    return {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "enunciado": S(type="STRING"),
                "tema": S(type="STRING", enum=enum("tema")),
                "tipo": S(type="STRING", enum=enum("tipo")),
                "instrumento": S(type="ARRAY", items=S(type="STRING", enum=enum("instrumento"))),
                "poblacion": S(type="ARRAY", items=S(type="STRING", enum=enum("poblacion"))),
                "territorio": S(type="STRING", enum=enum("territorio")),
                "evidencia_paginas": S(type="ARRAY", items=S(type="INTEGER")),
                "evidencia_anexos": S(type="ARRAY", items=S(type="STRING")),
                "cifras": S(type="ARRAY", items=S(type="OBJECT", properties={
                    "metrica": S(type="STRING"), "valor": S(type="NUMBER"),
                    "unidad": S(type="STRING"), "texto": S(type="STRING")}, required=["texto"])),
                "tags": S(type="ARRAY", items=S(type="STRING")),
            },
            "required": ["enunciado", "tema", "tipo"],
            "propertyOrdering": ["enunciado", "tema", "tipo", "instrumento", "poblacion",
                                 "territorio", "evidencia_paginas", "evidencia_anexos", "cifras", "tags"],
        },
    }

def prompt(entidad, periodo):
    def voc(f):
        return "; ".join(f"{k}={v['label'] if isinstance(v, dict) and 'label' in v else (v.get('def') if isinstance(v,dict) else v)}"
                         for k, v in TAX["facetas"][f]["valores"].items())
    return f"""Eres un analista documental experto en política pública colombiana. Extrae TODAS las
ideas relevantes de este informe de empalme de la entidad "{entidad}" ({periodo}).

Devuelve un ARRAY JSON de ideas. Cada idea es autocontenida (1-2 frases en 'enunciado') y se
clasifica con estas facetas de vocabulario CONTROLADO (usa exactamente estos códigos):

- tema (uno): {voc('tema')}
- tipo (uno): {voc('tipo')}
- instrumento (varios): {voc('instrumento')}
- poblacion (varios; usa 'general' si no hay foco): {voc('poblacion')}
- territorio (uno): {voc('territorio')}

Reglas:
- Prioriza: apuestas de política, programas con nombre propio, cambios normativos/estructura,
  logros con cifra, y pendientes/recomendaciones al gobierno entrante.
- 'evidencia_paginas': números de página (## Página N) donde aparece la idea.
- 'cifras': cantidades citadas (metrica p.ej. inversion/beneficiarios/proyectos; valor numérico
  si se puede; unidad COP/personas/proyectos/porcentaje; texto tal como aparece).
- 'tags': nombres propios (programas, misiones, decretos, leyes).
- Sé exhaustivo pero sin redundancia: extrae todas las ideas relevantes de ESTE FRAGMENTO del
  informe. Si el fragmento es portada, índice o tabla sin contenido sustantivo, devuelve pocas o
  ninguna idea (no inventes ni rellenes)."""

def call_gemini(modelo, texto, entidad, periodo):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt(entidad, periodo) + "\n\n===INFORME===\n" + texto}]}],
        "generationConfig": {
            "temperature": 0, "maxOutputTokens": 60000,
            "responseMimeType": "application/json",
            "responseSchema": response_schema(),
            "thinkingConfig": {"thinkingBudget": 128},  # mínimo; 0 lo rechazan los modelos Gemini 3.x (400)
        },
    }
    for intento in range(4):
        try:
            r = httpx.post(url, headers={"x-goog-api-key": KEY}, json=body, timeout=600.0, verify=False)
            if r.status_code == 200:
                j = r.json()
                cand = j["candidates"][0]
                parts = cand.get("content", {}).get("parts", [])
                raw = "".join(p.get("text", "") for p in parts)
                fr = cand.get("finishReason", "")
                if fr not in ("STOP", ""):
                    print(f"    ⚠ finishReason={fr} (puede venir truncado)", file=sys.stderr)
                return json.loads(raw) if raw.strip() else []
            print(f"    HTTP {r.status_code}: {r.text[:180]}", file=sys.stderr)
        except Exception as e:
            print(f"    error: {e}", file=sys.stderr)
        time.sleep(2 ** intento * 3)
    return None

def reshape(raw_idea, idx, slug, periodo, entidad):
    """Del formato aplanado del modelo al registro del contrato."""
    it = {
        "id": f"{slug}-{periodo}-{idx:03d}",
        "enunciado": (raw_idea.get("enunciado") or "").strip(),
        "tema": raw_idea.get("tema"),
        "tipo": raw_idea.get("tipo"),
        "instrumento": sorted(set(raw_idea.get("instrumento") or [])),
        "poblacion": sorted(set(raw_idea.get("poblacion") or [])) or ["general"],
        "territorio": raw_idea.get("territorio") or "nacional",
        "entidad": entidad,
        "evidencia": {
            "documento": "informe",
            "paginas": [p for p in (raw_idea.get("evidencia_paginas") or []) if isinstance(p, int)],
            "anexos": raw_idea.get("evidencia_anexos") or [],
        },
        "cifras": [c for c in (raw_idea.get("cifras") or []) if c.get("texto")],
        "tags": raw_idea.get("tags") or [],
    }
    return it

def split_chunks(texto, max_chars=55_000):
    """Parte el informe en trozos por límites de '## Página' para cobertura exhaustiva."""
    partes = re.split(r"(?=^## Página )", texto, flags=re.M)
    chunks, buf = [], ""
    for p in partes:
        if len(buf) + len(p) > max_chars and buf:
            chunks.append(buf); buf = p
        else:
            buf += p
    if buf.strip():
        chunks.append(buf)
    return chunks or [texto]


def dedupe(pares):
    """Quita ideas casi duplicadas (mismo inicio de enunciado) preservando orden."""
    vistos, out = set(), []
    for entidad, raw in pares:
        clave = (entidad, norm_txt((raw.get("enunciado") or ""))[:70])
        if clave in vistos:
            continue
        vistos.add(clave); out.append((entidad, raw))
    return out


def norm_txt(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    return " ".join(s.split())


def discover(match):
    """Halla (periodo, entidad, path_md) de los informes de un sector en markdown/."""
    out = []
    m = slugify(match)
    for periodo in ("2018-2022", "2022-2026"):
        base = ROOT / "markdown" / periodo
        if not base.exists(): continue
        for sect_dir in base.iterdir():
            if m not in slugify(sect_dir.name): continue
            for ent_dir in sect_dir.iterdir():
                if not ent_dir.is_dir(): continue
                # informe principal = .pdf.md directamente bajo la entidad, excluyendo anexos
                # (los anexos empiezan por 'Anexo' o viven en subcarpeta Anexos/).
                pdfs = [p for p in ent_dir.glob("*.pdf.md")
                        if not p.name.lower().startswith("anexo")]
                for p in pdfs:
                    out.append((periodo, ent_dir.name.replace("_", " "), p))
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="slug del sector, p.ej. cultura")
    ap.add_argument("--match", required=True, help="substring del nombre de sector en markdown/")
    ap.add_argument("--modelo", default="gemini-flash-lite-latest")
    args = ap.parse_args()

    informes = discover(args.match)
    if not informes:
        print(f"No se hallaron informes para match='{args.match}'", file=sys.stderr); sys.exit(1)
    print(f"Informes hallados: {len(informes)}")
    por_periodo: dict[str, list] = {}
    for periodo, entidad, p in informes:
        texto = p.read_text(encoding="utf-8")[:MAX_CHARS]
        chunks = split_chunks(texto)
        print(f"  · {periodo} | {entidad[:40]:40} ({len(texto):,} chars, {len(chunks)} trozos)")
        acc = []
        for ci, ch in enumerate(chunks, 1):
            raw = call_gemini(args.modelo, ch, entidad, periodo)
            if raw is None:
                print(f"    trozo {ci}/{len(chunks)}: FALLÓ", file=sys.stderr); continue
            acc.extend((entidad, r) for r in raw)
            print(f"    trozo {ci}/{len(chunks)}: {len(raw)} ideas")
            time.sleep(3)
        antes = len(acc)
        acc = dedupe(acc)
        print(f"    -> {antes} ideas ({antes - len(acc)} duplicadas removidas)")
        por_periodo.setdefault(periodo, []).extend(acc)

    total = 0
    for periodo, pares in por_periodo.items():
        ideas, errs = [], 0
        for i, (entidad, raw_idea) in enumerate(pares, 1):
            it = reshape(raw_idea, i, args.slug, periodo, entidad)
            problemas = sorted(VALIDATOR.iter_errors(it), key=lambda e: e.path)
            if problemas:
                errs += 1
                print(f"    inválida ({periodo} #{i}): {problemas[0].message[:80]}", file=sys.stderr)
                continue
            ideas.append(it)
        out_dir = ROOT / "data" / "sectores" / args.slug / periodo
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "ideas.yaml").write_text(
            yaml.safe_dump(ideas, allow_unicode=True, sort_keys=False, width=100), encoding="utf-8")
        (out_dir / "ideas.json").write_text(
            json.dumps(ideas, ensure_ascii=False, indent=2), encoding="utf-8")
        total += len(ideas)
        print(f"  [{periodo}] {len(ideas)} ideas válidas ({errs} descartadas) -> {out_dir}/ideas.yaml")
    print(f"\nTotal: {total} ideas estructuradas.")

if __name__ == "__main__":
    main()
