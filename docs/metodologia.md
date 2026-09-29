# Cómo lo hicimos: metodología y uso de IA

> [ADR-0006](decisiones/ADR-0006-declarar-uso-de-ia-paso-a-paso.md) ·
> [ADR-0007](decisiones/ADR-0007-metodologia-como-receta-y-glosario-en-orden.md). En el sitio es la
> página **«Cómo lo hicimos»** (`#/metodologia`). El contenido vive en `web/src/lib/metodologia.ts`:
> si cambia uno, cambia el otro. El detalle técnico está en
> [`pipeline-extraccion.md`](pipeline-extraccion.md).

## Advertencia

**Este contenido se generó con inteligencia artificial y aún no se ha revisado al 100 %.** La IA
produjo la red, los textos y los materiales. Puede haber errores de clasificación, de cifras o de
citas.

Es parte del ejercicio. El laboratorio también prueba cómo trabajar con la máquina para construir
algo juntos: ella hace un borrador rápido y las personas lo revisan y lo corrigen. Cada error que
encuentren mejora el mapa.

## Las categorías: qué le preguntamos a cada informe

Un texto se vuelve red cuando se decide antes qué buscar en él. Estas preguntas convierten cada
informe en puntos (políticas e instrumentos) y en líneas (las relaciones).

| Qué se busca | Pregunta | Valores |
|---|---|---|
| Política pública | ¿Sobre qué problema público actúa el Estado? | Un área que atraviesa gobiernos, con el objetivo que declara cada uno |
| Cambio del objetivo | ¿Cambió lo que se busca en esa área? | se mantiene · se reformula · no declarado · nuevo |
| Instrumento | ¿Con qué actúa el Estado? | Un programa, una norma, un fondo, un sistema o una convocatoria, con nombre propio |
| Tipo de instrumento (NATO) | ¿Qué recurso del Estado usa? | nodalidad · autoridad · tesoro · organización |
| Presencia | ¿Cómo aparece en el informe de cada gobierno? | propuesto · logrado · pendiente |
| Modo de cambio | ¿Qué le pasó entre un gobierno y el otro? | continuidad estable · conversión · estratificación · terminación · reversión · deriva |
| Relación | ¿Cómo se conecta con otro instrumento? | habilita · financia · depende de · encadena |
| Evidencia | ¿Dónde lo dice el informe? | La página y la cifra, tal cual, y qué tan segura es la lectura: alta, media o baja |

En la página, los valores salen del mismo vocabulario que usa la red (`data/schema/taxonomia.yaml`)
y cada categoría enlaza su entrada del glosario.

## La receta

| # | Paso | Quién | Dónde entra la IA | En este mapa |
|---|---|---|---|---|
| 1 | Reunir los documentos | Programa | — | Informes del DNP; para CTeI, los dos principales de MinCiencias |
| 2 | Pasarlos a texto, página por página | Programa + IA | Solo en los escaneados: la IA transcribe la imagen | Con Gemini por API; transcripciones sin revisión humana |
| 3 | Fijar las categorías antes de leer | Personas | — | Salieron de la teoría política; son las de la tabla anterior |
| 4 | Extraer con IA, una política a la vez | IA | Lee y clasifica. Mejor por API: misma instrucción y mismo formato para todos los textos (otra corrida puede dar otra red) | Primero con Gemini por API: los fondos compartidos quedaron en una sola política y la red se partió en islas. Se rehízo con agentes de Claude |
| 5 | Unir los repetidos | IA + programa | Un agente propone qué unir; un programa sin IA arma el resultado | Donde nadie propuso el modo de cambio, quedó «conversión»: hay que revisarlo |
| 6 | Verificar contra la fuente | IA + personas | Una segunda IA busca errores; después, personas | La red de Gemini se verificó con IA; **la actual no se ha verificado** (ni con IA ni dato por dato con personas) |
| 7 | Agrupar en áreas comparables | IA + personas | La IA propone; las personas aprueban | 14 áreas; el equipo aprobó la división, no el contenido |
| 8 | Comprobar y publicar | Programa | — | Sin IA: con los mismos datos, siempre el mismo resultado |
| 9 | Revisar y ampliar en el taller | Personas | — | Es la vía prevista para la revisión humana que le falta a la red |

En la página, los pasos con IA muestran la instrucción que usamos cuando la guardamos: la transcripción con Gemini
(`ocr_gemini.py`), la extracción por política y la unión de repetidos
(`rebuild-ctei-claude.workflow.js`).

## Qué está revisado

| Parte | Quién la hizo | Revisión |
|---|---|---|
| Informes de empalme | Las entidades de cada gobierno; los publica el DNP | Fuente oficial |
| Texto de los escaneados | Gemini | Sin revisión humana |
| La red | Agentes de Claude | Sin revisión humana. Casi todos los instrumentos citan su página; hay descripciones que contradicen su modo de cambio |
| Áreas de política | Propuestas por la IA | Parcial: el equipo aprobó cómo se dividieron, no el contenido |
| Textos del sitio y glosario | Claude, a partir de nuestro encuadre | Revisión parcial; conviene verificar las citas |
| Ejemplo de bitácora CTeI | El equipo | Escrito por personas |
| Bitácoras de los grupos | Los grupos | Escritas por personas |

La fuente de verdad es `CAPAS` en `web/src/lib/metodologia.ts`. Ninguna parte cambia de estado
hasta que una persona la revise de verdad.

## El registro: lo que le pedimos a la IA

La página conserva, plegados y sin fechas, los mensajes con que construimos el sitio, tal cual los
escribimos. De la primera conversación no se guardaron. Están en `PASOS`
(`web/src/lib/metodologia.ts`):

1. Leer los informes y armar la red *(sin mensajes guardados)*
2. Ordenar la forma de trabajar
3. Reordenar la pantalla de la red
4. Precisar qué es una política pública
5. La actividad, la teoría y el glosario
6. La bitácora de cada grupo
7. Una actividad más dinámica
8. Cerrar la versión
9. La declaración de uso de IA
10. Un glosario en orden y la metodología como receta

## Mantenerla al día

- Al cerrar un ciclo de trabajo, se agrega su paso con los prompts literales a `PASOS`.
- Si cambia cómo se extrae la red, se actualizan `RECETA`, esta página y `pipeline-extraccion.md`.
- El texto público pasa al final por el agente **editor** (`.claude/agents/editor.md`), que busca
  redundancia, jerga e ideas borrosas.
