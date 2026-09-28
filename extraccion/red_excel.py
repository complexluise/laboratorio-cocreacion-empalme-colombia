# /// script
# requires-python = ">=3.11"
# dependencies = ["openpyxl>=3.1", "pyyaml>=6.0"]
# ///
"""
Exporta la red de un sector a un Excel para el taller (issue #32): los grupos lo usan como consulta
(filtrar por política, tipo NATO, modo de cambio) mientras llenan la bitácora. DETERMINISTA, sin
llamadas pagas: lee el dataset que consume la web.

Hojas: Léeme (cómo usarlo + vocabulario de taxonomia.yaml) · Resumen (conteos con fórmulas sobre
Instrumentos y Políticas) · Políticas · Instrumentos · Relaciones.

Uso (desde la raíz):
  uv run extraccion/red_excel.py --slug ciencia-tecnologia      # -> web/public/red-<slug>.xlsx
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

DATOS_WEB = Path("web/src/lib/data")
TAXONOMIA = Path("data/schema/taxonomia.yaml")
SALIDA = Path("web/public")
VIGENCIAS = ["2018-2022", "2022-2026"]
ETQ_VIG = {"2018-2022": "2018–2022", "2022-2026": "2022–2026"}

# Etiquetas legibles (las mismas que la web: web/src/lib/visual.ts). Las claves se verifican contra
# taxonomia.yaml: si el vocabulario cambia y falta una etiqueta, el script falla.
ETQ_MODO = {
    "continuidad-estable": "continuidad estable",
    "conversion": "conversión",
    "estratificacion": "estratificación",
    "terminacion": "terminación",
    "reversion": "reversión",
    "deriva": "deriva",
}
ETQ_NATO = {"nodalidad": "nodalidad", "autoridad": "autoridad", "tesoro": "tesoro", "organizacion": "organización"}
ETQ_OBJETIVO = {"se-mantiene": "se mantiene", "se-reformula": "se reformula", "no-declarado": "no declarado", "nuevo": "nuevo"}
ETQ_RELACION = {"habilita": "habilita", "financia": "financia", "depende-de": "depende de", "encadena": "encadena"}

NOMBRE_SECTOR = {"ciencia-tecnologia": "Ciencia, Tecnología e Innovación"}

FUENTE = "Arial"
CABECERA = PatternFill("solid", fgColor="ECEAFD")
TITULO = Font(name=FUENTE, bold=True, size=16)
NEGRITA = Font(name=FUENTE, bold=True)
NORMAL = Font(name=FUENTE)
GRIS = Font(name=FUENTE, italic=True, color="5D6371")


def _verificar_vocabulario(tax: dict) -> None:
    pares = [
        (tax["objetos"]["modo_cambio"]["valores"], ETQ_MODO, "modo_cambio"),
        (tax["objetos"]["tipo_nato"]["valores"], ETQ_NATO, "tipo_nato"),
        (tax["politicas"]["cambio_objetivo"]["valores"], ETQ_OBJETIVO, "cambio_objetivo"),
        (tax["objetos"]["relaciones"], ETQ_RELACION, "relaciones"),
    ]
    for valores, etiquetas, nombre in pares:
        if set(valores) != set(etiquetas):
            sys.exit(f"red_excel.py: las etiquetas de {nombre} no coinciden con taxonomia.yaml: {sorted(set(valores) ^ set(etiquetas))}")


def _tabla(ws: Worksheet, cabecera: list[str], filas: list[list], anchos: list[int]) -> None:
    ws.append(cabecera)
    for c in ws[1]:
        c.font = NEGRITA
        c.fill = CABECERA
        c.alignment = Alignment(vertical="top", wrap_text=True)
    for f in filas:
        ws.append(f)
    for fila in ws.iter_rows(min_row=2):
        for c in fila:
            c.font = NORMAL
            c.alignment = Alignment(vertical="top", wrap_text=True)
    for i, ancho in enumerate(anchos, start=1):
        ws.column_dimensions[get_column_letter(i)].width = ancho
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = ws.dimensions


def _presencia(o: dict, v: str) -> str:
    p = (o.get("presencia") or {}).get(v)
    if not p or not p.get("activo", True):
        return "—"
    return p.get("modo") or "presente"


def libro(data: dict, tax: dict) -> Workbook:
    _verificar_vocabulario(tax)
    politicas = data.get("politicas", [])
    nombre_pol = {p["id"]: p["nombre"] for p in politicas}
    nombre_obj = {o["id"]: o["nombre"] for o in data["objetos"]}
    instrumentos = [o for o in data["objetos"] if not o.get("es_objetivo")]
    sector = NOMBRE_SECTOR.get(data["sector"], data["sector"])

    wb = Workbook()
    lee = wb.active
    lee.title = "Léeme"
    res = wb.create_sheet("Resumen")
    pol = wb.create_sheet("Políticas")
    ins = wb.create_sheet("Instrumentos")
    rel = wb.create_sheet("Relaciones")

    # ── Políticas
    filas = []
    for p in politicas:
        objs = p.get("objetivos") or {}
        fila = [p["nombre"], ETQ_OBJETIVO.get(p.get("cambio_objetivo", ""), "")]
        for v in VIGENCIAS:
            og = objs.get(v)
            fila += ["\n".join(og["enunciados"]) if og else "No declarado en este informe", "; ".join(og.get("declaradas", [])) if og else ""]
        fila += [sum(1 for o in instrumentos if p["id"] in o.get("politicas", [])), p["id"]]
        filas.append(fila)
    _tabla(
        pol,
        ["Política pública (área)", "Cambio del objetivo",
         "Objetivo 2018–2022", "Declarada como (2018–2022)", "Objetivo 2022–2026", "Declarada como (2022–2026)",
         "N.º de instrumentos", "id"],
        filas,
        [34, 16, 50, 32, 50, 32, 12, 26],
    )

    # ── Instrumentos
    filas = []
    for o in instrumentos:
        n = o.get("narrativa") or {}
        filas.append([
            o["nombre"],
            ETQ_NATO.get(o.get("tipo_nato", ""), ""),
            ETQ_MODO.get(o.get("modo_cambio", ""), ""),
            _presencia(o, "2018-2022"),
            _presencia(o, "2022-2026"),
            "; ".join(nombre_pol.get(x, x) for x in o.get("politicas", [])),
            "; ".join(o.get("entidades", [])),
            n.get("cambio", ""),
            n.get("g2018", ""),
            n.get("g2022", ""),
            "; ".join(f"{ETQ_VIG.get(e['vigencia'], e['vigencia'])}: p. {', '.join(map(str, e.get('paginas', [])))}"
                      for e in o.get("evidencia", []) if e.get("paginas")),
            o["id"],
        ])
    _tabla(
        ins,
        ["Instrumento", "Tipo NATO", "Modo de cambio", "Presencia 2018–2022", "Presencia 2022–2026",
         "Políticas a las que sirve", "Entidades", "Qué pasó entre gobiernos", "En 2018–2022", "En 2022–2026",
         "Evidencia (páginas del informe)", "id"],
        filas,
        [40, 13, 18, 14, 14, 36, 30, 50, 50, 50, 26, 30],
    )
    n_ins = len(filas) + 1  # última fila con datos

    # ── Relaciones
    _tabla(
        rel,
        ["Desde", "Relación", "Hacia", "Nota"],
        [[nombre_obj.get(r["source"], r["source"]), ETQ_RELACION.get(r["tipo"], r["tipo"]),
          nombre_obj.get(r["target"], r["target"]), r.get("nota", "")] for r in data.get("relaciones", [])],
        [40, 14, 40, 70],
    )

    # ── Resumen (fórmulas: se recalculan si el grupo edita o filtra la hoja Instrumentos)
    res["A1"] = f"Resumen de la red · {sector}"
    res["A1"].font = TITULO
    res["A2"] = "Conteos calculados con fórmulas sobre las hojas Instrumentos y Políticas."
    res["A2"].font = GRIS
    fila = 4

    def bloque(titulo: str, etiquetas: list[str], hoja: str, col: str, ultima: int) -> None:
        nonlocal fila
        res.cell(fila, 1, titulo).font = NEGRITA
        res.cell(fila, 1).fill = CABECERA
        res.cell(fila, 2, "Cantidad").font = NEGRITA
        res.cell(fila, 2).fill = CABECERA
        inicio = fila + 1
        for e in etiquetas:
            fila += 1
            res.cell(fila, 1, e).font = NORMAL
            res.cell(fila, 2, f"=COUNTIF('{hoja}'!${col}$2:${col}${ultima},A{fila})").font = NORMAL
        fila += 1
        res.cell(fila, 1, "Total").font = NEGRITA
        res.cell(fila, 2, f"=SUM(B{inicio}:B{fila - 1})").font = NEGRITA
        fila += 2

    bloque("Instrumentos por modo de cambio", list(ETQ_MODO.values()), "Instrumentos", "C", n_ins)
    bloque("Instrumentos por tipo NATO", list(ETQ_NATO.values()), "Instrumentos", "B", n_ins)
    bloque("Políticas por cambio del objetivo", list(ETQ_OBJETIVO.values()), "Políticas", "B", len(politicas) + 1)
    res.column_dimensions["A"].width = 38
    res.column_dimensions["B"].width = 12

    # ── Léeme
    lineas: list[tuple[str, Font]] = [
        (f"La red de políticas e instrumentos · {sector}", TITULO),
        ("Laboratorio de Cocreación · empalme 2018–2022 ↔ 2022–2026", GRIS),
        ("", NORMAL),
        ("Para qué sirve", NEGRITA),
        ("Es la misma red del sitio, en tabla, para consultarla mientras llenan la bitácora. Usen los filtros de cada "
         "columna (flecha del encabezado) para ver, por ejemplo, los instrumentos de su política o los que se terminaron.", NORMAL),
        ("Es un punto de partida, no la verdad: si el informe o la información complementaria dicen otra cosa, anótenlo en la bitácora.", NORMAL),
        ("Advertencia: esta red se generó con inteligencia artificial y aún no se ha revisado al 100 %. Revisarla contra "
         "los informes es parte del ejercicio: si encuentran un error, anótenlo en la bitácora o avísenle al equipo. "
         "Cómo la hicimos y qué está revisado: sitio del laboratorio › Cómo lo hicimos (ADR-0006).", NEGRITA),
        ("", NORMAL),
        ("Hojas", NEGRITA),
        ("Resumen — cuántos instrumentos hay por modo de cambio y tipo NATO, y cuántas políticas por cambio del objetivo.", NORMAL),
        ("Políticas — cada área con el objetivo que declara cada gobierno y cómo cambió.", NORMAL),
        ("Instrumentos — tipo NATO, modo de cambio, presencia por gobierno, políticas, entidades, qué pasó y páginas del informe.", NORMAL),
        ("Relaciones — cuando un instrumento habilita, financia, depende de o se encadena con otro.", NORMAL),
        ("", NORMAL),
        ("Presencia por gobierno", NEGRITA),
    ]
    lineas += [(f"{k} — {v}", NORMAL) for k, v in tax["objetos"]["modo_presencia"]["valores"].items()]
    lineas += [("— — no aparece en el informe de ese gobierno.", NORMAL), ("", NORMAL), ("Modo de cambio del instrumento", NEGRITA)]
    lineas += [(f"{ETQ_MODO[k]} — {v}", NORMAL) for k, v in tax["objetos"]["modo_cambio"]["valores"].items()]
    lineas += [("", NORMAL), ("Tipo de instrumento (NATO, Hood)", NEGRITA)]
    lineas += [(f"{ETQ_NATO[k]} — {v}", NORMAL) for k, v in tax["objetos"]["tipo_nato"]["valores"].items()]
    lineas += [("", NORMAL), ("Cambio del objetivo de la política", NEGRITA)]
    lineas += [(f"{ETQ_OBJETIVO[k]} — {v}", NORMAL) for k, v in tax["politicas"]["cambio_objetivo"]["valores"].items()]
    lineas += [("", NORMAL), ("Glosario completo y la actividad: en el sitio del laboratorio.", GRIS)]
    for i, (texto, fuente) in enumerate(lineas, start=1):
        c = lee.cell(i, 1, texto)
        c.font = fuente
        c.alignment = Alignment(wrap_text=True, vertical="top")
    lee.column_dimensions["A"].width = 110
    wb.calculation.fullCalcOnLoad = True  # openpyxl no guarda resultados: Excel/Sheets recalculan al abrir
    return wb


def ruta_salida(slug: str) -> Path:
    return SALIDA / f"red-{slug}.xlsx"


def al_dia(slug: str) -> list[str]:
    """El Excel publicado refleja el dataset actual (mismas políticas e instrumentos, mismo orden)."""
    from openpyxl import load_workbook

    ruta = ruta_salida(slug)
    if not ruta.exists():
        return [f"falta {ruta}: uv run extraccion/red_excel.py --slug {slug}"]
    data = json.loads((DATOS_WEB / f"{slug}.json").read_text(encoding="utf-8"))
    wb = load_workbook(ruta, read_only=True)
    ids_ins = [r[-1] for r in wb["Instrumentos"].iter_rows(min_row=2, values_only=True)]
    ids_pol = [r[-1] for r in wb["Políticas"].iter_rows(min_row=2, values_only=True)]
    esperados_ins = [o["id"] for o in data["objetos"] if not o.get("es_objetivo")]
    esperados_pol = [p["id"] for p in data.get("politicas", [])]
    if ids_ins != esperados_ins or ids_pol != esperados_pol:
        return [f"{ruta} no refleja el dataset actual: uv run extraccion/red_excel.py --slug {slug}"]
    return []


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--slug", required=True)
    ap.add_argument("--salida", type=Path)
    a = ap.parse_args()
    data = json.loads((DATOS_WEB / f"{a.slug}.json").read_text(encoding="utf-8"))
    tax = yaml.safe_load(TAXONOMIA.read_text(encoding="utf-8"))
    salida = a.salida or ruta_salida(a.slug)
    salida.parent.mkdir(parents=True, exist_ok=True)
    libro(data, tax).save(salida)
    print(f"ok  {salida} · {len(data.get('politicas', []))} políticas · "
          f"{sum(1 for o in data['objetos'] if not o.get('es_objetivo'))} instrumentos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
