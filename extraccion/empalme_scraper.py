# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27"]
# ///
"""
Descargador de Informes de Empalme — Datálogo DNP Colombia
https://datalogo.dnp.gov.co/informe-empalme

Recorre el API publico:
  GET  /api/vigencias                          -> periodos de gobierno
  GET  /api/informe-empalme/sectores/{vig}     -> sectores por vigencia
  POST /api/informe-empalme/entidades          -> entidades por (vigencia, sector)
  POST /api/informe-empalme                    -> URLs (PDF + anexos) por entidad

Descarga los PDF y ZIP de anexos desde el storage directo, de forma respetuosa:
pausa entre requests, reintentos con backoff, y salta lo ya descargado.

Uso:
  uv run empalme_scraper.py mapear                       # solo enumera, no descarga; escribe manifiesto.json
  uv run empalme_scraper.py descargar --sector "Ciencia" # descarga sectores que matcheen (substring, sin acentos)
  uv run empalme_scraper.py descargar --todo             # descarga TODO el sitio
  uv run empalme_scraper.py descargar --sector "Ciencia" --dry-run   # muestra que haria
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import unicodedata
from dataclasses import dataclass, asdict, field
from pathlib import Path
from urllib.parse import quote, urlsplit, unquote

import httpx

API = "https://datalogo.dnp.gov.co/api"
NULL_GUID = "00000000-0000-0000-0000-000000000000"
UA = "empalme-research/1.0 (uso academico; contacto trama.complejidad@gmail.com)"
DEST = Path("descargas")

# Pausa cortes entre llamadas para no saturar el servidor.
PAUSE_API = 0.8      # entre llamadas al API json
PAUSE_FILE = 1.5     # entre descargas de archivos grandes


def slug(s: str) -> str:
    """Normaliza a ASCII seguro para carpetas: sin acentos, sin caracteres raros."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    keep = "".join(c if c.isalnum() or c in " -_" else " " for c in s)
    return "_".join(keep.split())


def norm(s: str) -> str:
    """Para comparar: minusculas sin acentos."""
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()


@dataclass
class Item:
    vigencia: str
    sector: str
    entidad: str
    url_pdf: str | None = None
    url_anexos: str | None = None
    dest_pdf: str | None = None
    dest_anexos: str | None = None


def client() -> httpx.Client:
    # verify=False: el certificado de la cadena no valida en algunos entornos; el contenido es publico.
    return httpx.Client(
        headers={"User-Agent": UA, "Accept": "application/json"},
        verify=False,
        timeout=60.0,
        follow_redirects=True,
    )


def get_json(c: httpx.Client, method: str, path: str, body: dict | None = None):
    for intento in range(4):
        try:
            r = c.request(method, f"{API}{path}", json=body)
            r.raise_for_status()
            return r.json()
        except Exception as e:  # noqa: BLE401
            wait = 2 ** intento
            print(f"  ! {method} {path} fallo ({e}); reintento en {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"No se pudo obtener {method} {path}")


def enumerar(c: httpx.Client, filtro_sector: str | None) -> list[Item]:
    items: list[Item] = []
    vigencias = get_json(c, "GET", "/vigencias")
    time.sleep(PAUSE_API)
    for vig in vigencias:
        vid, vname = vig["vigenciaId"], vig["vigenciaName"]
        sectores = get_json(c, "GET", f"/informe-empalme/sectores/{vid}")
        time.sleep(PAUSE_API)
        for sec in sectores:
            sname = sec["sectorName"]
            if filtro_sector and norm(filtro_sector) not in norm(sname):
                continue
            ents = get_json(c, "POST", "/informe-empalme/entidades",
                            {"vigenciaId": vid, "sectorId": sec["sectorId"], "entidadId": NULL_GUID})
            time.sleep(PAUSE_API)
            for ent in ents:
                meta = get_json(c, "POST", "/informe-empalme",
                                {"vigenciaId": vid, "sectorId": sec["sectorId"],
                                 "entidadId": ent["entidadId"]})
                time.sleep(PAUSE_API)
                it = Item(vigencia=vname, sector=sname, entidad=ent["entidadName"])
                if isinstance(meta, dict):
                    it.url_pdf = meta.get("url") or None
                    it.url_anexos = meta.get("urlAnexos") or None
                base = DEST / slug(vname) / slug(sname) / slug(ent["entidadName"])
                if it.url_pdf:
                    it.dest_pdf = str(base / nombre_archivo(it.url_pdf))
                if it.url_anexos:
                    it.dest_anexos = str(base / nombre_archivo(it.url_anexos))
                items.append(it)
                print(f"  · {vname} | {sname} | {ent['entidadName']} "
                      f"[pdf={'si' if it.url_pdf else 'no'} anexos={'si' if it.url_anexos else 'no'}]")
    return items


def nombre_archivo(url: str) -> str:
    return slug_nombre(unquote(urlsplit(url).path.rsplit("/", 1)[-1]))


def slug_nombre(name: str) -> str:
    stem, dot, ext = name.rpartition(".")
    if not dot:
        return slug(name)
    return f"{slug(stem)}.{ext.lower()}"


def encode_url(url: str) -> str:
    parts = urlsplit(url)
    return f"{parts.scheme}://{parts.netloc}{quote(unquote(parts.path))}"


def descargar_archivo(c: httpx.Client, url: str, dest: Path) -> str:
    if dest.exists() and dest.stat().st_size > 0:
        return f"SKIP (ya existe, {dest.stat().st_size} bytes)"
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    for intento in range(4):
        try:
            with c.stream("GET", encode_url(url),
                          headers={"Accept": "*/*"}) as r:
                r.raise_for_status()
                total = 0
                with open(tmp, "wb") as f:
                    for chunk in r.iter_bytes(1 << 16):
                        f.write(chunk)
                        total += len(chunk)
            tmp.rename(dest)
            return f"OK ({total} bytes)"
        except Exception as e:  # noqa: BLE401
            wait = 2 ** intento
            print(f"    ! descarga fallo ({e}); reintento en {wait}s", file=sys.stderr)
            time.sleep(wait)
    return "ERROR (agotados los reintentos)"


def cmd_mapear(args):
    with client() as c:
        items = enumerar(c, args.sector)
    manifiesto = [asdict(i) for i in items]
    Path(args.salida).write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nMapeados {len(items)} registros -> {args.salida}")


def cmd_descargar(args):
    if not args.sector and not args.todo:
        print("Especifica --sector <texto> o --todo", file=sys.stderr)
        sys.exit(2)
    with client() as c:
        items = enumerar(c, None if args.todo else args.sector)
        Path("manifiesto.json").write_text(
            json.dumps([asdict(i) for i in items], ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n{len(items)} entidades. Descargando...\n")
        for it in items:
            objetivos = [("PDF", it.url_pdf, it.dest_pdf)]
            if not getattr(args, "sin_anexos", False):
                objetivos.append(("ANEXOS", it.url_anexos, it.dest_anexos))
            for kind, url, dest in objetivos:
                if not url:
                    continue
                if args.dry_run:
                    print(f"  [dry-run] {kind}: {url} -> {dest}")
                    continue
                res = descargar_archivo(c, url, Path(dest))
                print(f"  {kind:6} {it.sector[:30]:30} | {it.entidad[:28]:28} -> {res}")
                if not res.startswith("SKIP"):
                    time.sleep(PAUSE_FILE)
    print("\nListo.")


def main():
    p = argparse.ArgumentParser(description="Descargador de Informes de Empalme DNP")
    sub = p.add_subparsers(required=True)
    m = sub.add_parser("mapear", help="Enumera y escribe manifiesto sin descargar")
    m.add_argument("--sector", help="filtra por substring del sector (sin acentos)")
    m.add_argument("--salida", default="manifiesto.json")
    m.set_defaults(func=cmd_mapear)
    d = sub.add_parser("descargar", help="Descarga archivos")
    d.add_argument("--sector", help="filtra por substring del sector")
    d.add_argument("--todo", action="store_true", help="descarga todos los sectores")
    d.add_argument("--sin-anexos", action="store_true", help="solo los informes PDF, sin los ZIP de anexos")
    d.add_argument("--dry-run", action="store_true")
    d.set_defaults(func=cmd_descargar)
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")  # silencia el warning de verify=False
    main()
