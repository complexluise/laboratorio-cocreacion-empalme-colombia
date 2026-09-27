---
name: release
description: >-
  Corta un release liberando el trabajo acumulado en `dev` hacia `main` con el
  flujo GitFlow-lite. Usala cuando el usuario quiere "hacer el release", "cortar
  versión", "publicar el mapa", "liberar dev a main" o escribe /release. Es la fase
  LIBERAR del flujo: changesets → PR dev→main (merge commit) → Pages publica →
  tag + GitHub Release → back-merge main→dev. NO es para subir un fix suelto (eso es /hotfix)
  ni para abrir trabajo nuevo.
---

Esta skill codifica cómo el PO corta un release. El humano decide *cuándo*; vos ejecutás
el procedimiento y **parás a avisar** ante cualquier cosa que no esté verde. En este repo
**liberar = publicar el mapa**: el workflow `pages` despliega en cada push a `main`.

## Cuándo usarla
- `dev` tiene trabajo acumulado y validado y el PO quiere publicarlo. Se invoca con `/release`
  o pidiéndolo en palabras ("hagamos el release", "publiquemos").
- **No** la uses para un bug suelto urgente → eso es `/hotfix`. **No** la uses si `dev` no
  está listo: el release libera *todo* lo que hay en `dev`.

## Precondiciones (verificá antes de tocar nada)
- `main` y `dev` están **protegidos**: PR + CI verde obligatorios, nunca push directo.
- El head de `dev` tiene CI verde. Si está rojo o pendiente, pará y reportá.
- **El milestone de la versión refleja el alcance:** issues abiertos del milestone `X.Y.Z` = trabajo
  que **no** entra al corte — traélo al PO antes de liberar (¿se cierra, se reasigna, o se espera?).

## El procedimiento
1. **Resumí lo que entra** — Conventional Commits desde el último tag
   (`git log <ultimo-tag>..origin/dev`; si no hay tags, desde el inicio). Bump en 0.x: breaking
   (`!`) o `feat` → minor; solo `fix`/`docs` → patch. Decíselo al PO en una línea.
2. **Consumí los changesets** — si hay `.changeset/*.md` pendientes, en una rama desde `dev`
   corré `pnpm changeset version` (bump de los paquetes + su `CHANGELOG.md`, borra los changesets
   consumidos), commit `chore(release): version packages`, PR a `dev` con CI verde. Así el
   bump entra al corte. Sin changesets pendientes, saltá este paso. (La versión `vX.Y.Z` del
   repo la sigue decidiendo el paso 1; los changesets versionan cada paquete.)
3. **PR `dev → main`** — título `release: dev → main (vX.Y.Z)`, cuerpo con
   breaking/features/fixes.
4. **Esperá CI verde del PR.** Si falla, pará y reportá la causa.
5. **Mergeá con MERGE COMMIT** (no squash): la historia de `main` conserva cada commit.
6. **Verificá el deploy** — el workflow `pages` (build con pnpm, publica `web/dist`) corre sobre
   `main`; confirmá que terminó verde y que el mapa publicado responde (HTTP 200) y se ve.
7. **Tag + Release** — tag `vX.Y.Z` sobre el merge commit en `main` y GitHub Release con las notas
   (secciones Breaking / Features / Fixes armadas desde los commits). El número lo decidís con el
   PO en el paso 1; no hay release-please ni publish a registry (paquetes internos).
8. **Back-merge `main → dev`** — PR de sincronización (`--base dev --head main`), CI verde,
   **merge commit**. **Obligatorio**: sin esto las ramas divergen.
9. **Cerrá el milestone** `X.Y.Z`.

## Cierra cuando
El mapa está publicado desde `main`, el tag/Release existe, `dev` quedó sincronizado y el milestone
está cerrado. Reportá al PO: versión, link al Release y al mapa, back-merge hecho, milestone cerrado.

## No-negociables (lecciones de la experiencia)
- **`dev→main` es merge commit.** Nada de squash en el corte.
- **Nunca `--admin`** para saltar la protección. Si CI no está verde, se espera o se arregla.
- **El back-merge es parte del comando**, no un paso aparte que se hace después "si me acuerdo".
- Si en cualquier paso algo no está verde o el diff sorprende, **pará y diagnosticá** antes de
  seguir. Reportá la causa raíz, no la maquilles.
