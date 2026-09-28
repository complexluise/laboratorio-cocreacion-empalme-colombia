# AGENTS.md — guía canónica para agentes

> Fuente de verdad operativa. Si sos agente (humano o máquina), leé esto **primero**.
> Dueño: 👥 (colectivo; PO: @complexluise). Disciplina: [`kybernetes`](https://github.com/Sostaina/kybernetes).

## Qué es el Laboratorio de Cocreación

- **Narrativa:** un mapa navegable de la política pública colombiana (hoy: Ciencia, Tecnología e
  Innovación) construido desde los **informes de empalme del DNP**, para responder: ¿qué hizo un
  gobierno? ¿qué tuvo continuidad? ¿cómo contrastan las ejecuciones? (ver `docs/ontologia.md`).
- **Frontera:** no evalúa gobiernos ni sirve documentos crudos; clasifica y conecta con el
  vocabulario de `data/schema/taxonomia.yaml`.
- **Objeto de dominio de primera clase:** el **instrumento de política pública** (nodo de la red),
  agrupado por **política** (red bipartita muchos-a-muchos), con `tipo_nato`, `modo_cambio` y
  narrativa por gobierno. La **política** es un **área persistente** con el objetivo que declara cada
  gobierno y su `cambio_objetivo` (ADR-0004).
- **La actividad:** cada grupo del seminario elige una política, la describe entre los dos gobiernos
  en una **bitácora** .docx y el equipo la convierte a JSON (`data/bitacoras/`, ADR-0005). Ver
  `docs/encuadre-actividad-trama.md`.

## Convenciones

- **Flujo:** GitFlow-lite (`dev`/`main`). `main` = lo publicado en GitHub Pages. Ver `CONTRIBUTING.md`.
- **Commits:** Conventional Commits, atómicos, en español, con `Refs #N`.
- **Trabajo:** vive en **issues** (epics con sub-issues). Nada de documentos sueltos de pendientes.
- **Decisiones:** ADR en `docs/decisiones/` (vía PR). Se gradúan con `/graduar-adr`.
- **Fronteras:** `extraccion/` produce, `data/schema/` es el contrato, `packages/red` es el dominio
  (frontera = `exports`), `web/` consume ambos. Enforcement: `dependency-cruiser` + validador de
  contrato. Ver `docs/FRONTERAS.md`.
- **Changesets:** si cambiás la API pública (`exports`) de un paquete de `packages/`, agregá un
  changeset (`pnpm changeset`) en el mismo PR. Cambios internos o solo de `web/` no lo necesitan.
- **Ritmo:** deliberado. Encuadrar antes de ejecutar; retroalimentar al cerrar (`/retro-ciclo`).

## Estructura del repo

```
extraccion/       # sistema viable 1: ingesta DNP -> markdown -> politicas + instrumentos -> areas (Python, uv)
                  #   + bitacora.py (plantilla .docx <-> JSON) y red_excel.py (la red en Excel)
data/schema/      # FRONTERA 1: contratos (objeto.schema.json, bitacora.schema.json) + vocabulario (taxonomia.yaml)
data/correcciones/# curaduría versionada por sector: areas.yaml (ADR-0004) + overlay de correcciones
data/bitacoras/   # bitácoras de los grupos convertidas a JSON (<slug>/<grupo>.json, ADR-0005)
packages/red/     # sistema viable 2: @laboratorio/red, dominio de la red (tipos, filtros, subred, buscar, vecindario). Sin DOM/D3
web/              # sistema viable 3: @laboratorio/web, el sitio (Svelte 5 + Vite + D3; mobile first)
  public/         #   materiales del taller (.docx de la bitácora, .xlsx de la red; los genera extraccion/)
  src/lib/paginas/#   PaginaInicio (#/), PaginaRed (#/red), PaginaGlosario (#/glosario),
                  #   PaginaMetodologia (#/metodologia), PaginaTexto
  src/lib/data/   #   dataset commiteado (<slug>.json, lo escribe generar_web.py)
  src/lib/state/  #   store de la exploración (red.svelte.ts, runes: filtros vs foco)
  src/lib/graph/  #   GraphView.svelte + física D3 (forces.ts, posiciones.ts, acciones.ts, etiquetas.ts)
  src/lib/components/ # Cabecera, Buscador, Filtros, MigaDePan, Leyenda, ControlesZoom, DetailPanel, Marca,
                  #     PasosActividad, Practica, BotonDescarga, AvisoIA
  src/lib/*.ts    #   rutas.ts (hash), glosario.ts, practica.ts, metodologia.ts, visual.ts (vocabulario -> color/forma/etiqueta)
scripts/          # utilidades del repo (validar_contrato.py: gate de la frontera 1)
docs/             # ontologia, teoria, taxonomia, encuadre, metodologia, pipeline-extraccion, FRONTERAS, decisiones/ (ADRs)
.changeset/       # changesets pendientes (se consumen en el release)
.claude/          # skills (flujo), agents (architect/coder/verifier/editor), commands (retro-ciclo), settings
.github/          # workflows (ci, pages), CODEOWNERS, templates
```

Raíz: `package.json` + `pnpm-workspace.yaml` (monorepo pnpm, Node >= 22), `tsconfig.json`,
`vitest.config.ts` (un proyecto por sistema viable), `.dependency-cruiser.cjs`. Ver ADR-0003.

## Cómo correr

```bash
pnpm install                    # deps del monorepo (Node >= 22, pnpm vía corepack)
pnpm dev                        # el sitio en modo desarrollo (Vite)
pnpm typecheck                  # tsc estricto + svelte-check
pnpm test                       # vitest (packages/red + web)
pnpm lint:boundaries            # dependency-cruiser: fronteras entre sistemas viables
pnpm build                      # web/dist (estático; abre también por file://)
uv run scripts/validar_contrato.py                           # contratos, dataset, bitácoras y materiales al día
uv run extraccion/aplicar_areas.py --slug ciencia-tecnologia # políticas por gobierno -> áreas (areas.yaml)
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web/src/lib/data/<slug>.json
uv run extraccion/bitacora.py generar                        # -> web/public/bitacora-laboratorio.docx
uv run extraccion/bitacora.py ejemplo                        # -> web/public/bitacora-ejemplo-ctei.docx
uv run extraccion/bitacora.py leer <grupo>.docx --slug <slug> # -> data/bitacoras/<slug>/<grupo>.json
uv run extraccion/red_excel.py --slug ciencia-tecnologia     # -> web/public/red-<slug>.xlsx
```

`aplicar_areas.py` y `generar_web.py` parten de `data/sectores/<slug>/objetos.json` (no versionado; la
fuente vigente de CTeI es el workflow pago `extraccion/rebuild-ctei-claude.workflow.js`). Si cambia el
dataset, regenerá el Excel; si cambia la estructura de la bitácora, las dos .docx (el gate lo exige).

**Gate de CI** (`ci.yml`, en cada PR/push a `dev`/`main`):
- **contrato-y-pipeline:** compila `extraccion/` y `scripts/`, y `uv run scripts/validar_contrato.py`
  (schemas, dataset de la web, bitácoras + ida y vuelta de la plantilla, .docx y Excel al día).
- **web:** `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm lint:boundaries`,
  `pnpm build`.

`pages.yml` construye con pnpm y publica `web/dist` en cada push a `main`.

## Code style

- **Python:** scripts autocontenidos con dependencias inline (PEP 723) y `uv run`. Stdlib cuando
  alcanza. Docstring de módulo con qué hace + uso.
- **TypeScript:** estricto (`noUncheckedIndexedAccess`). La **lógica del dominio va en `packages/red`**
  (funciones puras, sin DOM ni D3); `web/` la orquesta y la dibuja. La lógica propia del sitio
  (rutas, glosario, práctica, física/etiquetas) vive en `web/src/lib/**/*.ts`, sin `.svelte`, con su test.
- **Svelte 5:** runes (`$state`, `$derived`, `$effect`), sin stores legacy. Estado compartido en
  clases `*.svelte.ts` (`EstadoRed`). **D3 posee la física** (`d3-force`, zoom, drag vía acciones);
  **Svelte posee el DOM** (los nodos se renderizan en el template, no con `d3.select().append`).
- **Tests:** vitest, co-locados como `*.test.ts` junto al módulo. Lo visual se verifica con smoke.
- **Idioma:** código, docs, commits e issues en español.

## Notas de desarrollo

- **Nunca corras llamadas pagas** (Gemini, workflows multi-agente de reconstrucción) sin
  autorización explícita del PO. Probá la lógica con datos ya versionados.
- `data/sectores/`, `descargas/`, `extraido/`, `markdown/` no se versionan (se regeneran).
  `web/src/lib/data/*.json` **sí** se versiona a propósito; `web/dist/` no.
- Archivos calientes (serializar trabajo que los toque): `pnpm-lock.yaml`,
  `web/src/lib/state/red.svelte.ts`, `web/src/lib/graph/GraphView.svelte`, `web/src/App.svelte`
  (layout mobile/escritorio), `data/schema/objeto.schema.json`, `data/schema/taxonomia.yaml`,
  `extraccion/bitacora.py` + `data/schema/bitacora.schema.json` (la estructura de la bitácora se
  congela mientras haya grupos llenando; ADR-0005).
- Al paralelizar trabajo entre agentes: archivos/fronteras disjuntas para evitar conflictos.

## Ejecución concurrente y testing

- Paralelizá solo issues que tocan archivos disjuntos (ver skill `feature-cycle` §Archivos calientes).
- Los agentes escriben en el worktree de la sesión; briefeá rutas absolutas.
