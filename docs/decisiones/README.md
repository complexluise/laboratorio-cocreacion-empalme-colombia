# Decisiones (ADR)

Los **por qué** que condicionan el código viven acá, versionados y pasando por PR (a diferencia del
pensamiento suelto, que va a Discussions). Un ADR = una decisión testeable de forma aislada.

- Copiá `ADR-0000-template.md` → `ADR-000N-titulo-corto.md`.
- Registrá decisiones **que cuajaron**, no debates abiertos.
- N cambios al mismo contrato → N ADRs focalizados, no un ADR paraguas.
- Los ADR cerrados son historia inmutable: se reemplazan con uno nuevo, no se reescriben.

Se gradúan con la skill `graduar-adr` (fase DECIDIR del flujo).

## Índice

| # | Título | Estado |
|---|--------|--------|
| [0001](ADR-0001-adoptar-disciplina-kybernetes.md) | Adoptar la disciplina kybernetes | aceptada (enmendada por 0003) |
| [0002](ADR-0002-frontend-svelte-vite.md) | Frontend del explorador en Svelte 5 + Vite | aceptada (enmendada por 0003) |
| [0003](ADR-0003-preset-codigo-kybernetes.md) | Adoptar el preset de código de kybernetes (monorepo pnpm + TS) | aceptada |
