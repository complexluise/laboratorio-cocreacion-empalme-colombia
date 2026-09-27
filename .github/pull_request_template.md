## Qué y por qué

<!-- Breve: qué cambia y qué problema/necesidad resuelve. -->

## Cómo se probó

- [ ] CI verde (`ci.yml`)
- [ ] Local: `pnpm typecheck`, `pnpm test`, `pnpm lint:boundaries`, `pnpm build`
- [ ] Si toqué `data/schema/` o el dataset de la web: `uv run scripts/validar_contrato.py`
- [ ] Tests nuevos para la lógica nueva (o smoke explícito si es visual)
- [ ] Si toqué `web/`: abrí el mapa y lo miré (desktop + mobile)

## Checklist

- [ ] Rama desde `dev`, PR a `dev` (features nunca van directo a `main`)
- [ ] Commits atómicos y semánticos (Conventional Commits)
- [ ] Fronteras respetadas (`docs/FRONTERAS.md`): no crucé `extraccion/` ↔ `web/` salvo PR de contrato
- [ ] Si cambié la API pública (`exports`) de un paquete de `packages/`: changeset (`pnpm changeset`)
- [ ] Si cambió un porqué → ADR en `docs/decisiones/`
- [ ] Referencia al issue/ADR

Refs #
