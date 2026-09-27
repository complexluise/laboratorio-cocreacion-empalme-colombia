# Laboratorio de cocreación — Trama

Repo de trabajo del laboratorio: acá **construimos el lab y todo lo necesario**. El fin es un
**mapa navegable** de la política pública para que la gente **explore y cocree** sobre ella.
Hoy están el **núcleo conceptual** (ontología + teoría política + contrato de datos), la
**extracción** (ingesta de informes de empalme del DNP) y la **actividad del seminario**
documentada. El pipeline de procesamiento y la aplicación se (re)construyen sobre esta base.

## Por qué

Un laboratorio de cocreación: un mapa que **responda preguntas** en vez de mostrar frases
sueltas. Las preguntas que guían todo (ver `docs/ontologia.md`):

1. **¿Qué hizo un gobierno?** — qué instrumentos de política pública estuvieron activos.
2. **¿Qué tuvo continuidad?** — qué persiste entre gobiernos.
3. **¿Cómo contrastan las ejecuciones?** — la trayectoria del mismo instrumento (continuó / se
   dejó / nuevo / se revirtió).

## Qué hay acá

| Carpeta / archivo | Qué es |
|---|---|
| `docs/ontologia.md` | El modelo: red multicapa, **instrumento de política pública** como nodo, diacronía. |
| `docs/teoria-politica.md` | Fundamentación (Hood; Lascoumes & Le Galès; Mahoney & Thelen; Pierson). |
| `docs/taxonomia.md` | La clasificación facetada explicada. |
| `docs/encuadre-actividad-trama.md` | La **actividad del seminario TRAMA**: cómo los grupos reconstruyen y comparan políticas. |
| `data/schema/taxonomia.yaml` | Vocabulario controlado (fuente única de verdad de los enums). |
| `data/schema/*.schema.json` | Contratos de datos: `idea` (evidencia), `comparacion`, `objeto` (instrumento). |
| `extraccion/` | Scripts de ingesta y extracción (ver abajo). |
| `descargas/`, `extraido/`, `markdown/` | Informes de empalme del DNP: PDF/ZIP descargados, anexos descomprimidos y su conversión a markdown. *(no versionado; se regeneran)* |

### Sobre `extraccion/`
Del informe crudo del DNP → markdown → **políticas + instrumentos** de política pública:

- `empalme_scraper.py` — descarga informes de empalme (PDF + anexos) del Datálogo DNP, por sector.
- `empalme_to_markdown.py` — PDF/xlsx/xls → markdown (texto por página; resumen de hojas de cálculo).
- `ocr_gemini.py` — OCR para los PDF escaneados sin texto extraíble.
- `extraer_instrumentos.py` — markdown → **políticas + instrumentos** con NATO, modo de cambio,
  presencia por vigencia, evidencia y relaciones (nodos + aristas). Con `responseSchema` + validación.
- `generar_web.py` — `objetos.json` → `web/datos.js` (dato horneado para el mapa).
- *(deprecados: `extraer_ideas.py`, `consolidar_objetos.py` — la capa de "ideas" ya no se usa.)*

> Leen rutas relativas a la raíz del repo, así que ejecutarlos desde la raíz. Los que usan Gemini
> requieren `GEMINI_API_KEY` en `.env` (ver `.env.example`). El vocabulario de clasificación vive en
> `data/schema/taxonomia.yaml` y sale de `docs/encuadre-actividad-trama.md`.

## La aplicación

Un **explorador de instrumentos** (D3.js): el mapa navegable de instrumentos agrupados por política,
coloreados por su modo de cambio entre gobiernos. **PoC funcionando en `web/`** para Ciencia y
Tecnología — abrir `web/index.html` (ver `web/README.md`).

## Estado

- ✅ Núcleo conceptual y contrato de datos (alineado al encuadre: NATO + modos de cambio + política).
- ✅ Ingesta de informes de empalme del DNP y conversión a markdown.
- ✅ Actividad del seminario documentada (`docs/encuadre-actividad-trama.md`).
- ✅ Pipeline `extraer_instrumentos.py` corrido sobre Ciencia y Tecnología (piloto/PoC).
- ✅ Aplicación: explorador de instrumentos (D3) — **PoC** en `web/` (CTeI).
- 🔧 Afinar la resolución de entidades entre gobiernos (fusión de instrumentos/políticas equivalentes).
- 🔧 Escalar a más sectores (educación, cultura, agro) cuando el portal DNP esté disponible.
- ❔ Compartir la actividad en un GitHub público — **por decidir** (¿este repo u otro?).
