# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.0", "pyyaml>=6.0"]
# ///
"""
Valida la frontera del repo (docs/FRONTERAS.md): el contrato de datos en data/schema/.

- Cada *.schema.json es un JSON Schema válido para su metaschema.
- taxonomia.yaml parsea y es un mapeo.
- Cada dataset que consume la web (web/src/lib/data/*.json) cumple objeto.schema.json.

Uso (desde la raíz): uv run scripts/validar_contrato.py
"""
from __future__ import annotations
import json, sys
from pathlib import Path

import yaml
from jsonschema.validators import validator_for

SCHEMA_DIR = Path("data/schema")
DATOS_WEB = Path("web/src/lib/data")


def main() -> int:
    errores = []
    schemas = sorted(SCHEMA_DIR.glob("*.schema.json"))
    if not schemas:
        errores.append(f"no hay *.schema.json en {SCHEMA_DIR}")
    for p in schemas:
        try:
            schema = json.loads(p.read_text(encoding="utf-8"))
            validator_for(schema).check_schema(schema)
            print(f"ok  {p}")
        except Exception as e:  # noqa: BLE001 — reportar cualquier fallo del contrato
            errores.append(f"{p}: {e}")
    tax = SCHEMA_DIR / "taxonomia.yaml"
    try:
        data = yaml.safe_load(tax.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("no es un mapeo")
        print(f"ok  {tax}")
    except Exception as e:  # noqa: BLE001
        errores.append(f"{tax}: {e}")
    objeto = SCHEMA_DIR / "objeto.schema.json"
    try:
        schema = json.loads(objeto.read_text(encoding="utf-8"))
        validador = validator_for(schema)(schema)
        for d in sorted(DATOS_WEB.glob("*.json")):
            fallos = sorted(validador.iter_errors(json.loads(d.read_text(encoding="utf-8"))), key=str)
            for f in fallos[:10]:
                ruta = "/".join(str(x) for x in f.absolute_path)
                errores.append(f"{d}: {ruta}: {f.message}")
            if not fallos:
                print(f"ok  {d} (conforme a {objeto.name})")
    except Exception as e:  # noqa: BLE001
        errores.append(f"{objeto}: {e}")
    for e in errores:
        print(f"ERROR {e}", file=sys.stderr)
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
