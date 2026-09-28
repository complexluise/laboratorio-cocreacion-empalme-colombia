# CLAUDE.md

> Puente para agentes. La **fuente de verdad operativa** es [`AGENTS.md`](AGENTS.md) — leelo primero.
> La disciplina de trabajo viene de [`kybernetes`](https://github.com/Sostaina/kybernetes)
> (ver [ADR-0001](docs/decisiones/ADR-0001-adoptar-disciplina-kybernetes.md)).

## No te lo saltes

- **Cómo trabajamos:** GitFlow-lite (`dev` integra, `main` solo releases = lo que publica Pages).
  Ver [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Fronteras:** `extraccion/` → **contrato de datos** (`data/schema/`) → `web/`; y `packages/red`
  (dominio, sin DOM/D3) → `web/` por `exports`. La web nunca importa del pipeline. Enforcement:
  `pnpm lint:boundaries` + `validar_contrato.py`. Ver [`docs/FRONTERAS.md`](docs/FRONTERAS.md).
- **Stack JS/TS:** monorepo pnpm (Node >= 22), TS estricto, Svelte 5 (runes), vitest,
  dependency-cruiser, changesets ([ADR-0003](docs/decisiones/ADR-0003-preset-codigo-kybernetes.md)).
- **Test-first** donde hay código con lógica (la lógica vive en `packages/red`). Nada se mergea con CI
  en rojo.
- **Decisiones → ADR** (`docs/decisiones/`). **Trabajo → issues** (no `.md` de "lo que falta").
- **El flujo** (encuadrar/decidir/ejecutar/liberar/retroalimentar) vive en `.claude/skills/`
  (empezá por `flujo`). El cierre de ciclo, en `.claude/commands/retro-ciclo.md`.

## El dominio

- **Qué es:** un **laboratorio de cocreación** sobre política pública colombiana. Del informe de
  empalme del DNP se extraen **políticas públicas + instrumentos** y se publican como un **mapa
  navegable** (red bipartita política↔instrumento) para que la gente explore y cocree.
- **Frontera del sistema:** no evalúa ni puntúa gobiernos; no es un buscador de documentos. Clasifica
  y conecta con un vocabulario controlado (`data/schema/taxonomia.yaml`).
- **Objeto de dominio de primera clase:** el **instrumento de política pública**, con su `tipo_nato`
  (Hood), su `modo_cambio` entre gobiernos (Mahoney-Thelen) y su presencia por vigencia. Se agrupa por
  **política pública** = **área persistente** con el objetivo que declara cada gobierno y su
  `cambio_objetivo` (ADR-0004).
- **El sitio:** landing con la actividad (`#/`), la red (`#/red`), el glosario (`#/glosario`) y
  «Cómo lo hicimos» (`#/metodologia`: metodología, declaración de uso de IA, git como evidencia).
- **Uso de IA (ADR-0006):** el contenido se declara hecho con IA y revisado solo en parte. Todo commit
  en el que participe IA lleva su `Co-Authored-By`; no declares una capa «revisada» en
  `web/src/lib/metodologia.ts` (`CAPAS`) si no lo está. Ver [`docs/metodologia.md`](docs/metodologia.md).
- **La bitácora:** cada grupo describe su política en un .docx en blanco
  (`web/public/bitacora-laboratorio.docx`); el equipo la convierte a `data/bitacoras/<slug>/<grupo>.json`
  con `extraccion/bitacora.py leer` (ADR-0005).

## Cómo correr

```bash
pnpm install && pnpm dev                                     # explorador en desarrollo
pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build   # el gate de la web
uv run scripts/validar_contrato.py                           # el gate del contrato (schemas, dataset, bitácoras, .docx y Excel al día)
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web/src/lib/data/<slug>.json
uv run extraccion/bitacora.py generar && uv run extraccion/bitacora.py ejemplo \
  && uv run extraccion/red_excel.py --slug ciencia-tecnologia  # materiales del taller -> web/public/
uv run scripts/evidencia_git.py                              # evidencia de git -> web/src/lib/evidencia.json (en cada release)
```

Detalle y gate de CI completo en [`AGENTS.md`](AGENTS.md) §Cómo correr.

Los scripts de `extraccion/` se ejecutan **desde la raíz** (rutas relativas) con `uv run` (deps
inline PEP 723). Los que usan Gemini necesitan `GEMINI_API_KEY` en `.env` — **no los corras sin
autorización** (API paga).
