# ADR-0005: La bitácora es un .docx no pre-llenado que el equipo convierte a dato estructurado

- **Estado:** aceptada
- **Fecha:** 2026-09-27
- **Decide:** PO (@complexluise) — issue #26

## Contexto

En la sesión 1 cada grupo describe una política pública (área, ADR-0004) entre los dos gobiernos y
registra lo que encuentra en una **bitácora** (`docs/encuadre-actividad-trama.md` §6). Entre sesiones
el equipo tiene que **integrar** esas bitácoras al mapa: si llegan como texto libre en papel o en
documentos sueltos, la integración es transcripción manual, lenta y con pérdida.

El encuadre v0.4 suponía una bitácora **pre-llenada con lo que sabe la red** y un formulario en la
app (épico #26). El PO lo revisó: el pre-llenado orienta la lectura del grupo hacia la de la red, y
los participantes trabajan con naturalidad en Word o Google Docs, no en un formulario nuevo.

## Decisión

- La bitácora es un **.docx con el formato listo para llenar, sin pre-llenar**. Se descarga desde la
  landing (`web/public/bitacora-laboratorio.docx`, con un ejemplo lleno de CTeI en
  `web/public/bitacora-ejemplo-ctei.docx`) y se llena en Word o Google Docs. La red es **consulta**
  para ubicarse, no el punto de partida del texto.
- El **equipo recoge los .docx y los convierte en dato estructurado**:
  `uv run extraccion/bitacora.py leer <grupo>.docx --slug <slug>` → `data/bitacoras/<slug>/<grupo>.json`.
- **Convención de celdas**, igual en la plantilla, el lector y el contrato:
  - texto → lo que escribió el grupo;
  - «Sin dato» → `null`: **hueco de información declarado** (la fuente no lo dice; es un hallazgo);
  - celda vacía → **no llenada**: la clave se omite y su ruta se lista en `sin_llenar`.
- **Lectura por etiquetas, no por posición.** Cada tabla se reconoce por el texto de su primera celda
  y cada fila por su etiqueta; se toleran mayúsculas, tildes, filas agregadas o vacías y varios
  párrafos. Un documento que no es la bitácora se rechaza con un mensaje claro.
- **Definición única de la estructura** en `extraccion/bitacora.py`: la misma sirve para generar la
  plantilla, llenarla (ejemplo y pruebas) y leerla. La plantilla lleva versión (`VERSION`, impresa en
  el pie).
- **Contrato:** `data/schema/bitacora.schema.json` (una bitácora por grupo y política: ubicación y
  avance, instrumentos y las siete subcategorías por vigencia; comparabilidad, hallazgos, hipótesis y
  fuentes complementarias). Si el nombre de la política coincide con un área del dataset del sector,
  se anota su `id`.
- **El gate del contrato** (`uv run scripts/validar_contrato.py`) valida cada
  `data/bitacoras/<slug>/*.json` contra el schema, corre la ida y vuelta (generar → llenar con el
  ejemplo CTeI → leer = mismo JSON) y verifica que las .docx publicadas en `web/public/` estén al día
  con la estructura actual.

## Consecuencias

- **Habilita:** integrar los aportes del seminario como dato (base del "mapa v2" de la sesión 2);
  distinguir un hueco declarado de un olvido; que los grupos trabajen con herramientas conocidas y
  sin cuenta en ninguna app.
- **Cuesta / cierra:** los **títulos de tablas y de filas no se deben editar** (la landing y la
  plantilla lo advierten); cambiar la estructura obliga a subir `VERSION` (schema `version: const`) y
  regenerar las .docx publicadas; una bitácora llenada con una plantilla anterior puede dejar de
  leerse, así que la estructura se congela mientras haya grupos llenando. La
  vinculación con el dataset es por nombre (solo `politica.id`); llevar los aportes a
  `dataset.json`/`areas.yaml` sigue siendo curaduría del equipo.
- **Frontera afectada:** contrato nuevo `data/schema/bitacora.schema.json` y carpeta
  `data/bitacoras/`. `extraccion/bitacora.py` escribe las plantillas en `web/public/` como artefacto
  estático (igual que `generar_web.py` con el dataset); la web solo las enlaza, no importa del
  pipeline. Sin cambios en `@laboratorio/red`.

## Alternativas consideradas

- **Formulario en la app con export JSON** (el épico #26 original) — descartada por el PO: más
  superficie en la web y los grupos trabajan mejor en un procesador de texto.
- **Plantilla pre-llenada desde la red** — descartada: sesga la lectura del grupo hacia la de la red
  (verificar en vez de describir) y el PO la prefiere en blanco.
- **Digitalización manual** de bitácoras en papel o documento libre — descartada: lenta, con pérdida
  y sin forma de distinguir un hueco declarado de una celda sin llenar.
