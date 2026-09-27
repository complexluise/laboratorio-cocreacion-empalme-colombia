import type {
  Arista,
  ClaseNato,
  Dataset,
  ModoCambio,
  Objeto,
  Politica,
  TipoRelacion,
  VigenciaSel,
} from "./tipos.ts";
import { claseNato } from "./tipos.ts";

export type NodoPolitica = { id: string; tipo: "pol"; pol: Politica };
export type NodoInstrumento = { id: string; tipo: "ins"; obj: Objeto };
export type Nodo = NodoPolitica | NodoInstrumento;

export type Enlace =
  | { id: string; source: string; target: string; clase: "pertenencia" }
  | { id: string; source: string; target: string; clase: "relacion"; tipo: TipoRelacion; nota: string };

export interface Red {
  nodos: Nodo[];
  enlaces: Enlace[];
}

/**
 * Filtros de análisis. Componen por INTERSECCIÓN: un instrumento es visible solo si pasa todos.
 * `modos`/`natos` vacíos = sin restricción (equivale a "todos").
 */
export interface Filtros {
  vigencia: VigenciaSel;
  busqueda: string;
  politica: string | null;
  modos: ReadonlySet<ModoCambio>;
  natos: ReadonlySet<ClaseNato>;
}

export const FILTROS_INICIALES: Filtros = {
  vigencia: "ambos",
  busqueda: "",
  politica: null,
  modos: new Set(),
  natos: new Set(),
};

export const idPolitica = (id: string) => `pol:${id}`;
export const idInstrumento = (id: string) => `ins:${id}`;

/** Minúsculas y sin tildes, para buscar "educacion" y encontrar "Educación". */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function activoEn(o: Objeto, vigencia: VigenciaSel): boolean {
  if (vigencia === "ambos") return true;
  return o.presencia[vigencia]?.activo === true;
}

/** Construye la red visible (nodos + enlaces) a partir del dataset y los filtros. */
export function construirRed(ds: Dataset, f: Filtros): Red {
  const politicas = ds.politicas ?? [];
  const polPorId = new Map(politicas.map((p) => [p.id, p]));
  const q = normalizar(f.busqueda);

  const coincide = (o: Objeto): boolean => {
    if (!q) return true;
    if (normalizar(o.nombre).includes(q)) return true;
    if ((o.alias ?? []).some((a) => normalizar(a).includes(q))) return true;
    return (o.politicas ?? []).some((pid) => {
      const p = polPorId.get(pid);
      return p !== undefined && normalizar(p.nombre).includes(q);
    });
  };

  const instrumentos = ds.objetos.filter(
    (o) =>
      activoEn(o, f.vigencia) &&
      (f.modos.size === 0 || f.modos.has(o.modo_cambio)) &&
      (f.natos.size === 0 || f.natos.has(claseNato(o))) &&
      (f.politica === null || (o.politicas ?? []).includes(f.politica)) &&
      coincide(o),
  );

  // Políticas visibles: las que tienen ≥1 instrumento visible (con foco, solo la enfocada).
  const polVisibles = new Set<string>();
  for (const o of instrumentos) {
    for (const pid of o.politicas ?? []) {
      if (!polPorId.has(pid)) continue;
      if (f.politica === null || pid === f.politica) polVisibles.add(pid);
    }
  }

  const nodos: Nodo[] = [
    ...politicas
      .filter((p) => polVisibles.has(p.id))
      .map((p): Nodo => ({ id: idPolitica(p.id), tipo: "pol", pol: p })),
    ...instrumentos.map((o): Nodo => ({ id: idInstrumento(o.id), tipo: "ins", obj: o })),
  ];

  const enlaces: Enlace[] = [];
  for (const o of instrumentos) {
    for (const pid of o.politicas ?? []) {
      if (!polVisibles.has(pid)) continue;
      const source = idInstrumento(o.id);
      const target = idPolitica(pid);
      enlaces.push({ id: `${source}->${target}`, source, target, clase: "pertenencia" });
    }
  }

  const visibles = new Set(instrumentos.map((o) => o.id));
  for (const r of ds.relaciones ?? []) {
    if (r.source === r.target || !visibles.has(r.source) || !visibles.has(r.target)) continue;
    enlaces.push(enlaceRelacion(r));
  }

  return { nodos, enlaces };
}

function enlaceRelacion(r: Arista): Enlace {
  const source = idInstrumento(r.source);
  const target = idInstrumento(r.target);
  return {
    id: `${source}-${r.tipo}->${target}`,
    source,
    target,
    clase: "relacion",
    tipo: r.tipo,
    nota: r.nota ?? "",
  };
}

/** Firma de la topología: cambia solo si cambian los nodos o enlaces (no con la selección). */
export function firmaTopologia(red: Red): string {
  return [...red.nodos.map((n) => n.id), "|", ...red.enlaces.map((e) => e.id)].join(",");
}
