# @laboratorio/red

## 0.2.0

### Minor Changes

- 9fbf4fb: Política como área persistente con objetivo por gobierno: `Politica.objetivos` (por vigencia) y
  `cambio_objetivo`, `CAMBIOS_OBJETIVO`, `objetivoEn()`. `NodoPolitica.sinObjetivo` marca el área sin
  objetivo declarado en la vigencia elegida. `buscar()` encuentra un área por el nombre de la política
  declarada.

## 0.1.0

### Minor Changes

- 741ddaf: Buscar deja de ser un filtro: `Filtros` pierde `busqueda` y `politica`. Nueva `buscar(dataset, q)`
  (resultados agrupados políticas/instrumentos, por nombre o alias, con tramo a resaltar) para
  navegar, y `construirRed(ds, filtros, { politica })` aísla la subred de una política como foco.
