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
  (Hood), su `modo_cambio` entre gobiernos (Mahoney-Thelen) y su presencia por vigencia.

## Cómo correr

```bash
pnpm install && pnpm dev                                     # explorador en desarrollo
pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build   # el gate de la web
uv run scripts/validar_contrato.py                           # el gate del contrato
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web/src/lib/data/<slug>.json
```

Detalle y gate de CI completo en [`AGENTS.md`](AGENTS.md) §Cómo correr.

Los scripts de `extraccion/` se ejecutan **desde la raíz** (rutas relativas) con `uv run` (deps
inline PEP 723). Los que usan Gemini necesitan `GEMINI_API_KEY` en `.env` — **no los corras sin
autorización** (API paga).
