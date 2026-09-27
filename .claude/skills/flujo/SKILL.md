---
name: flujo
description: >-
  El mapa ejecutable del proceso de trabajo del PO — orquesta cuándo usar cada
  comando del flujo (abrir-issue, graduar-adr, feature-cycle, release, hotfix,
  cosechar-sesion, retro-ciclo) y dónde vive cada género de información. Usala cuando no está
  claro qué paso toca, cuando arranca trabajo nuevo y hay que enrutarlo, o cuando
  el usuario escribe /flujo. No hace el trabajo: decide y despacha al comando
  correcto.
---

Esta skill es el **mapa** del proceso, no el motor. Dado dónde estás, te dice qué comando
corresponde y te despacha a él. El humano es el PO y decide; vos enrutás.

## Los géneros y dónde vive cada uno (partición rectora)
| Género | Dónde vive | ¿PR/CI? |
|---|---|---|
| Pensamiento / debate | **GitHub Discussions** | no |
| Trabajo / estado | **Issues + Project + Milestones** | no |
| Decisión (por qué) | **ADR en el repo** (`docs/decisiones/`) | sí |
| Contrato (API, ARCHITECTURE, PRD) | **repo** | sí |
| Mapa / guías / glosario / onboarding | **Wiki** | no |

Regla: lo que debe moverse en lockstep con el código (contrato, ADR) se queda en el repo y
pasa por PR. El Wiki es para lo estable y narrativo. **No se crean Notas-archivo nuevas.**

## Las 7 fases y su comando
```
(1) DIVERGIR ──madura──► (2) DECIDIR ──► (3) ENCUADRAR ──► (4) EJECUTAR ──► (5) ACUMULAR ──► (6) LIBERAR
  Discussion             /graduar-adr     /abrir-issue      /feature-cycle    dev = batallón    /release
  idea/hallazgo          → ADR (repo)     → issue/epic       (motor del         (validar el       dev→main →
                                                              cambio)            conjunto)         Pages + tag
        ▲                                                                                            │
        │                                                                                            ▼
   (7) RETROALIMENTAR ◄───────────────────────────────────────────────────────────────  back-merge main→dev
   • PRODUCTO: /cosechar-sesion (QA/uso → issues/Discussions) ──► vuelve a (1)/(3)
   • PROCESO:  /retro-ciclo (al cerrar un epic/release/sesión con fan-out → mide y BAKEA
               lecciones en .claude/agents/ + AGENTS.md) ──► mejora cómo se hace (4)
   LANE HOTFIX: bug+issue → /hotfix (rama←main → PR→main → patch release → back-merge)
```

- **Empieza** en (1) si es exploratorio; en (3) directo si el trabajo ya es claro; en la
  **lane hotfix** si es un bug con issue.
- **Cierra**: cada issue en (4); cada epic cuando se entrega; cada release en (6). **Al cerrar
  un epic/release o una sesión con mucho fan-out de agentes → corré la retro del PROCESO
  (`/retro-ciclo`)** antes de pasar a lo siguiente.
- **Retroalimenta (dos lazos distintos)**: (7-producto) `/cosechar-sesion` vuelve a (1) o (3); el
  verifier de (4) puede rebotar al coder o escalar a (1) si la decisión estaba mal. (7-proceso)
  `/retro-ciclo` no toca el producto: mide dónde se fue el tiempo y **baka las lecciones** en el
  tooling de agentes para que el próximo (4) sea más rápido y con menos fricción.

## Cómo enrutar (qué despachar)
- Idea/dirección sin decidir → abrí/orientá a una **Discussion**.
- Decisión ya tomada que falta registrar → `/graduar-adr`.
- Idea clara lista para trabajar → `/abrir-issue`.
- Implementar un cambio sustancial → `/feature-cycle`.
- Cortar versión desde `dev` → `/release`.
- Bug con issue urgente → `/hotfix`.
- Cosechar una sesión de QA/uso (hallazgos del **producto**) → `/cosechar-sesion`.
- Cerrar un epic/release/sesión con fan-out → retro del **proceso** → `/retro-ciclo` (mide y baka
  lecciones en el tooling de agentes; comando de proyecto en `.claude/commands/`). **No** lo
  confundas con `/cosechar-sesion`: ese es del producto, este es de cómo trabajan los agentes.

## Decisiones de borde (clasificación en casos reales del repo)

La tabla de géneros no resuelve los bordes. Estos son los casos frecuentes:

- **N cambios que tocan el mismo contrato** → N ADR focalizados (uno por cambio
  testeable de forma aislada), **NO** un ADR paraguas que reenumere. Los paraguas
  duplican texto sin registrar decisión nueva. *(Ver `graduar-adr` §Antes de escribir.)*
- **Doc conceptual en `docs/`** (ontología, teoría, taxonomía, encuadre) → es **contrato
  conceptual** del laboratorio: vive en el repo y se actualiza por PR en lockstep con el
  schema. No es una Nota-archivo; un `.md` de "lo que falta" sí lo sería (→ issue).
- **Issue chico dentro de un epic** → si tiene DoD propio, sub-issue con label
  `sub-issue` enlazado al epic. Si es una tarea mecánica sin decisión, va como checklist
  en el cuerpo del epic.
- **Sector nuevo** (educación, cultura, agro…) o **fuente nueva** → epic propio, no un
  issue: arrastra extracción, resolución de entidades y verificación, cada una con su DoD.
- **Cambio del contrato de datos** (`data/schema/`) → issue propio + PR de contrato que ajusta
  productor (`extraccion/`) y consumidores (tipos de `packages/red`, `web/`) en el mismo
  movimiento; ADR si cambia el porqué.
- **"Disciplina con projects" / sincronización milestone ↔ project board** → no es
  una skill sola, es un sub-paso de cualquier flujo de milestone. Si lo detectás
  derivando, abrí/cerrá con el PO antes de seguir.
- **Documentación nueva** → si es **guía de usuario** (cómo usar), Wiki o `docs/` con
  tono producto. Si es **contrato** (qué hace la API), `docs/API.md` con PR. Si es
  **decisión**, ADR. Si es **trabajo**, issue.

## GitFlow (las reglas duras)
- `dev` = integración (se acumula el batallón de PRs); `main` = estable. **Ambas protegidas**:
  PR + CI verde, nunca push directo.
- Trabajo normal: rama desde `dev` → PR a `dev`. Liberar: `dev → main` (merge commit) →
  Pages publica → tag `vX.Y.Z` + GitHub Release.
- **Hotfix directo a `main` SOLO con issue reportado**, y corta patch ya mismo.
- **Back-merge `main → dev`** tras cada release y cada hotfix (vía PR, porque `dev` está
  protegido). Va dentro de `/release` y `/hotfix`, no es un paso aparte.

## Milestones (alcance del release)
Un **milestone de GitHub = la versión que un issue va a liberar** (`0.10.0`, `0.11.0`, …). Es la
unidad que agrupa el trabajo hacia un release y lo hace legible de un vistazo.
- **Al ENCUADRAR (3):** todo issue se asigna al milestone de su release destino. Si todavía no
  tiene release claro, queda sin milestone (= backlog) hasta que se decida.
- **Al LIBERAR (6):** un release **es** cerrar su milestone — se corta cuando sus issues están
  cerrados, y cerrar el milestone es parte de `/release`.
- **El milestone es el espejo del `dev` que se va a liberar:** lo que está abierto en el milestone
  es lo que falta para cortar esa versión. Crealo apenas se nombra una versión (`gh api
  repos/:owner/:repo/milestones -f title="X.Y.Z"`); asigná con `gh issue edit <n> --milestone X.Y.Z`.

## Principio
No hagas el trabajo desde acá: identificá la fase, traé al PO la decisión real si hay una, y
despachá al comando correcto. Escalá la ceremonia al tamaño de la tarea (un one-liner no
necesita `/feature-cycle`).
