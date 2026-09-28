# ADR-0006: Declarar el uso de IA, con git como evidencia y una advertencia de revisión parcial

- **Estado:** aceptada
- **Fecha:** 2026-09-28
- **Decide:** PO (@complexluise) — issue #37

## Contexto

Casi todo el laboratorio lo produjo IA bajo la dirección del equipo:
- la red, extraída primero con Gemini y luego con agentes de Claude;
- el código, los textos del sitio, el glosario y los materiales.

La revisión humana está **incompleta**. Por ejemplo, hay instrumentos cuya narrativa contradice su
`modo_cambio`. Publicar esto sin decirlo presentaría un borrador como si fuera un análisis revisado.

A la vez, el PO encuadra el ejercicio como una práctica de **cómo interactuar con la máquina y
elaborar artefactos para colaborar**. La participación de la IA no es un detalle que se disculpa: es
parte de lo que el laboratorio muestra.

El historial de git ya registra esa colaboración:
- cada commit con IA lleva el trailer `Co-Authored-By`;
- el agente firma sus commits como `Claude`;
- las integraciones son merges de PR;
- las versiones son tags;
- las decisiones son ADR.

## Decisión

- **Metodología pública.** La página `#/metodologia` («Cómo lo hicimos») y `docs/metodologia.md`
  describen el flujo en nueve fases. Cada fase dice qué hicieron las personas, qué hizo la máquina y
  qué rastro dejó en git. El taller cierra el bucle hacia la revisión. Las fases viven en
  `web/src/lib/metodologia.ts`.
- **Git es la evidencia.** `scripts/evidencia_git.py` lee el historial y escribe
  `web/src/lib/evidencia.json`, sin datos escritos a mano:
  - commits por tipo de autoría (agente, persona con IA coautora, persona sola);
  - PR integrados, releases y ADR;
  - los **hitos** de cada fase: hashes curados en el script, con autor, fecha y coautoría tomados de
    git.

  El archivo vive fuera de `lib/data/`, porque no es un dataset del contrato. Es una **foto**: se
  regenera al cortar cada release. Los tests exigen que toda fase ocurrida tenga un hito y que la
  fase por venir (el taller) no tenga ninguno.
- **Declaración de uso de IA.** Nombra las herramientas por familia: Claude (Anthropic, vía Claude
  Code) y Gemini (Google). La versión exacta queda en los trailers. La declaración dice:
  - qué hizo la IA y qué hicieron las personas;
  - qué no decide la IA: no evalúa gobiernos, no publica sin PR aprobado, no rellena huecos y no
    escribe las bitácoras;
  - el **estado de revisión por capa** (`CAPAS`), en lugar de una cifra global.
- **Advertencia visible** con el texto del PO: el contenido se generó con IA y aún no se revisó al
  100 %, y revisarlo es parte del ejercicio.
  - En la web va como franja bajo la cabecera de todas las páginas (`AvisoIA.svelte`). Se puede
    plegar; la preferencia queda en el navegador de cada persona. En la metodología va desarrollada.
  - En el Excel de la red va en la hoja Léeme.
  - La bitácora en blanco no la lleva, porque su contenido lo escriben los grupos. El ejemplo CTeI
    tampoco, porque lo escribió el equipo.
- **Canal de errores:** avisar en el taller o abrir un issue en GitHub.
- **Qué no dice git**, declarado en la misma página:
  - de quién fue cada idea (las conversaciones no quedan en el repo);
  - cuánto se revisó un texto;
  - quién pulsó «merge». Los PR se integran con la cuenta del PO, a veces por el agente con
    autorización explícita.
- **Regla hacia adelante:** todo commit en el que participe IA lleva su `Co-Authored-By`. Sin eso,
  la evidencia deja de ser completa.

## Consecuencias

- **Habilita:**
  - que cualquiera verifique la participación de la IA con un solo `git log`;
  - leer la red como un borrador verificable y el taller como la revisión que falta;
  - que el glosario explique el vocabulario del proceso (grupo «Cómo lo hicimos»).
- **Cuesta / cierra:**
  - la evidencia envejece con cada commit y hay que regenerarla en cada release (paso en la skill
    `release`);
  - un hito que desaparezca de la historia rompe el script, y eso es intencional;
  - `CAPAS` se actualiza a mano cuando avance la revisión humana. Declarar una capa «revisada» exige
    que lo esté;
  - la franja ocupa una fila en móvil hasta que se pliega.
- **Frontera afectada:**
  - ninguna del contrato de datos;
  - `scripts/` gana un generador que escribe en `web/src/`, como `extraccion/generar_web.py`;
  - la web no importa del pipeline, solo lee el JSON.
