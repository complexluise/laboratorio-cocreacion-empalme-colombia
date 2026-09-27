---
name: hotfix
description: >-
  Apaga un bug reportado con su issue subiendo el fix DIRECTO a `main` y cortando
  un patch release ya mismo. Usala cuando hay un bug con issue abierto que no
  puede esperar al próximo release, o el usuario escribe /hotfix. Es la lane
  rápida del flujo: rama desde main → fix + test → PR a main → Pages publica +
  tag patch → back-merge main→dev. NO la uses sin un issue reportado, ni
  para features (eso va por dev / feature-cycle).
---

Esta skill codifica la lane de hotfix del PO. Regla dura: **solo bugs con issue reportado
van directo a `main`.** Es un ciclo liviano (coder + verifier, **sin** el architect
completo): apagar un fuego con su test de regresión, no rediseñar nada.

## Cuándo usarla
- Hay un bug con **issue abierto** y el PO quiere arreglarlo ya, sin esperar a acumular en
  `dev`. Se invoca con `/hotfix <issue>` o pidiéndolo.
- **No** la uses sin issue (sin issue, el cambio va por `dev` como cualquier trabajo). **No**
  la uses para features ni refactors — eso es `dev` + `feature-cycle`.

## Precondiciones (verificá antes de tocar nada)
- **Existe el issue** del bug. Si no hay issue, pará y decíselo al PO: sin issue no hay
  hotfix directo a main.
- `main` está protegido (PR + CI verde). Cada push a `main` publica el mapa en Pages.

## El procedimiento
1. **Rama desde `main`** (no desde dev): `fix/<issue>-<slug>`, salida de `origin/main`
   actualizado.
2. **Diagnosticá la causa raíz** antes de tocar código. Si "se ve mal", entendé por qué primero.
3. **Fix + test de regresión** — disciplina del repo: cada bug entra con un test que falla
   antes y pasa después. Acá podés despachar `coder` + `verifier` (ciclo liviano) o hacerlo
   directo si es chico.
4. **Gate local** — el mismo de CI (ver `AGENTS.md` §Cómo correr):
   `pnpm install --frozen-lockfile && pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build`
   y `uv run scripts/validar_contrato.py`. Si el fix cambia la API de un paquete de
   `packages/`, sumá un changeset (`pnpm changeset`, nivel `patch`).
5. **PR a `main`** — `gh pr create --base main`, **linkeá el issue** (`Closes #<n>`). Commit
   `fix(...): ...` en Conventional Commits.
6. **Esperá CI verde** (`gh pr checks <n> --watch`). Si falla, pará y reportá. **Nunca
   `--admin`.**
7. **Mergeá con SQUASH** (`gh pr merge <n> --squash`) — queda un solo commit `fix(...)`.
8. **Cortá el patch ya mismo** — verificá que el deploy de Pages terminó verde, y creá el tag
   `vX.Y.(Z+1)` + GitHub Release con el fix. El bug sale en su propio patch release (esa es la
   razón de subir directo a main).
9. **Back-merge `main → dev`** — como `dev` está protegido, va por **PR de sincronización**
   (`gh pr create --base dev --head main`), CI verde, **merge commit**. Sin esto, el bug
   reaparece la próxima vez que `dev` corte release. **Obligatorio.**

## Cierra cuando
El fix está en `main`, el issue cerrado, el patch release cortado, y `dev` sincronizado.
Reportá al PO: versión patch, link al Release, issue cerrado, back-merge hecho.

## No-negociables
- **Sin issue, no hay hotfix.** Es la frontera que separa esta lane de la de `dev`.
- **Cada bug entra con su test de regresión.** Si no se puede testear, decí por qué.
- **El patch se corta ya** (no se acumula): es el sentido de la lane directa a main.
- **El back-merge a `dev` es parte del comando.** No es opcional ni "después".
- Ciclo liviano: no metas al `architect` completo ni rediseñes — es un fix acotado.
