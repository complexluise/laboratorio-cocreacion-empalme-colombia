# @laboratorio/red

## 0.1.0

### Minor Changes

- 741ddaf: Buscar deja de ser un filtro: `Filtros` pierde `busqueda` y `politica`. Nueva `buscar(dataset, q)`
  (resultados agrupados políticas/instrumentos, por nombre o alias, con tramo a resaltar) para
  navegar, y `construirRed(ds, filtros, { politica })` aísla la subred de una política como foco.
