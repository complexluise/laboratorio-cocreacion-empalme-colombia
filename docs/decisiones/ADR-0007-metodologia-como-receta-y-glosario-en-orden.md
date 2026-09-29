# ADR-0007: La metodología es una receta replicable y el glosario se lee en orden

- **Estado:** aceptada (enmienda ADR-0006)
- **Fecha:** 2026-09-29
- **Decide:** PO (@complexluise)

## Contexto

ADR-0006 contó el uso de IA como una crónica: un paso por conversación, con fecha y prompts. El PO
pidió menos detalle de fechas y más una receta que otros puedan repetir. En esa receta debe quedar
explícito dónde entra la IA: primero la extracción con un modelo por API (como Gemini) y después una
verificación.

También señaló dos cosas:
- Las categorías con que se lee un informe para convertirlo en red son parte de la metodología.
- El glosario agrupaba por tipo, con títulos como «La ontología del mapa», que no dicen nada al
  público. Pidió un glosario que se recorra. Desde la teoría de la información, van primero los
  conceptos que permiten describir lo que sigue.

## Decisión

- **«Cómo lo hicimos» tiene este orden:**
  1. la advertencia;
  2. las categorías;
  3. la receta;
  4. qué está revisado;
  5. el registro de lo que le pedimos a la IA;
  6. cómo reportar un error.
- **Las categorías** (`CATEGORIAS` en `web/src/lib/metodologia.ts`). Son las preguntas que se le hacen
  a cada informe y sus valores posibles:
  - política y cambio del objetivo;
  - instrumento, tipo, presencia y modo de cambio;
  - relación y evidencia.

  Los valores salen del mismo vocabulario que usa la red, y cada categoría enlaza su entrada del
  glosario.
- **La receta** (`RECETA`). Tiene nueve pasos, escritos para quien quiera repetirlos. Cada paso dice:
  - quién lo hace: personas, IA o un programa sin IA;
  - si usa IA, dónde entra y qué instrucción usamos;
  - qué pasó en este mapa y en qué estado quedó.

  La verificación va después de la extracción, y la receta declara que la red actual no la tuvo.
  Las pruebas exigen que la IA se declare en todo paso que la usa y solo en esos.
- **El registro** (`PASOS`) se conserva sin fechas, al final y plegado. Cada ciclo sigue agregando su
  paso con los prompts literales.
- **El glosario es un recorrido.** Tiene seis secciones numeradas y, al final, las siglas para
  consultar:
  1. qué se compara;
  2. cómo se describe un instrumento;
  3. cómo se lee el cambio;
  4. cómo se arma la red;
  5. para llenar la bitácora;
  6. cómo se hizo el mapa.

  Cada entrada declara en qué términos anteriores se apoya (`usa`), y la página lo muestra. Las
  pruebas exigen que ningún término se apoye en uno posterior.

## Consecuencias

- **Habilita:**
  - otro equipo puede repetir el método con otro sector o con otros informes;
  - el lector ve de un vistazo dónde intervino la IA;
  - el glosario enseña en orden, en vez de ser solo un diccionario.
- **Cuesta:**
  - un término nuevo del glosario hay que ubicarlo en el recorrido y declarar en qué se apoya;
  - cambiar la receta obliga a mantener alineados la página, `docs/metodologia.md` y
    `docs/pipeline-extraccion.md`.
- **Cierra:** las anclas `#/glosario/grupo-ontologia`, `grupo-teoria` y las secciones `como`,
  `pasos` e `instrucciones` de la metodología. Nada del sitio las enlazaba.
- **Frontera afectada:** ninguna. Es contenido de la web.

## Alternativas consideradas

- Quitar los prompts literales: descartada. Son la evidencia de la declaración (ADR-0006).
- Ordenar el glosario alfabéticamente: descartada. No enseña en qué se apoya cada concepto.
