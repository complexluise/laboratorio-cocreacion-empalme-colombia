# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27", "pymupdf>=1.24"]
# ///
"""
OCR de PDFs escaneados usando Gemini (generativelanguage API).

Envía cada PDF escaneado a Gemini (modelo en MODEL; multimodal, admite PDF inline) y pide
la transcripción del texto. Escribe el resultado como markdown en `markdown/`,
sobreescribiendo el placeholder "(escaneado)" que dejó empalme_to_markdown.py.

La API key se lee de `GEMINI_API_KEY` (o de `.secrets/gemini_key.txt`, NO versionada).
Respetuoso: pausa entre llamadas y reintentos con backoff.

Uso:
  uv run ocr_gemini.py            # OCR de todos los PDFs escaneados detectados
  uv run ocr_gemini.py --list     # solo listar los escaneados, no llamar a la API
"""
from __future__ import annotations
import base64, os, sys, time, warnings
from pathlib import Path
import httpx, fitz

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MODEL = "gemini-flash-lite-latest"  # disponible para esta key y con cupo; 2.5-flash da 404
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

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
PROMPT = (
    "Transcribe COMPLETAMENTE el texto de este documento escaneado en español. "
    "Es un acta o resolución oficial del Ministerio de Ciencia de Colombia. "
    "Devuelve solo el texto transcrito en markdown limpio, respetando encabezados, "
    "listas, tablas y firmas. No agregues comentarios ni resúmenes. Si una página está "
    "en blanco o ilegible, indícalo con [página ilegible]."
)

def es_escaneado(md_path: Path) -> bool:
    try:
        return "escaneado — sin texto" in md_path.read_text(encoding="utf-8")[:400]
    except Exception:
        return False

def pdf_para_md(md_path: Path) -> Path | None:
    """Del .md placeholder deduce el PDF fuente en descargas/ o extraido/."""
    rel = md_path.relative_to("markdown")
    pdf_rel = rel.with_suffix("")  # quita .md -> queda ...pdf
    for raiz in ("extraido", "descargas"):
        cand = Path(raiz) / pdf_rel
        if cand.exists():
            return cand
    return None

def ocr_pdf(pdf: Path) -> str:
    data = base64.standard_b64encode(pdf.read_bytes()).decode()
    body = {
        "contents": [{"parts": [
            {"text": PROMPT},
            {"inline_data": {"mime_type": "application/pdf", "data": data}},
        ]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 16384,
                             "thinkingConfig": {"thinkingBudget": 128}},  # 0 lo rechazan los Gemini 3.x (400)
    }
    for intento in range(4):
        try:
            r = httpx.post(URL, headers={"x-goog-api-key": KEY}, json=body,
                           timeout=300.0, verify=False)
            if r.status_code == 200:
                j = r.json()
                cand = j.get("candidates", [{}])[0]
                parts = cand.get("content", {}).get("parts", [])
                txt = "".join(p.get("text", "") for p in parts).strip()
                fr = cand.get("finishReason", "")
                return txt + (f"\n\n> [OCR truncado: {fr}]" if fr not in ("STOP", "") else "")
            print(f"    HTTP {r.status_code}: {r.text[:200]}", file=sys.stderr)
        except Exception as e:
            print(f"    error: {e}", file=sys.stderr)
        time.sleep(2 ** intento)
    return ""

def main():
    solo_listar = "--list" in sys.argv
    escaneados = [p for p in Path("markdown").rglob("*.pdf.md") if es_escaneado(p)]
    print(f"PDFs escaneados detectados: {len(escaneados)}")
    ok = 0
    for md in escaneados:
        pdf = pdf_para_md(md)
        estado = "PDF hallado" if pdf else "PDF NO hallado"
        print(f"  · {md.name[:70]}  [{estado}]")
        if solo_listar or not pdf:
            continue
        txt = ocr_pdf(pdf)
        if not txt:
            print("    -> OCR vacío/fallido", file=sys.stderr)
            continue
        header = f"# {pdf.stem}\n\n> Fuente: `{pdf}`\n> Tipo: PDF escaneado — OCR vía Gemini {MODEL}\n\n---\n\n"
        md.write_text(header + txt, encoding="utf-8")
        ok += 1
        print(f"    -> OCR OK ({len(txt)} chars)")
        time.sleep(6)  # respetuoso con la API / cupo
    if not solo_listar:
        print(f"\nTranscritos: {ok}/{len(escaneados)}")

if __name__ == "__main__":
    main()
