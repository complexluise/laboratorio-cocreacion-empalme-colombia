# /// script
# requires-python = ">=3.11"
# dependencies = ["python-docx>=1.1", "jsonschema>=4.0"]
# ///
"""
La BITÁCORA del grupo (épico #26, ADR-0005): una plantilla .docx lista para llenar (sin pre-llenar)
y su conversión a dato estructurado conforme a data/schema/bitacora.schema.json.

Una sola definición de la estructura (SECCIONES y compañía, abajo) sirve para GENERAR la plantilla,
LLENARLA (ejemplo / pruebas) y LEERLA. El lector reconoce cada tabla por el texto de su primera
celda y cada fila por su etiqueta, no por su posición: tolera filas agregadas o vacías, párrafos
múltiples, mayúsculas y tildes (ediciones típicas en Word o Google Docs).

Convención de celdas (igual que el schema):
- texto            -> lo que escribió el grupo
- «Sin dato»       -> null: HUECO de información declarado (la fuente no lo dice; es un hallazgo)
- vacía            -> no llenada: se omite y se lista en `sin_llenar`

Uso (desde la raíz):
  uv run extraccion/bitacora.py generar                        # -> web/public/bitacora-laboratorio.docx
  uv run extraccion/bitacora.py ejemplo                        # -> web/public/bitacora-ejemplo-ctei.docx
  uv run extraccion/bitacora.py leer grupo3.docx --slug ciencia-tecnologia
                                                               # -> data/bitacoras/<slug>/<grupo>.json
  uv run extraccion/bitacora.py probar                         # ida y vuelta con el ejemplo CTeI
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from jsonschema import Draft202012Validator

VERSION = 1
VIGENCIAS = ["2018-2022", "2022-2026"]
ETIQUETA_VIGENCIA = {"2018-2022": "2018–2022 (Duque)", "2022-2026": "2022–2026 (Petro)"}
SIN_DATO = "Sin dato"

SCHEMA = Path("data/schema/bitacora.schema.json")
PLANTILLA = Path("web/public/bitacora-laboratorio.docx")
EJEMPLO_DOCX = Path("web/public/bitacora-ejemplo-ctei.docx")
EJEMPLO_JSON = Path(__file__).parent / "ejemplos" / "bitacora-ctei.json"
DATOS_WEB = Path("web/src/lib/data")
SALIDA = Path("data/bitacoras")


# ─────────────────────────── La estructura (definición única) ───────────────────────────


@dataclass(frozen=True)
class Fila:
    clave: str
    etiqueta: str
    pista: str = ""


@dataclass(frozen=True)
class Comparativa:
    """Tabla lado a lado: una fila por campo, una columna por gobierno."""

    clave: str  # clave en el JSON: {clave: {vigencia: {fila: celda}}}
    titulo: str  # encabezado de la sección
    cabecera: str  # texto de la primera celda: identifica la tabla al leer
    guia: str
    filas: tuple[Fila, ...]


@dataclass(frozen=True)
class Caja:
    """Texto libre: tabla de una columna (título + espacio para escribir)."""

    clave: str
    titulo: str
    guia: str
    alto_cm: float = 5.0


DATOS = (
    Fila("grupo", "Grupo", "Nombre o número del grupo"),
    Fila("integrantes", "Integrantes", "Separados por coma"),
    Fila("politica", "Política pública (área)", "Como aparece en la red, p. ej. «Bioeconomía»"),
    Fila("fecha", "Fecha"),
)

UBICACION = Comparativa(
    "ubicacion",
    "1. Ubicación y avance",
    "Ubicación y avance",
    "Dónde está la política en el informe de cada gobierno y qué avance reporta.",
    (
        Fila("ubicacion", "Ubicación en el documento", "Pacto, transformación o sección del informe"),
        Fila("avance", "Avance reportado", "¿Qué porcentaje o logro reporta?"),
    ),
)
COMPARABILIDAD = Caja(
    "comparabilidad",
    "Hallazgo de comparabilidad (tabla puente)",
    "Antes de comparar cifras: ¿qué parte de un informe corresponde a qué parte del otro? ¿Miden lo mismo?",
    3.5,
)
INSTRUMENTOS = Comparativa(
    "instrumentos",
    "1.1 Instrumentos de política pública",
    "Instrumentos",
    "Con qué actuó el Estado en esta política. Anoten si el instrumento sigue, cambia de uso, se suma o se deja.",
    (
        Fila("principal", "Instrumento principal", "El que más peso o recursos tiene"),
        Fila("talento", "Instrumento de formación de talento", "Becas, formación, vocaciones"),
        Fila("fiscal", "Instrumento fiscal o tributario", "Beneficios tributarios, fondos, cupos"),
    ),
)
SUBCATEGORIAS = Comparativa(
    "subcategorias",
    "2–8. Las siete subcategorías, lado a lado",
    "Subcategoría",
    "Lo mismo para los dos gobiernos, fila por fila. Si el informe no lo dice, escriban «Sin dato».",
    (
        Fila("objetivo", "2. Objetivo", "¿Qué declara cada gobierno que busca?"),
        Fila("instituciones", "3. Instituciones", "¿Qué entidades la ejecutan o coordinan?"),
        Fila("poblacion", "4. Población", "¿A quién va dirigida? ¿Enfoque diferencial o territorial?"),
        Fila("normativa", "5. Normativa", "Leyes, decretos o CONPES que la sustentan"),
        Fila("recursos", "6. Recursos", "¿Cuánto dinero y de qué fuente?"),
        Fila("metas", "7. Metas", "¿Qué cifras reporta y contra qué meta del cuatrienio?"),
        Fila("impacto", "8. Impacto", "¿Hay evidencia de impacto o solo de gestión y producto?"),
    ),
)
COMPARATIVAS = (UBICACION, INSTRUMENTOS, SUBCATEGORIAS)

FUENTES_CABECERA = ("Fuente", "Qué aportó", "Página o enlace")
FUENTES_CLAVES = ("fuente", "aporte", "referencia")
FUENTES_FILAS = 6

HALLAZGOS = Caja(
    "hallazgos",
    "Lo que el ejercicio le enseña al taller",
    "Para el plenario, en pocas líneas. Pistas: ¿el objetivo revela un giro de enfoque? ¿las metas son "
    "comparables o hay que homologarlas? ¿hay evidencia de impacto o solo de gestión? ¿qué huecos tiene "
    "cada informe?",
    6.0,
)
HIPOTESIS = Caja(
    "hipotesis",
    "Hipótesis para la sesión 2",
    "¿Qué patrón creen que comparten las otras políticas? Se contrasta con el mapa integrado.",
    3.5,
)
CAJAS = (COMPARABILIDAD, HALLAZGOS, HIPOTESIS)


# ─────────────────────────── Utilidades ───────────────────────────


def normalizar(s: str, *, numeracion: bool = True) -> str:
    """Sin tildes, minúsculas, espacios colapsados; por defecto sin numeración inicial."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = s.replace("–", "-").replace("—", "-")
    if numeracion:
        s = re.sub(r"^\s*\d+(\s*[.\-]\s*\d+)*\.?\s+", "", s)  # «2. », «1.1 », «2-8. »
    return re.sub(r"\s+", " ", s).strip(" :")


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalizar(s)).strip("-") or "sin-nombre"


def _texto_celda(celda) -> str:
    """Todo el texto de la celda, incluidas tablas pegadas dentro (se leen fila por fila)."""
    lineas = [p.text.strip() for p in celda.paragraphs]
    for anidada in celda.tables:
        for fila in anidada.rows:
            lineas.append(" · ".join(t for t in (_texto_celda(c) for c in fila.cells) if t))
    return "\n".join(l for l in lineas if l)


def _primera_linea(celda) -> str:
    for p in celda.paragraphs:
        if p.text.strip():
            return p.text.strip()
    return ""


_HUECO = re.compile(r"^\s*(sin\s+datos?|s\s*/\s*d|no\s+hay\s+datos?)\b\.?(.*)$", re.IGNORECASE | re.DOTALL)


def _valor(texto: str):
    """texto -> (presente, valor, nota). «Sin dato» (o «S/D», «No hay dato») es null: hueco
    declarado; «Sin dato: <nota>» o «Sin dato (<nota>)» conserva la nota aparte. Vacío = no llenado."""
    if not texto:
        return False, None, None
    m = _HUECO.match(texto)
    if m:
        nota = m.group(2).strip().lstrip(":-–—(").strip().rstrip(".)").strip()
        return True, None, nota or None
    return True, texto, None


# ─────────────────────────── Generar ───────────────────────────

GRIS = RGBColor(0x5D, 0x63, 0x71)
TINTA = RGBColor(0x23, 0x26, 0x2E)
ACENTO = RGBColor(0x4F, 0x46, 0xE5)
ANCHO_UTIL_CM = 17.6  # carta con márgenes de 2 cm


def _sombrear(celda, color: str) -> None:
    tc = celda._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color)
    tc.append(shd)


def _alto_minimo(fila, cm: float) -> None:
    trPr = fila._tr.get_or_add_trPr()
    alto = OxmlElement("w:trHeight")
    alto.set(qn("w:val"), str(int(cm * 567)))
    alto.set(qn("w:hRule"), "atLeast")
    trPr.append(alto)


def _no_partir(fila) -> None:
    trPr = fila._tr.get_or_add_trPr()
    trPr.insert(0, OxmlElement("w:cantSplit"))  # va antes de trHeight en el esquema


def _cabecera_pegada(fila) -> None:
    """La fila de encabezado se repite en cada página y no queda sola al pie."""
    trPr = fila._tr.get_or_add_trPr()
    trPr.append(OxmlElement("w:tblHeader"))
    for celda in fila.cells:
        for p in celda.paragraphs:
            p.paragraph_format.keep_with_next = True


def _anchos(tabla, anchos_cm: list[float]) -> None:
    tabla.autofit = False
    tabla.alignment = WD_TABLE_ALIGNMENT.CENTER
    for fila in tabla.rows:
        for celda, ancho in zip(fila.cells, anchos_cm):
            celda.width = Cm(ancho)


def _escribir(celda, texto: str, *, negrita=False, color=None, tam=None, cursiva=False) -> None:
    p = celda.paragraphs[0]
    r = p.add_run(texto)
    r.bold = negrita
    r.italic = cursiva
    if color is not None:
        r.font.color.rgb = color
    if tam is not None:
        r.font.size = Pt(tam)


def _etiqueta(celda, fila: Fila) -> None:
    _escribir(celda, fila.etiqueta, negrita=True)
    if fila.pista:
        p = celda.add_paragraph()
        r = p.add_run(fila.pista)
        r.italic = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = GRIS


def _guia(doc, texto: str) -> None:
    p = doc.add_paragraph()
    r = p.add_run(texto)
    r.italic = True
    r.font.color.rgb = GRIS
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True


def _titulo(doc, texto: str) -> None:
    h = doc.add_heading(texto, level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.color.rgb = TINTA
        r.font.size = Pt(14)


def _tabla_comparativa(doc, c: Comparativa) -> None:
    t = doc.add_table(rows=1 + len(c.filas), cols=3)
    t.style = "Table Grid"
    cab = t.rows[0].cells
    _escribir(cab[0], c.cabecera, negrita=True)
    for i, v in enumerate(VIGENCIAS, start=1):
        _escribir(cab[i], ETIQUETA_VIGENCIA[v], negrita=True)
    for celda in cab:
        _sombrear(celda, "ECEAFD")
    _cabecera_pegada(t.rows[0])
    for fila, def_fila in zip(t.rows[1:], c.filas):
        _etiqueta(fila.cells[0], def_fila)
        _sombrear(fila.cells[0], "F5F5F3")
        _alto_minimo(fila, 2.2)
        _no_partir(fila)
    _anchos(t, [4.4, 6.6, 6.6])


def _caja(doc, c: Caja) -> None:
    t = doc.add_table(rows=2, cols=1)
    t.style = "Table Grid"
    _escribir(t.rows[0].cells[0], c.titulo, negrita=True)
    _sombrear(t.rows[0].cells[0], "ECEAFD")
    _cabecera_pegada(t.rows[0])
    _alto_minimo(t.rows[1], c.alto_cm)
    _no_partir(t.rows[1])
    _anchos(t, [ANCHO_UTIL_CM])


def _pie(seccion) -> None:
    p = seccion.footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(f"Laboratorio de Cocreación · Bitácora de grupo · v{VERSION} · página ")
    r.font.size = Pt(8)
    r.font.color.rgb = GRIS
    # Campo PAGE (número de página).
    for tipo, texto in (("begin", None), (None, "PAGE"), ("end", None)):
        run = p.add_run()
        run.font.size = Pt(8)
        run.font.color.rgb = GRIS
        if tipo:
            fld = OxmlElement("w:fldChar")
            fld.set(qn("w:fldCharType"), tipo)
            run._r.append(fld)
        else:
            instr = OxmlElement("w:instrText")
            instr.set(qn("xml:space"), "preserve")
            instr.text = texto
            run._r.append(instr)


def plantilla() -> Document:
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21.59), Cm(27.94)  # carta
    for lado in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(sec, lado, Cm(2))
    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10)
    normal.font.color.rgb = TINTA
    _pie(sec)

    t = doc.add_paragraph()
    r = t.add_run("Bitácora de grupo")
    r.bold = True
    r.font.size = Pt(22)
    s = doc.add_paragraph()
    r = s.add_run("Laboratorio de Cocreación · Una política pública, dos gobiernos")
    r.font.color.rgb = ACENTO
    r.bold = True

    doc.add_paragraph(
        "Elijan una política pública de la red y descríbanla en los dos gobiernos (2018–2022 y 2022–2026), "
        "con el informe de empalme y con información complementaria (Sinergia, el Plan Nacional de "
        "Desarrollo, el capítulo de inversión pública, normas y documentos CONPES)."
    )
    regla = doc.add_paragraph()
    r = regla.add_run("Regla: si la fuente no lo dice, escriban «Sin dato». ")
    r.bold = True
    regla.add_run(
        "Pueden aclarar el porqué: «Sin dato: el balance no lo desagrega». Un hueco de información es un "
        "hallazgo: se anota, no se rellena con supuestos. No cambien los títulos de las tablas ni de las "
        "filas, ni combinen celdas: con ellos el equipo lee la bitácora y la integra al mapa."
    )

    datos = doc.add_table(rows=len(DATOS), cols=2)
    datos.style = "Table Grid"
    for fila, d in zip(datos.rows, DATOS):
        _etiqueta(fila.cells[0], d)
        _sombrear(fila.cells[0], "F5F5F3")
        _alto_minimo(fila, 0.9)
    _anchos(datos, [5.0, ANCHO_UTIL_CM - 5.0])

    _titulo(doc, UBICACION.titulo)
    _guia(doc, UBICACION.guia)
    _tabla_comparativa(doc, UBICACION)
    doc.add_paragraph()
    _guia(doc, COMPARABILIDAD.guia)
    _caja(doc, COMPARABILIDAD)

    for c in (INSTRUMENTOS, SUBCATEGORIAS):
        _titulo(doc, c.titulo)
        _guia(doc, c.guia)
        _tabla_comparativa(doc, c)

    _titulo(doc, "Fuentes complementarias")
    _guia(doc, "Lo que consultaron más allá del informe de empalme. Agreguen filas si hace falta.")
    f = doc.add_table(rows=1 + FUENTES_FILAS, cols=3)
    f.style = "Table Grid"
    for celda, texto in zip(f.rows[0].cells, FUENTES_CABECERA):
        _escribir(celda, texto, negrita=True)
        _sombrear(celda, "ECEAFD")
    _cabecera_pegada(f.rows[0])
    for fila in f.rows[1:]:
        _alto_minimo(fila, 1.0)
    _anchos(f, [6.0, 6.6, 5.0])

    for c in (HALLAZGOS, HIPOTESIS):
        _titulo(doc, c.titulo)
        _guia(doc, c.guia)
        _caja(doc, c)
    return doc


# ─────────────────────────── Llenar (ejemplo y pruebas) ───────────────────────────


def _poner(celda, valor) -> None:
    """string -> texto (una línea por párrafo); None -> «Sin dato»."""
    lineas = [SIN_DATO] if valor is None else str(valor).split("\n")
    celda.paragraphs[0].text = lineas[0]
    for l in lineas[1:]:
        celda.add_paragraph(l)


def llenar(doc: Document, b: dict) -> Document:
    tablas = _indexar(doc)
    datos = tablas["datos"]
    valores = {
        "grupo": b["grupo"]["nombre"],
        "integrantes": ", ".join(b["grupo"]["integrantes"]),
        "politica": b["politica"]["nombre"],
        "fecha": b.get("fecha", ""),
    }
    for fila in datos.rows:
        clave = _fila_de(DATOS, _primera_linea(fila.cells[0]))
        if clave and valores.get(clave):
            _poner(fila.cells[1], valores[clave])
    for c in COMPARATIVAS:
        t = tablas[c.clave]
        cols = _columnas_vigencia(t)
        for fila in t.rows[1:]:
            clave = _fila_de(c.filas, _primera_linea(fila.cells[0]))
            for v, i in cols.items():
                if clave and clave in b[c.clave][v]:
                    _poner(fila.cells[i], b[c.clave][v][clave])
    for c in CAJAS:
        if c.clave in b:
            _poner(tablas[c.clave].rows[1].cells[0], b[c.clave])
    f = tablas["fuentes"]
    while len(f.rows) - 1 < len(b["fuentes"]):
        f.add_row()
    for fila, fuente in zip(f.rows[1:], b["fuentes"]):
        for celda, k in zip(fila.cells, FUENTES_CLAVES):
            if fuente.get(k):
                _poner(celda, fuente[k])
    return doc


# ─────────────────────────── Leer ───────────────────────────


class PlantillaInvalida(Exception):
    pass


def _fila_de(filas: tuple[Fila, ...], etiqueta: str) -> str | None:
    """Etiqueta exacta, o ampliada por el grupo en la misma línea («Objetivo del gobierno»)."""
    n = normalizar(etiqueta)
    for f in filas:
        if n == normalizar(f.etiqueta):
            return f.clave
    ampliadas = [f for f in filas if n.startswith(normalizar(f.etiqueta) + " ")]
    return max(ampliadas, key=lambda f: len(f.etiqueta)).clave if ampliadas else None


def _indexar(doc: Document) -> dict:
    """Clave de sección -> tabla, reconocida por el texto de su primera celda."""
    por_cabecera = {normalizar(c.cabecera): c.clave for c in COMPARATIVAS}
    por_cabecera |= {normalizar(c.titulo): c.clave for c in CAJAS}
    por_cabecera[normalizar(FUENTES_CABECERA[0])] = "fuentes"
    por_cabecera[normalizar(DATOS[0].etiqueta)] = "datos"
    tablas = {}
    for t in doc.tables:
        if not t.rows:
            continue
        clave = por_cabecera.get(normalizar(_primera_linea(t.rows[0].cells[0])))
        if clave and clave not in tablas:
            tablas[clave] = t
    faltan = [c for c in ["datos", *(c.clave for c in COMPARATIVAS), *(c.clave for c in CAJAS), "fuentes"] if c not in tablas]
    if faltan:
        raise PlantillaInvalida(
            "no parece una bitácora del laboratorio (v%d): faltan las tablas %s. ¿Se cambiaron los títulos?"
            % (VERSION, ", ".join(faltan))
        )
    return tablas


def _columnas_vigencia(t) -> dict[str, int]:
    """Columna de cada gobierno por su encabezado: «2018» marca el primero y «2026» el segundo, en
    cualquier parte del texto («Gobierno Duque (2018–2022)» sirve)."""
    cols = {}
    for i, celda in enumerate(t.rows[0].cells[1:], start=1):
        n = normalizar(_primera_linea(celda), numeracion=False)
        v = "2018-2022" if "2018" in n else "2022-2026" if "2026" in n else None
        if v and v not in cols:
            cols[v] = i
    if set(cols) != set(VIGENCIAS):
        raise PlantillaInvalida(
            f"en la tabla «{_primera_linea(t.rows[0].cells[0])}» no se reconocen las columnas de los dos "
            "gobiernos: sus encabezados deben mencionar 2018–2022 y 2022–2026"
        )
    return cols


def _id_politica(nombre: str, sector: str) -> str | None:
    dataset = DATOS_WEB / f"{sector}.json"
    if not nombre or not dataset.exists():
        return None
    n = normalizar(nombre)
    politicas = json.loads(dataset.read_text(encoding="utf-8")).get("politicas", [])
    for p in politicas:
        if normalizar(p["nombre"]) == n or p["id"] == slug(nombre):
            return p["id"]
    return None


def leer(doc: Document, sector: str) -> dict:
    tablas = _indexar(doc)
    sin_llenar: list[str] = []
    notas: dict[str, str] = {}

    def celda(ruta: str, texto: str):
        """Registra la celda: (presente, valor). Vacía -> sin_llenar; «Sin dato: nota» -> notas."""
        presente, valor, nota = _valor(texto)
        if not presente:
            sin_llenar.append(ruta)
        if nota:
            notas[ruta] = nota
        return presente, valor

    datos: dict[str, str] = {}
    for fila in tablas["datos"].rows:
        clave = _fila_de(DATOS, _primera_linea(fila.cells[0]))
        if clave and clave not in datos:
            datos[clave] = _texto_celda(fila.cells[1]) if len(fila.cells) > 1 and fila.cells[1]._tc is not fila.cells[0]._tc else ""
    for d in DATOS:
        if d.clave not in datos:
            raise PlantillaInvalida(f"falta la fila «{d.etiqueta}» en la tabla de datos del grupo")
    valores = {}
    for d in DATOS:
        presente, valor = celda(d.clave, datos[d.clave])
        valores[d.clave] = valor if presente and valor is not None else ""
    integrantes = [x.strip() for x in re.split(r"[,;\n]", valores["integrantes"]) if x.strip()]
    politica = {"nombre": valores["politica"]}
    if (pid := _id_politica(politica["nombre"], sector)) is not None:
        politica["id"] = pid
    b: dict = {
        "version": VERSION,
        "sector": sector,
        "grupo": {"nombre": valores["grupo"], "integrantes": integrantes},
        "politica": politica,
    }
    if valores["fecha"]:
        b["fecha"] = valores["fecha"]

    for c in COMPARATIVAS:
        t = tablas[c.clave]
        cols = _columnas_vigencia(t)
        b[c.clave] = {v: {} for v in VIGENCIAS}
        vistas = set()
        for fila in t.rows[1:]:
            clave = _fila_de(c.filas, _primera_linea(fila.cells[0]))
            if clave is None or clave in vistas:
                continue  # fila agregada por el grupo, vacía o repetida
            vistas.add(clave)
            celdas = {v: fila.cells[i] if i < len(fila.cells) else None for v, i in cols.items()}
            tcs = [x._tc for x in celdas.values() if x is not None]
            if len(set(map(id, tcs))) < len(tcs) or any(x is fila.cells[0]._tc for x in tcs):
                etiqueta = next(f.etiqueta for f in c.filas if f.clave == clave)
                raise PlantillaInvalida(
                    f"en «{c.cabecera}», la fila «{etiqueta}» tiene celdas combinadas: cada gobierno va en su columna"
                )
            for v, x in celdas.items():
                presente, valor = celda(f"{c.clave}.{v}.{clave}", _texto_celda(x) if x is not None else "")
                if presente:
                    b[c.clave][v][clave] = valor
        for f in c.filas:
            if f.clave not in vistas:
                raise PlantillaInvalida(f"falta la fila «{f.etiqueta}» en la tabla «{c.cabecera}»")

    for c in CAJAS:
        filas = tablas[c.clave].rows
        presente, valor = celda(c.clave, "\n".join(_texto_celda(f.cells[0]) for f in filas[1:]).strip())
        if presente:
            b[c.clave] = valor

    fuentes = []
    for fila in tablas["fuentes"].rows[1:]:
        textos = [_texto_celda(x) for x in fila.cells[: len(FUENTES_CLAVES)]]
        if any(textos):  # sin inventar valores: solo lo que el grupo escribió
            fuentes.append({k: t for k, t in zip(FUENTES_CLAVES, textos) if t})
    b["fuentes"] = fuentes
    if notas:
        b["notas"] = notas
    b["sin_llenar"] = sin_llenar
    return b


def validar(b: dict) -> list[str]:
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    return [
        f"{'/'.join(str(x) for x in e.absolute_path) or '(raíz)'}: {e.message}"
        for e in sorted(Draft202012Validator(schema).iter_errors(b), key=str)
    ]


# ─────────────────────────── Probar (ida y vuelta) ───────────────────────────


def probar() -> list[str]:
    """Genera la plantilla, la llena con el ejemplo CTeI, la lee y compara. Devuelve errores."""
    errores: list[str] = []
    ejemplo = json.loads(EJEMPLO_JSON.read_text(encoding="utf-8"))
    errores += [f"ejemplo: {e}" for e in validar(ejemplo)]
    with tempfile.TemporaryDirectory() as tmp:
        ruta = Path(tmp) / "b.docx"
        llenar(plantilla(), ejemplo).save(ruta)
        leida = leer(Document(ruta), ejemplo["sector"])
        vacia_ruta = Path(tmp) / "v.docx"
        plantilla().save(vacia_ruta)
        vacia = leer(Document(vacia_ruta), ejemplo["sector"])
    errores += [f"leída: {e}" for e in validar(leida)]
    if leida != ejemplo:
        distintas = sorted(k for k in set(leida) | set(ejemplo) if leida.get(k) != ejemplo.get(k))
        errores.append(f"ida y vuelta: difiere en {', '.join(distintas)}")
    if any(vacia[c.clave][v] for c in COMPARATIVAS for v in VIGENCIAS) or vacia["fuentes"]:
        errores.append("la plantilla vacía no debería tener contenido")
    esperadas = len(DATOS) + sum(len(c.filas) * len(VIGENCIAS) for c in COMPARATIVAS) + len(CAJAS)
    if len(vacia["sin_llenar"]) != esperadas:
        errores.append(f"plantilla vacía: {len(vacia['sin_llenar'])} campos sin llenar, se esperaban {esperadas}")
    errores += _probar_tolerancia(ejemplo)
    return errores


def _probar_tolerancia(ejemplo: dict) -> list[str]:
    """Ediciones típicas de Word/Google Docs que el lector debe tolerar, y plantillas que debe rechazar."""
    errores = []
    doc = llenar(plantilla(), ejemplo)
    sub = _indexar(doc)["subcategorias"]
    # 1) etiquetas en mayúsculas y sin tildes; 2) fila extra agregada por el grupo; 3) «sin dato.» en minúsculas
    fila_obj = next(f for f in sub.rows if normalizar(_primera_linea(f.cells[0])) == "objetivo")
    fila_obj.cells[0].paragraphs[0].text = "2. OBJETIVO"
    fila_pob = next(f for f in sub.rows if normalizar(_primera_linea(f.cells[0])) == "poblacion")
    fila_pob.cells[0].paragraphs[0].text = "4. Poblacion"
    fila_pob.cells[1].paragraphs[0].text = "sin dato."
    extra = sub.add_row()
    extra.cells[0].paragraphs[0].text = "Otra cosa que el grupo quiso anotar"
    with tempfile.TemporaryDirectory() as tmp:
        ruta = Path(tmp) / "t.docx"
        doc.save(ruta)
        leida = leer(Document(ruta), ejemplo["sector"])
    if leida["subcategorias"] != ejemplo["subcategorias"]:
        errores.append("tolerancia: etiquetas en mayúsculas / sin tildes o fila extra rompen la lectura")
    # Una plantilla ajena se rechaza con un mensaje claro.
    try:
        otro = Document()
        otro.add_table(rows=1, cols=1).rows[0].cells[0].paragraphs[0].text = "Tabla cualquiera"
        leer(otro, ejemplo["sector"])
        errores.append("tolerancia: un documento ajeno debería rechazarse")
    except PlantillaInvalida:
        pass
    errores += _probar_casos_reales(ejemplo)
    return errores


def _fila(tabla, etiqueta: str):
    return next(f for f in tabla.rows if normalizar(_primera_linea(f.cells[0])) == normalizar(etiqueta))


def _leer_editada(ejemplo: dict, editar) -> dict:
    doc = llenar(plantilla(), ejemplo)
    editar(_indexar(doc))
    with tempfile.TemporaryDirectory() as tmp:
        ruta = Path(tmp) / "e.docx"
        doc.save(ruta)
        return leer(Document(ruta), ejemplo["sector"])


def _rechaza(ejemplo: dict, editar) -> bool:
    try:
        _leer_editada(ejemplo, editar)
        return False
    except PlantillaInvalida:
        return True


def _probar_casos_reales(ejemplo: dict) -> list[str]:
    """Casos de edición real que antes perdían o torcían datos en silencio."""
    errores = []

    # Columnas de gobierno combinadas: se rechaza (antes duplicaba el dato en las dos vigencias).
    def combinar(t):
        f = _fila(t["subcategorias"], "7. Metas")
        f.cells[1].merge(f.cells[2])
    if not _rechaza(ejemplo, combinar):
        errores.append("casos: celdas de gobierno combinadas deberían rechazarse")

    # Fila de datos borrada o renombrada: se rechaza (antes perdía lo escrito).
    def borrar_integrantes(t):
        f = _fila(t["datos"], "Integrantes")
        f._tr.getparent().remove(f._tr)
    if not _rechaza(ejemplo, borrar_integrantes):
        errores.append("casos: falta de la fila «Integrantes» debería rechazarse")

    # Variantes de «Sin dato», con nota: null + la nota en `notas`.
    def variantes(t):
        _fila(t["subcategorias"], "6. Recursos").cells[1].paragraphs[0].text = "S/D"
        _fila(t["subcategorias"], "3. Instituciones").cells[1].paragraphs[0].text = "Sin dato: el balance no nombra entidades"
    leida = _leer_editada(ejemplo, variantes)
    s18 = leida["subcategorias"]["2018-2022"]
    if s18.get("recursos", "x") is not None or s18.get("instituciones", "x") is not None:
        errores.append("casos: «S/D» y «Sin dato: nota» deberían leerse como hueco (null)")
    if leida.get("notas", {}).get("subcategorias.2018-2022.instituciones") != "el balance no nombra entidades":
        errores.append("casos: la nota de un «Sin dato: …» debería guardarse en `notas`")

    # Tabla anidada dentro de una celda: su texto se conserva.
    def anidar(t):
        celda = _fila(t["subcategorias"], "2. Objetivo").cells[2]
        celda.add_table(rows=1, cols=1).rows[0].cells[0].paragraphs[0].text = "texto anidado"
    if "texto anidado" not in (_leer_editada(ejemplo, anidar)["subcategorias"]["2022-2026"].get("objetivo") or ""):
        errores.append("casos: el texto de una tabla anidada se pierde")

    # Encabezado de gobierno con el año en medio, y etiqueta con texto agregado en la misma línea.
    def reescribir(t):
        t["ubicacion"].rows[0].cells[1].paragraphs[0].text = "Gobierno Duque (2018–2022)"
        _fila(t["subcategorias"], "2. Objetivo").cells[0].paragraphs[0].text = "2. Objetivo del gobierno"
    try:
        leida = _leer_editada(ejemplo, reescribir)
        if leida["ubicacion"] != ejemplo["ubicacion"] or leida["subcategorias"] != ejemplo["subcategorias"]:
            errores.append("casos: encabezado «Gobierno Duque (2018–2022)» o etiqueta ampliada leen mal")
    except PlantillaInvalida as e:
        errores.append(f"casos: encabezado con el año en medio o etiqueta ampliada se rechazan ({e})")

    # Datos vacíos: todos quedan registrados en `sin_llenar`.
    def vaciar(t):
        for f in t["datos"].rows:
            for p in f.cells[1].paragraphs:
                p.text = ""
    faltan = set(_leer_editada(ejemplo, vaciar)["sin_llenar"])
    if not {"grupo", "integrantes", "politica", "fecha"} <= faltan:
        errores.append(f"casos: los datos vacíos del grupo deberían ir a sin_llenar (hay {sorted(faltan)})")
    return errores


def publicadas_al_dia() -> list[str]:
    """Las .docx publicadas en web/public se leen con la estructura actual."""
    errores = []
    if not PLANTILLA.exists():
        return [f"falta {PLANTILLA}: uv run extraccion/bitacora.py generar"]
    try:
        vacia = leer(Document(PLANTILLA), "ciencia-tecnologia")
        if vacia["fuentes"] or any(vacia[c.clave][v] for c in COMPARATIVAS for v in VIGENCIAS):
            errores.append(f"{PLANTILLA} no está vacía")
    except PlantillaInvalida as e:
        errores.append(f"{PLANTILLA} desactualizada ({e}): regenerarla")
    if EJEMPLO_DOCX.exists():
        ejemplo = json.loads(EJEMPLO_JSON.read_text(encoding="utf-8"))
        try:
            if leer(Document(EJEMPLO_DOCX), ejemplo["sector"]) != ejemplo:
                errores.append(f"{EJEMPLO_DOCX} no coincide con {EJEMPLO_JSON.name}: regenerarla")
        except PlantillaInvalida as e:
            errores.append(f"{EJEMPLO_DOCX} desactualizada ({e})")
    return errores


# ─────────────────────────── CLI ───────────────────────────


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generar", help="plantilla vacía")
    g.add_argument("--salida", type=Path, default=PLANTILLA)
    e = sub.add_parser("ejemplo", help="plantilla llena con el ejemplo CTeI")
    e.add_argument("--salida", type=Path, default=EJEMPLO_DOCX)
    l = sub.add_parser("leer", help=".docx llena -> JSON validado")
    l.add_argument("docx", type=Path)
    l.add_argument("--slug", required=True, help="sector, p. ej. ciencia-tecnologia")
    l.add_argument("--salida", type=Path, help="por defecto data/bitacoras/<slug>/<grupo>.json")
    l.add_argument("--forzar", action="store_true", help="sobrescribir si ya existe")
    sub.add_parser("probar", help="ida y vuelta con el ejemplo CTeI")
    a = ap.parse_args()

    if a.cmd in ("generar", "ejemplo"):
        doc = plantilla()
        if a.cmd == "ejemplo":
            llenar(doc, json.loads(EJEMPLO_JSON.read_text(encoding="utf-8")))
        a.salida.parent.mkdir(parents=True, exist_ok=True)
        doc.save(a.salida)
        print(f"ok  {a.salida}")
        return 0
    if a.cmd == "probar":
        errores = probar() + publicadas_al_dia()
        for err in errores:
            print(f"ERROR {err}", file=sys.stderr)
        if not errores:
            print("ok  bitácora: ida y vuelta con el ejemplo CTeI")
        return 1 if errores else 0

    try:
        b = leer(Document(a.docx), a.slug)
    except PlantillaInvalida as err:
        print(f"ERROR {a.docx}: {err}", file=sys.stderr)
        return 1
    errores = validar(b)
    for err in errores:
        print(f"ERROR {err}", file=sys.stderr)
    if errores:
        return 1
    salida = a.salida or SALIDA / a.slug / f"{slug(b['grupo']['nombre'] or b['politica']['nombre'] or a.docx.stem)}.json"
    if salida.exists() and not a.forzar:
        print(f"ERROR {salida} ya existe (¿otro grupo con el mismo nombre?): use --salida o --forzar", file=sys.stderr)
        return 1
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(b, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    huecos = sum(1 for c in COMPARATIVAS for v in VIGENCIAS for x in b[c.clave][v].values() if x is None)
    print(f"ok  {salida} · política: {b['politica'].get('id', b['politica']['nombre'] + ' (sin área identificada)')}"
          f" · huecos declarados: {huecos} · sin llenar: {len(b['sin_llenar'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
