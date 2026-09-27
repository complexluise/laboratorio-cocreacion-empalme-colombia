# Mapa de instrumentos (PoC)

Prueba de concepto del mapa del laboratorio: un grafo de **instrumentos de política pública**
agrupados por **política**, coloreados por su **modo de cambio** entre los dos gobiernos y con la
forma según su **tipo NATO**. Render con **D3.js** (vendorizado en `vendor/`, sin CDN en runtime).

## Cómo abrirlo
Doble clic en `web/index.html` (abre por `file://`, sin servidor). El dato va horneado en
`datos.js` (`window.DATASET`) para evitar CORS.

Alternativa servida: `python -m http.server` desde la raíz del repo y abrir
`http://localhost:8000/web/` (en ese caso `app.js` cae al `fetch` del `objetos.json`).

## Cómo regenerar el dato
El mapa lee `datos.js`, generado desde el dataset del pipeline:

```
uv run extraccion/extraer_instrumentos.py --slug ciencia-tecnologia --match Ciencia
uv run extraccion/generar_web.py --slug ciencia-tecnologia
```

`data/sectores/` está gitignoreado (se regenera); **`web/datos.js` se versiona a propósito** para que
el PoC abra sin correr nada.

## Interacción
- **Color** = modo de cambio (continuidad estable · conversión · estratificación · terminación · reversión · deriva).
- **Forma** = tipo NATO (◆ autoridad · ▲ tesoro · ■ nodalidad · ● organización · ★ objetivo de política).
- **Relaciones**: ocultas por defecto; se muestran con los checkboxes por tipo.
- **Clic** en un nodo: panel con política, presencia por vigencia, entidades y evidencia (páginas y cifras).
- Arrastrar nodos, zoom/pan con la rueda, "Ajustar vista" para resetear.

## Archivos
- `index.html` — estructura, leyenda, toggles.
- `estilos.css` — estilos de página, panel y nodos SVG.
- `app.js` — carga `window.DATASET`, simulación de fuerzas D3 agrupada por política, interacción.
- `datos.js` — dataset horneado (generado).
- `vendor/d3.min.js` — D3 vendorizado.
