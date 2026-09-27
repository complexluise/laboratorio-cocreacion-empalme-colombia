# /// script
# requires-python = ">=3.9"
# ///
"""
Copia data/sectores/<slug>/objetos.json a web/src/lib/data/<slug>.json (copia COMMITEADA).

La web (Svelte + Vite) importa ese JSON como módulo: queda bundleado en el build, sin fetch, así
funciona en GitHub Pages y abriendo web/dist por `file://`. Ver docs/decisiones/ADR-0002.
Solo stdlib; corre con el Python del sistema o con `uv run`.

Uso: uv run extraccion/generar_web.py --slug ciencia-tecnologia
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="ciencia-tecnologia")
    args = ap.parse_args()
    src = Path("data/sectores") / args.slug / "objetos.json"
    if not src.exists():
        sys.exit(f"No existe {src}. Corre antes extraer_instrumentos.py.")
    data = json.loads(src.read_text(encoding="utf-8"))
    out = Path("web/src/lib/data") / f"{args.slug}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{src} -> {out}  ({len(data.get('politicas', []))} políticas, "
          f"{len(data.get('objetos', []))} instrumentos, {len(data.get('relaciones', []))} relaciones)")


if __name__ == "__main__":
    main()
