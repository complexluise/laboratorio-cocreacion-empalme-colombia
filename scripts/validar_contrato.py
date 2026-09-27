# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.0", "pyyaml>=6.0"]
# ///
"""
Valida la frontera del repo (docs/FRONTERAS.md): el contrato de datos en data/schema/.

- Cada *.schema.json es un JSON Schema válido para su metaschema.
- taxonomia.yaml parsea y es un mapeo.

Uso (desde la raíz): uv run scripts/validar_contrato.py
"""
from __future__ import annotations
import json, sys
from pathlib import Path

import yaml
from jsonschema.validators import validator_for

SCHEMA_DIR = Path("data/schema")


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
    for e in errores:
        print(f"ERROR {e}", file=sys.stderr)
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
