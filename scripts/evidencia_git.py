"""
Evidencia de cómo se hizo el laboratorio, leída del historial de git (issue #37, ADR-0006).

Git es el registro de la colaboración humano↔IA: cada commit dice quién lo firmó y, con el trailer
`Co-Authored-By`, qué modelo participó; cada merge de PR es una integración aprobada; cada tag, un
release; cada ADR, una decisión. Este script cuenta eso y verifica los HITOS de la metodología
(commits curados abajo): que existan, y de quién son, lo toma de git, no de la mano.

Escribe web/src/lib/evidencia.json (commiteado, lo importa la página #/metodologia). No es un
dataset del contrato: vive fuera de lib/data/ (que valida validar_contrato.py).
Es una FOTO: se regenera al cortar cada release (ver .claude/skills/release).
Solo stdlib; corre desde la raíz del repo, con historia completa y tags (`git fetch --tags`).

Uso: uv run scripts/evidencia_git.py [--hasta <ref>]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

SALIDA = Path("web/src/lib/evidencia.json")
DECISIONES = Path("docs/decisiones")
AGENTE = "Claude"  # autor de los commits que el agente firma solo (sesiones en la nube)

# Hitos por FASE de la metodología (los ids de fase son los del flujograma de la web).
# Solo el hash y qué muestra: autor, fecha y coautoría salen de git.
HITOS: list[tuple[str, str, str]] = [
    ("encuadrar", "a2123e2", "Encuadre de la actividad del seminario"),
    ("fuente", "b75ffa6", "Descarga de los informes del DNP, conversión y OCR"),
    ("extraer", "7aac947", "Primera extracción con Gemini"),
    ("extraer", "5b8dafa", "Reconstrucción del dataset CTeI con Claude"),
    ("revisar", "52c9c04", "Correcciones verificadas contra los informes (overlay)"),
    ("decidir", "d15b99c", "Registro de decisiones (ADR-0001 y 0002)"),
    ("decidir", "8e8f7b9", "ADR-0004: la política como área persistente"),
    ("decidir", "3fab5b6", "ADR-0005: la bitácora .docx convertida en dato"),
    ("construir", "7bdd006", "Validador del contrato de datos"),
    ("construir", "7ed1661", "Sitio: landing, glosario y red"),
    ("construir", "5692154", "Plantilla de la bitácora y su lector"),
    ("verificar", "d8d6779", "Hallazgos del verificador en la web"),
    ("verificar", "4443611", "Hallazgos del verificador en la bitácora"),
    ("liberar", "c49f4f2", "Release v0.1.0"),
    ("liberar", "fcfd87d", "Release v0.3.0"),
]


def git(*args: str) -> str:
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout


def _registros(salida: str) -> list[list[str]]:
    """Registros separados por \\x1e y campos por \\x1f (seguros ante texto libre)."""
    return [r.strip("\n").split("\x1f") for r in salida.split("\x1e") if r.strip()]


FORMATO = "%H\x1f%h\x1f%an\x1f%ad\x1f%s\x1f%(trailers:key=Co-Authored-By,valueonly,separator=;)\x1e"


def _modelo(coautor: str) -> str:
    """La FAMILIA del coautor («Claude …» -> «Claude»); la versión exacta queda en el trailer."""
    nombre = coautor.split("<")[0].strip()
    return nombre.split()[0] if nombre else nombre


def clasificar(autor: str, coautores: str) -> str:
    if autor == AGENTE:
        return "agente"
    return "persona_con_ia" if coautores.strip() else "persona"


def recolectar(hasta: str) -> dict:
    corte = _registros(git("log", "-1", "--date=short", f"--format={FORMATO}", hasta))[0]
    commits = _registros(git("log", "--no-merges", "--date=short", f"--format={FORMATO}", hasta))
    merges = _registros(git("log", "--merges", "--date=short", f"--format={FORMATO}", hasta))

    tipos = Counter(clasificar(c[2], c[5]) for c in commits)
    modelos = Counter(_modelo(m) for c in commits for m in c[5].split(";") if m.strip())
    prs = sorted({int(m.group(1)) for c in merges if (m := re.match(r"Merge pull request #(\d+)", c[4]))})

    tags = []
    for linea in git("tag", "--merged", hasta, "--sort=creatordate", "--format=%(refname:short)").split():
        fecha = git("log", "-1", "--date=short", "--format=%ad", linea).strip()
        tags.append({"tag": linea, "commit": git("rev-list", "-n1", linea).strip()[:7], "fecha": fecha})

    adrs = []
    for p in sorted(DECISIONES.glob("ADR-*.md")):
        n = p.stem.split("-")[1]
        if n == "0000":
            continue
        titulo = next((l.lstrip("# ").strip() for l in p.read_text(encoding="utf-8").splitlines() if l.startswith("# ")), p.stem)
        adrs.append({"id": f"ADR-{n}", "titulo": re.sub(r"^ADR-\d+\s*[—:-]\s*", "", titulo), "archivo": p.as_posix()})

    hitos = []
    for fase, corto, que in HITOS:
        try:
            c = _registros(git("log", "-1", "--date=short", f"--format={FORMATO}", corto))[0]
        except subprocess.CalledProcessError:
            sys.exit(f"hito inexistente en git: {corto} ({que})")
        if subprocess.run(["git", "merge-base", "--is-ancestor", c[0], hasta]).returncode != 0:
            sys.exit(f"el hito {corto} ({que}) no está en la historia de {hasta}")
        hitos.append({
            "fase": fase,
            "commit": c[1],
            "que": que,
            "autor": c[2],
            "fecha": c[3],
            "asunto": c[4],
            "coautores": sorted({_modelo(m) for m in c[5].split(";") if m.strip()}),
        })

    fechas = sorted(c[3] for c in commits)
    return {
        "corte": {"commit": corte[1], "fecha": corte[3]},
        "periodo": {"desde": fechas[0], "hasta": fechas[-1]},
        "commits": {"total": len(commits), **{k: tipos.get(k, 0) for k in ("agente", "persona_con_ia", "persona")}},
        "modelos": dict(modelos.most_common()),
        "prs_integrados": prs,
        "releases": tags,
        "adrs": adrs,
        "hitos": hitos,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--hasta", default="HEAD", help="ref de corte (por defecto HEAD)")
    args = ap.parse_args()
    if git("rev-parse", "--is-shallow-repository").strip() == "true":
        sys.exit("clon superficial: corré `git fetch --unshallow --tags` antes (la evidencia sería parcial)")
    datos = recolectar(args.hasta)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = datos["commits"]
    print(f"{SALIDA}: {c['total']} commits (agente {c['agente']}, persona+IA {c['persona_con_ia']}, persona {c['persona']}), "
          f"{len(datos['prs_integrados'])} PR, {len(datos['releases'])} releases, {len(datos['adrs'])} ADR, corte {datos['corte']['commit']}")


if __name__ == "__main__":
    main()
