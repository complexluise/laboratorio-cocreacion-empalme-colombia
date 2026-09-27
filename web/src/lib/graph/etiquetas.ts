/**
 * Colocación de etiquetas sin solape (greedy por prioridad). Geometría pura, sin DOM:
 *
 * - Cada etiqueta prueba 4 posiciones alrededor de su nodo (abajo, arriba, derecha, izquierda).
 * - Se queda con la primera que no choca con etiquetas ya colocadas ni con otros nodos.
 * - Se colocan de mayor a menor prioridad; si ninguna posición cabe, la etiqueta se omite
 *   (salvo `forzada`: el nodo seleccionado o bajo el cursor siempre se rotula).
 *
 * Coordenadas en unidades del mundo (las de la simulación). El tamaño de fuente se pasa ya
 * dividido por el zoom, así el texto mide lo mismo en pantalla y al acercarse caben más.
 */

export interface PedidoEtiqueta {
  id: string;
  x: number;
  y: number;
  /** Radio del nodo: la etiqueta se separa de él. */
  radio: number;
  texto: string;
  prioridad: number;
  forzada?: boolean;
}

export interface Obstaculo {
  id: string;
  x: number;
  y: number;
  radio: number;
}

export interface EtiquetaColocada {
  id: string;
  texto: string;
  /** Punto de anclaje del <text> (baseline). */
  x: number;
  y: number;
  ancla: "start" | "middle" | "end";
  caja: Caja;
}

export interface Caja {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Ancho aproximado de un texto sans-serif de `fuente` px (sin medir el DOM). */
export function anchoTexto(texto: string, fuente: number): number {
  return texto.length * fuente * 0.56;
}

const solapan = (a: Caja, b: Caja) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

function chocaCirculo(c: Caja, o: Obstaculo): boolean {
  const px = Math.max(c.x0, Math.min(o.x, c.x1));
  const py = Math.max(c.y0, Math.min(o.y, c.y1));
  return (px - o.x) ** 2 + (py - o.y) ** 2 < o.radio ** 2;
}

function candidatas(p: PedidoEtiqueta, fuente: number): Omit<EtiquetaColocada, "id" | "texto">[] {
  const w = anchoTexto(p.texto, fuente);
  const h = fuente * 1.15;
  const sep = fuente * 0.3;
  const r = p.radio + sep;
  const desc = fuente * 0.25; // lo que baja el texto por debajo del baseline
  return [
    // abajo
    { x: p.x, y: p.y + r + h - desc, ancla: "middle", caja: { x0: p.x - w / 2, y0: p.y + r, x1: p.x + w / 2, y1: p.y + r + h } },
    // arriba
    { x: p.x, y: p.y - r - desc, ancla: "middle", caja: { x0: p.x - w / 2, y0: p.y - r - h, x1: p.x + w / 2, y1: p.y - r } },
    // derecha
    { x: p.x + r, y: p.y + h / 2 - desc, ancla: "start", caja: { x0: p.x + r, y0: p.y - h / 2, x1: p.x + r + w, y1: p.y + h / 2 } },
    // izquierda
    { x: p.x - r, y: p.y + h / 2 - desc, ancla: "end", caja: { x0: p.x - r - w, y0: p.y - h / 2, x1: p.x - r, y1: p.y + h / 2 } },
  ];
}

export function colocarEtiquetas(
  pedidos: PedidoEtiqueta[],
  obstaculos: Obstaculo[],
  fuente: number,
): EtiquetaColocada[] {
  const orden = [...pedidos].sort(
    (a, b) => Number(b.forzada ?? false) - Number(a.forzada ?? false) || b.prioridad - a.prioridad,
  );
  const colocadas: EtiquetaColocada[] = [];
  for (const p of orden) {
    const opciones = candidatas(p, fuente);
    const libre = opciones.find(
      (c) =>
        !colocadas.some((o) => solapan(c.caja, o.caja)) &&
        !obstaculos.some((o) => o.id !== p.id && chocaCirculo(c.caja, o)),
    );
    const elegida = libre ?? (p.forzada ? opciones[0] : undefined);
    if (elegida) colocadas.push({ id: p.id, texto: p.texto, ...elegida });
  }
  return colocadas;
}
