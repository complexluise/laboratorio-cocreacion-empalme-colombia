# /// script
# requires-python = ">=3.11"
# dependencies = ["jsonschema>=4.0", "pyyaml>=6.0", "python-docx>=1.1"]
# ///
"""
Valida la frontera del repo (docs/FRONTERAS.md): el contrato de datos en data/schema/.

- Cada *.schema.json es un JSON Schema válido para su metaschema.
- taxonomia.yaml parsea y es un mapeo.
- Cada dataset que consume la web (web/src/lib/data/*.json) cumple objeto.schema.json.
- Cada bitácora integrada (data/bitacoras/<slug>/*.json) cumple bitacora.schema.json, y la
  plantilla .docx ida y vuelta: generar -> llenar con el ejemplo CTeI -> leer da el mismo JSON, y
  las .docx publicadas en web/public se leen con la estructura actual (extraccion/bitacora.py).

Uso (desde la raíz): uv run scripts/validar_contrato.py
"""
from __future__ import annotations
import json, sys
from pathlib import Path

import importlib.util

import yaml
from jsonschema.validators import validator_for

SCHEMA_DIR = Path("data/schema")
DATOS_WEB = Path("web/src/lib/data")
BITACORAS = Path("data/bitacoras")


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
    errores += validar_bitacoras()
    for e in errores:
        print(f"ERROR {e}", file=sys.stderr)
    return 1 if errores else 0


def validar_bitacoras() -> list[str]:
    errores = []
    schema = json.loads((SCHEMA_DIR / "bitacora.schema.json").read_text(encoding="utf-8"))
    validador = validator_for(schema)(schema)
    for d in sorted(BITACORAS.glob("*/*.json")):
        fallos = sorted(validador.iter_errors(json.loads(d.read_text(encoding="utf-8"))), key=str)
        for f in fallos[:10]:
            errores.append(f"{d}: {'/'.join(str(x) for x in f.absolute_path)}: {f.message}")
        if not fallos:
            print(f"ok  {d} (conforme a bitacora.schema.json)")
    spec = importlib.util.spec_from_file_location("bitacora", Path("extraccion/bitacora.py"))
    bitacora = importlib.util.module_from_spec(spec)
    sys.modules["bitacora"] = bitacora  # las dataclasses resuelven sus anotaciones por el módulo
    spec.loader.exec_module(bitacora)
    fallos = bitacora.probar() + bitacora.publicadas_al_dia()
    errores += [f"bitácora: {f}" for f in fallos]
    if not fallos:
        print("ok  bitácora .docx: ida y vuelta y plantillas publicadas al día")
    return errores


if __name__ == "__main__":
    sys.exit(main())
