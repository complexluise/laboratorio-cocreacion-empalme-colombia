# Bitácoras integradas

Una carpeta por sector (`<slug>/`) con un JSON por grupo, producido por
`uv run extraccion/bitacora.py leer <bitacora.docx> --slug <slug>` a partir de la plantilla que los
grupos llenan (`web/public/bitacora-laboratorio.docx`). Contrato: `data/schema/bitacora.schema.json`
(ADR-0005). `uv run scripts/validar_contrato.py` valida todo lo que haya aquí.

Convención de celdas: texto = lo que escribió el grupo; «Sin dato» → `null` (hueco declarado; la
aclaración de «Sin dato: …» va a `notas`); celda vacía → clave omitida (en los datos del grupo, `""`
o `[]`) y listada en `sin_llenar`.
Hoy no hay bitácoras integradas: se suman después de la sesión 1.
