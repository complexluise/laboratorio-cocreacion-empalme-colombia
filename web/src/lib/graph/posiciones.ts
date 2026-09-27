import type { Red } from "@laboratorio/red";
import type { EnlaceSim, NodoSim } from "./forces.ts";

export type Posiciones = Map<string, { x: number; y: number }>;

/**
 * Nodos y enlaces para la simulación, reusando posiciones previas (cache por id) para que
 * re-filtrar no "explote" la red. Un nodo nuevo nace junto a un vecino ya ubicado, o cerca del
 * centro con un poco de ruido determinista.
 */
export function prepararSimulacion(red: Red, cache: Posiciones): { nodos: NodoSim[]; enlaces: EnlaceSim[] } {
  const vecinoUbicado = new Map<string, { x: number; y: number }>();
  for (const e of red.enlaces) {
    const ps = cache.get(e.source);
    const pt = cache.get(e.target);
    if (pt && !vecinoUbicado.has(e.source)) vecinoUbicado.set(e.source, pt);
    if (ps && !vecinoUbicado.has(e.target)) vecinoUbicado.set(e.target, ps);
  }

  const nodos: NodoSim[] = red.nodos.map((nodo, i) => {
    const previa = cache.get(nodo.id);
    if (previa) return { id: nodo.id, nodo, x: previa.x, y: previa.y };
    const ancla = vecinoUbicado.get(nodo.id) ?? { x: 0, y: 0 };
    const ang = i * 2.399963; // ángulo áureo: dispersión estable sin Math.random
    const r = ancla === vecinoUbicado.get(nodo.id) ? 24 : 40 + 6 * Math.sqrt(i);
    return { id: nodo.id, nodo, x: ancla.x + r * Math.cos(ang), y: ancla.y + r * Math.sin(ang) };
  });

  const porId = new Map(nodos.map((n) => [n.id, n]));
  const enlaces: EnlaceSim[] = [];
  for (const enlace of red.enlaces) {
    const source = porId.get(enlace.source);
    const target = porId.get(enlace.target);
    if (source && target) enlaces.push({ id: enlace.id, enlace, source, target });
  }
  return { nodos, enlaces };
}

export function guardarPosiciones(nodos: NodoSim[], cache: Posiciones): void {
  for (const n of nodos) {
    if (n.x !== undefined && n.y !== undefined) cache.set(n.id, { x: n.x, y: n.y });
  }
}
