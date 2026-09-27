# Explorador de la red (`@laboratorio/web`)

El mapa del Laboratorio de Cocreación: una **red bipartita** entre **políticas públicas** (hubs) e
**instrumentos**. Un instrumento puede servir a varias políticas — los instrumentos compartidos
enlazan la red. SPA estática en **Svelte 5 (runes) + Vite + D3** (módulos `d3-*`, bundleados).
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
evidencia, narrativa por gobierno), que escribe `data/sectores/ciencia-tecnologia/objetos.json`
(gitignoreado). Es una corrida paga: solo con autorización del PO.

> Legado (no usar para CTeI): `extraer_instrumentos.py` (Gemini) + `aplicar_correcciones.py`
> (overlay en `data/correcciones/`); Gemini resultó poco fiable (cuota/calidad).

## Estructura

```
src/App.svelte               # layout mobile first: cabecera (marca, buscador, botón Filtros),
                             #   lienzo, hoja inferior / paneles laterales en escritorio
src/lib/data/                # dataset JSON commiteado + index.ts (lo tipa como Dataset)
src/lib/state/red.svelte.ts  # EstadoRed (runes): filtros vs foco, red derivada, miga de pan
src/lib/graph/               # GraphView.svelte + física D3 (forces.ts, posiciones.ts, acciones.ts)
                             #   y colocación de etiquetas sin solape (etiquetas.ts)
src/lib/components/          # Buscador, Filtros, MigaDePan, Leyenda, ControlesZoom,
                             #   DetailPanel, Marca
src/lib/visual.ts            # mapeo del vocabulario a colores, glifos y etiquetas
```

La lógica del dominio (`construirRed`, `buscar`, `vecindario`, tipos del contrato) **no** vive acá:
está en [`packages/red`](../packages/red/README.md) y se importa como `@laboratorio/red`.

## Interacción

**Mobile first** (referencia 390×844); en pantallas de más de 860 px se amplía con paneles
laterales. Mismos componentes y mismo estado en ambos. El principio: **una intención = un lugar**.

| Intención | Dónde | Qué hace |
|---|---|---|
| **Navegar** | `Buscador` en la cabecera (siempre visible; atajo `/`) | Combobox ARIA: busca políticas e instrumentos por nombre o alias, sin tildes. **No filtra la red**: elegir un resultado lo enfoca. Si los filtros ocultan el destino, la lista lo avisa y al elegirlo se limpian. |
| **Filtrar** | `Filtros`: hoja (mobile) o panel izquierdo plegable (escritorio); botón "Filtros" en la cabecera con el n.º de activos | Vigencia segmentada (2018–2022, 2022–2026, ambos); modo de cambio y tipo NATO como chips "mostrar solo" (sin ninguno marcado se ve todo). Componen por intersección; muestra el conteo. "Limpiar filtros" **no toca el foco**. |
| **Enfocar** | `MigaDePan` arriba a la izquierda del lienzo: Red completa › Política › Instrumento ✕ | Política → aísla su subred (solo ella y sus instrumentos). Instrumento → resalta su vecindario (vecinos directos + un salto por relaciones instrumento↔instrumento) y atenúa el resto. Clic en el vacío sube un nivel; `Esc` o ✕ vuelve a la red completa. Si un filtro oculta lo enfocado, se sale de ese nivel. |
| **Ver detalle** | `DetailPanel`: hoja inferior (mobile) o panel derecho (escritorio) | Solo contenido del foco: políticas que sirve, presencia por vigencia, qué fue bajo cada gobierno, relaciones, entidades, evidencia. Sin foco: "Cómo leer la red" + instrumentos por modo de cambio. |
| **Leer** | `Leyenda` (abajo-izq, plegada) y `ControlesZoom` (abajo-der: +, −, ajustar) sobre el lienzo | La leyenda es solo lectura (color = modo de cambio, forma = tipo NATO); no filtra (eso vive en `Filtros`). |

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
