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

- **Christopher Hood**, *The Tools of Government* (1983; actualizado con Margetts en 2007): el
  Estado gobierna con un repertorio finito de herramientas. Su taxonomía **NATO** clasifica los
  instrumentos por el recurso estatal que movilizan:
  - **N**odalidad: la posición del Estado en el centro de las redes de información (no cualquier
    dato);
  - **A**utoridad: el poder legal u oficial de ordenar, prohibir, permitir o certificar;
  - **T**esoro: dinero y bienes intercambiables;
  - **O**rganización: personal, sedes y equipos propios, con los que actúa directamente.

  Cada recurso sirve como **detector** (conocer) y como **efector** (actuar). Un instrumento real
  suele combinar recursos; el mapa asigna el dominante (decisión nuestra). Un programa no es
  «organización» por ser programa: si reparte dinero, es tesoro.
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
| entidad o programa que el Estado ejecuta con su propio personal | organizacional | `organizacion` |

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

Los cuatro modos de cambio gradual de Mahoney & Thelen (Streeck & Thelen 2005 agregaban un quinto,
el **agotamiento**: la regla se extingue sin reemplazo):

| Modo | Definición | Lo que era en PID+T |
|---|---|---|
| **Layering** (estratificación) | se añaden reglas **nuevas** encima o al lado de las existentes, que **siguen** | **unicidad** solo en el gobierno **posterior** |
| **Displacement** (desplazamiento) | se **remueven** reglas existentes y se **introducen** otras nuevas | **unicidad** solo en el gobierno **anterior** (aproximado) |
| **Conversion** (conversión) | la regla sigue formalmente igual, pero los actores la **reinterpretan** hacia nuevos fines | **redundancia** con otro uso |
| **Drift** (deriva) | la regla sigue igual, el entorno cambia y los actores **deciden no ajustarla**: cambia su efecto | **redundancia** sin cambio formal |

**Lo que el mapa adapta (y no es la tipología original).** Los autores estudian reglas a lo largo de
años; el mapa compara **dos informes**. Por eso:
- la **estratificación** del mapa («solo en el informe posterior») no comprueba que lo anterior
  siga: si lo nuevo reemplaza a otro instrumento, en la teoría es desplazamiento;
- la **terminación** del mapa («solo en el informe anterior») junta desplazamiento, terminación
  (deLeon) y agotamiento, y **el silencio del informe posterior no prueba que terminó**;
- la **continuidad estable** no es un modo de Mahoney & Thelen (su tipología es de cambio): viene de
  la dependencia de la trayectoria (Pierson);
- la **reversión** es propia (abajo).

El origen de cada categoría —de la literatura, adaptación o propia— se muestra en el glosario del
sitio (`web/src/lib/fundamentos.ts`, ADR-0008).

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
  modo de Mahoney & Thelen. Lo más cercano en la literatura es el **desmantelamiento** de políticas
  (Bauer et al. 2012: recortar, reducir o eliminar), que no es lo mismo que invertir el rumbo.
- `deriva` — persiste formalmente, pero el entorno cambia y nadie la ajusta. No tiene medición propia:
  se asigna por lectura semántica y queda como pregunta para el plenario.

Los cuatro últimos son lectura semántica guiada por la evidencia. Esto convierte una propiedad de
datos en una **lectura política**.

---

## 3. Fines y medios: el **objetivo** de la política

El modo de cambio mira los **medios**. Pero una política pública combina **fines y medios**
(**Howlett & Cashore**, 2009), y el cambio más profundo es el de los fines:

- **Peter Hall**, "Policy Paradigms, Social Learning, and the State" (1993): el cambio de política
  tiene **tres órdenes**. 1.º: se ajustan los parámetros de un instrumento. 2.º: se cambian los
  instrumentos. 3.º: se cambia la jerarquía de **metas** que hay detrás (el paradigma).
- **Howlett & Cashore** (2009) separan los fines en tres niveles —**metas** generales,
  **objetivos** de programa y **ajustes** concretos— y los medios en otros tres: lógica del
  instrumento, mecanismos y calibraciones.
- La **conversión** de Mahoney & Thelen (mismo instrumento, otro fin) solo es observable si el fin de
  cada gobierno lo es.

Por eso la **política es un área persistente** a la que cada gobierno le **declara su objetivo**, y
ese cambio tiene vocabulario propio, `cambio_objetivo` (ADR-0004; en la red, el **anillo** del nodo
de la política): **se mantiene · se reformula · no declarado · nuevo**.

**Estas cuatro categorías son propias del proyecto**, no de un autor. Lo que declara un informe de
empalme está más cerca de un **objetivo de programa** (Howlett & Cashore) que de un paradigma: un
«se reformula» no es por sí solo un cambio de tercer orden de Hall, hay que argumentarlo. Como
analogía, tres de ellas se parecen a la tipología de Hogwood & Peters: *se mantiene* ≈
mantenimiento, *se reformula* ≈ sucesión (se renuevan objetivos y programas dentro de las mismas
metas), *nuevo* ≈ innovación. *No declarado* no tiene equivalente a propósito: no es terminación. Se dice **"no declarado" y no "abandonado"**: el
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

Con enlace para consultarlas. **Acceso abierto** = se descarga sin suscripción; el resto se consigue
por la biblioteca (DOI) o en préstamo. Las definiciones de este documento y del glosario están
parafraseadas de resúmenes de estas obras: falta cotejarlas con los textos originales (las páginas a
revisar están en ADR-0008).

- Bauer, M.W., Jordan, A., Green-Pedersen, C. & Héritier, A. (eds.) (2012). *Dismantling Public
  Policy: Preferences, Strategies, and Effects*. Oxford University Press.
  [Editorial](https://global.oup.com/academic/product/dismantling-public-policy-9780199656646).
- deLeon, P. (1978). "A Theory of Policy Termination". En May, J.V. & Wildavsky, A. (eds.), *The
  Policy Cycle*. Sage. (Capítulo de libro, sin versión abierta.)
- Hall, P.A. (1993). "Policy Paradigms, Social Learning, and the State: The Case of Economic
  Policymaking in Britain". *Comparative Politics*, 25(3), 275–296.
  [doi:10.2307/422246](https://doi.org/10.2307/422246).
- Hogwood, B.W. & Peters, B.G. (1982). "The dynamics of policy change: Policy succession". *Policy
  Sciences*, 14(3), 225–245. [doi:10.1007/BF00136398](https://doi.org/10.1007/BF00136398). ·
  Hogwood, B.W. & Peters, B.G. (1983). *Policy Dynamics*. St. Martin's Press.
- Hood, C. (1983). *The Tools of Government*. Macmillan. · Hood, C. & Margetts, H. (2007). *The Tools
  of Government in the Digital Age*. Palgrave Macmillan.
  [doi:10.1007/978-1-137-06154-6](https://doi.org/10.1007/978-1-137-06154-6) ·
  [préstamo en Internet Archive](https://archive.org/details/toolsofgovernmen0000hood_d0a8).
- Howlett, M. & Cashore, B. (2009). "The Dependent Variable Problem in the Study of Policy Change:
  Understanding Policy Change as a Methodological Problem". *Journal of Comparative Policy
  Analysis*, 11(1), 33–46. [doi:10.1080/13876980802648144](https://doi.org/10.1080/13876980802648144)
  · **Acceso abierto:** [copia del autor (SFU)](https://www.sfu.ca/~howlett/documents/13876980802648144.pdf).
- Lascoumes, P. & Le Galès, P. (2004). *Gouverner par les instruments*. Presses de Sciences Po. ·
  Lascoumes, P. & Le Galès, P. (2007). "Introduction: Understanding Public Policy through Its
  Instruments". *Governance*, 20(1), 1–21.
  [doi:10.1111/j.1468-0491.2007.00342.x](https://doi.org/10.1111/j.1468-0491.2007.00342.x).
- Mahoney, J. & Thelen, K. (2010). "A Theory of Gradual Institutional Change". En Mahoney & Thelen
  (eds.), *Explaining Institutional Change: Ambiguity, Agency, and Power*. Cambridge University Press.
  [doi:10.1017/CBO9780511806414.003](https://doi.org/10.1017/CBO9780511806414.003) · **Acceso
  abierto:** [extracto del capítulo 1 (Cambridge)](https://assets.cambridge.org/97805211/18835/excerpt/9780521118835_excerpt.pdf).
- Pierson, P. (2000). "Increasing Returns, Path Dependence, and the Study of Politics". *American
  Political Science Review*, 94(2), 251–267. [doi:10.2307/2586011](https://doi.org/10.2307/2586011). ·
  Pierson, P. (2004). *Politics in Time: History, Institutions, and Social Analysis*. Princeton
  University Press.
- Streeck, W. & Thelen, K. (eds.) (2005). *Beyond Continuity: Institutional Change in Advanced
  Political Economies*. Oxford University Press.
  [Presentación del libro (MPIfG)](https://www.mpifg.de/821262/2005-01-wz-streeck-thelen).
- Williams, P.L. & Beer, R.D. (2010). "Nonnegative Decomposition of Multivariate Information".
  **Acceso abierto:** [arXiv:1004.2515](https://arxiv.org/abs/1004.2515).
