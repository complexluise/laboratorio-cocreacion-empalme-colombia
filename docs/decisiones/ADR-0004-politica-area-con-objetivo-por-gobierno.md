# ADR-0004: La política pública es un área persistente con objetivo por gobierno

- **Estado:** aceptada
- **Fecha:** 2026-09-27
- **Decide:** PO (@complexluise) — issue #20

## Contexto

Hasta v0.2.0 cada "política" del dataset pertenecía implícitamente a un gobierno (9 del informe
2018–2022, 10 del 2022–2026; el id llevaba la vigencia) y tenía **un** objetivo sin vigencia. Solo los
instrumentos cruzaban entre gobiernos: la continuidad o el cambio *de la política* no era observable.

La teoría pide lo contrario: una política combina **fines y medios** (Howlett & Cashore); el cambio de
**objetivos** es el de 3er orden (Hall 1993); y la **conversión** de Mahoney & Thelen (mismo
instrumento, otro fin) solo se ve si el objetivo de cada gobierno es observable.

## Decisión

- La **política pública es un área persistente** (problema o área que atraviesa gobiernos). Cada
  gobierno le **declara su objetivo** (uno o varios enunciados): `politica.objetivos[vigencia]`, con las
  políticas declaradas de origen.
- El cambio del objetivo tiene **vocabulario propio** (`cambio_objetivo`, en `taxonomia.yaml`):
  **se mantiene · se reformula · no declarado · nuevo**. Complementa al modo de cambio del instrumento.
  Se dice "no declarado" y no "abandonado": el informe de empalme lo escribe cada gobierno sobre sí
  mismo y el silencio no prueba abandono (frontera del sistema: no evalúa gobiernos).
- El instrumento se vincula **a la política (área)**, no a un objetivo concreto.
- **Cada misión es un área**; apropiación social y ciencia abierta son áreas distintas.
- Las áreas las **define el equipo antes de publicar**, en una curaduría versionada
  (`data/correcciones/<slug>/areas.yaml`) que aplica `extraccion/aplicar_areas.py` de forma determinista;
  queda abierta a ampliarse con el seminario.
- Un área sin objetivo declarado en un gobierno pero con instrumentos activos se muestra **"huérfana"**
  (dependencia de la trayectoria hecha visible).

## Consecuencias

- **Habilita:** comparar el objetivo 2018 vs 2022 de cada política; ver instrumentos que persisten sin
  objetivo declarado; base para detectar conversión real.
- **Cuesta / cierra:** la agrupación en áreas es criterio analítico curado (no automático); el
  extractor sigue produciendo políticas por gobierno (`objetivo`, campo legado) y hace falta el paso
  `aplicar_areas.py` en el pipeline.
- **Frontera afectada:** contrato `objeto.schema.json` (`objetivos`, `cambio_objetivo`,
  `objetivo_gobierno`) y API de `@laboratorio/red` (`objetivoEn`, `CAMBIOS_OBJETIVO`,
  `NodoPolitica.sinObjetivo`; changeset `minor`).

## Alternativas consideradas

- **Una política por gobierno + arista de sucesión** (Hogwood & Peters) — descartada: duplica hubs y
  no da un lugar a "el área" como unidad de análisis del seminario.
- **Red de tres capas objetivo → política → instrumento** — descartada: más densa y costosa, sin
  ganancia para las tres preguntas del laboratorio.
- **Vincular cada instrumento al objetivo de cada gobierno** — pospuesta: más trabajo de datos; se
  revisa si hace falta para medir conversión.
