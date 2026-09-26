# Laboratorio de cocreación — Trama

Un **mapa navegable** de la política pública para que la gente **explore y cocree** sobre ella.
Este repo arranca con el **núcleo conceptual** (ontología + teoría política + contrato de datos)
y la **extracción básica** como referencia. El pipeline de procesamiento y el mapa se (re)construyen
sobre esta base.

## Por qué

El fin es un laboratorio de cocreación: un mapa que **responda preguntas** en vez de mostrar frases
sueltas. Las preguntas que guían todo (ver `docs/ontologia.md`):

1. **¿Qué hizo un gobierno?** — qué instrumentos de política pública estuvieron activos.
2. **¿Qué tuvo continuidad?** — qué persiste entre gobiernos.
3. **¿Cómo contrastan las ejecuciones?** — la trayectoria del mismo instrumento (continuó / se
   dejó / nuevo / se revirtió).

## Qué hay acá

| Carpeta | Qué es |
|---|---|
| `docs/ontologia.md` | El modelo: red multicapa, **instrumento de política pública** como nodo, diacronía. |
| `docs/teoria-politica.md` | Fundamentación (Hood; Lascoumes & Le Galès; Mahoney & Thelen; Pierson). |
| `docs/taxonomia.md` | La clasificación facetada explicada. |
| `data/schema/taxonomia.yaml` | Vocabulario controlado (fuente única de verdad de los enums). |
| `data/schema/*.schema.json` | Contratos de datos: `idea` (evidencia), `comparacion`, `objeto` (instrumento). |
| `extraccion/` | Scripts básicos de extracción, **como referencia** (el pipeline se rehará). |

### Sobre `extraccion/`
Scripts heredados que van de informes crudos → ideas → instrumentos de política pública, con Gemini:

- `extraer_ideas.py` — markdown → ideas (evidencia), con `responseSchema` + validación.
- `consolidar_objetos.py` — ideas → instrumentos de política pública (nodos + aristas).
- `empalme_scraper.py`, `empalme_to_markdown.py`, `ocr_gemini.py` — ingesta de informes de empalme del DNP.

> Son **referencia para rehacer el pipeline**, no la versión final. Leen rutas relativas a la raíz
> del repo (`data/schema/…`), así que ejecutarlos desde la raíz. Requieren `GEMINI_API_KEY` en `.env`
> (ver `.env.example`).

## Estado

- ✅ Núcleo conceptual y contrato de datos.
- 🔧 Pipeline de procesamiento — **a rehacer**.
- 🔧 Mapa (frontend navegable) — **a (re)construir** sobre `dataset.objetos`.
