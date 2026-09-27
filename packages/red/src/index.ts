// Frontera pública de @laboratorio/red. Solo lo exportado acá cruza hacia web/.
export * from "./tipos.ts";
export {
  FILTROS_INICIALES,
  activoEn,
  construirRed,
  firmaTopologia,
  idInstrumento,
  idPolitica,
  normalizar,
} from "./red.ts";
export type { Enlace, Filtros, Nodo, NodoInstrumento, NodoPolitica, Red } from "./red.ts";
export { vecindario } from "./vecindario.ts";
export type { Vecindario } from "./vecindario.ts";
