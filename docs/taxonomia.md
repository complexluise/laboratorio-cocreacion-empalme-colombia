# Taxonomía facetada — clasificación bibliotecaria de ideas

> **DEPRECADO (histórico).** La capa de "ideas" facetadas (A–K) ya no se usa: el pipeline extrae
> directo **políticas + instrumentos** con el vocabulario del encuadre (NATO + modos de cambio
> gradual + política). El vocabulario vigente vive en `data/schema/taxonomia.yaml` (sección `objetos`)
> y se explica en `docs/encuadre-actividad-trama.md` y `docs/teoria-politica.md`. Este documento se
> conserva como referencia del enfoque anterior.

Esquema compartido para clasificar las ideas extraídas de **ambos** empalmes, de modo
que sean comparables. Cada idea se etiqueta con **una faceta temática (A–K)** y **un tipo**.
Un esquema único y estable es lo que hace el ejercicio *reproducible y defendible*.

## Facetas temáticas (de qué trata la idea)

| Cód | Faceta | Cubre |
|---|---|---|
| **A** | Orientación estratégica y política | Misión, visión, enfoque de política pública de CTeI, apuestas de gobierno, Plan Nacional de Desarrollo. |
| **B** | Programas e instrumentos | Programas concretos, convocatorias, misiones de conocimiento (Misión de Sabios, misiones temáticas), instrumentos de fomento. |
| **C** | Institucionalidad y estructura | Estructura del Ministerio, plantas de personal, decretos de estructura, gobernanza del SNCTI, creación/rediseño de dependencias. |
| **D** | Financiación y presupuesto | Presupuesto, ejecución presupuestal, regalías (SGR / FCTeI), beneficios tributarios, vigencias futuras, fuentes de recursos. |
| **E** | Talento humano y formación | Becas, formación de alto nivel (maestrías/doctorados), jóvenes investigadores, vocaciones científicas, inserción laboral. |
| **F** | Territorio y regiones | Descentralización, CODECTI, regionalización de la CTeI, cierre de brechas regionales. |
| **G** | Internacionalización y diplomacia científica | Cooperación internacional, diplomacia científica, alianzas y organismos multilaterales. |
| **H** | Apropiación social del conocimiento | CTeI y sociedad, ciencia ciudadana, comunicación pública de la ciencia, saberes propios/ancestrales. |
| **I** | Resultados e indicadores | Logros reportados, metas, cifras de gestión, indicadores de resultado. |
| **J** | Gestión administrativa y transversal | Control interno, jurídica, TIC/sistemas de información, contratación, gestión documental, riesgos operativos. |
| **K** | Pendientes, alertas y recomendaciones | Lo que queda por hacer, riesgos de continuidad, recomendaciones al gobierno entrante, procesos judiciales/hallazgos. |

## Tipo (qué clase de idea es)

| Tipo | Significado |
|---|---|
| `apuesta` | Orientación o prioridad de política que el periodo impulsa. |
| `programa` | Instrumento/programa concreto en ejecución. |
| `estructura` | Cambio institucional, normativo u organizacional. |
| `logro` | Resultado alcanzado y reportado (con cifra si la hay). |
| `pendiente` | Tarea inconclusa, alerta o recomendación de continuidad. |

## Formato de cada idea (en `docs/ideas/*.md`)

```
- [Faceta X · tipo] Enunciado en 1–2 frases.
  · Evidencia: informe pág. NN / Anexo NN (nombre).
  · Cifra: (si aplica)
```

## Marco de comparación (fase siguiente) — PID+T

Sobre las ideas ya clasificadas, se contrastan los dos periodos:

- **Convergencia** — apuntan a lo mismo aunque el lenguaje difiera.
- **Redundancia** — la idea se repite/comparte entre periodos (continuidad).
- **Unicidad** — idea propia de un solo periodo.
- **Sinergia** — combinadas entre periodos producen algo mayor (acumulación, encadenamiento).
- **Tensión** — conflicto, reversión o cambio de rumbo entre periodos.
