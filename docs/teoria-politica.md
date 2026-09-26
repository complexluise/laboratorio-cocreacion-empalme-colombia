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

### Nuestras `clase` ≈ una tipología de instrumentos

| Nuestra `clase` | Tipo de instrumento | Recurso (Hood NATO) |
|---|---|---|
| `norma` | legislativo y reglamentario | Autoridad |
| `fuente-financiacion` | económico y fiscal | Tesoro |
| `instrumento` (convocatoria, beca, beneficio) | incentivo económico / de fomento | Tesoro / Autoridad |
| `programa` | organizacional (programa de inversión) | Organización |
| `sistema` | organizacional / institucionalidad | Organización |
| `apuesta` | *(ver salvedad)* orientación / prioridad de política | — |

**Salvedad honesta:** `apuesta` (p.ej. "Inteligencia Artificial", "reforma agraria") **no es un
instrumento** en sentido estricto: es un **objetivo o prioridad de política** (*policy goal*). En
v1 conviven en el mismo tipo de nodo; si genera confusión, en v2 se puede separar el eje
*objetivo* del eje *instrumento* (los objetivos se persiguen **con** instrumentos).

**Consecuencia de nomenclatura:** donde hoy decimos "objeto de política" deberíamos decir
**"instrumento de política pública"** (y reservar "objeto" para el nivel de datos: el *nodo* que
representa al instrumento en el grafo). Ver el mapeo en `docs/ontologia.md`.

---

## 2. El eje diacrónico: **cambio institucional gradual**

Comparar dos gobiernos sobre el mismo sector es, en términos teóricos, estudiar **cómo cambia una
institución sin rupturas** — el corazón del **institucionalismo histórico**. Nuestro vocabulario
diacrónico (redundancia / unicidad / tensión) reproduce, sin saberlo al inicio, la tipología
estándar de **Streeck & Thelen** (*Beyond Continuity*, 2005) y **Mahoney & Thelen**
(*Explaining Institutional Change*, 2010).

Los cuatro modos de cambio gradual de Mahoney & Thelen:

| Modo | Definición | Nuestro equivalente |
|---|---|---|
| **Layering** (estratificación) | se añaden reglas/instrumentos **nuevos** junto a los existentes | **unicidad** presente solo en el gobierno **posterior** (nuevo) |
| **Displacement** (desplazamiento) | se **remueven** reglas existentes y se reemplazan | **unicidad** presente solo en el gobierno **anterior** (dejado) · **tensión** (reversión) |
| **Conversion** (conversión) | la **misma** regla se **redespliega** hacia nuevos fines | **redundancia con cambio de modo** (mismo instrumento, otro `modo`) |
| **Drift** (deriva) | la regla persiste formalmente pero su **efecto** cambia con el entorno | **redundancia** sin cambio formal *(no lo medimos aún; ver Pendientes)* |

### Refinamiento que esto habilita

Hoy `diacronia` colapsa toda "unicidad" en una sola categoría. Pero como guardamos la
**presencia por vigencia**, podemos **partir la unicidad en dos** con significado teórico:

- unicidad solo-posterior → **estratificación** (el gobierno entrante *suma*).
- unicidad solo-anterior → **terminación / desplazamiento** (el gobierno saliente lo *deja*).

Y la "redundancia" puede subdividirse según si el `modo` cambió entre vigencias:
continuidad estable vs. **conversión** (mismo instrumento, distinto uso). Esto convierte una
propiedad de datos en una **lectura política**.

---

## 3. El fenómeno de fondo: **sucesión de políticas**

El *empalme* —un gobierno que hereda el aparato del anterior— tiene nombre propio:

- **Hogwood & Peters**, *Policy Dynamics* (1983): los gobiernos casi nunca parten de cero. Toda
  política entrante hace una de cuatro cosas con lo heredado: **mantenimiento, sucesión,
  innovación o terminación**. Es, literalmente, el marco de lectura de un informe de empalme.
- **Paul Pierson**, *Politics in Time* (2004) y "Increasing Returns…" (2000): **dependencia de la
  trayectoria** (*path dependence*). Explica **por qué** algo persiste: los rendimientos
  crecientes hacen costoso revertir. Fundamenta teóricamente nuestra "redundancia".
- **Peter deLeon**, "A Theory of Policy Termination" (1978): la contracara — por qué y cómo se
  terminan políticas. Fundamenta la "unicidad solo-anterior".

---

## 4. Cómo se dice (la frase para defenderlo)

> "No es un concepto vago que inventamos: modelamos los **instrumentos de política pública**
> (Lascoumes & Le Galès) de un sector como una red, y sobre los informes de empalme usamos la
> tipología de **cambio institucional gradual** de Mahoney y Thelen —estratificación, conversión,
> desplazamiento— para leer qué se mantuvo, qué se reconvirtió y qué se revirtió entre dos
> gobiernos."

Traducción del pitch anterior ("objeto de política, muy amplio") a algo reconocible:
**instrumentos de política pública leídos con institucionalismo histórico.**

---

## 5. Salvedad metodológica: el marco PID+T

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
- Hogwood, B. & Peters, B.G. (1983). *Policy Dynamics*. St. Martin's Press.
- Pierson, P. (2000). "Increasing Returns, Path Dependence, and the Study of Politics".
  *American Political Science Review*, 94(2). · Pierson, P. (2004). *Politics in Time*. Princeton UP.
- deLeon, P. (1978). "A Theory of Policy Termination". En *The Policy Cycle*.
- Williams, P.L. & Beer, R.D. (2010). "Nonnegative Decomposition of Multivariate Information".
  *arXiv:1004.2515*.
