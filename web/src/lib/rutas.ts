/**
 * Rutas por HASH: el build es IIFE y se sirve desde file:// y desde el subpath de Pages, así que
 * no hay router de historial. `#/`, `#/red`, `#/glosario[/<termino>]`, `#/metodologia[/<seccion>]`,
 * `#/inicio/<seccion>`.
 */
export const PAGINAS = ["inicio", "red", "glosario", "metodologia"] as const;
export type Pagina = (typeof PAGINAS)[number];

export interface Ruta {
  pagina: Pagina;
  /** Término del glosario o sección (del inicio o de la metodología) a la que se salta. */
  ancla?: string;
}

export const TITULO_PAGINA: Record<Pagina, string> = {
  inicio: "Laboratorio de Cocreación · Políticas públicas entre gobiernos",
  red: "Red de políticas e instrumentos · Laboratorio de Cocreación",
  glosario: "Glosario · Laboratorio de Cocreación",
  metodologia: "Cómo lo hicimos · Laboratorio de Cocreación",
};

const CON_ANCLA: ReadonlySet<Pagina> = new Set(["inicio", "glosario", "metodologia"]);

export function resolverRuta(hash: string): Ruta {
  if (!hash.startsWith("#/")) return { pagina: "inicio" };
  const [cabeza = "", ancla] = hash.slice(2).split("/").filter(Boolean);
  const pagina = PAGINAS.find((p) => p === cabeza.toLowerCase());
  if (pagina === undefined) return { pagina: "inicio" };
  return ancla !== undefined && CON_ANCLA.has(pagina) ? { pagina, ancla: decodificar(ancla).toLowerCase() } : { pagina };
}

function decodificar(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s; // secuencia % inválida: se usa tal cual
  }
}

export function hrefDe(pagina: Pagina, ancla?: string): string {
  const base = pagina === "inicio" ? (ancla === undefined ? "#/" : "#/inicio") : `#/${pagina}`;
  return ancla === undefined ? base : `${base}/${ancla}`;
}
