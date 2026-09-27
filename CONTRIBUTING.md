# Contribuir — disciplina de trabajo

Este repo es un **sistema viable** que colabora con agentes humanos y máquinas. La disciplina viene de
[`kybernetes`](https://github.com/Sostaina/kybernetes) y existe para dar la **variedad requisita**
(Ashby) que el trabajo necesita: bucles de control, fronteras claras y retroalimentación. El mapa
ejecutable del proceso vive en la skill `flujo` (`.claude/skills/flujo/`).

## Ramas (GitFlow-lite)

- **`main`** — estable = **lo que publica GitHub Pages**. **Solo recibe releases** (y hotfixes con
  issue). Nunca push directo ni PR de feature.
- **`dev`** — integración. Todo feature/fix sale de `dev` y vuelve a `dev`.
- **Ramas de trabajo** — `feat/…`, `fix/…`, `chore/…`, `docs/…`, `ci/…`, `test/…`, desde `dev`.
  (Las sesiones de Claude Code usan `claude/…`; mismo tratamiento: PR a `dev`.)

```
feat/x ──PR──► dev ──(release)──► main ──► GitHub Pages
```

## Commits (Conventional + atómicos)

`tipo(scope): asunto` — `feat` `fix` `docs` `chore` `ci` `build` `test` `refactor`. Scopes habituales:
`web`, `red`, `extraccion`, `schema`, `contrato`, `bitacora`, `encuadre`, `tooling`, `pipeline`, `adr`,
`proceso`. Un commit = un cambio lógico.
Referenciá el issue: `Refs #N` (o `Closes #N` en el PR).

## TDD (test-first)

Toda regla nueva con lógica (transformaciones del dataset, filtros, foco de vecindario, cálculo de
modo de cambio) arranca con un test que falla → lo hacés pasar → refactor. La lógica del dominio vive
en `packages/red` (sin DOM); la del sitio (rutas, glosario, práctica), en `web/src/lib/*.ts`. Se testea
con vitest, en `*.test.ts` co-locados. En `extraccion/`, la lógica de la bitácora se prueba con la ida
y vuelta que corre el gate (`bitacora.py probar`). Lo exploratorio o visual
se verifica con un smoke (abrir el mapa, captura) y se dice explícito en el PR.

Un PR no se mergea con el gate de CI (`ci.yml`) en rojo. Antes de abrirlo, localmente:
`pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build` y
`uv run scripts/validar_contrato.py` (ver `AGENTS.md` §Cómo correr).

## Fronteras (⭐ el corazón)

- `extraccion/` **produce** el dataset (y los materiales de `web/public/`); `web/` lo **consume**. Se
  encuentran **solo** en el contrato `data/schema/objeto.schema.json` (+ `taxonomia.yaml`). Las
  bitácoras de los grupos tienen su propio contrato, `bitacora.schema.json` (no cruza a la web).
- `packages/red` es el dominio de la red; `web/` lo usa por nombre (`@laboratorio/red`), nunca por
  ruta a su `src/`. Si cambiás su API pública (`exports`), sumá un **changeset** (`pnpm changeset`).
- Cambiar el contrato es un acto explícito: PR propio (`feat(schema)`/`refactor(schema)`), con ADR si
  cambia el porqué. Reglas y enforcement en [`docs/FRONTERAS.md`](docs/FRONTERAS.md).

## Releases

**Fase LIBERAR:** `pnpm changeset version` (bump + CHANGELOG de los paquetes) → PR `dev → main`
(merge commit) → el workflow `pages` publica el mapa → tag `vX.Y.Z` + GitHub Release con las notas de los Conventional Commits → back-merge `main → dev`. Un
release **es** cerrar su milestone. Ver la skill `release`.

## Decisiones

Los "por qué" que condicionan el código se registran como **ADR** (`docs/decisiones/`, vía PR).
Encuadre conceptual y estado del arte viven en `docs/`. Pensamiento abierto → GitHub Discussions.
