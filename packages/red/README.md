# @laboratorio/red

Sistema viable del **dominio de la red**: lo que la web necesita saber del dataset, sin DOM ni D3.

- `tipos.ts` — tipos del contrato `data/schema/objeto.schema.json` + vocabulario (`taxonomia.yaml`).
- `red.ts` — `construirRed(dataset, filtros)`: nodos (política / instrumento) y enlaces
  (pertenencia / relación) visibles; los filtros **componen por intersección**.
- `vecindario.ts` — `vecindario(red, id)`: el nodo + vecinos directos + 1 salto por relaciones
  instrumento↔instrumento (foco de vecindario).

La frontera es `exports` (`src/index.ts`); `web/` lo importa como `@laboratorio/red`. Paquete
interno: exporta el fuente TS (Vite lo compila), no publica `dist/`.

```bash
pnpm test          # desde la raíz
```
