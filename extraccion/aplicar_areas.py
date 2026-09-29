# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6.0", "jsonschema>=4.0"]
# ///
"""
Agrupa las políticas por gobierno (salida del extractor) en ÁREAS persistentes con objetivo por
gobierno (issue #20). DETERMINISTA y sin llamadas pagas: aplica la curaduría versionada en
data/correcciones/<slug>/areas.yaml.

Qué hace:
- Cada área pasa a ser una política con `objetivos[vigencia]` (enunciados + nombres de las
  políticas declaradas de origen, tomados tal cual del dataset) y `cambio_objetivo`.
- Los instrumentos pasan a apuntar a las áreas (dedup si dos políticas de origen caen en la misma).
- `absorbe_nodos`: nodos-objetivo que duplicaban una misión se absorben en su área; sus relaciones
  pasan a ser pertenencia del otro instrumento al área (la misión ES el área).
- Falla si una política de origen queda sin área o si un área cita una política inexistente.

Pipeline (docs/pipeline-extraccion.md): workflow de Claude (rebuild-ctei-claude.workflow.js; legado:
extraer_instrumentos.py -> aplicar_correcciones.py) -> aplicar_areas.py -> generar_web.py

Uso:
  uv run extraccion/aplicar_areas.py --slug ciencia-tecnologia
  uv run extraccion/aplicar_areas.py --slug ciencia-tecnologia \\
      --entrada web/src/lib/data/ciencia-tecnologia.json --salida web/src/lib/data/ciencia-tecnologia.json
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

VIGENCIAS = ["2018-2022", "2022-2026"]


def aplicar(data: dict, curaduria: dict) -> dict:
    if any("objetivos" in p for p in data.get("politicas", [])):
        sys.exit("El dataset ya tiene áreas (politicas con 'objetivos'): nada que aplicar.")

    origen = {p["id"]: p for p in data.get("politicas", [])}
    area_de: dict[str, list[str]] = {}  # id política de origen -> ids de área
    areas = []
    for a in curaduria["areas"]:
        objetivos = {}
        for vig in VIGENCIAS:
            ids = a.get("declaradas", {}).get(vig, [])
            if not ids:
                continue
            faltan = [i for i in ids if i not in origen]
            if faltan:
                sys.exit(f"Área {a['id']}: políticas de origen inexistentes: {faltan}")
            enunciados = list(dict.fromkeys(origen[i]["objetivo"] for i in ids if origen[i].get("objetivo")))
            objetivos[vig] = {
                "enunciados": enunciados or [f"(sin enunciado en el informe) {origen[ids[0]]['nombre']}"],
                "declaradas": [origen[i]["nombre"] for i in ids],
            }
            for i in ids:
                area_de.setdefault(i, [])
                if a["id"] not in area_de[i]:
                    area_de[i].append(a["id"])
        areas.append({"id": a["id"], "nombre": a["nombre"], "objetivos": objetivos, "cambio_objetivo": a["cambio_objetivo"]})

    sin_area = sorted(set(origen) - set(area_de))
    if sin_area:
        sys.exit(f"Políticas de origen sin área en la curaduría: {sin_area}")

    # Nodos-objetivo absorbidos por su área.
    absorbe = {n: a["id"] for a in curaduria["areas"] for n in a.get("absorbe_nodos", [])}
    objetos = [o for o in data["objetos"] if o["id"] not in absorbe]
    por_id = {o["id"]: o for o in objetos}
    relaciones = []
    for r in data.get("relaciones", []):
        s, t = r["source"], r["target"]
        if s in absorbe or t in absorbe:
            otro, area = (t, absorbe[s]) if s in absorbe else (s, absorbe[t])
            if otro in por_id and otro not in absorbe:
                por_id[otro].setdefault("politicas", [])
                por_id[otro]["_areas_extra"] = por_id[otro].get("_areas_extra", []) + [area]
            continue
        relaciones.append(r)

    for o in objetos:
        nuevas: list[str] = []
        for pid in o.get("politicas", []):
            for aid in area_de.get(pid, []):
                if aid not in nuevas:
                    nuevas.append(aid)
        for aid in o.pop("_areas_extra", []):
            if aid not in nuevas:
                nuevas.append(aid)
        o["politicas"] = nuevas

    return {**data, "politicas": areas, "objetos": objetos, "relaciones": relaciones}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="ciencia-tecnologia")
    ap.add_argument("--entrada")
    ap.add_argument("--salida")
    args = ap.parse_args()
    entrada = Path(args.entrada or f"data/sectores/{args.slug}/objetos.json")
    salida = Path(args.salida or entrada)
    curaduria = yaml.safe_load(Path(f"data/correcciones/{args.slug}/areas.yaml").read_text(encoding="utf-8"))
    data = json.loads(entrada.read_text(encoding="utf-8"))

    out = aplicar(data, curaduria)

    schema = json.loads(Path("data/schema/objeto.schema.json").read_text(encoding="utf-8"))
    errores = sorted(Draft202012Validator(schema).iter_errors(out), key=str)
    if errores:
        for e in errores[:10]:
            print("ERROR", "/".join(map(str, e.absolute_path)), e.message, file=sys.stderr)
        sys.exit(1)
    salida.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    cambios = {}
    for a in out["politicas"]:
        cambios[a["cambio_objetivo"]] = cambios.get(a["cambio_objetivo"], 0) + 1
    print(f"{entrada} -> {salida}: {len(data['politicas'])} políticas por gobierno -> {len(out['politicas'])} áreas "
          f"{cambios}; {len(data['objetos'])} -> {len(out['objetos'])} nodos; "
          f"{len(data.get('relaciones', []))} -> {len(out['relaciones'])} relaciones")


if __name__ == "__main__":
    main()
