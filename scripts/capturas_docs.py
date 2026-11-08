# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright>=1.47"]
# ///
"""Capturas anotadas del sitio para los documentos públicos (docs/publicos/img/).

Requiere el sitio corriendo (por defecto en http://localhost:5199) y Chrome instalado.

  uv run scripts/capturas_docs.py [--doc marco|ontologia|encuadre|todos] [--url http://localhost:5199/]

Cada captura marca con un recuadro numerado lo que el texto explica y resalta en amarillo las
frases clave. Los números se explican en el pie de cada figura del documento.

Todas se recortan igual (1140 × 650 px CSS, proporción ≈ 1,75:1): sin encabezado, sin aviso de IA
y sin panel de filtros; quedan la red (x 300–1060) y el panel de detalle (x 1060–1440). El borde
superior se CALCULA en cada captura: se mide el rectángulo que une todo lo marcado y el recorte se
centra sobre él. Si lo marcado no cabe, el script falla en vez de entregar una figura cortada (la
red se dibuja con una simulación de fuerzas y su disposición cambia entre corridas).
"""
from __future__ import annotations

import argparse
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

SALIDA = Path("docs/publicos/img")
RECORTE_X, RECORTE_ANCHO, RECORTE_ALTO = 300, 1140, 650
TOPE_SUPERIOR = 70  # debajo del encabezado, con el aviso de IA cerrado
VIEWPORT_ALTO = 900
MARGEN = 30  # aire alrededor de lo marcado (incluye el número, que sobresale ~20 px)


# La portada es una columna centrada (x 364–1076): sus capturas usan un recorte angosto.
PORTADA_X, PORTADA_ANCHO, PORTADA_ALTO = 344, 752, 560


def recorte(pg: Page, x: int = RECORTE_X, ancho: int = RECORTE_ANCHO, alto: int = RECORTE_ALTO) -> dict:
    """Recorte de alto fijo, centrado sobre la unión de todo lo marcado."""
    caja = pg.evaluate("""() => {
      const rs = window.__marcados.map(el => el.getBoundingClientRect());
      return {top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom))};
    }""")
    arriba, abajo = caja["top"] - MARGEN, caja["bottom"] + MARGEN
    if abajo - arriba > alto:
        raise SystemExit(f"Lo marcado mide {abajo - arriba:.0f} px y el recorte {alto}: no cabe.")
    y = (arriba + abajo) / 2 - alto / 2
    y = max(TOPE_SUPERIOR, min(y, VIEWPORT_ALTO - alto))
    if arriba < y or abajo > y + alto:
        raise SystemExit(f"Lo marcado ({arriba:.0f}–{abajo:.0f}) queda fuera del recorte posible.")
    return {"x": x, "y": y, "width": ancho, "height": alto}


def recorte_portada(pg: Page) -> dict:
    return recorte(pg, PORTADA_X, PORTADA_ANCHO, PORTADA_ALTO)

# Marcas sobre la página: recuadro rojo con número, y resaltado de frases. Coordenadas de
# viewport (position: fixed), así que se calculan después de cada scroll.
JS = """
window.__marcados = [];
window.__marcar = (el, n) => {
  window.__marcados.push(el);
  if (!(el instanceof SVGElement)) {
    // HTML: contorno sobre el propio elemento, que se mueve con el scroll del panel.
    Object.assign(el.style, {outline:'3px solid #d6204e', outlineOffset:'4px', borderRadius:'6px',
      position: getComputedStyle(el).position === 'static' ? 'relative' : el.style.position});
    const num = document.createElement('span');
    num.textContent = n;
    // El panel recorta lo que sale de su borde: en un bloque, el número va adentro, arriba a la
    // derecha (casi nunca hay texto ahí); en una frase resaltada, pegado arriba a la izquierda.
    const pos = el.tagName === 'MARK' ? {left:'-14px', top:'-18px'} : {right:'6px', top:'6px'};
    Object.assign(num.style, pos);
    Object.assign(num.style, {position:'absolute', width:'26px',
      height:'26px', borderRadius:'50%', background:'#d6204e', color:'#fff',
      font:'700 15px/26px system-ui, sans-serif', textAlign:'center', zIndex:100000,
      boxShadow:'0 1px 4px rgba(0,0,0,.35)'});
    el.append(num); return;
  }
  const r = el.getBoundingClientRect(), pad = 6;
  const caja = document.createElement('div');
  Object.assign(caja.style, {position:'fixed', left:(r.left-pad)+'px', top:(r.top-pad)+'px',
    width:(r.width+2*pad)+'px', height:(r.height+2*pad)+'px', border:'3px solid #d6204e',
    borderRadius:'10px', zIndex:99999, pointerEvents:'none', boxSizing:'border-box'});
  const num = document.createElement('div');
  num.textContent = n;
  Object.assign(num.style, {position:'fixed', left:(r.left-pad-14)+'px', top:(r.top-pad-14)+'px',
    width:'28px', height:'28px', borderRadius:'50%', background:'#d6204e', color:'#fff',
    font:'700 16px/28px system-ui, sans-serif', textAlign:'center', zIndex:100000,
    pointerEvents:'none', boxShadow:'0 1px 4px rgba(0,0,0,.35)'});
  document.body.append(caja, num);
};
window.__resaltar = (raiz, frase) => {
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) {
    const i = t.data.indexOf(frase);
    if (i < 0) continue;
    const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + frase.length);
    const m = document.createElement('mark');
    Object.assign(m.style, {background:'#ffe066', color:'inherit', padding:'0 2px', borderRadius:'3px'});
    r.surroundContents(m); return m;
  }
  throw new Error('No encontré: ' + frase);
};
"""


def marcar(pg: Page, selector: str, n: int) -> None:
    pg.locator(selector).first.evaluate("(el, n) => window.__marcar(el, n)", n)


def resaltar(pg: Page, raiz: str, frase: str, n: int | None = None) -> None:
    pg.locator(raiz).first.evaluate(
        "(raiz, a) => { const m = window.__resaltar(raiz, a.frase); if (a.n !== null) window.__marcar(m, a.n); }",
        {"frase": frase, "n": n},
    )


def nodo(nombre: str) -> str:
    return f'g.nodos [aria-label^="{nombre}"]'


def marcar_politica_central(pg: Page, n: int) -> None:
    """La disposición de la red cambia entre corridas: se marca la política más cercana al centro."""
    pg.evaluate("""n => {
      const lienzo = document.querySelector('.lienzo').getBoundingClientRect();
      const cx = lienzo.left + lienzo.width / 2, cy = lienzo.top + lienzo.height / 2;
      const pols = [...document.querySelectorAll('g.nodos .nodo.pol')];
      const d = el => { const r = el.getBoundingClientRect();
        return Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy); };
      pols.sort((a, b) => d(a) - d(b));
      window.__marcar(pols[0], n);
    }""", n)


def enfocar(pg: Page, nombre: str) -> None:
    pg.get_by_role("combobox", name="Buscar política o instrumento").fill(nombre)
    pg.wait_for_timeout(600)
    pg.get_by_role("option").first.click()
    pg.wait_for_timeout(2500)


def abrir_red(b, url: str) -> Page:
    """Página nueva por captura: el sitio navega por hash y `goto` no limpiaría las marcas."""
    pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    pg.goto(url + "#/red")
    pg.wait_for_timeout(4000)
    pg.get_by_role("button", name="Ocultar el aviso").click()
    pg.wait_for_timeout(500)
    pg.add_script_tag(content=JS)
    return pg


def seccion(titulo: str, siguiente: str = "*") -> str:
    """El bloque que sigue a un subtítulo del panel de detalle."""
    return f'.panel-detalle h3:has-text("{titulo}") + {siguiente}'


def abrir_portada(b, url: str, seccion: str) -> Page:
    """La portada del sitio, desplazada hasta una de sus secciones (#actividad, #practica…)."""
    pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    pg.goto(f"{url}#/inicio/{seccion}")
    pg.wait_for_timeout(2500)
    pg.get_by_role("button", name="Ocultar el aviso").click()
    pg.wait_for_timeout(300)
    pg.locator(f"#{seccion}").evaluate("el => el.scrollIntoView({block: 'start'})")
    pg.wait_for_timeout(800)
    pg.add_script_tag(content=JS)
    return pg


def capturas_marco(b, url: str) -> None:
        # 1. La red completa: qué es cada cosa.
        pg = abrir_red(b, url)
        marcar_politica_central(pg, 1)
        marcar(pg, nodo("Fondo Francisco José de Caldas"), 2)
        marcar(pg, ".panel-detalle .guia", 3)
        marcar(pg, ".panel-detalle .barras", 4)
        pg.screenshot(path=SALIDA / "red-completa.png", clip=recorte(pg))

        # 2. Una política huérfana: sin objetivo declarado, con instrumentos activos.
        pg = abrir_red(b, url)
        enfocar(pg, "Innovación empresarial")
        marcar(pg, nodo("Innovación empresarial"), 1)
        marcar(pg, ".panel-detalle .badges", 2)
        resaltar(pg, ".panel-detalle", "No declarado en el informe de este gobierno.", 3)
        resaltar(pg, ".panel-detalle", "siguen activos en este")
        pg.screenshot(path=SALIDA / "politica-huerfana.png", clip=recorte(pg))

        # 3. Conversión: el mismo fondo, con otro fin.
        pg = abrir_red(b, url)
        enfocar(pg, "Fondo Francisco José de Caldas")
        # El panel se desplaza hasta «Qué fue bajo cada gobierno»: entran las dos descripciones
        # y la explicación del modo.
        pg.locator(".panel-detalle").get_by_text("Qué fue bajo cada gobierno", exact=False).first.evaluate(
            "el => el.scrollIntoView({block: 'start'})")
        pg.wait_for_timeout(500)
        resaltar(pg, ".panel-detalle", "convocatorias temáticas y geográficas dispersas", 2)
        resaltar(pg, ".panel-detalle", "financiar las convocatorias de cada una de las cinco misiones PIIOM", 3)
        resaltar(pg, ".panel-detalle", "Conversión:", 1)
        pg.screenshot(path=SALIDA / "conversion-fondo-caldas.png", clip=recorte(pg))

        # 4. Una inconsistencia en la salida del modelo: deriva vs. «terminación funcional».
        pg = abrir_red(b, url)
        enfocar(pg, "Todo es Ciencia")
        # Sin desplazar: la etiqueta del modo (y≈230) y la frase (y≈800) entran en el recorte.
        marcar(pg, ".panel-detalle .badges", 1)
        resaltar(pg, ".panel-detalle", "terminación funcional", 2)
        pg.screenshot(path=SALIDA / "todo-es-ciencia-inconsistencia.png", clip=recorte(pg))


def capturas_ontologia(b, url: str) -> None:
        # 1. Una política: área con un objetivo declarado por cada gobierno.
        pg = abrir_red(b, url)
        enfocar(pg, "Talento humano")
        marcar(pg, nodo("Talento humano"), 1)
        marcar(pg, ".panel-detalle .badges", 2)
        marcar(pg, ".panel-detalle .objetivos", 3)
        pg.screenshot(path=SALIDA / "ontologia-politica.png", clip=recorte(pg))

        # 2. La ficha de un instrumento: tipo, modo, políticas a las que sirve y presencia.
        pg = abrir_red(b, url)
        enfocar(pg, "Ley 2162")
        marcar(pg, ".panel-detalle .badges", 1)
        marcar(pg, seccion("Políticas que sirve", "ul"), 2)
        marcar(pg, seccion("Presencia por vigencia", "table"), 3)
        pg.screenshot(path=SALIDA / "ontologia-instrumento.png", clip=recorte(pg))

        # 3. Relaciones y evidencia del mismo instrumento (más abajo en el panel).
        pg = abrir_red(b, url)
        enfocar(pg, "Ley 2162")
        pg.locator(seccion("Relaciones con otros instrumentos", "ul")).evaluate(
            "el => el.previousElementSibling.scrollIntoView({block: 'start'})")
        pg.wait_for_timeout(500)
        marcar(pg, seccion("Relaciones con otros instrumentos", "ul"), 1)
        marcar(pg, '.panel-detalle h3:has-text("Evidencia") ~ .vig', 2)
        pg.screenshot(path=SALIDA / "ontologia-relaciones-evidencia.png", clip=recorte(pg))


def capturas_encuadre(b, url: str) -> None:
        # 1. El recorrido de cuatro pasos: pestañas, pregunta guía y lo que produce el grupo.
        pg = abrir_portada(b, url, "actividad")
        marcar(pg, '#actividad [role="tablist"]', 1)
        marcar(pg, "#actividad .pregunta", 2)
        marcar(pg, "#actividad .producto", 3)
        pg.screenshot(path=SALIDA / "encuadre-recorrido.png", clip=recorte_portada(pg))

        # 2. La práctica: un instrumento real y los modos para elegir.
        pg = abrir_portada(b, url, "practica")
        resaltar(pg, "#practica", "Ley 2162 de 2021", 1)
        marcar(pg, '#practica button:has-text("conversión") >> xpath=..', 2)
        pg.screenshot(path=SALIDA / "encuadre-practica.png", clip=recorte_portada(pg))


DOCUMENTOS = {"marco": capturas_marco, "ontologia": capturas_ontologia, "encuadre": capturas_encuadre}


def capturas(url: str, docs: list[str]) -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        for doc in docs:
            DOCUMENTOS[doc](b, url)
        b.close()
    for f in sorted(SALIDA.glob("*.png")):
        print(f, f.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:5199/")
    ap.add_argument("--doc", choices=[*DOCUMENTOS, "todos"], default="todos")
    a = ap.parse_args()
    capturas(a.url, list(DOCUMENTOS) if a.doc == "todos" else [a.doc])
