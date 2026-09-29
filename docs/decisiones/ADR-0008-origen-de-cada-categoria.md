# ADR-0008: Cada categoría del mapa declara su origen y en qué se aparta de su fuente

- **Estado:** aceptada
- **Fecha:** 2026-09-29
- **Decide:** PO (@complexluise)

## Contexto

Las definiciones de los tipos de instrumento, del cambio del objetivo y de los modos de cambio eran
de una frase y citaban un autor. El PO pidió revisarlas contra los artículos que se citan y decir si
cada categoría tiene fuente o la inventamos, porque «estas definiciones son delicadas».

Al contrastarlas con la literatura aparecieron tres problemas:
- **Hall.** El glosario decía que el cambio del objetivo «es el cambio de tercer orden» de Hall.
  Exagera: lo que declara un informe está más cerca de un objetivo de programa (Howlett y Cashore)
  que de un paradigma.
- **Mahoney y Thelen.** Nuestra estratificación y nuestra terminación se asignan por presencia en un
  solo informe. No comprueban lo que exige la teoría: que lo anterior siga, en la estratificación, o
  que haya terminado, en la terminación.
- **Hood.** «Organización» decía «programas», pero un programa puede usar cualquier recurso.

## Decisión

- **Cada categoría del mapa declara su origen**, visible en el glosario:
  - *De estudios publicados*: nodalidad, autoridad, tesoro, organización, conversión y deriva;
  - *Adaptación nuestra*: modo de cambio en general, continuidad estable, estratificación y
    terminación;
  - *Propio del proyecto*: cambio del objetivo con sus cuatro valores, reversión, presencia y
    confianza.
- **Tres bloques** en esas entradas: qué dice la teoría, cómo se usa en el mapa y «Ojo», que dice en
  qué se aparta o qué no prueba. Viven en `web/src/lib/fundamentos.ts`.
- **Pruebas:** toda categoría del mapa declara su origen, y lo adaptado dice en qué se aparta.
- **Correcciones:**
  - las frases breves (red, Excel, `taxonomia.yaml`) quitan «programas» de organización y «se deja o
    reemplaza» de terminación;
  - la deriva agrega la decisión de no ajustar;
  - la terminación advierte que el silencio del informe no prueba el fin.
- **Bibliografía con enlaces** en `docs/teoria-politica.md`: DOI y, donde existe, versión abierta.

## Consecuencias

- **Habilita:** quien lea el mapa sabe qué es teoría establecida y qué es decisión del proyecto.
- **Cuesta:** una categoría nueva debe declarar su origen.
- **Pendiente:** las definiciones están parafraseadas de resúmenes. Falta que una persona las coteje
  con los originales:
  - Mahoney y Thelen (2010), cap. 1, tabla 1.1;
  - Hood (1983), cap. 1;
  - Hall (1993), pp. 278–279;
  - Howlett y Cashore (2009), la tabla de componentes;
  - Hogwood y Peters (1982), la definición de sucesión.
- **Frontera afectada:** `data/schema/taxonomia.yaml` cambia solo en sus descripciones, no en los
  valores. El Excel del taller se regeneró.

## Alternativas consideradas

- Renombrar los modos adaptados. Por ejemplo, llamar «ausente en el informe posterior» a la
  terminación. Se descartó por ahora: cambia el contrato de datos y el vocabulario del taller. Se
  declara la adaptación en su lugar.
