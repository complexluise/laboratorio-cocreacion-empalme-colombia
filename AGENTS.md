# AGENTS.md — guía canónica para agentes

> Fuente de verdad operativa. Si sos agente (humano o máquina), leé esto **primero**.
> Dueño: 👥 (colectivo; PO: @complexluise). Disciplina: [`kybernetes`](https://github.com/Sostaina/kybernetes).

## Qué es el Laboratorio de Cocreación

- **Narrativa:** un mapa navegable de la política pública colombiana (hoy: Ciencia, Tecnología e
  Innovación) construido desde los **informes de empalme del DNP**, para responder: ¿qué hizo un
  gobierno? ¿qué tuvo continuidad? ¿cómo contrastan las ejecuciones? (ver `docs/ontologia.md`).
- **Frontera:** no evalúa gobiernos ni sirve documentos crudos; clasifica y conecta con el
  vocabulario de `data/schema/taxonomia.yaml`.
- **Objeto de dominio de primera clase:** el **instrumento de política pública** (nodo de la red),
  agrupado por **política** (red bipartita muchos-a-muchos), con `tipo_nato`, `modo_cambio` y
  narrativa por gobierno.

## Convenciones

- **Flujo:** GitFlow-lite (`dev`/`main`). `main` = lo publicado en GitHub Pages. Ver `CONTRIBUTING.md`.
- **Commits:** Conventional Commits, atómicos, en español, con `Refs #N`.
- **Trabajo:** vive en **issues** (epics con sub-issues). Nada de documentos sueltos de pendientes.
- **Decisiones:** ADR en `docs/decisiones/` (vía PR). Se gradúan con `/graduar-adr`.
- **Fronteras:** `extraccion/` produce, `data/schema/` es el contrato, `web/` consume. Ver
  `docs/FRONTERAS.md`.
- **Ritmo:** deliberado. Encuadrar antes de ejecutar; retroalimentar al cerrar (`/retro-ciclo`).

## Estructura del repo

```
extraccion/       # sistema viable 1: ingesta DNP -> markdown -> politicas + instrumentos (Python, uv)
data/schema/      # la FRONTERA: contrato de datos (JSON Schema) + vocabulario (taxonomia.yaml)
data/correcciones/# overlay de correcciones verificadas a mano
scripts/          # utilidades del repo (validar_contrato.py: gate de la frontera)
web/              # sistema viable 2: el explorador de la red (consume el dataset)
docs/             # ontologia, teoria, taxonomia, encuadre, FRONTERAS, decisiones/ (ADRs)
.claude/          # skills (flujo), agents (architect/coder/verifier), commands (retro-ciclo), settings
.github/          # workflows (ci, pages), CODEOWNERS, templates
```

## Cómo correr

```bash
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web
python -m http.server                                        # servir y abrir /web/
```

**Gate de CI:** `ci.yml` corre en cada PR a `dev`/`main`: compila `extraccion/` y `scripts/`, y
`uv run scripts/validar_contrato.py` valida que los contratos (`data/schema/`) sean JSON Schema
válidos y que `taxonomia.yaml` parsee. El gate **crece con
el código**: cuando `web/` tenga build/tests propios (epic #6), se suman al mismo workflow.

## Code style

- **Python:** scripts autocontenidos con dependencias inline (PEP 723) y `uv run`. Stdlib cuando
  alcanza. Docstring de módulo con qué hace + uso.
- **Web:** ver `web/README.md` (y el epic #6 para la reescritura en Svelte).
- **Idioma:** código, docs, commits e issues en español.

## Notas de desarrollo

- **Nunca corras llamadas pagas** (Gemini, workflows multi-agente de reconstrucción) sin
  autorización explícita del PO. Probá la lógica con datos ya versionados.
- `data/sectores/`, `descargas/`, `extraido/`, `markdown/` no se versionan (se regeneran).
  `web/datos.js` **sí** se versiona a propósito.
- Archivos calientes (serializar trabajo que los toque): `web/app.js`, `web/datos.js`,
  `data/schema/objeto.schema.json`, `data/schema/taxonomia.yaml`, lockfiles.
- Al paralelizar trabajo entre agentes: archivos/fronteras disjuntas para evitar conflictos.

## Ejecución concurrente y testing

- Paralelizá solo issues que tocan archivos disjuntos (ver skill `feature-cycle` §Archivos calientes).
- Los agentes escriben en el worktree de la sesión; briefeá rutas absolutas.
