# Ontología del mapa — laboratorio de cocreación (piloto: Ciencia y Tecnología)

Base de trabajo. Arrancamos por Ciencia y Tecnología por ser el caso más acotado
(1 entidad, 104 ideas, 23 relaciones PID+T sobre dos vigencias) antes de escalar.

Regla de diseño: **la ontología se deriva de las preguntas, no al revés.** Si algo no
aporta a responder una de las preguntas de competencia, queda fuera de la v1.

## Lente: complejidad vía redes

El concepto central es una **red multicapa**: una capa por vigencia (2018-2022, 2022-2026).
El marco PID+T del proyecto **es descomposición parcial de información** (Redundancia /
Unicidad / Sinergia son términos de la PID de Williams-Beer, aplicados a "qué aporta cada
gobierno a la política del sector"); **Tensión** es la extensión propia para conflicto/reversión.

## Anclaje teórico

El nodo del mapa es un **instrumento de política pública** (Hood, *The Tools of Government*, 1983;
Lascoumes & Le Galès, *Gouverner par les instruments*, 2004): una entidad con identidad propia
—programa, norma, fuente de financiación, sistema— que condensa una forma de gobernar. Las `clase`
(norma / instrumento / fuente-financiación / sistema / programa / apuesta) son una tipología de
instrumentos. *(En el código y en `dataset.json` la clave se conserva como `objetos` por
compatibilidad; el término de dominio es "instrumento de política pública".)*

El eje diacrónico —comparar dos gobiernos sobre los informes de empalme— se lee con la tipología
del **cambio institucional gradual** (Mahoney & Thelen, 2010):

| Nuestro vocabulario | Término consolidado | Referencia |
|---|---|---|
| unicidad (nuevo) | *layering* (estratificación) | Mahoney & Thelen (2010) |
| tensión / reversión | *displacement* (desplazamiento) | Mahoney & Thelen (2010) |
| mismo instrumento, otro modo | *conversion* (conversión) | Mahoney & Thelen (2010) |
| continuidad | *path dependence* / *drift* | Pierson (2004); Thelen |

Complementos: **sucesión de políticas** (Hogwood & Peters, *Policy Dynamics*, 1983) nombra
exactamente el fenómeno del empalme (mantener / suceder / innovar / terminar lo heredado);
**terminación de políticas** (deLeon) para la unicidad que desaparece.

Salvedad: el marco **PID+T** (Williams-Beer) viene de teoría de la información, no de teoría
política — es una **analogía metodológica propia**, apoyada en Mahoney-Thelen, no una teoría
política en sí.

> Desarrollo completo (tipología de instrumentos NATO, mapeo diacrónico ampliado con
> estratificación / terminación / conversión, sucesión de políticas y referencias):
> **`docs/teoria-politica.md`**.

## Preguntas de competencia (el eje)

1. **¿Qué hizo un gobierno?** → qué instrumentos de política pública estuvieron **activos** en ese periodo,
   y en qué modo (apuesta / logro / pendiente).
2. **¿Qué tuvo continuidad?** → qué instrumentos **persisten en ambas capas** (propiedad del nodo).
3. **¿Cómo contrastan las dos ejecuciones?** → la **trayectoria** del mismo instrumento entre
   periodos (creado→consolidado, lanzado→revertido) + qué es propio de cada uno.

## Unidad de análisis: el **instrumento de política pública** (no la idea)

Una **idea** es una frase extraída de un informe: es la unidad en que el pipeline *cosecha*,
no una entidad del dominio. Modelarla como nodo obliga a representar la continuidad como
*arista entre dos nodos distintos*, cuando en realidad es *un mismo instrumento que persiste*.

El nodo es el **instrumento de política pública**: una entidad con nombre e identidad propia que existe
independiente de cualquier idea y **cruza gobiernos con la misma identidad**. Ya está latente
en el campo `tags[]` de las ideas. Ejemplos reales en los datos:

> Misión de Sabios · SGR/FCTeI · Ley 2162 de 2021 · Fondo Francisco José de Caldas ·
> Beneficios Tributarios (CNBT) · SNCTI · CONPES 4069/4182 · Colfuturo ·
> Jóvenes en Ciencia para la Paz · ColombIA Inteligente/IA · Formación de alto nivel.

La **idea se degrada a evidencia**: deja de ser nodo y pasa a ser una observación adjunta a
uno o más instrumentos de política pública, conservando su página, cifra y clasificación.

### Altitud: homogéneo en v1
Un solo tipo de nodo `InstrumentoDePoliticaPublica` con un atributo `clase` que lo etiqueta
(programa / instrumento / norma / fuente-financiacion / apuesta / sistema). No se separa en
tipos-nodo distintos (multipartito) todavía: si al mapear aparecen relaciones densas del
tipo norma→programa, se promueve a multipartito en v2.

## Esquema

### Clase (nodo): `InstrumentoDePoliticaPublica`
| Campo | Descripción |
|---|---|
| `id` | identificador estable (slug del nombre canónico) |
| `nombre` | nombre canónico (tras resolución de entidades sobre `tags`) |
| `clase` | programa · instrumento · norma · fuente-financiacion · apuesta · sistema |
| `alias[]` | variantes de nombre encontradas en los tags |
| `presencia` | `{2018-2022: modo?, 2022-2026: modo?}` — modo ∈ apuesta/logro/pendiente/estructura |
| `facetas[]` | facetas A–K de las ideas que lo evidencian |
| `entidad` | entidad(es) responsable(s) |
| `evidencia[]` | ideas que lo sustentan: `{idea_id, vigencia, documento, paginas, cifras}` |

### Propiedades diacrónicas (derivadas de `presencia`) — reemplazan parte de PID+T
- **redundancia** → instrumento presente en **ambas** capas (continuidad).
- **unicidad** → instrumento presente en **una sola** capa (propio de un gobierno).
- **tension** → instrumento que persiste **pero invierte de signo** (reversión/cambio de rumbo).
- **convergencia** → dos instrumentos de nombre distinto que resultan ser el mismo (fusión de nodos).

### Aristas: relaciones entre instrumentos distintos
| Relación | Significado |
|---|---|
| `sinergia` | dos instrumentos se encadenan/potencian (p.ej. *Misión de Sabios* → origina *PIIOM*) |
| `financia` | una fuente costea un instrumento (p.ej. *SGR* → *Fondo Francisco José de Caldas*) |
| `habilita` | una norma da existencia a un programa (p.ej. *Ley 2162* → *SNCTI*) |
| `depende-de` | precedencia/condición entre instrumentos |

Nota: las relaciones PID+T a nivel de idea (`comparacion`) **mezclan** continuidad del mismo
instrumento (→ ahora propiedad de nodo) con relación entre instrumentos distintos (→ ahora arista).
El giro de nodo las desambigua; al rehacer el pipeline hay que repartirlas.

### Métricas de red por pregunta
- P1: instrumentos activos por capa + su modo → foco del gobierno.
- P2: fracción de nodos presentes en ambas capas → continuidad.
- P3: trayectorias (tensión/consolidación) + centralidad intra-capa → instrumentos articuladores.

## Decisiones técnicas
- **Sin OWL/Protégé en v1**: esquema en YAML/JSON-LD, versionable, validado contra los JSON.
- **Render**: la aplicación es un **explorador de la red** (Svelte 5 + D3, SPA estática; ADR-0002).
  Es una **red bipartita política↔instrumento**, donde la **política es un área persistente** con el
  **objetivo que declara cada gobierno** y su cambio (se mantiene / se reformula / no declarado / nuevo;
  ADR-0004). Un instrumento puede servir a varias políticas (los
  compartidos enlazan la red); los instrumentos van coloreados por **modo de cambio** entre gobiernos
  y con forma por **tipo NATO**, filtrables por vigencia, modo y NATO, navegables con un buscador, y
  con foco por política (aísla su subred) o por instrumento (resalta su vecindario). Dominio en `packages/red`, UI en `web/` (ver `web/README.md`).
- **Glosario del sitio** (`#/glosario`): explica esta ontología al público (tipos de nodo, atributos
  y vocabulario controlado). Las entradas del vocabulario se generan de las mismas etiquetas que usa
  la red (`web/src/lib/visual.ts`), así que no se desincronizan; la fuente sigue siendo
  `data/schema/taxonomia.yaml` y este doc.

## Estado en este repo

Están **el contrato de datos, la extracción de referencia y el explorador** (`web/`); el pipeline
que produce los instrumentos **está por rehacer** sobre esta base (ver README).

- `data/schema/taxonomia.yaml` — sección `objetos` (clase / diacronía / relaciones).
- `data/schema/objeto.schema.json` — contrato del nodo y sus aristas.
- `extraccion/consolidar_objetos.py` — referencia del paso ideas → instrumentos: ve las dos
  vigencias a la vez. Pasada 1 (Gemini): inducción + **resolución de entidades** de los
  tags/enunciados → catálogo canónico con `clase` y `alias`, con **tope** (guardarraíl
  anti-hairball). Pasada 2 (Gemini): aristas entre instrumentos. La `presencia` por vigencia y la
  `diacronia` (redundancia/unicidad) se calculan de forma **determinista**.

Diseño **aditivo**: la capa de evidencia (ideas + `comparacion`) queda intacta y la capa de
instrumentos se construye encima, para reprocesar un sector sin desincronizar los demás.

**Piloto previo en Ciencia y Tecnología** (referencia, no versionado aquí): 104 ideas →
**32 instrumentos** (13 redundancia · 17 unicidad · 2 tensión; 12 aristas). Los 13 redundantes
coincidieron con los 13 tags que cruzaban ambas vigencias en la medición previa — señal de que la
resolución de entidades capturó los instrumentos persistentes reales. Se cita en
`docs/encuadre-actividad-trama.md` como caso validado.

## Pendientes
- **Rehacer el pipeline**: reconstruir el paso que produce el `dataset` de instrumentos (nodos +
  aristas + resumen) a partir de las ideas.
- **Auditar cobertura**: qué ideas no quedan ancladas a ningún instrumento (evidencia suelta) y si
  alguna merece instrumento propio.
- **`comparacion` (idea-nivel) vs aristas de instrumento**: decidir si las relaciones PID+T de idea
  se re-expresan como propiedades/aristas de instrumento o quedan como capa de evidencia paralela.
- **Escalar** el paso a los demás sectores cuando se decida migrarlos.
