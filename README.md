# Laboratorio de Cocreación

🗺️ **Mapa en vivo:** https://complexluise.github.io/laboratorio-cocreacion-empalme-colombia/

Repo de trabajo del laboratorio: acá **construimos el lab y todo lo necesario**. El fin es un
**mapa navegable** de la política pública para que la gente **explore y cocree** sobre ella.
Hoy están el **núcleo conceptual** (ontología + teoría política + contrato de datos), la
**extracción** (ingesta de informes de empalme del DNP) y la **actividad del seminario**
documentada, y el **explorador** de la red (Svelte) publicado en GitHub Pages.

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
| `packages/red/` | `@laboratorio/red`: dominio de la red (tipos del contrato, filtros, foco de vecindario), sin DOM. |
| `web/` | `@laboratorio/web`: el explorador (Svelte 5 + Vite + D3). Ver `web/README.md`. |
| `scripts/` | `validar_contrato.py`: valida los schemas y el dataset de la web (gate de CI). |
| `docs/decisiones/` | **ADRs**: los porqués que condicionan el código. |
| `docs/FRONTERAS.md` | Las fronteras del repo: `extraccion/` → contrato `data/schema/` → `web/`, y `packages/red` → `web/`. |
| `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/` | La **disciplina de trabajo** (ver abajo). |
| `descargas/`, `extraido/`, `markdown/` | Informes de empalme del DNP: PDF/ZIP descargados, anexos descomprimidos y su conversión a markdown. *(no versionado; se regeneran)* |

### Sobre `extraccion/`
Del informe crudo del DNP → markdown → **políticas + instrumentos** de política pública:

- `empalme_scraper.py` — descarga informes de empalme (PDF + anexos) del Datálogo DNP, por sector.
- `empalme_to_markdown.py` — PDF/xlsx/xls → markdown (texto por página; resumen de hojas de cálculo).
- `ocr_gemini.py` — OCR para los PDF escaneados sin texto extraíble.
- `extraer_instrumentos.py` — markdown → **políticas + instrumentos** con NATO, modo de cambio,
  presencia por vigencia, evidencia y relaciones (nodos + aristas). Con `responseSchema` + validación.
- `aplicar_areas.py` — agrupa las políticas por gobierno en **áreas persistentes con objetivo por
  gobierno** según la curaduría `data/correcciones/<slug>/areas.yaml` (determinista; ADR-0004).
- `generar_web.py` — `objetos.json` → `web/src/lib/data/<slug>.json` (dataset commiteado que importa la web).
- *(deprecados: `extraer_ideas.py`, `consolidar_objetos.py` — la capa de "ideas" ya no se usa.)*

> Leen rutas relativas a la raíz del repo, así que ejecutarlos desde la raíz. Los que usan Gemini
> requieren `GEMINI_API_KEY` en `.env` (ver `.env.example`). El vocabulario de clasificación vive en
> `data/schema/taxonomia.yaml` y sale de `docs/encuadre-actividad-trama.md`.

## La aplicación

Un **explorador de la red** política↔instrumento (Svelte 5 + D3): instrumentos agrupados por
política, coloreados por su modo de cambio entre gobiernos y con forma según su tipo NATO. Hoy cubre
Ciencia y Tecnología.

```bash
pnpm install && pnpm dev     # desarrollo (Node >= 22)
pnpm build                   # web/dist: estático, abre en Pages o por file://
```

Interacción, estructura y de dónde sale el dato: [`web/README.md`](web/README.md).

## Cómo trabajamos

Con la disciplina de [`kybernetes`](https://github.com/Sostaina/kybernetes) (ver
[ADR-0001](docs/decisiones/ADR-0001-adoptar-disciplina-kybernetes.md) y
[ADR-0003](docs/decisiones/ADR-0003-preset-codigo-kybernetes.md)): GitFlow-lite (`dev` integra,
`main` publica), Conventional Commits, trabajo en issues, decisiones en ADRs, monorepo pnpm con TS
estricto, fronteras verificadas (dependency-cruiser), changesets, y un harness para
agentes en `.claude/` (skills del flujo, agentes `architect`/`coder`/`verifier`, `/retro-ciclo`).
Empezá por [`CONTRIBUTING.md`](CONTRIBUTING.md); si sos un agente, por [`AGENTS.md`](AGENTS.md).

## Estado

- ✅ Núcleo conceptual y contrato de datos (alineado al encuadre: NATO + modos de cambio + política).
- ✅ Ingesta de informes de empalme del DNP y conversión a markdown.
- ✅ Actividad del seminario documentada (`docs/encuadre-actividad-trama.md`).
- ✅ Pipeline `extraer_instrumentos.py` corrido sobre Ciencia y Tecnología (piloto/PoC).
- ✅ Aplicación: explorador de la red en **Svelte 5 + D3** (`web/` + `packages/red`), responsive (CTeI).
- 🔧 Afinar la resolución de entidades entre gobiernos (fusión de instrumentos/políticas equivalentes).
- 🔧 Escalar a más sectores (educación, cultura, agro) cuando el portal DNP esté disponible.
- ✅ Publicado en **GitHub Pages** (build con pnpm y deploy de `web/dist` en cada push a `main`).
