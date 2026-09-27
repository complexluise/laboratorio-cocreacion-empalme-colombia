# Mapa de instrumentos (PoC)

Prueba de concepto del mapa del laboratorio: una **red bipartita** entre **políticas públicas** (hubs)
e **instrumentos**. Un instrumento puede servir a varias políticas — los instrumentos compartidos
enlazan la red. Los instrumentos van coloreados por su **modo de cambio** entre los dos gobiernos y
con la forma según su **tipo NATO**. Un **selector de vigencia** permite ver 2018-2022, 2022-2026 o
ambos. Render con **D3.js** (vendorizado en `vendor/`, sin CDN en runtime).

## Cómo abrirlo
Doble clic en `web/index.html` (abre por `file://`, sin servidor). El dato va horneado en
`datos.js` (`window.DATASET`) para evitar CORS.

Alternativa servida: `python -m http.server` desde la raíz del repo y abrir
`http://localhost:8000/web/` (en ese caso `app.js` cae al `fetch` del `objetos.json`).

## Cómo regenerar el dato
El mapa lee `datos.js`, generado desde el dataset del pipeline:

```
uv run extraccion/extraer_instrumentos.py --slug ciencia-tecnologia --match Ciencia
uv run extraccion/aplicar_correcciones.py --slug ciencia-tecnologia   # overlay verificado
uv run extraccion/generar_web.py --slug ciencia-tecnologia
```

Las correcciones verificadas contra los informes (revisión adversarial) viven versionadas en
`data/correcciones/ciencia-tecnologia/` (`correcciones.yaml` + `narrativa.json`, con `revision.json`
como evidencia). `aplicar_correcciones.py` las funde sobre `objetos.json` de forma determinista, así
no las pisa una nueva corrida de Gemini.

`data/sectores/` está gitignoreado (se regenera); **`web/datos.js` se versiona a propósito** para que
el PoC abra sin correr nada.

## Interacción
- **Vigencia**: selector para ver solo 2018-2022, solo 2022-2026, o ambos gobiernos.
- **Nodos**: círculo grande = política; símbolo = instrumento.
- **Color** (instrumentos) = modo de cambio (continuidad estable · conversión · estratificación · terminación · reversión · deriva).
- **Forma** = tipo NATO (◆ autoridad · ▲ tesoro · ■ nodalidad · ● organización · ★ objetivo de política).
- **Aristas grises** = pertenencia instrumento↔política (la red bipartita, siempre visible).
- **Relaciones instrumento-instrumento** (habilita/financia/depende-de/encadena): ocultas por defecto; toggles por tipo.
- **Clic** en instrumento: panel con políticas que sirve, presencia por vigencia, entidades y evidencia (páginas/cifras). Clic en política: su objetivo e instrumentos.
- Arrastrar nodos, zoom/pan con la rueda, "Ajustar vista" para resetear.

## Archivos
- `index.html` — estructura, leyenda, toggles.
- `estilos.css` — estilos de página, panel y nodos SVG.
- `app.js` — carga `window.DATASET`, simulación de fuerzas D3 agrupada por política, interacción.
- `datos.js` — dataset horneado (generado).
- `vendor/d3.min.js` — D3 vendorizado.
