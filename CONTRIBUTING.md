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

`tipo(scope): asunto` — `feat` `fix` `docs` `chore` `ci` `test` `refactor`. Scopes habituales:
`web`, `extraccion`, `schema`, `pipeline`, `adr`, `proceso`. Un commit = un cambio lógico.
Referenciá el issue: `Refs #N` (o `Closes #N` en el PR).

## TDD (test-first)

Toda regla nueva con lógica (transformaciones del dataset, filtros, foco de vecindario, cálculo de
modo de cambio) arranca con un test que falla → lo hacés pasar → refactor. Lo exploratorio o visual
se verifica con un smoke (abrir el mapa, captura) y se dice explícito en el PR.

Un PR no se mergea con el gate de CI (`ci.yml`) en rojo.

## Fronteras (⭐ el corazón)

- `extraccion/` **produce** el dataset; `web/` lo **consume**. Se encuentran **solo** en el contrato
  `data/schema/objeto.schema.json` (+ `taxonomia.yaml`).
- `web/` nunca importa ni ejecuta código de `extraccion/`; `extraccion/` no sabe cómo se dibuja.
- Cambiar el contrato es un acto explícito: PR propio (`feat(schema)`/`refactor(schema)`), con ADR si
  cambia el porqué. Ver [`docs/FRONTERAS.md`](docs/FRONTERAS.md).

## Releases

**Fase LIBERAR:** PR `dev → main` (merge commit) → el workflow `pages` publica el mapa → tag
`vX.Y.Z` + GitHub Release con las notas de los Conventional Commits → back-merge `main → dev`. Un
release **es** cerrar su milestone. Ver la skill `release`.

## Decisiones

Los "por qué" que condicionan el código se registran como **ADR** (`docs/decisiones/`, vía PR).
Encuadre conceptual y estado del arte viven en `docs/`. Pensamiento abierto → GitHub Discussions.
