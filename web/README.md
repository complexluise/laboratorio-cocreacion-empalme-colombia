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
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # data/sectores/<slug>/objetos.json -> src/lib/data/<slug>.json
```

**Fuente vigente (CTeI):** reconstrucción con Claude vía el workflow multi-agente
`extraccion/rebuild-ctei-claude.workflow.js` (políticas + instrumentos, modo de cambio guiado por
evidencia, narrativa por gobierno), que escribe `data/sectores/ciencia-tecnologia/objetos.json`
(gitignoreado). Es una corrida paga: solo con autorización del PO.

> Legado (no usar para CTeI): `extraer_instrumentos.py` (Gemini) + `aplicar_correcciones.py`
> (overlay en `data/correcciones/`); Gemini resultó poco fiable (cuota/calidad).

## Estructura

```
src/App.svelte               # layout: cabecera + toolbar, grafo, leyenda, panel de detalle
src/lib/data/                # dataset JSON commiteado + index.ts (lo tipa como Dataset)
src/lib/state/red.svelte.ts  # EstadoRed: filtros, selección, red derivada y foco (runes)
src/lib/graph/               # GraphView.svelte + física D3 (forces.ts, posiciones.ts, acciones.ts)
                             #   y colocación de etiquetas sin solape (etiquetas.ts)
src/lib/components/          # Toolbar, Legend, DetailPanel, Marca
src/lib/visual.ts            # mapeo del vocabulario a colores, glifos y etiquetas
```

La lógica del dominio (`construirRed`, `vecindario`, tipos del contrato) **no** vive acá: está en
[`packages/red`](../packages/red/README.md) y se importa como `@laboratorio/red`.

## Interacción

- **Vigencia**: 2018–2022, 2022–2026 o ambos gobiernos.
- **Buscar**: por nombre de instrumento, alias o política (sin distinguir tildes).
- **Enfocar política**: deja solo una política y sus instrumentos.
- **Filtrar por modo de cambio / tipo NATO**: clic en la leyenda (color = modo de cambio, forma =
  tipo NATO). Todos los filtros **componen por intersección**; "Limpiar filtros" los resetea.
- **Foco de vecindario**: clic en un nodo resalta el nodo, sus vecinos directos y un salto más por
  relaciones instrumento↔instrumento; el panel muestra el detalle (políticas que sirve, presencia
  por vigencia, qué fue bajo cada gobierno, relaciones, entidades, evidencia). Clic en el fondo o
  `Esc` deselecciona. Al seleccionar, la vista se acerca al vecindario.
- **Sin solapes**: los nodos se separan por colisión (`forceCollide`, varias iteraciones) y las
  etiquetas se colocan con un algoritmo greedy por prioridad (seleccionado/hover > políticas >
  vecindario > resto) que prueba 4 posiciones y omite la que no cabe. El texto mide lo mismo en
  pantalla a cualquier zoom: **al acercarse aparecen más etiquetas** (zoom semántico).
- Arrastrar nodos, zoom/pan (anclado al cursor), "Ajustar vista" para encuadrar la red; Tab recorre
  las políticas y Enter selecciona.
- **Responsive** (≤ 860 px): filtros y leyenda plegables; el panel pasa a una hoja inferior dentro
  del layout, así nunca tapa el grafo.
