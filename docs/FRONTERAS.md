# Fronteras — sistemas viables y su gobernanza

En el **Viable System Model** (Beer) un sistema viable tiene una **frontera** que lo separa de su
entorno, y la **recursión** significa que cada subsistema es a su vez viable, con *su propia*
frontera. En este repo hay tres sistemas viables y dos fronteras entre ellos:

```
extraccion/  ──produce──►  data/schema/ (CONTRATO)  ◄──consume──  web/  (@laboratorio/web)
 (Python, uv)               objeto.schema.json                     ▲  Svelte 5 + D3
                            taxonomia.yaml                         │  importa por nombre
                                                                   │
                                          packages/red (@laboratorio/red) ── frontera: `exports`
                                          dominio de la red, sin DOM ni D3
```

- **Frontera 1 — el contrato de datos** (`extraccion/` → `web/`): un dataset conforme a
  `data/schema/objeto.schema.json`, copiado a `web/src/lib/data/<slug>.json` por `generar_web.py`.
  Del mismo modo, `extraccion/bitacora.py` escribe las plantillas de la bitácora en `web/public/`
  (`bitacora-laboratorio.docx`, `bitacora-ejemplo-ctei.docx`): productor → artefacto estático que
  la web solo enlaza. En sentido inverso, lee las .docx llenas a `data/bitacoras/<slug>/*.json`
  conforme a `bitacora.schema.json` (ADR-0005); eso no cruza a la web.
- **Frontera 2 — `exports` de `@laboratorio/red`** (`packages/red` → `web/`): tipos del contrato,
  `construirRed`, `vecindario`. La web no entra a `packages/red/src/` por ruta.

## Las reglas

1. **De la extracción a la web cruza el dato, no el código.** La web (y `packages/`) nunca importa
   ni ejecuta `extraccion/`; `extraccion/` no conoce detalles de render (colores, layout, física).
   La única excepción es el gate: `scripts/validar_contrato.py` ejecuta `extraccion/bitacora.py`
   para probar la ida y vuelta de la plantilla (validar el pipeline no es consumirlo).
2. **Vocabulario único.** Los enums (`tipo_nato`, `modo_cambio`, …) salen de `taxonomia.yaml` (y se
   reflejan en los tipos de `packages/red`). La web puede *mapearlos* a colores/formas, pero no
   inventar valores nuevos.
3. **Los paquetes se cruzan por nombre y por `exports`.** El dominio no conoce a su consumidor:
   `packages/*` nunca importa de `web/`. Cambiar la API de un paquete lleva changeset.
4. **Dentro de `web/`, la lógica no depende de componentes.** `lib/state`, `lib/data` y
   `lib/graph/*.ts` no importan `.svelte`.
5. **Cambiar el contrato es explícito.** PR propio (`feat(schema)`/`refactor(schema)`), productor
   (`extraccion/`) y consumidores (tipos de `packages/red`, `web/`) ajustados en el mismo
   movimiento, y ADR si cambia el porqué.

## Cómo se enforcea

- **`pnpm lint:boundaries`** (`.dependency-cruiser.cjs`, en CI): `no-circular`,
  `frontera-entre-paquetes`, `web-cruza-por-nombre`, `paquetes-no-dependen-de-web`,
  `nadie-importa-extraccion`, `logica-sin-componentes` (error) y `no-huerfanos` (warn). Resuelve
  con `tsconfig.depcruise.json`, que suma el alias `$lib` de la web: sin él, las aristas vía `$lib`
  quedaban sin resolver y no se chequeaban.
- **`uv run scripts/validar_contrato.py`** (en CI): cada `*.schema.json` es un JSON Schema válido,
  `taxonomia.yaml` parsea, **cada `web/src/lib/data/*.json` cumple `objeto.schema.json`** y cada
  `data/bitacoras/<slug>/*.json` cumple `bitacora.schema.json`; además corre la ida y vuelta de la
  plantilla .docx y chequea que las de `web/public/` estén al día con `extraccion/bitacora.py`.
  `extraer_instrumentos.py` además valida su salida al producirla.
- **Revisión**: el `verifier` chequea que un PR no cruce fronteras salvo PR de contrato.

## Por qué (cibernética)

La frontera es donde se gestiona la **variedad** (Ashby): el contrato **atenúa** la variedad interna
del pipeline (modelos, reintentos, correcciones) y **amplifica** solo lo necesario hacia la web.
Fronteras nítidas = sistema gobernable = podemos reescribir la UI sin tocar ni la extracción ni el
dominio de la red. Decisión: [ADR-0003](decisiones/ADR-0003-preset-codigo-kybernetes.md).
