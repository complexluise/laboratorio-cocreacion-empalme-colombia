# Encuadre de la actividad — Laboratorio de cocreación en TRAMA

> v0.5 (2026-09-27) · Vocabulario alineado con `teoria-politica.md` y [ADR-0004](decisiones/ADR-0004-politica-area-con-objetivo-por-gobierno.md) · Cada grupo **selecciona una política pública** (un área persistente), la describe entre los dos gobiernos, busca información complementaria y llena una **bitácora** (§6): un .docx en blanco que el equipo convierte en dato ([ADR-0005](decisiones/ADR-0005-bitacora-docx-a-dato-estructurado.md)). En el sitio la actividad es un **recorrido de 4 pasos** con sus materiales (bitácora, ejemplo CTeI, la red en Excel) y una práctica previa (§5). El sector no es la unidad de asignación.

## 1. Encuadre en una frase

En dos sesiones, el seminario TRAMA toma por grupos varias **políticas públicas** de distintos sectores, describe cada una entre dos gobiernos (su objetivo declarado y sus **instrumentos de política pública**) usando la red como consulta, y lee su cambio con la tipología de **cambio institucional gradual**. Luego observa qué patrones **emergen solo al integrar** el trabajo de todos los grupos.

## 2. Vocabulario de la actividad

### Conceptos principales

| Término a usar | Qué designa |
|---|---|
| **Sector** | Agrupación administrativa bajo la que se organizan los informes de empalme (CTeI, Deporte, Agropecuario) |
| **Política pública** | Un **área persistente**: problema o campo que atraviesa gobiernos (p. ej. Talento humano y capacidades regionales, Beneficios tributarios para CTeI), junto con los instrumentos con que se atiende. Cada grupo selecciona una. Las áreas las cura el equipo (ADR-0004). |
| **Objetivo de política** | Lo que **cada gobierno declara** que persigue en el área (uno o varios enunciados por vigencia). Su cambio entre gobiernos se lee con `cambio_objetivo`: **se mantiene · se reformula · no declarado · nuevo**. Se dice "no declarado", no "abandonado": el informe lo escribe cada gobierno sobre sí mismo y el silencio no prueba abandono. |
| **Instrumento de política pública** | Medio concreto con que el Estado actúa: un programa, una norma, una fuente de financiación, un sistema, una convocatoria o una beca. |
| **Tipo de instrumento (NATO, Hood)** | Recurso que moviliza: Nodalidad, Autoridad, Tesoro, Organización |
| **Empalme / sucesión de políticas** | El gobierno entrante hereda el aparato del saliente (Hogwood & Peters) |


### Tipos de instrumento, según el recurso que usa el Estado (Hood)

| Tipo | Recurso | Ejemplo |
|---|---|---|
| **Nodalidad** (información) | Datos, comunicación, orientación | Un sistema de información |
| **Autoridad** | Normas y obligaciones | Una ley o un decreto |
| **Tesoro** | Dinero | Un fondo o una convocatoria |
| **Organización** | Capacidad directa del Estado | Un programa ejecutado por una entidad |


### Cómo cambia un instrumento entre gobiernos (Mahoney-Thelen)

| Modo de cambio | Qué pasa con el instrumento |
|---|---|
| **Continuidad estable** | Mismo instrumento, mismo modo: persiste. Se explica por dependencia de la trayectoria (Pierson). |
| **Conversión** | Mismo instrumento, redesplegado hacia otro uso. |
| **Estratificación** (*layering*) | Solo en el gobierno posterior: se suma a lo que existía. |
| **Terminación** | Solo en el gobierno anterior: se deja o se reemplaza. |
| **Reversión** | Persiste, pero invierte su rumbo. |
| **Deriva** (*drift*) | Persiste formalmente; su efecto cambia con el entorno. Se deja como pregunta para el plenario. |

El modo de cambio del **instrumento** complementa al `cambio_objetivo` de la **política** (§2, arriba): un instrumento que continúa bajo un objetivo que se reformula es la pista para buscar conversión. Aparte de los modos, las **sinergias** (encadenamientos entre instrumentos que se habilitan o potencian) se registran como relaciones.

**Regla para facilitación.** Con los participantes se habla en términos de institucionalismo histórico (*qué significa*). PID+T queda como la capa de medición (*cómo medimos*).

En TRAMA esto funciona como un puente: la audiencia de sistemas complejos reconoce la Descomposición Parcial de Información (PID), y el vocabulario de política le da contenido disciplinar. Se presenta explícitamente como **analogía metodológica propia**, no como marco de ciencia política.

## 3. Preguntas que guían la actividad

Las tres preguntas de competencia, reformuladas:

1. **¿Qué instrumentos movilizó cada gobierno** en esta política, y en qué modo (propuesto, logrado, pendiente)?
2. **¿Qué se mantuvo, qué se reconvirtió, qué se sumó y qué se terminó** entre un gobierno y otro?
3. **¿Cómo contrastan las dos ejecuciones** sobre los mismos instrumentos?

A estas se suma una **pregunta de complejidad**, propia de la sesión 2: ¿los patrones de cambio son específicos de cada política, o hay regularidades que atraviesan políticas y sectores?

## 4. División de grupos: una política pública por grupo

Cada grupo **selecciona una política pública** y la describe a través de los dos gobiernos (2018–2022, Duque, y 2022–2026, Petro). No se queda en el informe de empalme: **busca información complementaria** (p. ej. Sinergia/DNP, el Plan Nacional de Desarrollo de cada gobierno, el capítulo de inversión pública) y registra todo en la **bitácora** (§6). La actividad trabaja con tres niveles:

| Nivel | Qué es | Papel en la actividad | Estado |
|---|---|---|---|
| **Sector** | Agrupación de los informes de empalme | Fuente de las políticas y escala de comparación en el plenario | CTeI: publicado (93 instrumentos, 22 relaciones) · Deporte: en curso (59 fragmentos → 26 instrumentos) · Agropecuario: objetivo declarado |
| **Política pública** | Área persistente con objetivo por gobierno + mezcla de instrumentos | **Unidad que selecciona cada grupo** | CTeI: **14 áreas curadas** (`data/correcciones/ciencia-tecnologia/areas.yaml`, ADR-0004) · Deporte y Agropecuario: por curar |
| **Instrumento** | Programa, norma, financiación, sistema… | Unidad de análisis dentro de cada política | Nodos que ya produce el pipeline |

### Extracción de las políticas (antes de la sesión 1)

Las políticas no vienen dadas: hay que identificarlas en los informes de empalme. Desde ADR-0004 el equipo las **cura como áreas** antes de publicar (`data/correcciones/<slug>/areas.yaml`, aplicado por `extraccion/aplicar_areas.py`); CTeI ya tiene 14. La lista queda abierta a ampliarse con el seminario. Criterios para reconocer una política pública en un informe:

- Tiene un **objetivo o problema público** identificable.
- Se persigue con **más de un instrumento** (programa, norma, financiación, etc.).
- Tiene un **ancla institucional**: una entidad responsable o un documento que la formaliza (ley, CONPES, plan).
- Tiene **evidencia suficiente** en el informe: páginas y cifras.

Criterios para **seleccionar** las políticas que se asignan:

- Priorizar políticas con evidencia **en ambos gobiernos**, porque ahí se observa el cambio. Puede incluirse una que aparezca en un solo gobierno como caso de estratificación o de terminación.
- **Carga comparable** entre grupos: un número de instrumentos que se pueda trabajar en una sesión.
- **Diversidad**: varias políticas de un mismo sector y políticas de más de un sector, para tener las dos escalas de comparación.

*Punto de partida:* las políticas que declara cada gobierno en su informe (las que detecta el pipeline) se agrupan en áreas; cada área conserva el objetivo que le declaró cada gobierno. Un área con instrumentos activos pero sin objetivo declarado en un gobierno aparece como **huérfana**: es un buen caso para un grupo.

### Qué cambia con esta división

Cada grupo ve el empalme completo de su política. La **emergencia ocurre entre políticas**, en dos escalas que ningún grupo ve por separado:

- **Dentro de un sector.** Hay instrumentos compartidos por varias políticas, como una fuente de financiación o un sistema que sostiene a más de una. Si dos grupos leen distinto el mismo instrumento, aparece una tensión que solo se ve al integrar (por verificar en los datos).
- **Entre sectores.** Aparecen **regularidades del cambio**: ¿predomina la estratificación? ¿qué tipo de instrumento (NATO) persiste más? Una hipótesis de trabajo, desde la dependencia de la trayectoria, es que los instrumentos de Tesoro y Organización persisten más que los objetivos de política. También se ve la **coherencia de gobierno**: un mismo gobierno puede estratificar en una política y terminar instrumentos en otra.

### Variante opcional

Si un grupo tiene suficientes personas, se divide internamente en dos subgrupos, uno por gobierno, que se encuentran al final de la sesión 1. Así se conserva a escala pequeña el "encuentro" entre capas.

## 5. Estructura de las dos sesiones

**Antes de la sesión 1: equipo organizador**
- Cura las políticas públicas como áreas y define cuáles se ofrecen a los grupos (§4).
- Para cada política, prepara la subred de sus instrumentos y un paquete curado de evidencia. La **bitácora** es la misma plantilla .docx para todos, en blanco, descargable desde la landing (§6), junto con un ejemplo lleno de CTeI y la **red del sector en Excel** (`red-<slug>.xlsx`: políticas, instrumentos y relaciones para filtrar por tipo NATO y modo de cambio), que generan `extraccion/bitacora.py` y `extraccion/red_excel.py`.

**Sesión 1: análisis por política**
- Encuadre común: empalme, política pública, instrumento y modos de cambio gradual (en la landing, «Cinco ideas para leer el mapa» y el glosario). Para ensayar la lectura, la práctica **«¿Qué le pasó a este instrumento?»**: ejemplos reales de la red, uno por modo (continuidad, conversión, estratificación, terminación), con pista si la respuesta no es la correcta.
- Cada grupo selecciona su política y trabaja con su subred (ambas vigencias) y un paquete curado de evidencia: fragmentos con página y cifra.
- La **describe entre los dos gobiernos** en la bitácora (Word o Google Docs), usando la red como consulta para ubicarse, y **busca información complementaria** fuera del informe de empalme (Sinergia/DNP, PND, inversión pública).
- Cierre: cada grupo deja por escrito en la bitácora una **hipótesis** sobre qué patrón cree que comparten las otras políticas.

El sitio guía la sesión como un **recorrido de 4 pasos**; cada uno dice qué hacer, con qué material, qué pregunta guía la conversación y qué produce:

| Paso | Qué hace el grupo | Material | Produce |
|---|---|---|---|
| 1. **Elegir** | Explora la red y elige un área (mira el anillo: cómo cambió su objetivo) | la red, la bitácora | La política elegida, en los datos del grupo |
| 2. **Describir** | Ubica la política en cada gobierno y compara sus instrumentos | la red en Excel, la tabla puente | Secciones 1 y 1.1 de la bitácora |
| 3. **Buscar** | Busca información complementaria; si algo no aparece, «Sin dato» | glosario: meta del cuatrienio, gestión/producto/impacto | Las siete subcategorías y la tabla de fuentes |
| 4. **Concluir** | Cierra con lo aprendido y la hipótesis para el plenario | el ejemplo lleno de CTeI | La bitácora completa, entregada al equipo |

**Entre sesiones: equipo organizador**
- Recoge los .docx y los convierte en dato: `uv run extraccion/bitacora.py leer <grupo>.docx --slug <slug>` → `data/bitacoras/<slug>/<grupo>.json` (validado por `scripts/validar_contrato.py`).
- Integra los aportes al dataset de cada sector (y a `areas.yaml` si el seminario propone áreas nuevas).
- Construye el mapa integrado de todas las políticas.

**Sesión 2: integración e intergrupo**
- Revelación del mapa integrado.
- Contraste de las hipótesis de la sesión 1 con lo que muestra el mapa.
- Plenario sobre instrumentos compartidos, regularidades entre sectores, coherencia de gobierno y lo que le falta al mapa (p. ej. la deriva).
- Producto: **mapa v2 con los aportes del seminario**, que es el primer acto de cocreación del laboratorio.

## 6. La bitácora

Una bitácora por grupo y por política. Reemplaza el formato por instrumento de v0.3. Su estructura se inspira en la plantilla aplicada de CTeI del PO; los ejemplos de abajo vienen de ella.

**Es un .docx listo para llenar, en blanco** ([ADR-0005](decisiones/ADR-0005-bitacora-docx-a-dato-estructurado.md)). Se descarga desde la landing (`bitacora-laboratorio.docx`, con un ejemplo lleno de CTeI) y se llena en Word o Google Docs. La red sirve de **consulta** (la política, sus instrumentos y cómo cambiaron), no de borrador: el grupo construye la bitácora con el informe de empalme y la información complementaria. Además de las secciones de abajo, la plantilla pide los datos del grupo y una tabla de **fuentes complementarias** (fuente, qué aportó, página o enlace).

Dos reglas para que el equipo pueda convertirla en dato: **no cambiar los títulos de las tablas ni de las filas**, y escribir **«Sin dato»** cuando la fuente no dice algo (es un hueco declarado, un hallazgo; se puede aclarar: «Sin dato: el balance no lo desagrega»), distinto de dejar la celda vacía (no llenado). La estructura exacta vive en la plantilla (definida en `extraccion/bitacora.py`); las tablas de abajo la resumen.

### 1. Ubicación y avance

Dónde está la política en el documento de cada gobierno y qué avance reporta.

| | 2018–2022 | 2022–2026 |
|---|---|---|
| Ubicación (pacto / transformación / sección) | | |
| Avance reportado | | |

**Hallazgo de comparabilidad (tabla puente).** Antes de comparar cifras, se deja escrito cómo se corresponden las estructuras de los dos documentos. Ejemplo CTeI: Duque la reporta como el Pacto Transversal IX, con 94,41 % de cumplimiento del cuatrienio al estilo Sinergia; Petro la reparte entre la Transformación 4.2 y la 5.7.2, sin un porcentaje único. Sin la tabla puente, cualquier comparación de números es engañosa.

### 1.1 Instrumentos

Por gobierno, al menos: el **principal**, el de **formación de talento** y el **fiscal/tributario**. Cada uno con su tipo NATO y su modo de cambio (§2).

| Instrumento | 2018–2022 | 2022–2026 |
|---|---|---|
| Principal | p. ej. cupo de inversión para deducción y descuento tributario en CTeI | p. ej. convocatorias de financiación: ColombIA Inteligente, ECONOVA, Ciencias Básicas y del Espacio, FIS… |
| Formación de talento | p. ej. becas y créditos-beca doctorales | p. ej. Ondas en los Territorios + Ciencia para la Paz (jóvenes en municipios PDET) |
| Fiscal / tributario | p. ej. sí: es el instrumento central reportado | p. ej. se menciona el fortalecimiento de beneficios tributarios para I+D, sin cifra propia |

### 2–8. Las siete subcategorías, lado a lado

| # | Subcategoría | 2018–2022 | 2022–2026 | Ejemplo CTeI |
|---|---|---|---|---|
| 2 | **Objetivo** | | | El giro de enfoque entre gobiernos (`cambio_objetivo`) |
| 3 | **Instituciones** | | | Colciencias → MinCiencias: un cambio institucional ocurrido dentro de 2018–2022 (Leyes 1951 de 2019 y 2162 de 2021) que cada informe reporta desde otra institucionalidad |
| 4 | **Población** | | | No se desagrega en 2018–2022 (dato ausente) vs. enfoque diferencial y territorial explícito en 2022–2026 |
| 5 | **Normativa** | | | Ninguno de los dos ancla la política a una ley en la sección que reporta CTeI |
| 6 | **Recursos** | | | $6,50 billones de cupo tributario vs. sin cifra agregada |
| 7 | **Metas** | | | Meta cuatrienio con % vs. solo cifras de ejecución |
| 8 | **Impacto** | | | Vacío en ambos: solo métricas de gestión o producto |

### Lo que enseña al plenario

Lo que el grupo aprendió comparando, en pocas líneas. Los hallazgos típicos del ejemplo CTeI:

- **El giro de enfoque** en el objetivo es lo primero que se ve y lo que más ordena la lectura de los instrumentos.
- **Metas engañosas sin homologar.** No se compara 5.706 con 3.126: son manzanas con peras. Hay que buscar la meta del PND 2022–2026 en Sinergia antes de leer la diferencia.
- **Impacto vacío en ambos gobiernos** (solo métricas de gestión o producto) es un hallazgo típico del laboratorio, no una falla del grupo.
- **Las asimetrías documentales** (normativa, recursos) **se anotan, no se rellenan con supuestos**.

### Hipótesis para la sesión 2

Qué patrón cree el grupo que comparten las otras políticas (se conserva del cierre de la sesión 1, §5).

## 7. Decisiones abiertas

1. ~~**Actividad concreta de la sesión 1.**~~ **Resuelta (v0.4, 2026-09-27, PO; ajustada en v0.5):** cada grupo selecciona una política, la describe entre los dos gobiernos y llena la bitácora (§6). **Consulta la red** para ubicarse y **completa con información complementaria** fuera del informe de empalme; la bitácora arranca en blanco (ADR-0005).
2. **Extracción de políticas.** *Resuelto por ADR-0004:* quién y cómo (el equipo las cura como áreas en `areas.yaml` antes de publicar; CTeI tiene 14). *Sigue abierto:* cuántas se ofrecen a los grupos (una por grupo, más reservas), cuáles se priorizan con los criterios de §4, y la curaduría de áreas de Deporte y Agropecuario.
3. **Número de participantes y duración** de cada sesión, que determinan el número de grupos y si se usan subgrupos.
4. **¿Llega Agropecuario a tiempo?** Si no, las políticas se extraen solo de CTeI y Deporte.
5. **Visibilidad en la sesión 1.** Recomendado: cada grupo ve solo su política, para que la integración de la sesión 2 sea reveladora. *Abierto (decide el PO):* el sitio publica la red completa y el Excel de todo el sector, y el paso 1 del recorrido pide explorar la red para elegir; hay que decidir si la recomendación se sostiene (p. ej. pedir a los grupos que usen el foco de su política) o se abandona.
