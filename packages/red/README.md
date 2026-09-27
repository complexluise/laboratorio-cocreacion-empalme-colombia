# @laboratorio/red

Sistema viable del **dominio de la red**: lo que la web necesita saber del dataset, sin DOM ni D3.

- `tipos.ts` — tipos del contrato `data/schema/objeto.schema.json` + vocabulario (`taxonomia.yaml`).
- `red.ts` — `construirRed(dataset, filtros, subred?)`: nodos (política / instrumento) y enlaces
  (pertenencia / relación) visibles. `Filtros` = vigencia + modos de cambio + clases NATO, que
  **componen por intersección**. `Subred` (`{ politica }`) es foco, no filtro: aísla una política
  y sus instrumentos. También `firmaTopologia`, `normalizar` (sin tildes ni mayúsculas) e ids
  `idPolitica` / `idInstrumento` (`pol:…` / `ins:…`).
- `buscar.ts` — `buscar(dataset, consulta, limite = 6)`: para **navegar**, no filtra. Resultados
  agrupados (políticas con instrumentos / instrumentos) por nombre o alias, ordenados por
  relevancia, con el tramo a resaltar y el total antes del límite.
- `vecindario.ts` — `vecindario(red, id)`: el nodo + vecinos directos + 1 salto por relaciones
  instrumento↔instrumento (foco de vecindario).

La frontera es `exports` (`src/index.ts`); `web/` lo importa como `@laboratorio/red`. Paquete
interno: exporta el fuente TS (Vite lo compila), no publica `dist/`.

```bash
pnpm test          # desde la raíz
```
