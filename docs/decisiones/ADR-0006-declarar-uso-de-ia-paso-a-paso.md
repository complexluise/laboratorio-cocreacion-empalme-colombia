# ADR-0006: Declarar el uso de IA como un paso a paso con los prompts, para público no técnico

- **Estado:** aceptada (enmendada por [ADR-0007](ADR-0007-metodologia-como-receta-y-glosario-en-orden.md): receta, categorías y registro sin fechas)
- **Fecha:** 2026-09-28
- **Decide:** PO (@complexluise) — issue #37

## Contexto

La IA produjo casi todo el laboratorio: la red, el código, los textos y los materiales. El equipo
dirigió, decidió y probó. La revisión humana está incompleta. Publicarlo sin decirlo haría pasar un
borrador por un análisis revisado.

El PO encuadra el ejercicio como una práctica de cómo colaborar con la máquina. Un primer intento
contó el proceso con el historial de git (commits, PR, un flujograma con evidencia). El PO lo
descartó: el público no es técnico. Pidió algo parecido a un documento, con los prompts enviados y el
paso a paso de lo que se hizo.

## Decisión

- **Página «Cómo lo hicimos»** (`#/metodologia`), en lenguaje llano. Tiene seis partes:
  1. la advertencia;
  2. cómo trabajamos;
  3. el paso a paso;
  4. las instrucciones que procesaron los informes;
  5. qué está revisado;
  6. cómo reportar un error.

  El espejo en el repo es `docs/metodologia.md`.
- **Paso a paso con prompts literales.** Cada paso dice:
  - lo que pedimos, con los mensajes tal cual, con erratas;
  - lo que decidimos cuando la IA ofreció opciones;
  - lo que hizo la IA;
  - el resultado.

  Viven en `PASOS` (`web/src/lib/metodologia.ts`). Las conversaciones anteriores al 27 de septiembre
  no se guardaron, y se dice así.
- **Instrucciones de procesamiento.** Se muestran las instrucciones con que Gemini y Claude leyeron
  los informes, literales o en extracto (`INSTRUCCIONES_DATOS`).
- **Revisión por partes, no una cifra global** (`CAPAS`). La red figura «Sin revisión humana». Una
  parte pasa a «revisada» solo cuando lo esté.
- **Advertencia**, con el texto del PO:
  - en la franja bajo la cabecera de todas las páginas menos «Cómo lo hicimos», que la desarrolla.
    Se puede plegar (`AvisoIA.svelte`);
  - en la hoja Léeme del Excel de la red;
  - no en la bitácora en blanco ni en el ejemplo CTeI, que escriben personas.
- **Herramientas por familia:** Claude (Anthropic) y Gemini (Google).
- **Editor adversario al final.** Todo texto público pasa por el agente `editor`
  (`.claude/agents/editor.md`), antes de integrarse. Es un quisquilloso que persigue la redundancia,
  la jerga y las ideas borrosas. Es de solo lectura: señala y propone, no reescribe.

## Consecuencias

- **Habilita:** que cualquiera vea qué se le pidió a la máquina y qué decidieron las personas, sin
  saber de programación. El taller queda como la revisión que falta.
- **Cuesta:**
  - agregar cada ciclo nuevo a `PASOS` con sus prompts, a mano;
  - los prompts, al ser literales, muestran erratas y el tono informal del trabajo. Es intencional;
  - las conversaciones no guardadas dejan un hueco declarado.
- **Descartado:**
  - la evidencia automática desde git (script, cifras de commits, flujograma con hashes): exacta
    pero ilegible para el público;
  - publicar las transcripciones completas: largas y llenas de detalle técnico.
- **Frontera afectada:** ninguna. La página no importa del pipeline; las instrucciones se copian de
  `extraccion/` como texto.
