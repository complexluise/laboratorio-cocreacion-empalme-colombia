# Ontología del mapa — laboratorio de cocreación (piloto: Ciencia y Tecnología)

Base de trabajo. Arrancamos por Ciencia y Tecnología por ser el caso más acotado (1 entidad, dos
vigencias) antes de escalar. Hoy el dataset publicado tiene **14 políticas (áreas), 93 instrumentos
y 22 relaciones** (`web/src/lib/data/ciencia-tecnologia.json`).

Regla de diseño: **la ontología se deriva de las preguntas, no al revés.** Si algo no
aporta a responder una de las preguntas de competencia, queda fuera de la v1.

## Lente: complejidad vía redes

El concepto central es una **red bipartita política↔instrumento leída en dos capas**, una por
vigencia (2018-2022, 2022-2026). El marco PID+T del proyecto **es descomposición parcial de
información** (Redundancia / Unicidad / Sinergia son términos de la PID de Williams-Beer, aplicados a
"qué aporta cada gobierno a la política del sector"); **Tensión** es la extensión propia para
conflicto/reversión. En el dato, esa lectura quedó expresada con el vocabulario disciplinar (modo de
cambio, abajo).

## Anclaje teórico

El nodo del mapa es un **instrumento de política pública** (Hood, *The Tools of Government*, 1983;
Lascoumes & Le Galès, *Gouverner par les instruments*, 2004): una entidad con identidad propia
—programa, norma, fuente de financiación, sistema— que condensa una forma de gobernar. Se clasifica
por el recurso que moviliza (**NATO** de Hood: `tipo_nato`). *(En el código y en el dataset la clave
se conserva como `objetos` por compatibilidad; el término de dominio es "instrumento de política
pública".)*

Los instrumentos se agrupan por **política pública**: un **área persistente** que atraviesa gobiernos,
a la que cada gobierno le **declara su objetivo** (fines y medios, Howlett & Cashore; el cambio del
objetivo es el de 3er orden de Hall 1993). Decisión: [ADR-0004](decisiones/ADR-0004-politica-area-con-objetivo-por-gobierno.md).

El eje diacrónico —comparar dos gobiernos sobre los informes de empalme— se lee con la tipología
del **cambio institucional gradual** (Mahoney & Thelen, 2010):

| Vocabulario PID+T (histórico) | `modo_cambio` | Referencia |
|---|---|---|
| unicidad solo-posterior (nuevo) | `estratificacion` (*layering*) | Mahoney & Thelen (2010) |
| unicidad solo-anterior (dejado) | `terminacion` (*displacement* · *termination*) | Mahoney & Thelen (2010); deLeon (1978) |
| tensión | `reversion` | extensión propia |
| mismo instrumento, otro uso | `conversion` | Mahoney & Thelen (2010) |
| redundancia (continuidad) | `continuidad-estable` · `deriva` | Pierson (2004); Mahoney & Thelen (2010) |

Complementos: **sucesión de políticas** (Hogwood & Peters, *Policy Dynamics*, 1983) nombra
exactamente el fenómeno del empalme (mantener / suceder / innovar / terminar lo heredado);
**terminación de políticas** (deLeon) para lo que desaparece.

Salvedad: el marco **PID+T** (Williams-Beer) viene de teoría de la información, no de teoría
política — es una **analogía metodológica propia**, apoyada en Mahoney-Thelen, no una teoría
política en sí.

> Desarrollo completo (NATO, modos de cambio, fines y medios / cambio del objetivo, sucesión de
> políticas y referencias): **`docs/teoria-politica.md`**.

## Preguntas de competencia (el eje)

1. **¿Qué hizo un gobierno?** → qué instrumentos de política pública estuvieron **activos** en ese
   periodo, en qué modo (propuesto / logrado / pendiente) y qué **objetivo** declaró en cada política.
2. **¿Qué tuvo continuidad?** → qué instrumentos **persisten en ambas capas** (propiedad del nodo) y qué
   políticas mantienen su objetivo.
3. **¿Cómo contrastan las dos ejecuciones?** → la **trayectoria** del mismo instrumento entre
   periodos (`modo_cambio`) + el cambio del objetivo de su política (`cambio_objetivo`) + qué es propio
   de cada uno.

## Unidad de análisis: el **instrumento de política pública** (no la idea)

*(Historia.)* El primer pipeline cosechaba **ideas** —frases extraídas de un informe— y las
comparaba entre sí. Modelarlas como nodo obligaba a representar la continuidad como *arista entre dos
nodos distintos*, cuando en realidad es *un mismo instrumento que persiste*. La capa de ideas quedó
deprecada (`docs/taxonomia.md`, `idea.schema.json`, `comparacion.schema.json`).

El nodo es el **instrumento de política pública**: una entidad con nombre e identidad propia que
**cruza gobiernos con la misma identidad**. Ejemplos reales en los datos:

> Misión de Sabios · SGR/FCTeI · Ley 2162 de 2021 · Fondo Francisco José de Caldas ·
> Beneficios Tributarios (CNBT) · SNCTI · CONPES 4069/4182 · Colfuturo ·
> Jóvenes en Ciencia para la Paz · ColombIA Inteligente/IA · Formación de alto nivel.

La evidencia (páginas y cifras del informe de cada vigencia) queda **adjunta al instrumento**.

## Esquema

Contrato: `data/schema/objeto.schema.json`; vocabulario: `data/schema/taxonomia.yaml`.

### Política (`politicas[]`): área persistente
| Campo | Descripción |
|---|---|
| `id`, `nombre` | slug estable y nombre del área (p. ej. *Talento humano y capacidades regionales*) |
| `objetivos` | por vigencia: `{enunciados[], declaradas[]}` — lo que declara ese gobierno y con qué nombres; ausente = **no declarado** |
| `cambio_objetivo` | `se-mantiene` · `se-reformula` · `no-declarado` · `nuevo` |
| `objetivo` | *legado* del extractor (una política por gobierno), antes de `aplicar_areas.py` |

Un área con instrumentos activos pero sin objetivo declarado en un gobierno se muestra **huérfana**.

### Instrumento (`objetos[]`)
| Campo | Descripción |
|---|---|
| `id`, `nombre`, `alias[]` | slug estable, nombre canónico (tras resolución de entidades) y variantes |
| `tipo_nato` | `nodalidad` · `autoridad` · `tesoro` · `organizacion` |
| `politicas[]` | ids de las áreas a las que sirve (muchos-a-muchos: los compartidos enlazan la red) |
| `presencia` | por vigencia: `{activo, modo?}` — modo ∈ `propuesto` · `logrado` · `pendiente` |
| `modo_cambio` | `continuidad-estable` · `conversion` · `estratificacion` · `terminacion` · `reversion` · `deriva` |
| `narrativa` | qué fue en cada gobierno (`g2018`, `g2022`) y el `cambio` |
| `entidades[]`, `confianza` | responsables; `alta` · `media` · `baja` |
| `evidencia[]` | `{vigencia, paginas, cifras}` |
| `es_objetivo` | *legado*: el extractor podía producir nodos-objetivo; desde ADR-0004 el objetivo vive en la política y el dataset CTeI no tiene ninguno |

`terminacion` y `estratificacion` se derivan de la presencia (una sola vigencia); los modos de lo
presente en ambas son lectura semántica guiada por evidencia.

### Aristas: relaciones entre instrumentos distintos
| Relación | Significado |
|---|---|
| `encadena` | sinergia: dos instrumentos se encadenan/potencian (p. ej. *Misión de Sabios* → *PIIOM*) |
| `financia` | una fuente costea un instrumento (p. ej. *SGR* → *Fondo Francisco José de Caldas*) |
| `habilita` | una norma da existencia a un programa (p. ej. *Ley 2162* → *SNCTI*) |
| `depende-de` | precedencia/condición entre instrumentos |

La pertenencia instrumento→política no es arista: sale de `politicas[]`.

### Métricas de red por pregunta
- P1: instrumentos activos por capa + su modo, y objetivos declarados → foco del gobierno.
- P2: fracción de instrumentos presentes en ambas capas; áreas que mantienen el objetivo → continuidad.
- P3: modos de cambio + cambio del objetivo + instrumentos compartidos entre políticas → articuladores.

## Decisiones técnicas
- **Sin OWL/Protégé en v1**: esquema en JSON Schema + YAML, versionable, validado en CI
  (`scripts/validar_contrato.py`).
- **Render**: el sitio muestra la red (Svelte 5 + D3, SPA estática; ADR-0002). En la **red bipartita
  política↔instrumento** la política es el hub con un **anillo** que codifica el cambio de su objetivo
  (ADR-0004); los instrumentos van coloreados por **modo de cambio** y con forma por **tipo NATO**,
  filtrables por vigencia, modo y NATO, navegables con un buscador, y con foco por política (aísla su
  subred) o por instrumento (resalta su vecindario). Dominio en `packages/red`, UI en `web/` (ver
  `web/README.md`).
- **Glosario del sitio** (`#/glosario`): explica esta ontología al público (tipos de nodo, atributos
  y vocabulario controlado). Las entradas del vocabulario se generan de las mismas etiquetas que usa
  la red (`web/src/lib/visual.ts`), así que no se desincronizan; la fuente sigue siendo
  `data/schema/taxonomia.yaml` y este doc.

## Estado en este repo

- `data/schema/objeto.schema.json` + `taxonomia.yaml` (secciones `objetos` y `politicas`) — el contrato.
- **Pipeline** (`extraccion/`, ver README): markdown → políticas + instrumentos (`extraer_instrumentos.py`
  con Gemini + `aplicar_correcciones.py`; para CTeI, la fuente vigente es la reconstrucción con Claude
  `rebuild-ctei-claude.workflow.js`) → **áreas** (`aplicar_areas.py` con la curaduría
  `data/correcciones/ciencia-tecnologia/areas.yaml`, 14 áreas) → `generar_web.py`.
- `data/schema/bitacora.schema.json` + `data/bitacoras/` — **capa de aportes del seminario**: lo que
  cada grupo registra sobre una política (área) por vigencia, con «Sin dato» como hueco declarado;
  se vincula al mapa por `politica.id` y no modifica nodos ni aristas (ADR-0005).
- *(Historia)* `extraer_ideas.py` y `consolidar_objetos.py` (ideas → instrumentos) están deprecados. Su
  piloto en CTeI (104 ideas → 32 instrumentos; los 13 que persistían coincidieron con los 13 tags que
  cruzaban ambas vigencias) validó la idea de resolver entidades entre gobiernos.

## Pendientes
- **Resolución de entidades** entre gobiernos: afinar la fusión de instrumentos equivalentes.
- **Conversión real**: vincular cada instrumento al objetivo de cada gobierno (pospuesto en ADR-0004)
  si hace falta para medirla; hoy se lee instrumento que continúa + objetivo que se reformula.
- **Deriva**: sigue sin medición propia (lectura semántica; pregunta para el plenario).
- **Integrar las bitácoras** al dataset y a `areas.yaml` (curaduría del equipo, ADR-0005).
- **Escalar** a los demás sectores: extraer y curar sus áreas.
