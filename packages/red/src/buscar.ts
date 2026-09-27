import { idInstrumento, idPolitica, normalizar } from "./red.ts";
import type { Dataset, Objeto } from "./tipos.ts";

/**
 * Búsqueda para NAVEGAR (no filtra la red): devuelve políticas e instrumentos cuyo nombre o alias
 * contiene la consulta, sin tildes ni mayúsculas. Cada grupo se ordena por relevancia:
 * nombre que empieza por la consulta > palabra del nombre que empieza por ella > contiene > alias.
 */

export interface Resultado {
  /** Id de nodo (`pol:…` / `ins:…`). */
  id: string;
  nombre: string;
  /** Tramo [inicio, fin) del nombre que coincide, para resaltarlo. Ausente si coincidió el alias. */
  tramo?: [number, number];
  /** Alias por el que coincidió, si no fue por el nombre. */
  alias?: string;
  /** Solo instrumentos: el objeto, para mostrar su forma/color. */
  obj?: Objeto;
}

export interface ResultadosBusqueda {
  politicas: Resultado[];
  instrumentos: Resultado[];
  /** Coincidencias totales (antes del límite por grupo). */
  total: number;
}

const VACIO: ResultadosBusqueda = { politicas: [], instrumentos: [], total: 0 };

function puntuar(nombre: string, alias: readonly string[], q: string): { puntos: number; tramo?: [number, number]; alias?: string } | null {
  const n = normalizar(nombre);
  const i = n.indexOf(q);
  if (i >= 0) {
    // La normalización conserva la longitud en texto NFC latino; si no, no se resalta.
    const tramo: [number, number] | undefined = n.length === nombre.length ? [i, i + q.length] : undefined;
    const inicioPalabra = i === 0 || /[\s(/.,:;"'-]/.test(n[i - 1]!);
    const puntos = i === 0 ? 3 : inicioPalabra ? 2 : 1;
    return tramo ? { puntos, tramo } : { puntos };
  }
  const a = alias.find((x) => normalizar(x).includes(q));
  return a !== undefined ? { puntos: 0, alias: a } : null;
}

function ordenar(xs: (Resultado & { puntos: number })[]): Resultado[] {
  return xs
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre, "es"))
    .map(({ puntos: _p, ...r }) => r);
}

export function buscar(ds: Dataset, consulta: string, limite = 6): ResultadosBusqueda {
  const q = normalizar(consulta);
  if (!q) return VACIO;

  // Solo políticas que tienen instrumentos (una subred vacía no lleva a ningún lado).
  const conInstrumentos = new Set(ds.objetos.flatMap((o) => o.politicas ?? []));
  const politicas: (Resultado & { puntos: number })[] = [];
  for (const p of ds.politicas ?? []) {
    if (!conInstrumentos.has(p.id)) continue;
    const m = puntuar(p.nombre, [], q);
    if (m) politicas.push({ id: idPolitica(p.id), nombre: p.nombre, ...m });
  }
  const instrumentos: (Resultado & { puntos: number })[] = [];
  for (const o of ds.objetos) {
    const m = puntuar(o.nombre, o.alias ?? [], q);
    if (m) instrumentos.push({ id: idInstrumento(o.id), nombre: o.nombre, obj: o, ...m });
  }

  return {
    politicas: ordenar(politicas).slice(0, limite),
    instrumentos: ordenar(instrumentos).slice(0, limite),
    total: politicas.length + instrumentos.length,
  };
}
