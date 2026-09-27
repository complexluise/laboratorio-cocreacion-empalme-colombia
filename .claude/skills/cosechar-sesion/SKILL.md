---
name: cosechar-sesion
description: >-
  Convierte los hallazgos de una sesión de QA / uso real en issues y Discussions
  de GitHub, sin que nada quede en una nota suelta. Usala al terminar una prueba,
  un QA o una sesión de uso con varios hallazgos (bugs, fricciones, ideas), o
  cuando el usuario escribe /cosechar-sesion. Es la fase RETROALIMENTAR del flujo:
  separa bug (→ issue, candidato a hotfix) de idea/dirección (→ Discussion).
---

Esta skill cierra el lazo del flujo: lo que el uso real encuentra **vuelve a GitHub como
trabajo**, no como una Nota que sedimenta. Reemplaza el viejo patrón "sesión → documento de
hallazgos → más tarde issues" por "sesión → issues/Discussions directo".

## Cuándo usarla
- Terminó una sesión de prueba/QA/uso con varios hallazgos. Se invoca con `/cosechar-sesion`
  o pidiéndolo.
- **No** la uses para un solo bug que vas a arreglar ya (abrí el issue y andá a `/hotfix`).

## El procedimiento
1. **Listá los hallazgos** — recorré la sesión y enumerá lo encontrado: bugs, fricciones de
   UX, ideas, deuda. Una línea cada uno, con su evidencia/repro si la hay.
2. **Clasificá cada uno:**
   - **Bug** (algo está roto) → **issue** con repro mínima. Si es urgente, queda como
     candidato a `/hotfix` (la lane directa a main exige issue — éste lo provee).
   - **Mejora / trabajo claro** → **issue** con DoD breve (podés delegar a `/abrir-issue`).
   - **Dirección / debate abierto** (no hay decisión todavía) → **Discussion**, no issue.
3. **Abrí todo** — `gh issue create` para los issues, Discussion para lo que es debate.
   Enlazalos entre sí si se relacionan.
4. **Reportá el mapa** — al PO: qué se abrió (números/links), agrupado por bug / mejora /
   debate. Sin documento intermedio.

## Cierra cuando
Todos los hallazgos están en GitHub (issues o Discussions) y nada quedó solo en la memoria de
la sesión. Reportá la lista al PO.

## No-negociables
- **Nada queda en una nota suelta.** Cada hallazgo es un issue o una Discussion.
- **Bug ≠ debate:** lo roto va a issue (accionable); lo no-decidido va a Discussion.
- Repro mínima en los bugs — un issue sin cómo reproducir es media tarea.
- No infles: un hallazgo trivial puede ser un comentario en un issue existente, no uno nuevo.
