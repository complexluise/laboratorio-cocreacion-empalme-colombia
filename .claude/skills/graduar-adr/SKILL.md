---
name: graduar-adr
description: >-
  Toma una decisión que cuajó (en una Discussion o en charla con el PO) y la
  registra como ADR en el repo, vía PR a dev. Usala cuando el usuario quiere
  "registrar esta decisión", "graduar a ADR", dejar por escrito un porqué, o
  escribe /graduar-adr. Es la fase DECIDIR del flujo. El ADR vive en el repo
  (pasa por PR/CI), no en el Wiki ni en una Nota suelta.
---

Esta skill registra el *porqué* de una decisión. El PO considera los ADR un éxito y los
mantiene: son inmutables, fechados, direccionables. Viven en el **repo** (`docs/decisiones/`)
porque son parte del registro auditado que se mueve con el código.

## Antes de escribir: ¿es esto realmente un ADR nuevo?

Antes de despachar al `architect` a redactar, corré este test. Si 2+ respuestas son
"no / reenumera / 1 línea", **no es un ADR**, es ejecución o trabajo:

1. **¿La decisión NO está ya registrada en un ADR vigente?** Si la postura ya está
   declarada en un ADR previo y lo que vas a hacer es **ejecutar** parte de ella, eso es **ejecución con su propio ADR focalizado**, no un ADR
   paraguas que reenumere.
2. **¿Cambia algo verificable?** Si el ADR solo enumera cosas que ya se decidieron en
   otros lados (paraguas de N cambios), es trabajo disfrazado de decisión.
3. **¿Qué archivo cambia y por qué?** Si la respuesta es "ninguno, solo enumera", no es
   un ADR — es un índice.
4. **¿Se justifica un PR entero?** Si la respuesta cabe en una enmienda a un ADR
   existente o en una línea del contexto del issue, hacé eso. ADR nuevo = cada cambio de
   contrato testeable de forma aislada.

> **Ejemplos.** "ADR paraguas que reenumera los 5 sub-issues del epic #6" → NO ADR (ya
> decidido en ADR-0002; es trabajo). "Agregar un valor nuevo a `modo_cambio` en
> `taxonomia.yaml`" → SÍ (cambia el contrato y su porqué). "ADR para documentar el principio
> X" → SÍ si X es nuevo, NO si X ya vive en ADR previos.

## Cuándo usarla
- Una decisión ya está **tomada** (debatida en una Discussion o acordada con el PO) y hay que
  dejar el porqué por escrito. Se invoca con `/graduar-adr <tema>` o pidiéndolo.
- **No** la uses para abrir trabajo (eso es `/abrir-issue`) ni para debatir una decisión que
  todavía no se tomó (eso se debate en una Discussion primero).

## El procedimiento
1. **Architect redacta** — despachá `architect` para escribir el ADR siguiendo el formato del
   repo: leé `docs/decisiones/` para el **siguiente número**, el estado (`Propuesta` /
   `Aceptado`) y la plantilla (contexto · decisión · consecuencias · alternativas). Enlazá la
   Discussion/issue de origen. Actualizá el índice de `docs/decisiones/README.md`.
2. **Coherencia** — el architect chequea que el ADR no contradiga ADRs vivos ni el contrato
   (`data/schema/`, `docs/FRONTERAS.md`, `docs/ontologia.md`); si enmienda a otro ADR, decilo explícito ("enmienda 0009").
3. **PR a `dev`** — el ADR es un cambio del repo: commit `docs(adr): …` en Conventional
   Commits, PR `--base dev`, gate verde. (Como cualquier trabajo, no va directo a main.)
4. **Cerrá el origen** — comentá en la Discussion que la decisión se graduó al ADR `00NN` y
   marcala como resuelta.

## Cierra cuando
El ADR está en `dev` (vía PR) y la Discussion de origen quedó enlazada y cerrada. Reportá al
PO el número de ADR y el link al PR.

## No-negociables
- **El ADR va al repo, no al Wiki.** El Wiki es para mapa/guías; el porqué auditado vive con
  el código.
- **Solo se gradúa lo ya decidido.** Si todavía se está discutiendo, primero se cierra el
  debate (Discussion), después se gradúa.
- Numeración correlativa, estado explícito, origen enlazado. No rompas el append-only.
- El architect es dueño del ADR; no mezcles cambios de código en el mismo PR.
