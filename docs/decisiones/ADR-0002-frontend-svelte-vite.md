# ADR-0002: Frontend del explorador en Svelte 5 + Vite

- **Estado:** aceptada — enmendada por [ADR-0003](ADR-0003-preset-codigo-kybernetes.md)
- **Fecha:** 2026-09-27
- **Decide:** PO (@complexluise) — encuadre del epic #6

## Contexto

El PoC vanilla en `web/` (HTML/CSS/D3 vendorizado) cumplió como prueba, pero no es mantenible por
componentes, no es responsive, el panel se solapa con el grafo, la física tiene demasiada gravedad,
el filtro por tipo de relación no ayuda a analizar y arrastra la identidad TRAMA, que ya no
corresponde. El modelo de datos (red bipartita política↔instrumento, `modo_cambio`, `tipo_nato`,
narrativa por gobierno) **no** cambia.

## Decisión

Reescribimos el explorador como **SPA estática en Svelte 5 (runes) + Vite**, con `base: './'` (sirve
en el subpath de Pages y por `file://`). **D3 entra como módulos npm**, bundleado: sin CDN y sin
`vendor/`. El dato deja de ir horneado en `datos.js` y pasa a un **JSON commiteado** en
`web/src/lib/data/`, importado por el bundle. Pages publica `web/dist`.

Identidad **"Laboratorio de Cocreación"** (chrome neutro; se conservan los colores de dato).
Controles: vigencia + buscar + enfocar por política + filtrar por modo de cambio + filtrar por tipo
NATO; se elimina el filtro por tipo de relación. Interacción clave: **foco de vecindario** al
seleccionar.

## Consecuencias

- **Habilita:** componentes testeables (lógica de filtros/foco con tests), responsive, build
  reproducible con lockfile, gate de CI con build + tests de la web.
- **Cuesta / cierra:** aparece un toolchain Node (npm + lockfile) y un paso de build antes del
  deploy; `file://` depende de `base: './'`.
- **Frontera afectada:** `web/` (consumidor). El contrato `data/schema/` no cambia;
  `generar_web.py` pasa a escribir el JSON en `web/src/lib/data/`.

## Alternativas consideradas

- Mantener vanilla + D3 — descartada: no escala en componentes ni responsive.
- React/Vue — descartadas: más runtime y ceremonia para una SPA chica; Svelte compila a poco JS.
