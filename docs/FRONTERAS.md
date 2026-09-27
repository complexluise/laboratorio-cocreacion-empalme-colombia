# Fronteras — sistemas viables y su gobernanza

En el **Viable System Model** (Beer) un sistema viable tiene una **frontera** que lo separa de su
entorno, y la **recursión** significa que cada subsistema es a su vez viable, con *su propia*
frontera. En este repo hay dos sistemas viables y un contrato entre ellos:

```
extraccion/  ──produce──►  data/schema/ (CONTRATO)  ◄──consume──  web/
 (Python, uv)               objeto.schema.json                     (explorador de la red)
                            taxonomia.yaml
```

## Las reglas

1. **La frontera = el contrato de datos.** Lo único que cruza de `extraccion/` a `web/` es un dataset
   conforme a `data/schema/objeto.schema.json`, con los enums de `data/schema/taxonomia.yaml`.
2. **Se cruza por el dato, no por el código.** `web/` nunca importa ni ejecuta `extraccion/`;
   `extraccion/` no conoce detalles de render (colores, layout, física).
3. **Vocabulario único.** Los enums (`tipo_nato`, `modo_cambio`, …) salen de `taxonomia.yaml`. La web
   puede *mapearlos* a colores/formas, pero no inventar valores nuevos.
4. **Cambiar el contrato es explícito.** PR propio (`feat(schema)`/`refactor(schema)`), ambos lados
   ajustados en el mismo movimiento, y ADR si cambia el porqué.

## Cómo se enforcea

- **CI (`ci.yml`)**: valida que cada `*.schema.json` sea un JSON Schema válido y que
  `taxonomia.yaml` parsee. `extraer_instrumentos.py` valida su salida contra el schema al producirla.
- **Revisión**: el `verifier` chequea que un PR de `web/` no toque `extraccion/` ni el schema, y
  viceversa (salvo PR de contrato).
- **Pendiente** (crece con el epic #6): validar el dataset que consume la web contra el schema en CI.

## Por qué (cibernética)

La frontera es donde se gestiona la **variedad** (Ashby): el contrato **atenúa** la variedad interna
del pipeline (modelos, reintentos, correcciones) y **amplifica** solo lo necesario hacia la web.
Fronteras nítidas = sistema gobernable = podemos reescribir la web (epic #6) sin tocar la extracción.
