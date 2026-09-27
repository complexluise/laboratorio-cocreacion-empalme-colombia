/**
 * Tipos del contrato de datos (data/schema/objeto.schema.json) y su vocabulario
 * (data/schema/taxonomia.yaml). Si el contrato cambia, esto cambia en el mismo PR.
 */

export const VIGENCIAS = ["2018-2022", "2022-2026"] as const;
export type Vigencia = (typeof VIGENCIAS)[number];
export type VigenciaSel = Vigencia | "ambos";

export const MODOS_CAMBIO = [
  "continuidad-estable",
  "conversion",
  "estratificacion",
  "terminacion",
  "reversion",
  "deriva",
] as const;
export type ModoCambio = (typeof MODOS_CAMBIO)[number];

export const TIPOS_NATO = ["nodalidad", "autoridad", "tesoro", "organizacion"] as const;
export type TipoNato = (typeof TIPOS_NATO)[number];

/** Clase de nodo para filtrar por forma: un tipo NATO o "objetivo" (objetivo de política, sin NATO). */
export type ClaseNato = TipoNato | "objetivo";
export const CLASES_NATO: readonly ClaseNato[] = [...TIPOS_NATO, "objetivo"];

export const TIPOS_RELACION = ["habilita", "financia", "depende-de", "encadena"] as const;
export type TipoRelacion = (typeof TIPOS_RELACION)[number];

export interface Politica {
  id: string;
  nombre: string;
  objetivo?: string;
}

export interface Presencia {
  activo: boolean;
  modo?: "propuesto" | "logrado" | "pendiente";
}

export interface Cifra {
  texto?: string;
  metrica?: string;
  valor?: string | number;
}

export interface Evidencia {
  vigencia: string;
  paginas?: number[];
  cifras?: Cifra[];
}

export interface Narrativa {
  g2018?: string;
  g2022?: string;
  cambio?: string;
}

export interface Objeto {
  id: string;
  nombre: string;
  es_objetivo: boolean;
  tipo_nato?: TipoNato;
  politicas?: string[];
  alias?: string[];
  presencia: Partial<Record<Vigencia, Presencia>>;
  modo_cambio: ModoCambio;
  entidades?: string[];
  confianza?: "alta" | "media" | "baja";
  narrativa?: Narrativa;
  evidencia: Evidencia[];
}

export interface Arista {
  source: string;
  target: string;
  tipo: TipoRelacion;
  nota?: string;
}

export interface Dataset {
  sector: string;
  politicas?: Politica[];
  objetos: Objeto[];
  relaciones?: Arista[];
}

export function claseNato(o: Objeto): ClaseNato {
  return o.es_objetivo ? "objetivo" : (o.tipo_nato ?? "organizacion");
}
