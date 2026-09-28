# Laboratorio de Cocreación

🗺️ **Sitio en vivo:** https://complexluise.github.io/laboratorio-cocreacion-empalme-colombia/

Repo de trabajo del laboratorio: acá **construimos el lab y todo lo necesario**. El fin es un
**mapa navegable** de la política pública para que la gente **explore y cocree** sobre ella.
Hoy están el **núcleo conceptual** (ontología + teoría política + contrato de datos), la
**extracción** (de los informes de empalme del DNP a políticas + instrumentos), la **actividad del
seminario** con su **bitácora**, y el **sitio** (Svelte) publicado en GitHub Pages: la actividad, la
red, un glosario y cómo lo hicimos.

> ⚠️ **Hecho con IA y aún sin revisar al 100 %.** La red, los textos y los materiales se produjeron con
> modelos de IA (Claude y Gemini) bajo la dirección del equipo; la revisión humana completa no está
> hecha. Revisarlo es parte del ejercicio: es una práctica de cómo colaborar con la máquina. El paso a
> paso, con los prompts que enviamos: [`docs/metodologia.md`](docs/metodologia.md)
> ([ADR-0006](docs/decisiones/ADR-0006-declarar-uso-de-ia-paso-a-paso.md)).

## Por qué

Un laboratorio de cocreación: un mapa que **responda preguntas** en vez de mostrar frases
sueltas. Las preguntas que guían todo (ver `docs/ontologia.md`):

1. **¿Qué hizo un gobierno?** — qué instrumentos de política pública estuvieron activos.
2. **¿Qué tuvo continuidad?** — qué persiste entre gobiernos.
3. **¿Cómo contrastan las ejecuciones?** — la trayectoria del mismo instrumento (continuó / se
   reconvirtió / se sumó / se terminó) y el objetivo que cada gobierno declara para cada política.

## El sitio

| Ruta | Qué hay |
|---|---|
| `#/` | **Landing**: la actividad como recorrido de 4 pasos (elegir → describir → buscar → concluir), la **bitácora** con sus descargas, la teoría en 5 ideas, la práctica «¿Qué le pasó a este instrumento?» y las preguntas que guían el mapa. |
| `#/red` | La **red bipartita** política↔instrumento. Cada política es un **área** con el objetivo que declara cada gobierno (el anillo del hub muestra cómo cambió); los instrumentos van coloreados por **modo de cambio** y con forma por **tipo NATO**. Filtros, buscador que navega y foco por política o instrumento. |
| `#/glosario[/<id>]` | Glosario de la ontología, la teoría, la bitácora, el proceso y las siglas. |
| `#/metodologia[/<seccion>]` | **Cómo lo hicimos**: la advertencia, cómo trabajamos con la IA, el paso a paso con los prompts que enviamos y lo que decidimos, las instrucciones que procesaron los informes y qué está revisado. |

En todas las páginas (menos «Cómo lo hicimos», que la desarrolla), una franja bajo la cabecera advierte que el contenido se hizo con IA y aún no
se revisó al 100 % (se puede plegar).

**Materiales del taller** (en `web/public/`, los genera el pipeline): la bitácora en blanco
(`bitacora-laboratorio.docx`), un ejemplo lleno de CTeI (`bitacora-ejemplo-ctei.docx`) y la red en
Excel (`red-ciencia-tecnologia.xlsx`). Hoy cubre **Ciencia, Tecnología e Innovación**. Detalle de
páginas, interacción y componentes: [`web/README.md`](web/README.md).

## Qué hay acá

| Carpeta / archivo | Qué es |
|---|---|
| `docs/ontologia.md` | El modelo: política (área con objetivo por gobierno) ↔ **instrumento de política pública**, diacronía. |
| `docs/teoria-politica.md` | Fundamentación (Hood; Lascoumes & Le Galès; Mahoney & Thelen; Pierson; Hall; Howlett & Cashore). |
| `docs/metodologia.md` | **Metodología y declaración de uso de IA**: el paso a paso con los prompts, qué hizo la IA y qué las personas, qué está revisado. |
| `docs/encuadre-actividad-trama.md` | La **actividad del seminario TRAMA**: cómo los grupos describen y comparan políticas, y la bitácora. |
| `docs/taxonomia.md` | *(deprecado)* la clasificación facetada de "ideas", como historia. |
| `docs/decisiones/` | **ADRs**: los porqués que condicionan el código. |
| `docs/FRONTERAS.md` | Las fronteras del repo: `extraccion/` → contrato `data/schema/` → `web/`, y `packages/red` → `web/`. |
| `data/schema/taxonomia.yaml` | Vocabulario controlado (fuente única de verdad de los enums). |
| `data/schema/*.schema.json` | Contratos de datos: `objeto` (el dataset: políticas + instrumentos + relaciones) y `bitacora` (aportes de los grupos). `idea` y `comparacion` están deprecados. |
| `data/correcciones/<slug>/` | Curaduría versionada: `areas.yaml` (las áreas de política; ADR-0004) y el overlay de correcciones. |
| `data/bitacoras/` | Bitácoras de los grupos convertidas a JSON (`<slug>/<grupo>.json`; ADR-0005). |
| `extraccion/` | Scripts de ingesta y extracción (ver abajo). |
| `packages/red/` | `@laboratorio/red`: dominio de la red (tipos del contrato, filtros, buscar, foco de vecindario), sin DOM. |
| `web/` | `@laboratorio/web`: el sitio (Svelte 5 + Vite + D3). Ver `web/README.md`. |
| `scripts/` | `validar_contrato.py`: valida schemas, dataset de la web, bitácoras y los materiales de `web/public/` (gate de CI). |
| `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/` | La **disciplina de trabajo** (ver abajo). |
| `descargas/`, `extraido/`, `markdown/`, `data/sectores/` | Informes del DNP (PDF/ZIP, anexos, markdown) y salidas intermedias del pipeline. *(no versionado; se regeneran)* |

### Sobre `extraccion/`
Del informe crudo del DNP → markdown → **políticas + instrumentos** → áreas → web:

```
empalme_scraper → empalme_to_markdown (+ ocr_gemini) → extraer_instrumentos → aplicar_correcciones
  → aplicar_areas → generar_web            (+ bitacora y red_excel: los materiales del taller)
```

- `empalme_scraper.py` — descarga informes de empalme (PDF + anexos) del Datálogo DNP, por sector.
- `empalme_to_markdown.py` — PDF/xlsx/xls → markdown (texto por página; resumen de hojas de cálculo).
- `ocr_gemini.py` — OCR para los PDF escaneados sin texto extraíble.
- `extraer_instrumentos.py` — markdown → **políticas + instrumentos** con NATO, modo de cambio,
  presencia por vigencia, evidencia y relaciones (Gemini, con `responseSchema` + validación).
- `aplicar_correcciones.py` — aplica el overlay verificado a mano (`data/correcciones/<slug>/`).
- `rebuild-ctei-claude.workflow.js` — **fuente vigente de CTeI**: reconstrucción multi-agente con
  Claude (políticas + instrumentos, modo de cambio por evidencia, narrativa por gobierno) que reemplaza
  a `extraer_instrumentos.py` + `aplicar_correcciones.py` para ese sector (Gemini resultó poco fiable).
- `aplicar_areas.py` — agrupa las políticas por gobierno en **áreas persistentes con objetivo por
  gobierno** según `data/correcciones/<slug>/areas.yaml` (determinista; ADR-0004).
- `generar_web.py` — `objetos.json` → `web/src/lib/data/<slug>.json` (dataset commiteado que importa la web).
- `bitacora.py` — la **bitácora** del grupo (ADR-0005): genera la plantilla .docx en blanco y el ejemplo
  CTeI (`web/public/`), lee las .docx llenas → `data/bitacoras/<slug>/<grupo>.json` y prueba la ida y
  vuelta (`generar` / `ejemplo` / `leer` / `probar`; sin API paga).
- `red_excel.py` — exporta la red del sector a `web/public/red-<slug>.xlsx` (Léeme, Resumen con
  fórmulas, Políticas, Instrumentos, Relaciones) para consultarla en el taller (determinista).
- *(deprecados: `extraer_ideas.py`, `consolidar_objetos.py` — la capa de "ideas" ya no se usa.)*

> Leen rutas relativas a la raíz del repo, así que ejecutarlos desde la raíz. Los que usan Gemini
> requieren `GEMINI_API_KEY` en `.env` (ver `.env.example`); ni esos ni el workflow de Claude se corren
> sin autorización del PO (son pagos). El vocabulario vive en `data/schema/taxonomia.yaml`.

## Cómo correr

```bash
pnpm install && pnpm dev     # el sitio en desarrollo (Node >= 22)
pnpm build                   # web/dist: estático, abre en Pages o por file://

# el gate (lo mismo que CI)
pnpm typecheck && pnpm test && pnpm lint:boundaries && pnpm build
uv run scripts/validar_contrato.py

# regenerar dataset y materiales (deterministas, sin API paga)
uv run extraccion/generar_web.py --slug ciencia-tecnologia
uv run extraccion/bitacora.py generar && uv run extraccion/bitacora.py ejemplo
uv run extraccion/red_excel.py --slug ciencia-tecnologia
```

Detalle en [`AGENTS.md`](AGENTS.md) §Cómo correr.

## Cómo trabajamos

Con la disciplina de [`kybernetes`](https://github.com/Sostaina/kybernetes) (ver
[ADR-0001](docs/decisiones/ADR-0001-adoptar-disciplina-kybernetes.md) y
[ADR-0003](docs/decisiones/ADR-0003-preset-codigo-kybernetes.md)): GitFlow-lite (`dev` integra,
`main` publica), Conventional Commits, trabajo en issues, decisiones en ADRs, monorepo pnpm con TS
estricto, fronteras verificadas (dependency-cruiser), changesets, y un harness para
agentes en `.claude/` (skills del flujo, agentes `architect`/`coder`/`verifier`/`editor`, `/retro-ciclo`).
Empezá por [`CONTRIBUTING.md`](CONTRIBUTING.md); si sos un agente, por [`AGENTS.md`](AGENTS.md).

## Estado

- ✅ Núcleo conceptual y contrato de datos (NATO + modos de cambio + política como área con objetivo
  por gobierno, ADR-0004).
- ✅ Ingesta de informes de empalme del DNP y conversión a markdown.
- ✅ Dataset de Ciencia y Tecnología: **14 áreas, 93 instrumentos, 22 relaciones** (reconstrucción con
  Claude + curaduría de áreas).
- ✅ Sitio en **Svelte 5 + D3** (`web/` + `packages/red`), responsive: landing con la actividad y la
  práctica, red, glosario.
- ✅ Bitácora .docx y su conversión a dato (ADR-0005); red en Excel para el taller.
- ✅ Metodología y declaración de uso de IA paso a paso, con los prompts, y advertencia en el sitio y
  el Excel (ADR-0006).
- 🔧 Revisión humana completa de la red y los textos (hoy parcial; ver `docs/metodologia.md`).
- ✅ Publicado en **GitHub Pages** (build con pnpm y deploy de `web/dist` en cada push a `main`).
- 🔧 Integrar las bitácoras del seminario al mapa (curaduría del equipo; "mapa v2").
- 🔧 Afinar la resolución de entidades entre gobiernos (fusión de instrumentos equivalentes).
- 🔧 Escalar a más sectores (Deporte y Agropecuario para el seminario; educación, cultura) cuando el
  portal DNP esté disponible: extraer y curar sus áreas.
