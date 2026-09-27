# Changesets

Cada cambio a la **frontera** de un paquete (su API pública) se acompaña de un *changeset*:

```bash
pnpm changeset        # elegí paquetes + nivel semver (patch/minor/major) + describí el cambio
```

Esto crea un `.md` acá. En el release (skill `release`) se consumen con `pnpm changeset version`:
sube versiones y escribe el CHANGELOG de cada paquete. No se publica a ningún registry (paquetes
internos). Un changeset = "toqué esta frontera, este es el impacto semver".

Docs: https://github.com/changesets/changesets
