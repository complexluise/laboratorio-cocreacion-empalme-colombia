---
title: "Guía de estilo"
subtitle: "Para los documentos públicos del laboratorio"
eyebrow: "Laboratorio de cocreación TRAMA"
---

## Para qué sirve

Esta guía fija cómo se escriben los cuatro documentos que salen del repositorio (Marco teórico,
Ontología del mapa, Cómo lo hicimos y Encuadre de la actividad) y los textos del sitio. La lee quien
escribe y quien revisa. Si un texto no la cumple, no se publica.

## Regla 1. Quién hizo qué

Es la regla más importante. El laboratorio trabaja con modelos de lenguaje, y el lector tiene
derecho a saber qué hizo una persona y qué produjo una máquina.

**Un modelo de lenguaje no lee, no piensa, no entiende y no decide.** Es un programa que procesa
texto y genera texto a partir de patrones estadísticos. Escribir que «leyó», «analizó» o «encontró»
le atribuye un juicio que no tiene, y le quita a las personas la responsabilidad que sí tienen.

La regla corre en los dos sentidos:

- **No atribuirle a la máquina acciones humanas.** Ni leer, ni interpretar, ni opinar.
- **No atribuirles a las personas lo que hizo la máquina.** Si un modelo generó un texto, no se dice
  «redactamos». Si nadie revisó algo, no se dice «revisamos».

### Verbos

| Sujeto | Verbos que sí | Verbos que no |
|---|---|---|
| **Personas** (el equipo, los grupos, el seminario) | leer, revisar, decidir, aprobar, corregir, interpretar, elegir, diseñar, verificar | — |
| **Modelo de lenguaje** | procesar, generar, producir, convertir, extraer, etiquetar, asignar, marcar, listar, proponer (como salida) | leer, entender, pensar, saber, decidir, juzgar, analizar, interpretar, encontrar, revisar, creer |

«Proponer» se admite para la máquina solo cuando lo que sigue es un **borrador que una persona
aprueba o rechaza**: «el modelo generó una propuesta de áreas; el equipo aprobó la división».

### Ejemplos

| No | Sí |
|---|---|
| Leímos los informes de dos gobiernos. | Trabajamos con los informes de dos gobiernos. Un modelo de lenguaje procesó su texto. |
| La IA lee y clasifica cada informe. | Un modelo de lenguaje procesa el texto de cada informe y le asigna categorías. |
| Leer con IA (nombre de un paso) | Procesar con un modelo de lenguaje |
| El agente editor revisó el texto. | Un modelo de lenguaje, con instrucciones de edición, marcó frases redundantes. El equipo decidió cuáles corregir. |
| El modelo encontró 93 instrumentos. | El modelo generó una lista de 93 instrumentos. |
| La lectura con IA dice que el programa continúa. | El modelo le asignó al programa el modo «continuidad estable». Nadie lo ha verificado. |

### Cómo nombrar la máquina

- La primera vez, con nombre, versión y empresa: «un modelo de lenguaje (Claude Opus 4.8, de
  Anthropic)». Después, «el modelo». Si un documento usa más de un modelo, se nombra cuál hizo cada
  paso.
- **«IA»** solo en frases sobre la herramienta en general («el uso de inteligencia artificial»),
  nunca como sujeto que actúa.
- **«Agente»** no se usa en textos públicos: sugiere voluntad. Se describe lo que es: «un programa
  que le hace varias consultas seguidas a un modelo de lenguaje».
- Lo que sale del modelo es una **salida**, un **borrador** o una **propuesta**. No es una
  «lectura», un «análisis» ni un «hallazgo». Un hallazgo es de una persona.

### Quién es «nosotros»

«Nosotros» es **el equipo del laboratorio**: las personas. Nunca incluye a la máquina. Cuando no
quede claro, se nombra al sujeto: «el equipo», «cada grupo», «el seminario».

### Los autores son personas

- **Los autores son siempre personas**, con nombre y su contribución: conceptualización,
  metodología, curaduría de datos, revisión (la taxonomía de contribuciones CRediT).
- **El modelo de lenguaje se declara como herramienta, nunca como autor.** La autoría exige
  responder por el contenido, y una máquina no puede hacerlo. En eso coinciden las normas de
  publicación académica (COPE, ICMJE, APA).
- **Las ideas, el encuadre y las decisiones son del equipo**, que las trabajó en sus reuniones. No
  se presentan como «documentos internos» de los que partió el modelo.

### Cada documento cierra con su autoría

Al final de cada documento va una sección «Autoría y uso de inteligencia artificial» con tres
partes:

1. **Autoría:** los nombres.
2. **Contribuciones:** qué hizo cada persona, incluida la revisión. Si nadie ha revisado el
   documento, se dice «pendiente».
3. **Uso de inteligencia artificial:** qué generó el modelo, con nombre y versión, y qué decidió el
   equipo.

## Regla 2. Resumir, guiar y dar ritmo

El lector no tiene por qué saber adónde va. El documento se lo dice y lo lleva de a un paso.

### Empezar con un resumen

Cada documento abre con un **resumen de cinco líneas como máximo**: qué es, qué concluye y por qué
importa. Quien lea solo el resumen se lleva lo esencial. Después del resumen va un **mapa de
lectura**: qué secciones vienen, en qué orden y qué pregunta responde cada una.

### Subir de nivel de a un escalón

Cada documento, y dentro de él cada sección, sube por los niveles cognitivos de la taxonomía de
Bloom revisada (Anderson y Krathwohl, 2001), sin saltarse escalones:

1. **Reconocer:** qué es, con un ejemplo concreto del mapa.
2. **Comprender:** por qué es así, en palabras sencillas.
3. **Aplicar:** cómo se usa en un caso real.
4. **Analizar:** en qué se distingue de lo parecido, qué se compara.
5. **Evaluar:** qué límites tiene y qué no se puede afirmar.

Un concepto no se evalúa antes de que el lector lo haya visto aplicado.

### Alternar sorpresa y explicación

La atención se sostiene con contraste. Cada sección sigue este patrón:

1. **Gancho:** algo concreto que rompe una expectativa. Un dato del mapa, una pregunta o una
   contradicción entre los dos informes. Va antes de la abstracción.
2. **Concepto:** la idea que explica el gancho.
3. **Ejemplo:** el concepto aplicado a un caso real.
4. **Consecuencia:** qué cambia en el mapa o en la lectura. Cierra con una frase de síntesis.

El gancho tiene que ser **real**: sale de los datos o de las fuentes, nunca se inventa para
impresionar (regla 3).

### Mostrar antes que describir

- Si algo se puede ver, se muestra: una tabla, una figura, un ejemplo con nombre propio, una cifra.
- No más de **tres párrafos seguidos de abstracción**: después va un respiro (un ejemplo, una
  tabla, una cita breve).
- Los ejemplos son del mapa y con nombre propio: «el Fondo Francisco José de Caldas», no «un fondo».

### Capturas del mapa y diagramas

El mapa es el objeto del laboratorio: el lector tiene que **verlo**, no solo leer sobre él.

- **Cada concepto que se ve en el mapa lleva una captura** del sitio, en el momento en que el texto
  lo explica: una política, un instrumento, un modo de cambio, un área huérfana.
- **Las capturas van anotadas.** Un recuadro rojo numerado marca cada elemento que el texto nombra,
  y lo que hay que leer se resalta en amarillo. El pie de la figura explica cada número: «(1) Una
  política: los círculos grandes».
- **Los procesos, las clasificaciones y las relaciones van en diagrama** (mermaid en el Markdown):
  cómo se asigna un modo de cambio, de la idea inicial al mapa, fines y medios.
- **Toda figura lleva número y pie.** El pie se entiende sin leer el texto, y el texto cita la
  figura por su número.
- **Si la figura muestra una salida del modelo**, el pie lo dice (regla 1).
- Las capturas se regeneran con un script a partir del sitio, para que no queden desactualizadas
  cuando el mapa cambie.

## Regla 3. Afirmar solo lo que se puede sostener

- **Distinguir el origen de cada idea:** de la literatura, adaptada de la literatura o propia del
  laboratorio. Las propias se dicen propias.
- **No exagerar a los autores.** «Es compatible con Pierson» no es «Pierson lo demuestra».
- **Decir qué está cotejado.** Una afirmación sobre una obra que nadie ha leído en el original se
  marca como pendiente de cotejo.
- **El silencio de una fuente no es evidencia.** Que un informe no mencione algo no prueba que no
  exista: se dice «no declarado», «sin dato», nunca «abandonado» o «eliminado».

## Regla 4. Documentos que se sostienen solos

Los documentos se leen fuera del repositorio, en PDF.

- **Sin referencias internas:** nada de rutas, nombres de archivo, campos de código, scripts ni
  números de decisión (ADR).
- **Invitar a verificar en el mapa.** Cada documento da la dirección pública del mapa
  (https://complexluise.github.io/laboratorio-cocreacion-empalme-colombia/#/red) después del resumen, y la repite junto a la primera captura. El lector tiene que poder
  comprobar cada cifra y cada captura por su cuenta.
- **Los cuatro documentos se citan entre sí por título y sección:** «ver **Ontología del mapa**,
  sección 3».
- **Sin «arriba» ni «abajo».** Se dice «en la sección 3.1».
- **Cada documento abre con la serie**: los cuatro títulos y qué cubre cada uno.

## Regla 5. Lenguaje claro

- **Una idea por frase.** Si una frase pasa de unas 30 palabras, se parte.
- **Definir cada término técnico la primera vez**, en una frase sencilla.
- **Término en español; el original en inglés, en cursiva, solo la primera vez:**
  estratificación (*layering*).
- **Siglas desarrolladas la primera vez.** Si una sigla no se vuelve a usar, no se introduce.
- **Sin relleno:** nada de «cabe señalar», «es importante destacar», «como se mencionó». Si algo se
  repite, se corta.
- **Sin anuncios:** no se avisa lo que viene («esta sección presenta…»). Se dice.
- **Registro neutro**, para lectores de toda Colombia: impersonal o «nosotros»; ni voseo ni tuteo
  dirigidos al lector.

## Vocabulario fijo

Las mismas cosas se llaman igual en los cuatro documentos y en el sitio.

| Usar | No usar | Nota |
|---|---|---|
| instrumento de política pública; instrumento | objeto de política, objeto | «Objeto» es historia: se menciona solo para contar la idea inicial |
| política pública; área | política del gobierno | Un área persiste entre gobiernos |
| objetivo (de una política, por gobierno) | meta, apuesta | «Meta» se reserva para el sentido de Howlett y Cashore |
| informe de empalme | empalme (solo), informe | — |
| gobierno anterior / posterior | gobierno saliente / entrante | Salvo al explicar qué es un empalme |
| modo de cambio | tipo de cambio, trayectoria | Los seis valores, con sus nombres exactos |
| no declarado | abandonado | Ver regla 3 |
| el mapa (el conjunto) · la red (su forma) | el grafo, el dataset | — |
| modelo de lenguaje | la IA (como sujeto), el agente, el sistema | Ver regla 1 |

## Formato

- **Citas en el texto:** Autor (año); dos autores con «y», no con «&»: Mahoney y Thelen (2010).
- **Periodos:** 2018–2022, con raya corta y sin espacios.
- **Números:** coma decimal (94,41 %) y punto de miles (5.706).
- **Comillas:** angulares «» para citar palabras; *cursiva* para títulos de obras y términos en
  otro idioma.
- **Referencias:** al final, en orden alfabético, con DOI o enlace cuando exista.

## Referencias

- Anderson, L. W. y Krathwohl, D. R. (eds.) (2001). *A Taxonomy for Learning, Teaching, and
  Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*. Longman.

## Antes de publicar

1. ¿Algún verbo humano tiene a la máquina como sujeto? ¿Algún «nosotros» oculta lo que hizo la
   máquina?
2. ¿Queda alguna ruta, archivo, campo de código, ADR o «abajo»?
3. ¿Cada afirmación sobre un autor está cotejada o marcada como pendiente?
4. ¿Cada término técnico está definido la primera vez?
5. ¿Abre con un resumen de cinco líneas y un mapa de lectura?
6. ¿Cada sección arranca con un gancho real y sube de nivel sin saltarse escalones?
7. ¿Hay más de tres párrafos seguidos sin un ejemplo, una tabla o una cifra?
8. ¿Cada concepto visible en el mapa tiene su captura anotada, y cada figura su número y pie?
9. ¿Cierra con autoría (personas con nombre y contribución) y declaración de uso de IA?
