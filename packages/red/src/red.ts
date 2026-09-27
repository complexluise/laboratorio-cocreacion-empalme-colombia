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

/**
 * `sinObjetivo`: con una vigencia elegida, el área no tiene objetivo declarado por ese gobierno pero
 * sí instrumentos activos (dependencia de la trayectoria hecha visible). Nunca con "ambos".
 */
export type NodoPolitica = { id: string; tipo: "pol"; pol: Politica; sinObjetivo: boolean };
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
 * Filtros de análisis: QUÉ parte de la red se ve. Componen por INTERSECCIÓN: un instrumento es
 * visible solo si pasa todos. `modos`/`natos` vacíos = sin restricción (equivale a "todos").
 * Buscar NO es un filtro (navega: ver `buscar`) y enfocar una política tampoco (ver `Subred`).
 */
export interface Filtros {
  vigencia: VigenciaSel;
  modos: ReadonlySet<ModoCambio>;
  natos: ReadonlySet<ClaseNato>;
}

export const FILTROS_INICIALES: Filtros = {
  vigencia: "ambos",
  modos: new Set(),
  natos: new Set(),
};

/** Foco en una política: aísla su subred (solo ella y sus instrumentos). */
export interface Subred {
  politica: string | null;
}

export const idPolitica = (id: string) => `pol:${id}`;
export const idInstrumento = (id: string) => `ins:${id}`;

/** Minúsculas y sin tildes, para buscar "educacion" y encontrar "Educación". */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, " ").toLowerCase().trim();
}

export function activoEn(o: Objeto, vigencia: VigenciaSel): boolean {
  if (vigencia === "ambos") return true;
  return o.presencia[vigencia]?.activo === true;
}

/** Construye la red visible (nodos + enlaces) a partir del dataset, los filtros y la subred. */
export function construirRed(ds: Dataset, f: Filtros, subred: Subred = { politica: null }): Red {
  const politicas = ds.politicas ?? [];
  const polPorId = new Map(politicas.map((p) => [p.id, p]));
  const aislada = subred.politica;

  const instrumentos = ds.objetos.filter(
    (o) =>
      activoEn(o, f.vigencia) &&
      (f.modos.size === 0 || f.modos.has(o.modo_cambio)) &&
      (f.natos.size === 0 || f.natos.has(claseNato(o))) &&
      (aislada === null || (o.politicas ?? []).includes(aislada)),
  );

  // Políticas visibles: las que tienen ≥1 instrumento visible (con foco, solo la enfocada).
  const polVisibles = new Set<string>();
  for (const o of instrumentos) {
    for (const pid of o.politicas ?? []) {
      if (!polPorId.has(pid)) continue;
      if (aislada === null || pid === aislada) polVisibles.add(pid);
    }
  }

  const nodos: Nodo[] = [
    ...politicas
      .filter((p) => polVisibles.has(p.id))
      .map(
        (p): Nodo => ({
          id: idPolitica(p.id),
          tipo: "pol",
          pol: p,
          sinObjetivo: f.vigencia !== "ambos" && p.objetivos !== undefined && p.objetivos[f.vigencia] === undefined,
        }),
      ),
    ...instrumentos.map((o): Nodo => ({ id: idInstrumento(o.id), tipo: "ins", obj: o })),
  ];

  // Ids de enlace únicos aunque el dato repita una política o una relación (el render los usa
  // como clave; un duplicado rompería el {#each} keyed).
  const enlaces: Enlace[] = [];
  const vistos = new Set<string>();
  const agregar = (e: Enlace) => {
    if (vistos.has(e.id)) return;
    vistos.add(e.id);
    enlaces.push(e);
  };
  for (const o of instrumentos) {
    for (const pid of new Set(o.politicas ?? [])) {
      if (!polVisibles.has(pid)) continue;
      const source = idInstrumento(o.id);
      const target = idPolitica(pid);
      agregar({ id: `${source}->${target}`, source, target, clase: "pertenencia" });
    }
  }

  const visibles = new Set(instrumentos.map((o) => o.id));
  for (const r of ds.relaciones ?? []) {
    if (r.source === r.target || !visibles.has(r.source) || !visibles.has(r.target)) continue;
    agregar(enlaceRelacion(r));
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
