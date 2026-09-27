# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6.0", "jsonschema>=4.0"]
# ///
"""
Aplica correcciones verificadas (overlay) sobre el objetos.json generado por el pipeline.

Las correcciones salieron de una revisión adversarial contra los informes de empalme y viven,
versionadas, en data/sectores/<slug>/correcciones.yaml (estructural) y narrativa.json (detalle por
gobierno). Este paso es DETERMINISTA y RE-APLICABLE: correr después de extraer_instrumentos.py y
antes de generar_web.py. Así las correcciones no las pisa una futura corrida de Gemini.

Operaciones (en orden): dedup de políticas -> merges -> splits -> reclasificar modo_cambio ->
presencia 2022-2026 -> alias_add -> cifra_add -> adjuntar narrativa. Valida contra objeto.schema.json.

Uso: uv run extraccion/aplicar_correcciones.py --slug ciencia-tecnologia
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

MODOS = ["propuesto", "logrado", "pendiente"]
PRIO = ["logrado", "propuesto", "pendiente"]


def find(objs, oid):
    for o in objs:
        if o["id"] == oid:
            return o
    return None


def merge_presencia(a, b):
    """Une dos dicts de presencia, quedándose con el modo más fuerte por vigencia."""
    out = dict(a)
    for per, blk in (b or {}).items():
        if per not in out:
            out[per] = dict(blk)
        else:
            m1, m2 = out[per].get("modo"), blk.get("modo")
            cand = [m for m in (m1, m2) if m in PRIO]
            out[per] = {"activo": True}
            if cand:
                out[per]["modo"] = min(cand, key=PRIO.index)
    return out


def merge_evidencia(a, b):
    """Une evidencia por vigencia (páginas ∪, cifras ∪)."""
    idx = {}
    for ev in (a or []) + (b or []):
        v = ev["vigencia"]
        cur = idx.setdefault(v, {"vigencia": v, "paginas": [], "cifras": []})
        cur["paginas"] = sorted(set(cur["paginas"]) | set(ev.get("paginas", [])))
        cur["cifras"] += ev.get("cifras", [])
    out = []
    for v, ev in idx.items():
        r = {"vigencia": v}
        if ev["paginas"]:
            r["paginas"] = ev["paginas"]
        if ev["cifras"]:
            r["cifras"] = ev["cifras"]
        out.append(r)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="ciencia-tecnologia")
    args = ap.parse_args()
    base = Path("data/sectores") / args.slug
    overlay = Path("data/correcciones") / args.slug   # versionado (committeado)
    doc = json.loads((base / "objetos.json").read_text(encoding="utf-8"))
    corr_path = overlay / "correcciones.yaml"
    if not corr_path.exists():
        print(f"No hay {corr_path}; nada que aplicar."); return
    corr = yaml.safe_load(corr_path.read_text(encoding="utf-8")) or {}
    objs = doc["objetos"]
    pols = doc.get("politicas", [])
    rels = doc.get("relaciones", [])
    n = {"dedup": 0, "merge": 0, "split": 0, "reclas": 0, "pres": 0, "alias": 0, "cifra": 0, "narr": 0}

    # 1) dedup de políticas: remapea from->into en objetos y quita las from
    remap = {}
    for g in corr.get("dedup_politicas", []):
        into = g["into"]
        for f in g.get("from", []):
            remap[f] = into
        if g.get("nombre"):
            p = next((x for x in pols if x["id"] == into), None)
            if p:
                p["nombre"] = g["nombre"]
        n["dedup"] += len(g.get("from", []))
    if remap:
        pols = [p for p in pols if p["id"] not in remap]
        for o in objs:
            o["politicas"] = list(dict.fromkeys(remap.get(p, p) for p in o.get("politicas", [])))

    # 2) merges: fusiona from dentro de into
    for m in corr.get("merges", []):
        into = find(objs, m["into"])
        if not into:
            print(f"  ! merge: no existe into={m['into']}", file=sys.stderr); continue
        for fid in m.get("from", []):
            src = find(objs, fid)
            if not src:
                print(f"  ! merge: no existe from={fid}", file=sys.stderr); continue
            into["presencia"] = merge_presencia(into["presencia"], src["presencia"])
            into["evidencia"] = merge_evidencia(into.get("evidencia"), src.get("evidencia"))
            into["politicas"] = list(dict.fromkeys(into.get("politicas", []) + src.get("politicas", [])))
            into["entidades"] = sorted(set(into.get("entidades", []) + src.get("entidades", [])))
            into["alias"] = sorted(set(into.get("alias", []) + [src["nombre"]] + src.get("alias", [])))
            objs = [o for o in objs if o["id"] != fid]
            for r in rels:  # redirige aristas
                if r["source"] == fid: r["source"] = into["id"]
                if r["target"] == fid: r["target"] = into["id"]
            n["merge"] += 1
        if m.get("nombre"): into["nombre"] = m["nombre"]
        if m.get("modo_cambio"): into["modo_cambio"] = m["modo_cambio"]
        if m.get("alias_set") is not None: into["alias"] = m["alias_set"]

    # 3) splits: reemplaza un nodo por varios definidos
    for sp in corr.get("splits", []):
        orig = find(objs, sp["id"])
        if not orig:
            print(f"  ! split: no existe {sp['id']}", file=sys.stderr); continue
        objs = [o for o in objs if o["id"] != sp["id"]]
        rels = [r for r in rels if sp["id"] not in (r["source"], r["target"])]  # descarta aristas del original
        for j, spec in enumerate(sp["en"]):
            pres = {per: ({"activo": True, "modo": modo} if modo else {"activo": True})
                    for per, modo in (spec.get("presencia") or {}).items()}
            ev = merge_evidencia(orig.get("evidencia"), []) if j == 0 else [{"vigencia": v} for v in pres]
            nodo = {
                "id": spec["id"], "nombre": spec["nombre"],
                "es_objetivo": bool(spec.get("es_objetivo", orig.get("es_objetivo", False))),
                "politicas": spec.get("politicas", orig.get("politicas", [])),
                "alias": spec.get("alias", []),
                "presencia": pres or orig["presencia"],
                "modo_cambio": spec.get("modo_cambio", orig["modo_cambio"]),
                "entidades": spec.get("entidades", orig.get("entidades", [])),
                "evidencia": ev or [{"vigencia": v} for v in (pres or orig["presencia"])],
            }
            if not nodo["es_objetivo"] and spec.get("tipo_nato"):
                nodo["tipo_nato"] = spec["tipo_nato"]
            objs.append(nodo)
            n["split"] += 1

    # 4) reclasificar modo_cambio
    for oid, modo in (corr.get("reclasificar") or {}).items():
        o = find(objs, oid)
        if o:
            o["modo_cambio"] = modo; n["reclas"] += 1
        else:
            print(f"  ! reclasificar: no existe {oid}", file=sys.stderr)

    # 5) presencia 2022-2026
    for oid, modo in (corr.get("presencia_2022") or {}).items():
        o = find(objs, oid)
        if not o:
            continue
        blk = {"activo": True}
        if modo in MODOS:
            blk["modo"] = modo
        o["presencia"]["2022-2026"] = o["presencia"].get("2022-2026") or blk
        if not any(e["vigencia"] == "2022-2026" for e in o.get("evidencia", [])):
            o.setdefault("evidencia", []).append({"vigencia": "2022-2026"})
        n["pres"] += 1

    # 6) alias_add
    for oid, extra in (corr.get("alias_add") or {}).items():
        o = find(objs, oid)
        if o:
            o["alias"] = sorted(set(o.get("alias", []) + list(extra))); n["alias"] += 1

    # 7) cifra_add
    for oid, spec in (corr.get("cifra_add") or {}).items():
        o = find(objs, oid)
        if not o:
            continue
        v = spec["vigencia"]
        ev = next((e for e in o.get("evidencia", []) if e["vigencia"] == v), None)
        if not ev:
            ev = {"vigencia": v}; o.setdefault("evidencia", []).append(ev)
        ev.setdefault("cifras", []).append({"texto": spec["texto"]})
        n["cifra"] += 1

    # 8) adjuntar narrativa (detalle por gobierno)
    narr_path = overlay / "narrativa.json"
    if narr_path.exists():
        narr = json.loads(narr_path.read_text(encoding="utf-8"))
        for o in objs:
            d = narr.get(o["id"])
            if d and (d.get("g2018") or d.get("g2022") or d.get("cambio")):
                o["narrativa"] = {k: d[k] for k in ("g2018", "g2022", "cambio") if d.get(k)}
                n["narr"] += 1

    doc["objetos"] = objs
    doc["politicas"] = pols
    doc["relaciones"] = [r for r in rels if find(objs, r["source"]) and find(objs, r["target"]) and r["source"] != r["target"]]

    schema = json.loads(Path("data/schema/objeto.schema.json").read_text(encoding="utf-8"))
    errs = sorted(Draft202012Validator(schema).iter_errors(doc), key=lambda e: list(e.path))
    if errs:
        print(f"⚠ {len(errs)} problemas de validación; primero: {errs[0].message[:160]}", file=sys.stderr)

    (base / "objetos.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    (base / "objetos.yaml").write_text(yaml.safe_dump(doc, allow_unicode=True, sort_keys=False, width=100), encoding="utf-8")
    from collections import Counter
    print("Correcciones aplicadas:", {k: v for k, v in n.items() if v})
    print(f"objetos: {len(objs)} | políticas: {len(pols)} | relaciones: {len(doc['relaciones'])}")
    print("modo_cambio:", dict(Counter(o["modo_cambio"] for o in objs)))


if __name__ == "__main__":
    main()
