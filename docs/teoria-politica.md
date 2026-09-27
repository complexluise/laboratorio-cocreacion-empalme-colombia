# Marco de teoría política — cómo aterrizar el modelo

> Documento de fundamentación. Traduce el vocabulario del proyecto (que nació de necesidades de
> modelado de datos) a los conceptos consolidados de la teoría política, para que el mapa sea
> **reconocible, citable y defendible** ante alguien del campo. Es el ancla teórica de
> `docs/ontologia.md`.

## Por qué este documento

En las conversaciones surgió una crítica válida: **"objeto de política" no es un término de la
teoría política** — es una etiqueta de modelado que acuñamos internamente. Suena a ingeniería de
datos y es tan amplio que no comunica. La buena noticia: lo que estamos modelando **ya tiene
nombre** en la literatura. Este documento hace ese anclaje. No cambia el código (el schema sigue
usando `objetos` por ahora); cambia **cómo lo nombramos y lo justificamos**.

Regla de oro para presentarlo: **el fenómeno de fondo es el EMPALME entre dos gobiernos**, y la
teoría política tiene un aparato preciso para eso — la sucesión de políticas y el cambio
institucional gradual. No hace falta inventar vocabulario.

---

## 1. La unidad de análisis: el **instrumento de política pública**

Lo que llamamos "objeto de política" —una entidad con identidad propia que persiste entre
gobiernos: un programa, una norma, una fuente de financiación, un sistema— es, casi textualmente,
lo que la literatura llama **instrumento de política pública** (*policy instrument*).

- **Christopher Hood**, *The Tools of Government* (1983): el Estado gobierna con un repertorio
  finito de herramientas. Su taxonomía **NATO** clasifica los instrumentos por el recurso estatal
  que movilizan: **N**odalidad (información), **A**utoridad (norma), **T**esoro (dinero),
  **O**rganización (capacidad estatal directa).
- **Lascoumes & Le Galès**, *Gouverner par les instruments* (2004): la corriente más citada en
  América Latina. Tesis central: **un instrumento no es neutro** — condensa una teoría implícita
  de cómo se debe gobernar y de la relación Estado–sociedad. Elegir un instrumento *es* una
  decisión política, no técnica.

### El tipo de instrumento: `tipo_nato`

Cada instrumento del mapa lleva su recurso NATO (`taxonomia.yaml`); en la red es la **forma** del nodo.

| Lo que aparece en los informes | Tipo de instrumento | `tipo_nato` |
|---|---|---|
| sistema de información, plataforma, orientación | informativo | `nodalidad` |
| ley, decreto, CONPES, reglamento | legislativo y reglamentario | `autoridad` |
| fondo, convocatoria, beca, beneficio tributario | económico y fiscal | `tesoro` |
| programa ejecutado por una entidad, institucionalidad | organizacional | `organizacion` |

**Objetivo ≠ instrumento.** Una primera versión del modelo mezclaba en el mismo tipo de nodo
instrumentos y **objetivos o prioridades de política** (*policy goals*: "Inteligencia Artificial",
"reforma agraria"), bajo la etiqueta `apuesta`. Eso se separó: los objetivos se persiguen **con**
instrumentos, y hoy el objetivo **vive en la política**, declarado por cada gobierno (§3,
ADR-0004); no es un nodo.

**Consecuencia de nomenclatura:** donde hoy decimos "objeto de política" deberíamos decir
**"instrumento de política pública"** (y reservar "objeto" para el nivel de datos: el *nodo* que
representa al instrumento en el grafo). Ver el mapeo en `docs/ontologia.md`.

---

## 2. El eje diacrónico: **cambio institucional gradual**

Comparar dos gobiernos sobre el mismo sector es, en términos teóricos, estudiar **cómo cambia una
institución sin rupturas** — el corazón del **institucionalismo histórico**. Nuestro vocabulario
diacrónico original (redundancia / unicidad / tensión) reproducía, sin saberlo al inicio, la tipología
estándar de **Streeck & Thelen** (*Beyond Continuity*, 2005) y **Mahoney & Thelen**
(*Explaining Institutional Change*, 2010).

Los cuatro modos de cambio gradual de Mahoney & Thelen:

| Modo | Definición | Lo que era en PID+T |
|---|---|---|
| **Layering** (estratificación) | se añaden reglas/instrumentos **nuevos** junto a los existentes | **unicidad** solo en el gobierno **posterior** |
| **Displacement** (desplazamiento) | se **remueven** reglas existentes y se reemplazan | **unicidad** solo en el gobierno **anterior** |
| **Conversion** (conversión) | la **misma** regla se **redespliega** hacia nuevos fines | **redundancia** con otro uso |
| **Drift** (deriva) | la regla persiste formalmente pero su **efecto** cambia con el entorno | **redundancia** sin cambio formal |

### Cómo quedó en el dato: `modo_cambio`

Como guardamos la **presencia por vigencia**, la unicidad se partió en dos con significado teórico
y la redundancia se subdividió. Cada instrumento lleva un `modo_cambio` (`taxonomia.yaml`; en la red
es el **color** del nodo):

- `estratificacion` — solo en el gobierno posterior: el entrante *suma* (determinista).
- `terminacion` — solo en el gobierno anterior: el saliente lo *deja* o se reemplaza (determinista;
  *displacement* de Mahoney & Thelen y *termination* de deLeon).
- `continuidad-estable` — en ambos, mismo uso (dependencia de la trayectoria, Pierson).
- `conversion` — en ambos, redesplegado hacia otro uso.
- `reversion` — persiste pero invierte su rumbo: **extensión propia** (la "tensión" de PID+T), no un
  modo de Mahoney & Thelen.
- `deriva` — persiste formalmente, pero su efecto cambia con el entorno. No tiene medición propia:
  se asigna por lectura semántica y queda como pregunta para el plenario.

Los cuatro últimos son lectura semántica guiada por la evidencia. Esto convierte una propiedad de
datos en una **lectura política**.

---

## 3. Fines y medios: el **objetivo** de la política

El modo de cambio mira los **medios**. Pero una política pública combina **fines y medios**
(**Howlett & Cashore**, 2009), y el cambio más profundo es el de los fines:

- **Peter Hall**, "Policy Paradigms, Social Learning, and the State" (1993): el cambio de política
  tiene **tres órdenes**. 1.º: se ajusta cómo se usa un instrumento. 2.º: se cambian los instrumentos.
  3.º: se cambian los **objetivos** (el paradigma).
- La **conversión** de Mahoney & Thelen (mismo instrumento, otro fin) solo es observable si el fin de
  cada gobierno lo es.

Por eso la **política es un área persistente** a la que cada gobierno le **declara su objetivo**, y
ese cambio tiene vocabulario propio, `cambio_objetivo` (ADR-0004; en la red, el **anillo** del hub):
**se mantiene · se reformula · no declarado · nuevo**. Se dice **"no declarado" y no "abandonado"**: el
informe de empalme lo escribe cada gobierno sobre sí mismo y el silencio no prueba abandono. Un área
sin objetivo declarado pero con instrumentos activos es un **área huérfana**: la dependencia de la
trayectoria hecha visible (los medios persisten aunque el fin ya no se nombre). Un instrumento que
continúa bajo un objetivo que se reformula es la pista para buscar conversión.

---

## 4. El fenómeno de fondo: **sucesión de políticas**

El *empalme* —un gobierno que hereda el aparato del anterior— tiene nombre propio:

- **Hogwood & Peters**, *Policy Dynamics* (1983): los gobiernos casi nunca parten de cero. Toda
  política entrante hace una de cuatro cosas con lo heredado: **mantenimiento, sucesión,
  innovación o terminación**. Es, literalmente, el marco de lectura de un informe de empalme.
- **Paul Pierson**, *Politics in Time* (2004) y "Increasing Returns…" (2000): **dependencia de la
  trayectoria** (*path dependence*). Explica **por qué** algo persiste: los rendimientos
  crecientes hacen costoso revertir. Fundamenta la `continuidad-estable` (la "redundancia" de PID+T).
- **Peter deLeon**, "A Theory of Policy Termination" (1978): la contracara — por qué y cómo se
  terminan políticas. Fundamenta la `terminacion` (la "unicidad solo-anterior").

---

## 5. Cómo se dice (la frase para defenderlo)

> "No es un concepto vago que inventamos: modelamos los **instrumentos de política pública**
> (Lascoumes & Le Galès) de un sector como una red, y sobre los informes de empalme usamos la
> tipología de **cambio institucional gradual** de Mahoney y Thelen —estratificación, conversión,
> desplazamiento— para leer qué se mantuvo, qué se reconvirtió y qué se revirtió entre dos
> gobiernos."

Traducción del pitch anterior ("objeto de política, muy amplio") a algo reconocible:
**instrumentos de política pública leídos con institucionalismo histórico.**

---

## 6. Salvedad metodológica: el marco PID+T

El proyecto usa **PID+T** (Redundancia / Unicidad / Sinergia / Tensión). Las tres primeras vienen
de la **Descomposición Parcial de Información** (*Partial Information Decomposition*) de
**Williams & Beer (2010)** — **teoría de la información, no teoría política**. Se aplican por
analogía: "¿qué aporta cada gobierno a la política del sector?" (redundante = ambos lo sostienen;
único = propio de uno; sinérgico = surge de la combinación). "Tensión" es una extensión propia
para el conflicto/reversión.

**Cómo presentarlo, honestamente:** PID+T es una **analogía metodológica propia** —original y
elegante— para descomponer la contribución de cada gobierno; **no** es un marco de ciencia
política. Al exponerlo, apóyalo en Mahoney-Thelen (§2), que es el vocabulario disciplinar. Así
PID+T queda como *cómo medimos*, y el institucionalismo histórico como *qué significa*.

---

## Referencias

- Hood, C. (1983). *The Tools of Government*. Macmillan.
- Lascoumes, P. & Le Galès, P. (2004). *Gouverner par les instruments*. Presses de Sciences Po.
  (trad. y difusión amplia en América Latina).
- Streeck, W. & Thelen, K. (eds.) (2005). *Beyond Continuity: Institutional Change in Advanced
  Political Economies*. Oxford University Press.
- Mahoney, J. & Thelen, K. (eds.) (2010). *Explaining Institutional Change: Ambiguity, Agency,
  and Power*. Cambridge University Press.
- Hall, P.A. (1993). "Policy Paradigms, Social Learning, and the State: The Case of Economic
  Policymaking in Britain". *Comparative Politics*, 25(3), 275–296.
- Howlett, M. & Cashore, B. (2009). "The Dependent Variable Problem in the Study of Policy Change:
  Understanding Policy Change as a Methodological Problem". *Journal of Comparative Policy
  Analysis*, 11(1), 33–46.
- Hogwood, B. & Peters, B.G. (1983). *Policy Dynamics*. St. Martin's Press.
- Pierson, P. (2000). "Increasing Returns, Path Dependence, and the Study of Politics".
  *American Political Science Review*, 94(2). · Pierson, P. (2004). *Politics in Time*. Princeton UP.
- deLeon, P. (1978). "A Theory of Policy Termination". En *The Policy Cycle*.
- Williams, P.L. & Beer, R.D. (2010). "Nonnegative Decomposition of Multivariate Information".
  *arXiv:1004.2515*.
