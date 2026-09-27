# CLAUDE.md

> Puente para agentes. La **fuente de verdad operativa** es [`AGENTS.md`](AGENTS.md) — leelo primero.
> La disciplina de trabajo viene de [`kybernetes`](https://github.com/Sostaina/kybernetes)
> (ver [ADR-0001](docs/decisiones/ADR-0001-adoptar-disciplina-kybernetes.md)).

## No te lo saltes

- **Cómo trabajamos:** GitFlow-lite (`dev` integra, `main` solo releases = lo que publica Pages).
  Ver [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Fronteras:** `extraccion/` → **contrato de datos** (`data/schema/`) → `web/`. La web consume el
  dataset, nunca importa del pipeline. Ver [`docs/FRONTERAS.md`](docs/FRONTERAS.md).
- **Test-first** donde hay código con lógica. Nada se mergea con CI en rojo.
- **Decisiones → ADR** (`docs/decisiones/`). **Trabajo → issues** (no `.md` de "lo que falta").
- **El flujo** (encuadrar/decidir/ejecutar/liberar/retroalimentar) vive en `.claude/skills/`
  (empezá por `flujo`). El cierre de ciclo, en `.claude/commands/retro-ciclo.md`.

## El dominio

- **Qué es:** un **laboratorio de cocreación** sobre política pública colombiana. Del informe de
  empalme del DNP se extraen **políticas públicas + instrumentos** y se publican como un **mapa
  navegable** (red bipartita política↔instrumento) para que la gente explore y cocree.
- **Frontera del sistema:** no evalúa ni puntúa gobiernos; no es un buscador de documentos. Clasifica
  y conecta con un vocabulario controlado (`data/schema/taxonomia.yaml`).
- **Objeto de dominio de primera clase:** el **instrumento de política pública**, con su `tipo_nato`
  (Hood), su `modo_cambio` entre gobiernos (Mahoney-Thelen) y su presencia por vigencia.

## Cómo correr

```bash
uv run extraccion/generar_web.py --slug ciencia-tecnologia   # dataset -> web/datos.js
python -m http.server                                        # abrir http://localhost:8000/web/
```

Los scripts de `extraccion/` se ejecutan **desde la raíz** (rutas relativas) con `uv run` (deps
inline PEP 723). Los que usan Gemini necesitan `GEMINI_API_KEY` en `.env` — **no los corras sin
autorización** (API paga).
