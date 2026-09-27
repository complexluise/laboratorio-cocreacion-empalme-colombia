# Workflows pendientes (epic #6)

La sesión de Claude Code no tiene permiso para escribir en `.github/workflows/`, así que los
workflows nuevos quedan acá para que el PO los mueva:

```bash
git mv workflows-pendientes/ci.yml    .github/workflows/ci.yml
git mv workflows-pendientes/pages.yml .github/workflows/pages.yml
git rm -r workflows-pendientes
git commit -m "ci: gate de la web con pnpm y deploy de web/dist en Pages"
```

- `ci.yml`: suma el job `web` (pnpm install --frozen-lockfile, typecheck, test, lint:boundaries, build).
- `pages.yml`: construye con pnpm y publica `web/dist` (antes publicaba `web/` crudo).

**Subirlos antes de mergear a `main`**: sin el nuevo `pages.yml`, Pages publicaría el fuente sin
build y el sitio quedaría en blanco.
