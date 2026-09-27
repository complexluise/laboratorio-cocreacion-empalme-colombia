# ADR-0003: Adoptar el preset de código de kybernetes (monorepo pnpm + TS)

- **Estado:** aceptada — enmienda [ADR-0001](ADR-0001-adoptar-disciplina-kybernetes.md) y [ADR-0002](ADR-0002-frontend-svelte-vite.md)
- **Fecha:** 2026-09-27
- **Decide:** PO (@complexluise) — "adoptar la demás parte de la disciplina, en especial pnpm"

## Contexto

ADR-0001 adoptó solo el núcleo de proceso de kybernetes y **descartó el preset de código** (monorepo
pnpm, `dependency-cruiser`, `changesets`, `tsup`) porque el repo era Python + web estática. ADR-0002
introdujo un toolchain Node (Svelte 5 + Vite) pensado con npm y archivos `.js`. Con el epic #6 hay
código JS/TS con lógica de dominio (filtros, foco de vecindario) y la premisa de ADR-0001 dejó de
ser cierta: sin el preset, las fronteras entre la lógica y la UI no tienen enforcement mecánico.

## Decisión

Adoptamos el preset de código de kybernetes para todo lo que es JS/TS:

- **Monorepo pnpm** (`pnpm-workspace.yaml`: `packages/*` + `web`), Node **>= 22** (lo exige
  `dependency-cruiser` 18), `pnpm-lock.yaml` como único lockfile.
- **TypeScript estricto** (`tsconfig.json`: `strict`, `noUncheckedIndexedAccess`).
- **vitest** por proyectos (`vitest.config.ts`: un proyecto por sistema viable), tests co-locados.
- **dependency-cruiser** (`.dependency-cruiser.cjs`) como enforcement de fronteras (ver
  `docs/FRONTERAS.md`).
- **changesets** para versionar paquetes (`privatePackages.version: true`); se consumen en el release.
- La lógica de dominio vive en un sistema viable propio, **`packages/red`** (`@laboratorio/red`), sin
  DOM ni D3; `web/` (`@laboratorio/web`) lo consume por nombre.

**No** adoptamos `tsup` ni publish a registry: los paquetes son internos, exportan el fuente TS y
Vite compila. `extraccion/` sigue en Python + `uv`, fuera del workspace.

Enmienda a **ADR-0001**: se revierte el "no adoptamos el preset TypeScript" (salvo `tsup`/publish).
Enmienda a **ADR-0002**: el toolchain es pnpm + `pnpm-lock.yaml` (no npm + `package-lock.json`), el
código es TS (no `.js`), y la lógica de filtros/foco está en `packages/red`, no en `web/`.

## Consecuencias

- **Habilita:** fronteras verificadas en CI (no solo en revisión), lógica testeable sin DOM, tipos
  del contrato de datos compartidos, CHANGELOG por paquete.
- **Cuesta / cierra:** más config en la raíz; Node 22 obligatorio; cada cambio a la API de un paquete
  pide un changeset.
- **Frontera afectada:** aparece una segunda frontera, `exports` de `@laboratorio/red` (red → web),
  además del contrato de datos (extracción → web).

## Alternativas consideradas

- Quedarse con npm y un solo paquete `web/` — descartada: la lógica de dominio queda mezclada con
  componentes y las fronteras solo se cuidan a ojo.
- Preset completo con `tsup` + publish — descartada: nadie consume estos paquetes fuera del repo.
