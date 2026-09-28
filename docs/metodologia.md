# Cómo lo hicimos: metodología y uso de IA

> [ADR-0006](decisiones/ADR-0006-declarar-uso-de-ia-paso-a-paso.md) · issue #37. En el sitio es la
> página **«Cómo lo hicimos»** (`#/metodologia`). El contenido vive en `web/src/lib/metodologia.ts`:
> si cambia uno, cambia el otro.

## Advertencia

**Este contenido se generó con inteligencia artificial y aún no se ha revisado al 100 %.** La red,
los textos y los materiales los produjo la IA. Los hemos revisado solo en parte: puede haber errores
de clasificación, cifras o citas.

Es parte del ejercicio. El laboratorio también prueba cómo trabajar con la máquina para construir
algo juntos: ella hace un borrador rápido y las personas lo revisan y lo corrigen.

## Cómo trabajamos

- **Pedimos en lenguaje natural.** Sin programar: describimos qué queríamos y por qué.
- **La IA propone; nosotros decidimos.** Ante cada decisión, la IA planteó opciones y elegimos.
- **Otra IA revisa.** Un agente revisor buscó errores antes de publicar cada cambio.
- **Lo que falta se dice.** Si un informe no trae un dato, se anota «Sin dato»; no se inventa.

Usamos **Claude** (Anthropic) para leer los informes, escribir el sitio y los textos, y revisar.
Usamos **Gemini** (Google) para transcribir documentos escaneados y para una primera extracción.

## Paso a paso

Los prompts van tal cual los escribimos, con sus erratas. Las conversaciones del 26 y 27 de
septiembre por la mañana (el primer paso) no se guardaron.

| # | Paso | Lo que pedimos (resumen) | Lo que decidimos | Resultado |
|---|---|---|---|---|
| 1 | Leer los informes y armar la red | *(conversación no guardada)* | — | La red de CTeI |
| 2 | Ordenar la forma de trabajar | Adoptar la disciplina kybernetes, pasar a Svelte, que los nodos no se encimen | — | v0.1 |
| 3 | Reordenar la pantalla de la red | «hay cosas que no tienen una jerarquia clara […] seria mejor que apareciera una lista y al seleccionar te lleva al nodo» | Filtros a la izquierda; buscar lleva al nodo; leyenda solo explica | v0.2 |
| 4 | Precisar qué es una política pública | «una política publica tiene asociada un objetivo de política […] Primero reflexionemos» | La política es un área que atraviesa gobiernos | 14 áreas con objetivo por gobierno |
| 5 | La actividad, la teoría y el glosario | Página de inicio con la actividad y la teoría, y un glosario; pegamos nuestra plantilla de bitácora | Al abrir el sitio se ve la actividad | Inicio y glosario |
| 6 | La bitácora de cada grupo | — | «Un docx con el formato listo para llenar. así no este prellenado.» | Bitácora en Word y su lector |
| 7 | Una actividad más dinámica | «quiero descargar el excel»; «que la actividad fuera más dinamica y pedagogica» | — | Excel, actividad en 4 pasos, práctica |
| 8 | Cerrar la versión | «Cortemos aquí»; «Los documentos deben estar alineados» | Publicar la v0.3 | v0.3 |
| 9 | Esta declaración | Metodología, declaración y advertencia; luego: «olvida git nuestro publico NO estecnico» | Rehacerla como paso a paso y pasarla por un editor exigente | Esta página |

Los prompts completos están en la página y en `PASOS` (`web/src/lib/metodologia.ts`).

## Las instrucciones que leyeron los informes

Las instrucciones completas están en los scripts de `extraccion/`. La página muestra tres:
- la transcripción con Gemini (`ocr_gemini.py`);
- la extracción de instrumentos por política con Claude (`rebuild-ctei-claude.workflow.js`);
- la unión del mismo instrumento entre políticas y gobiernos (mismo archivo).

## Qué está revisado

| Parte | Quién la hizo | Revisión |
|---|---|---|
| Informes de empalme | Cada gobierno (DNP) | Fuente oficial |
| Texto de los escaneados | Gemini | Sin revisión humana |
| La red | Agentes de Claude | Sin revisión humana; cita páginas del informe |
| Áreas de política | Propuestas por la IA | Aprobadas por el equipo |
| Textos del sitio y glosario | Claude | Revisión parcial |
| Ejemplo de bitácora CTeI | El equipo | Escrito por personas |
| Bitácoras de los grupos | Los grupos | Escritas por personas |

La fuente de verdad es `CAPAS` en `web/src/lib/metodologia.ts`. Una parte solo pasa a «revisada»
cuando lo esté.

## Mantenerla al día

- Al cerrar un ciclo de trabajo, se agrega el paso con sus prompts literales a `PASOS`.
- El texto público pasa al final por el agente **editor** (`.claude/agents/editor.md`), que busca
  redundancia, jerga e ideas borrosas.
