import type { Red } from "./red.ts";

export interface Vecindario {
  nodos: Set<string>;
  enlaces: Set<string>;
}

/**
 * Foco de vecindario: el nodo + sus vecinos directos (por cualquier enlace) + 1 salto más por
 * relaciones instrumento↔instrumento desde los instrumentos alcanzados. Los enlaces resaltados
 * son los que unen dos nodos del vecindario.
 */
export function vecindario(red: Red, id: string): Vecindario {
  const nodos = new Set<string>();
  if (!red.nodos.some((n) => n.id === id)) return { nodos, enlaces: new Set() };

  nodos.add(id);
  for (const e of red.enlaces) {
    if (e.source === id) nodos.add(e.target);
    if (e.target === id) nodos.add(e.source);
  }

  const directos = [...nodos];
  for (const e of red.enlaces) {
    if (e.clase !== "relacion") continue;
    if (directos.includes(e.source)) nodos.add(e.target);
    if (directos.includes(e.target)) nodos.add(e.source);
  }

  const enlaces = new Set(
    red.enlaces.filter((e) => nodos.has(e.source) && nodos.has(e.target)).map((e) => e.id),
  );
  return { nodos, enlaces };
}
