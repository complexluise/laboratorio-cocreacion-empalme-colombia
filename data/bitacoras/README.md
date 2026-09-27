# Bitácoras integradas

Una carpeta por sector (`<slug>/`) con un JSON por grupo, producido por
`uv run extraccion/bitacora.py leer <bitacora.docx> --slug <slug>` a partir de la plantilla que los
grupos llenan (`web/public/bitacora-laboratorio.docx`). Contrato: `data/schema/bitacora.schema.json`
(ADR-0005). `uv run scripts/validar_contrato.py` valida todo lo que haya aquí.
