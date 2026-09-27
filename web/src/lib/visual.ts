import type { ClaseNato, ModoCambio, TipoNato, TipoRelacion } from "@laboratorio/red";
import {
  symbol,
  symbolCircle,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  type SymbolType,
} from "d3-shape";

/** Colores de DATO (se conservan del PoC): modo de cambio entre gobiernos. */
export const COLOR_MODO: Record<ModoCambio, string> = {
  "continuidad-estable": "#2e7d32",
  conversion: "#1565c0",
  estratificacion: "#7b1fa2",
  terminacion: "#9e9e9e",
  reversion: "#c62828",
  deriva: "#ef6c00",
};

export const ETIQUETA_MODO: Record<ModoCambio, string> = {
  "continuidad-estable": "continuidad estable",
  conversion: "conversión",
  estratificacion: "estratificación",
  terminacion: "terminación",
  reversion: "reversión",
  deriva: "deriva",
};

export const DESCRIPCION_MODO: Record<ModoCambio, string> = {
  "continuidad-estable": "Mismo instrumento, mismo modo: persiste.",
  conversion: "Mismo instrumento, redesplegado hacia otro uso.",
  estratificacion: "Solo en el gobierno posterior: se suma.",
  terminacion: "Solo en el gobierno anterior: se deja o reemplaza.",
  reversion: "Persiste pero invierte su rumbo.",
  deriva: "Persiste formalmente; su efecto cambia con el entorno.",
};

export const ETIQUETA_NATO: Record<ClaseNato, string> = {
  nodalidad: "nodalidad",
  autoridad: "autoridad",
  tesoro: "tesoro",
  organizacion: "organización",
  objetivo: "objetivo de política",
};

export const DESCRIPCION_NATO: Record<ClaseNato, string> = {
  nodalidad: "Información: datos, comunicación, orientación.",
  autoridad: "Normas y obligaciones (leyes, decretos).",
  tesoro: "Dinero (fondos, convocatorias).",
  organizacion: "Capacidad directa del Estado (programas).",
  objetivo: "Objetivo de política, no un instrumento.",
};

export const ETIQUETA_RELACION: Record<TipoRelacion, string> = {
  habilita: "habilita",
  financia: "financia",
  "depende-de": "depende de",
  encadena: "encadena",
};

const FORMA: Record<ClaseNato, SymbolType> = {
  nodalidad: symbolSquare,
  autoridad: symbolDiamond,
  tesoro: symbolTriangle,
  organizacion: symbolCircle,
  objetivo: symbolStar,
};

/** Glifo de texto equivalente a la forma (para leyenda y chips). */
export const GLIFO_NATO: Record<ClaseNato, string> = {
  nodalidad: "■",
  autoridad: "◆",
  tesoro: "▲",
  organizacion: "●",
  objetivo: "★",
};

/** Path SVG del símbolo de un instrumento, centrado en (0,0). `area` en px². */
export function pathSimbolo(clase: ClaseNato, area = 200): string {
  return symbol(FORMA[clase], area)() ?? "";
}

export const RADIO_POLITICA = 14;

export type { TipoNato };

/** Nombre legible del sector (el dataset trae el slug). */
export const NOMBRE_SECTOR: Record<string, string> = {
  "ciencia-tecnologia": "Ciencia, Tecnología e Innovación",
};
export const nombreSector = (slug: string) => NOMBRE_SECTOR[slug] ?? slug;
