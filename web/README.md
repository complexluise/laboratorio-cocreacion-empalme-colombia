# Sitio del laboratorio (`@laboratorio/web`)

El sitio del Laboratorio de Cocreación: la **actividad** y su teoría, el **mapa** (una **red
bipartita** entre **políticas públicas** (hubs) e **instrumentos**; los instrumentos compartidos
enlazan la red) y un **glosario**. SPA estática en **Svelte 5 (runes) + Vite + D3** (módulos
`d3-*`, bundleados).
Decisiones: [ADR-0002](../docs/decisiones/ADR-0002-frontend-svelte-vite.md),
[ADR-0003](../docs/decisiones/ADR-0003-preset-codigo-kybernetes.md).

## Cómo correrlo

Desde la raíz del repo (Node >= 22, pnpm):

```bash
pnpm install
pnpm dev          # Vite en modo desarrollo
pnpm build        # -> web/dist
```

`web/dist` es estático con `base: './'`: sirve en el subpath de GitHub Pages y también abriendo
`web/dist/index.html` por `file://` (el bundle sale como script clásico IIFE, no como módulo).
Gate: `pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build` (ver `AGENTS.md`).

## Páginas y rutas

Rutas por **hash** (`lib/rutas.ts`): el build es IIFE y se sirve por `file://` y desde el subpath
de Pages, así que no hay router de historial ni dependencia de router. `App.svelte` escucha
`hashchange` y elige la página; un hash desconocido cae en el inicio.

| Ruta | Página | Qué es |
|---|---|---|
| `#/` | `PaginaInicio` | Landing: la actividad como recorrido de 4 pasos (`PasosActividad`), la bitácora con sus descargas, la teoría en 5 ideas, la práctica (`Practica`) y las preguntas. |
| `#/inicio/<seccion>` | `PaginaInicio` | Salta a una sección: `actividad`, `bitacora`, `teoria`, `practica`, `preguntas`. |
| `#/red` | `PaginaRed` | El explorador de la red (ver §Interacción). |
| `#/glosario[/<id>]` | `PaginaGlosario` | Glosario filtrable; `<id>` salta a una entrada (p. ej. `#/glosario/modo-conversion`). |
| `#/metodologia[/<seccion>]` | `PaginaMetodologia` | Cómo lo hicimos: `advertencia`, `como`, `pasos` (cada uno con los prompts literales, anclas `paso-<id>`), `instrucciones`, `revision`, `reportar`. Contenido en `lib/metodologia.ts` (ADR-0006). |

Bajo la cabecera de todas las páginas (menos la metodología) va `AvisoIA`: el contenido se hizo con
IA y aún no se revisó al 100 %. Se pliega; la preferencia queda en `localStorage` (con try/catch).

El **vocabulario controlado** del glosario (modos de cambio, tipos NATO, cambio del objetivo,
relaciones) se genera de las mismas etiquetas y descripciones de `lib/visual.ts` que usa la red; un
test (`glosario.test.ts`) falla si algún término del vocabulario queda sin entrada. Teoría,
bitácora, proceso («Cómo lo hicimos») y siglas son texto curado en `lib/glosario.ts`.

## De dónde sale el dato

La web importa `src/lib/data/<slug>.json` (hoy `ciencia-tecnologia.json`), **commiteado a
propósito** y conforme a `data/schema/objeto.schema.json` (lo verifica
`uv run scripts/validar_contrato.py` en CI). Se regenera desde el dataset del pipeline:

```bash
uv run extraccion/aplicar_areas.py --slug ciencia-tecnologia  # políticas por gobierno -> áreas con objetivo por gobierno
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # data/sectores/<slug>/objetos.json -> src/lib/data/<slug>.json
```

Las **políticas son áreas persistentes** con el objetivo que declara cada gobierno (ADR-0004). En la
red, el **anillo del hub** codifica el cambio del objetivo: doble = se reformula, acento = nuevo,
punteado = no declarado; **hueco y punteado** = el gobierno de la vigencia elegida no declara objetivo
pero el área tiene instrumentos activos. El detalle de la política compara el objetivo de cada gobierno.

**Fuente vigente (CTeI):** reconstrucción con Claude vía el workflow multi-agente
`extraccion/rebuild-ctei-claude.workflow.js` (políticas + instrumentos, modo de cambio guiado por
evidencia, narrativa por gobierno); su salida se guarda en `data/sectores/ciencia-tecnologia/objetos.json`
(gitignoreado). Es una corrida paga: solo con autorización del PO. El sistema completo, en
[`docs/pipeline-extraccion.md`](../docs/pipeline-extraccion.md).

> Legado (no usar para CTeI): `extraer_instrumentos.py` (Gemini) + `aplicar_correcciones.py`
> (overlay en `data/correcciones/`); Gemini resultó poco fiable (cuota/calidad).

### Materiales del taller (`public/`)

La landing los ofrece con `BotonDescarga` (microinteracción; respeta `prefers-reduced-motion`) en el
recorrido de la actividad (`PasosActividad`) y en la sección de la bitácora. Los genera el pipeline y
no se editan a mano: `bitacora-laboratorio.docx` (la plantilla en blanco),
`bitacora-ejemplo-ctei.docx` (el ejemplo lleno, desde `extraccion/ejemplos/bitacora-ctei.json`) y
`red-<slug>.xlsx` (la red en Excel). Se regeneran desde la raíz (ADR-0005; `validar_contrato.py` falla
si quedan desactualizados respecto de la estructura o del dataset):

```bash
uv run extraccion/bitacora.py generar                   # -> public/bitacora-laboratorio.docx
uv run extraccion/bitacora.py ejemplo                   # -> public/bitacora-ejemplo-ctei.docx
uv run extraccion/red_excel.py --slug ciencia-tecnologia # -> public/red-ciencia-tecnologia.xlsx
```

La **práctica** «¿Qué le pasó a este instrumento?» (`Practica.svelte`, lógica en `lib/practica.ts`
con test) toma de la red un ejemplo coherente por modo de cambio: presencia acorde al modo y
narrativa que no nombra otro modo.

## Estructura

```
src/App.svelte               # shell: resuelve la ruta del hash y monta la página
src/lib/rutas.ts             # rutas por hash (resolverRuta, hrefDe, títulos)
src/lib/paginas/             # PaginaInicio, PaginaGlosario (lectura, sobre PaginaTexto: cabecera
                             #   + área que scrollea y salta al ancla) y PaginaRed (layout mobile
                             #   first: lienzo, hoja inferior / paneles laterales en escritorio)
src/lib/glosario.ts          # entradas del glosario; el vocabulario controlado sale de visual.ts
src/lib/practica.ts          # práctica «¿Qué le pasó a este instrumento?»: elige ejemplos y evalúa
src/lib/metodologia.ts       # «Cómo lo hicimos»: PASOS (prompts literales), instrucciones a la IA y CAPAS de revisión
src/lib/data/                # dataset JSON commiteado + index.ts (lo tipa como Dataset)
src/lib/state/red.svelte.ts  # EstadoRed (runes): filtros vs foco, red derivada, miga de pan
src/lib/graph/               # GraphView.svelte + física D3 (forces.ts, posiciones.ts, acciones.ts)
                             #   y colocación de etiquetas sin solape (etiquetas.ts)
src/lib/components/          # Cabecera (común: marca, herramientas de la página, menú del
                             #   sitio), Buscador, Filtros, MigaDePan, Leyenda, ControlesZoom,
                             #   DetailPanel, Marca; y de la landing: PasosActividad (recorrido en
                             #   pestañas ARIA), Practica, BotonDescarga
public/                      # materiales del taller (.docx, .xlsx), generados por extraccion/
src/lib/visual.ts            # mapeo del vocabulario a colores, glifos y etiquetas
```

La lógica del dominio (`construirRed`, `buscar`, `vecindario`, tipos del contrato) **no** vive acá:
está en [`packages/red`](../packages/red/README.md) y se importa como `@laboratorio/red`.

## Interacción (la red)

**Mobile first** (referencia 390×844); en pantallas de más de 860 px se amplía con paneles
laterales. Mismos componentes y mismo estado en ambos. El principio: **una intención = un lugar**.

| Intención | Dónde | Qué hace |
|---|---|---|
| **Navegar** | `Buscador` en la cabecera (siempre visible; atajo `/`) | Combobox ARIA: busca políticas e instrumentos por nombre o alias, sin tildes. **No filtra la red**: elegir un resultado lo enfoca. Si los filtros ocultan el destino, la lista lo avisa y al elegirlo se limpian. |
| **Filtrar** | `Filtros`: hoja (mobile) o panel izquierdo plegable (escritorio); botón "Filtros" en la cabecera con el n.º de activos | Vigencia segmentada (2018–2022, 2022–2026, ambos); modo de cambio y tipo NATO como chips "mostrar solo" (sin ninguno marcado se ve todo). Componen por intersección; muestra el conteo. "Limpiar filtros" **no toca el foco**. |
| **Enfocar** | `MigaDePan` arriba a la izquierda del lienzo: Red completa › Política › Instrumento ✕ | Política → aísla su subred (solo ella y sus instrumentos). Instrumento → resalta su vecindario (vecinos directos + un salto por relaciones instrumento↔instrumento) y atenúa el resto. Clic en el vacío sube un nivel; `Esc` o ✕ vuelve a la red completa. Si un filtro oculta lo enfocado, se sale de ese nivel. |
| **Ver detalle** | `DetailPanel`: hoja inferior (mobile) o panel derecho (escritorio) | Solo contenido del foco. Política: cambio del objetivo, objetivo que declara cada gobierno, sus instrumentos. Instrumento: políticas que sirve, presencia por vigencia, qué fue bajo cada gobierno, relaciones, entidades, alias, evidencia. Sin foco: "Cómo leer la red" + cómo cambiaron los objetivos y los instrumentos. |
| **Leer** | `Leyenda` (abajo-izq, plegada) y `ControlesZoom` (abajo-der: +, −, ajustar) sobre el lienzo | La leyenda es solo lectura (color = modo de cambio, forma = tipo NATO, anillo = cambio del objetivo de la política); no filtra (eso vive en `Filtros`). |

- **Una sola hoja a la vez** en mobile (filtros o detalle), dentro del flujo del grid: nunca tapa
  el grafo. Enfocar algo abre su detalle; salir del foco la pliega.
- **Vista**: en cada cambio de topología (filtros, subred) la vista se re-encuadra cuando la física
  casi se asienta; enfocar un instrumento encuadra su vecindario. Cualquier gesto del usuario
  (zoom, pan, arrastre) cancela el re-encuadre pendiente.
- **Sin solapes**: los nodos se separan por colisión (`forceCollide`, varias iteraciones) y las
  etiquetas se colocan con un algoritmo greedy por prioridad (seleccionado/hover > políticas >
  vecindario > resto) que prueba 4 posiciones y omite la que no cabe. El texto mide lo mismo en
  pantalla a cualquier zoom: **al acercarse aparecen más etiquetas** (zoom semántico).
- **Teclado**: `/` al buscador (flechas + Enter en la lista); Tab recorre las políticas (con una
  política enfocada, todos los nodos de su subred) y Enter enfoca; `Esc` vuelve a la red completa.
