# ADR-0001: Adoptar la disciplina kybernetes

- **Estado:** aceptada — enmendada por [ADR-0003](ADR-0003-preset-codigo-kybernetes.md)
- **Fecha:** 2026-09-27
- **Decide:** PO (@complexluise)

## Contexto

El repo creció con commits directos a `main` (que publica Pages en cada push), sin CI de calidad, sin
registro de decisiones y con el trabajo repartido entre issues y documentos. Buena parte del trabajo
lo hacen agentes (Claude Code), que necesitan un proceso explícito y descubrible para colaborar bien.
Antes de la reescritura del frontend (epic #6) queremos ese proceso en su lugar.

## Decisión

Adoptamos el **núcleo de proceso** de la plantilla [`Sostaina/kybernetes`](https://github.com/Sostaina/kybernetes):
GitFlow-lite (`dev`/`main`), Conventional Commits atómicos, test-first, CI como gate, ADRs,
trabajo en issues, y el harness de IA en `.claude/` (skills del flujo, agentes
`architect`/`coder`/`verifier`, `/retro-ciclo`) más `CLAUDE.md`/`AGENTS.md`.

**No** adoptamos el preset TypeScript (monorepo pnpm, `dependency-cruiser`, `changesets`, `tsup`):
este repo es Python (`extraccion/`) + web estática. Las fronteras se gobiernan por el **contrato de
datos** (`docs/FRONTERAS.md`) y el release es `dev → main` + tag, sin release-please.

## Consecuencias

- **Habilita:** agentes que descubren el proceso solos; PRs revisables con gate; historia de
  decisiones auditada; retro del proceso al cerrar epics.
- **Cuesta / cierra:** se termina el push directo a `main`; hay que crear `dev` y proteger ambas
  ramas (acción del PO en GitHub). Un poco más de ceremonia por cambio (escalada al tamaño).
- **Frontera afectada:** ninguna de código; cambia el proceso.

## Alternativas consideradas

- Seguir con commits directos a `main` — descartada: cada push publica, sin gate ni revisión.
- Adoptar kybernetes completo (preset TS) — descartada: el stack no es un monorepo TS.
