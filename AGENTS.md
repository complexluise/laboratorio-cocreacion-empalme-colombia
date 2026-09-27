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
  narrativa por gobierno.

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
extraccion/       # sistema viable 1: ingesta DNP -> markdown -> politicas + instrumentos (Python, uv)
data/schema/      # FRONTERA 1: contrato de datos (JSON Schema) + vocabulario (taxonomia.yaml)
data/correcciones/# overlay de correcciones verificadas a mano
packages/red/     # sistema viable 2: @laboratorio/red, dominio de la red (tipos, filtros, subred, buscar, vecindario). Sin DOM/D3
web/              # sistema viable 3: @laboratorio/web, el explorador (Svelte 5 + Vite + D3; mobile first)
  src/lib/data/   #   dataset commiteado (<slug>.json, lo escribe generar_web.py)
  src/lib/state/  #   store de la exploración (red.svelte.ts, runes: filtros vs foco)
  src/lib/graph/  #   GraphView.svelte + física D3 (forces.ts, posiciones.ts, acciones.ts)
  src/lib/components/ # Buscador, Filtros, MigaDePan, Leyenda, ControlesZoom, DetailPanel, Marca
scripts/          # utilidades del repo (validar_contrato.py: gate de la frontera 1)
docs/             # ontologia, teoria, taxonomia, encuadre, FRONTERAS, decisiones/ (ADRs)
.changeset/       # changesets pendientes (se consumen en el release)
.claude/          # skills (flujo), agents (architect/coder/verifier), commands (retro-ciclo), settings
.github/          # workflows (ci, pages), CODEOWNERS, templates
```

Raíz: `package.json` + `pnpm-workspace.yaml` (monorepo pnpm, Node >= 22), `tsconfig.json`,
`vitest.config.ts` (un proyecto por sistema viable), `.dependency-cruiser.cjs`. Ver ADR-0003.

## Cómo correr

```bash
pnpm install                    # deps del monorepo (Node >= 22, pnpm vía corepack)
pnpm dev                        # explorador en modo desarrollo (Vite)
pnpm typecheck                  # tsc estricto + svelte-check
pnpm test                       # vitest (packages/red + web)
pnpm lint:boundaries            # dependency-cruiser: fronteras entre sistemas viables
pnpm build                      # web/dist (estático; abre también por file://)
uv run scripts/validar_contrato.py                           # contrato + dataset de la web
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web/src/lib/data/<slug>.json
```

**Gate de CI** (`ci.yml`, en cada PR/push a `dev`/`main`):
- **contrato-y-pipeline:** compila `extraccion/` y `scripts/`, y `uv run scripts/validar_contrato.py`.
- **web:** `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm lint:boundaries`,
  `pnpm build`.

`pages.yml` construye con pnpm y publica `web/dist` en cada push a `main`.

## Code style

- **Python:** scripts autocontenidos con dependencias inline (PEP 723) y `uv run`. Stdlib cuando
  alcanza. Docstring de módulo con qué hace + uso.
- **TypeScript:** estricto (`noUncheckedIndexedAccess`). La **lógica testeable va en `packages/red`**
  (funciones puras, sin DOM ni D3); `web/` solo la orquesta y la dibuja.
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
  (layout mobile/escritorio), `data/schema/objeto.schema.json`, `data/schema/taxonomia.yaml`.
- Al paralelizar trabajo entre agentes: archivos/fronteras disjuntas para evitar conflictos.

## Ejecución concurrente y testing

- Paralelizá solo issues que tocan archivos disjuntos (ver skill `feature-cycle` §Archivos calientes).
- Los agentes escriben en el worktree de la sesión; briefeá rutas absolutas.
