/**
 * Memoria de scroll por ruta, para restaurar la posición exacta al volver con «atrás/adelante».
 *
 * El scroll de las páginas de texto vive en un contenedor interno (`.area` de `PaginaTexto`), no en
 * la ventana. La restauración de scroll nativa del navegador solo aplica a la ventana, así que la
 * hacemos nosotros: `App` guarda la posición al dejar una ruta y decide, en cada navegación, si el
 * próximo montaje debe restaurar (historial) o saltar al ancla/arriba (clic). `PaginaTexto` la aplica.
 */

/** Última posición de scroll conocida de cada ruta (por su hash, p. ej. `#/metodologia`). */
const posiciones = new Map<string, number>();

/** Guarda la posición de scroll de una ruta. Ignora el hash vacío (páginas sin `.area`). */
export function guardarScroll(hash: string, top: number): void {
  if (hash) posiciones.set(hash, top);
}

/** La posición guardada para una ruta, o `undefined` si no hay ninguna. */
export function scrollGuardado(hash: string): number | undefined {
  return posiciones.get(hash);
}

/** Scroll a restaurar en el próximo montaje. Lo fija `App` en una navegación de historial. */
let objetivo: number | undefined;

/** Fija (o limpia, con `undefined`) el scroll a restaurar en el próximo montaje. */
export function fijarObjetivo(top: number | undefined): void {
  objetivo = top;
}

/** Devuelve y consume el objetivo: solo se restaura una vez por navegación. */
export function tomarObjetivo(): number | undefined {
  const top = objetivo;
  objetivo = undefined;
  return top;
}
