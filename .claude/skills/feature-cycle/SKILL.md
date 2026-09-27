---
name: feature-cycle
description: >-
  Orquesta un cambio sustancial con rigor — Product Owner (humano) → architect →
  coder → verifier → architect — en cualquier repo. Usala cuando el usuario pide
  implementar un feature/fix con encuadre, revisión y sincronía de docs (o escribe
  /feature-cycle), sobre todo en trabajo no trivial. Salteá para ediciones de una
  línea o triviales.
---

Esta skill codifica una forma de trabajar. El humano es el **Product Owner** y decide;
vos (la sesión principal) sos el **orquestador / tech-lead** que despacha tres subagentes
— `architect`, `coder`, `verifier` — e integra su trabajo. Funciona en CUALQUIER repo:
los subagentes descubren las convenciones del repo (no asumen stack ni docs).

## Cuándo usarla
- Cambios sustanciales o riesgosos, cualquier cosa que toque arquitectura/contratos/
  decisiones, o cuando el usuario quiere el trabajo con revisión + sincronía de docs.
  Se invoca con `/feature-cycle <descripción>` o describiendo el trabajo.
- **No la sobre-apliques:** un one-liner o una edición trivial NO necesita tres subagentes
  — hacelo directo. Escalá la ceremonia al tamaño de la tarea.

## El ciclo
1. **Encuadre (architect)** — para todo lo grande/ambiguo o que toque diseño/contratos:
   despachá `architect` para encuadrar contra los docs del repo, marcar decisiones y
   necesidades del registro de decisiones, y proponer cómo partir si es >1 ciclo. **Traé
   las decisiones reales al PO (el humano) y ESPERÁ su respuesta — no las adivines.**
   (Salteá para trabajo claramente chico; decilo.)
2. **Implementar (coder)** — despachá `coder` con la tarea bien acotada + los punteros
   relevantes (qué docs leer). Código + tests.
3. **Verificar (verifier)** — despachá `verifier` para revisar el diff del árbol y correr
   los tests/build del repo. Read-only; devuelve veredicto + hallazgos.
4. **Loop** — si el verifier marca bugs (crítico/alto), volvé a despachar al `coder` con
   esos hallazgos. Repetí verificar hasta PASA (o hasta que lo pendiente sea bajo/opcional
   que el PO acepte). Los fixes triviales que el verifier ya especificó exactos, el
   orquestador los puede aplicar directo (no gastes un subagente para una línea).
5. **Sincronía de docs (architect)** — una vez que el código pasa, despachá `architect`
   para que actualice los docs según el cambio, **escribiendo cada género en su destino**
   (partición rectora del flujo):
   - **Contrato** (API/ARCHITECTURE/PRD) → en el **repo**, en este mismo PR (se mueve en
     lockstep con el código).
   - **Decisión** que se haya tomado → **ADR en el repo** (`/graduar-adr` si conviene PR
     aparte).
   - **Pensamiento / debate / bitácora** → **GitHub Discussions**, **no** una Nota-archivo.
   - **Trabajo / estado / seguimientos** → **issues**, no un `.md` de "lo que falta".
   - El **ROADMAP general / guías** → **Wiki** (no detalle de estado en el repo).
   No se crean Notas-archivo nuevas.
6. **Reporte al PO** — resumí qué se hizo, el veredicto, qué docs se tocaron, el estado del
   árbol. **NO commitees** salvo que el humano lo pida; ofrecé el commit.

## Principios (los no-negociables)
- El humano es el PO y decide. Surfacá las bifurcaciones reales; no decidas el alcance por él.
- Diagnosticá antes de arreglar. Cuando algo "se ve mal", investigá y reportá la causa raíz
  primero.
- El verifier es read-only por diseño (no puede "arreglar para que pase"); el architect es
  dueño de los docs, no del código; el coder es dueño del código, no de los docs. **Las
  fronteras son el punto.**
- Cada subagente corre en contexto aislado y comparte el árbol de trabajo (el coder escribe,
  el verifier lee `git diff`) — briefeá a cada uno (no ven esta conversación).
- Sé honesto: reportá trade-offs, pasos salteados y lo que quedó sin hacer, sin adornos.

## Adaptación por repo (importante)
Nada acá asume un lenguaje, gestor de paquetes, framework de tests ni layout de docs. Los
subagentes leen `CLAUDE.md`/`CONTRIBUTING`/`README` y los manifiestos del repo para descubrir
el comando de test, el de build, la filosofía de testing y el registro de decisiones (si hay).
Si un repo define sus propios subagentes `architect`/`coder`/`verifier` a nivel de proyecto,
esos ganan (project > user) — así un repo puede afinar los roles sin tocar esta skill global.

## Archivos calientes y paralelización (regla dura)

Antes de despachar N issues en paralelo, **mapear qué archivos toca cada uno**. La regla:

- **Dos issues que tocan el mismo archivo caliente → serializar** (mergear uno, rebasar
  el siguiente). Archivos calientes típicos: índices (`__init__.py`, `cli/__init__.py`,
  routers, registries), archivos de envelope/contrato compartido, manifests, el lockfile
  (`uv.lock`/`package-lock.json`).
- **Issues sobre archivos disjuntos → se pueden paralelizar** con un fan-out de N
  coder/verifier, siempre que el `architect` haya confirmado que el solapamiento es cero.
- **La verificación de archivos disjuntos es barata** (`git diff --name-only origin/dev..HEAD`
  al final de cada PR). Es el gate de "podemos mergear en paralelo".
- **Si hay duda → serializar.** El costo de un merge hell es mayor que el costo de un
  ciclo secuencial.
