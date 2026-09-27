# Changesets

Cada cambio a la **frontera** de un paquete (su API pública) se acompaña de un *changeset*:

```bash
pnpm changeset        # elegí paquetes + nivel semver (patch/minor/major) + describí el cambio
```

Esto crea un `.md` acá. Al llegar a `main`, la CI de release consume los changesets, sube versiones,
escribe el CHANGELOG y publica. Un changeset = "toqué esta frontera, este es el impacto semver".

Docs: https://github.com/changesets/changesets
