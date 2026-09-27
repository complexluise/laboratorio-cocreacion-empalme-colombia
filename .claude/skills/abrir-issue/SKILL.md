---
name: abrir-issue
description: >-
  Baja una idea o una Discussion que cuajó a un issue BREVE de GitHub con su DoD,
  listo para trabajar. Usala cuando el usuario quiere "abrir un issue", "encuadrar
  esto como trabajo", convertir una discusión en tarea, o escribe /abrir-issue. Es
  la fase ENCUADRAR del flujo. El detalle y la discusión viven DENTRO del issue, no
  en un documento suelto. Si es grande, abre un epic con sub-issues.
---

Esta skill convierte pensamiento en trabajo rastreable. La idea rectora del PO: **el trabajo
vive en issues de GitHub, no en documentos sueltos**. El issue es breve; la discusión
sustantiva pasa *dentro* del issue (comentarios) o en una Discussion enlazada.

## Cuándo usarla
- Una idea ya está clara, o una Discussion cuajó, y hay que volverla trabajo. Se invoca con
  `/abrir-issue <tema>` o pidiéndolo.
- **No** la uses para registrar una *decisión* (eso es `/graduar-adr`) ni para cosechar una
  sesión entera de hallazgos (eso es `/cosechar-sesion`).

## El procedimiento
1. **Encuadre (architect)** — para cualquier cosa que toque diseño/contratos, despachá
   `architect` para encuadrar contra los docs del repo: qué toca, qué decisiones hay, si
   necesita un ADR antes, y si es **un issue o un epic** (>1 ciclo). **Traé las bifurcaciones
   reales al PO y esperá su respuesta.** Para trabajo claramente chico, salteá el architect.
2. **Redactá breve** — título accionable (estilo Conventional: `feat(x): …`, `fix(x): …`),
   cuerpo mínimo: contexto en 2-4 líneas, **DoD** (criterios de "hecho"), tests esperados si
   aplica, y link a la Discussion/ADR de origen. Nada de ensayos: el detalle se discute en el
   issue.
3. **Abrí el issue** — `gh issue create` con esos campos. Si es epic, abrí el issue paraguas
   con una checklist de sub-issues (o abrí los sub-issues y enlazalos). **Asigná el milestone**
   de su release destino (`--milestone X.Y.Z`); si no hay versión clara, dejalo sin milestone
   (backlog) hasta decidirla. El milestone es el espejo de lo que falta para cortar esa versión.
4. **Cerrá el origen** — si vino de una Discussion, dejá un comentario que enlace el issue y
   marcala como graduada.

## Cierra cuando
El/los issue(s) existen en GitHub con su DoD, enlazados a su origen. Reportá al PO los
números y links.

## No-negociables
- **Breve.** El issue encuadra; no es el lugar de la discusión larga (esa va en comentarios).
- **Un issue = una idea con su DoD.** Si son varias, son varios issues (o un epic).
- **Nada de documentos sueltos** para describir trabajo. Si te dan ganas de crear un `.md` de
  "lo que falta", es un issue.
- No adivines el alcance por el PO: surfacá las decisiones reales del encuadre.
