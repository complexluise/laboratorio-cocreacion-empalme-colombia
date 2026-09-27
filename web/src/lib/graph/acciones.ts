import { drag } from "d3-drag";
import type { Simulation } from "d3-force";
import { select } from "d3-selection";
import "d3-transition"; // extiende Selection con .transition() para el encuadre animado
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import type { EnlaceSim, NodoSim } from "./forces.ts";

/**
 * Acciones `use:` que conectan D3 con el DOM que renderiza Svelte. D3 manda en la física y en
 * los gestos (zoom/pan/drag, también táctiles); Svelte manda en el markup.
 */

export interface ControlZoom {
  ajustar: (caja: { x: number; y: number; ancho: number; alto: number }, lienzo: { ancho: number; alto: number }) => void;
}

export function zoomable(
  svg: SVGSVGElement,
  params: { onzoom: (t: ZoomTransform) => void; onlisto?: (c: ControlZoom) => void },
) {
  let { onzoom } = params;
  const comportamiento: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.15, 5])
    .on("zoom", (ev: { transform: ZoomTransform }) => onzoom(ev.transform));
  const sel = select(svg).call(comportamiento).on("dblclick.zoom", null);

  params.onlisto?.({
    ajustar(caja, lienzo) {
      if (caja.ancho <= 0 || caja.alto <= 0 || lienzo.ancho <= 0) return;
      const margen = 40;
      const k = Math.min(
        2,
        Math.max(0.15, Math.min((lienzo.ancho - margen) / caja.ancho, (lienzo.alto - margen) / caja.alto)),
      );
      // El contenido ya está trasladado al centro del lienzo; centramos la caja sobre (0,0).
      const cx = caja.x + caja.ancho / 2;
      const cy = caja.y + caja.alto / 2;
      sel.transition().duration(450).call(comportamiento.transform, zoomIdentity.scale(k).translate(-cx, -cy));
    },
  });

  return {
    update(p: typeof params) {
      onzoom = p.onzoom;
    },
    destroy() {
      sel.on(".zoom", null);
    },
  };
}

export function arrastrable(el: SVGGElement, params: { nodo: NodoSim; sim: Simulation<NodoSim, EnlaceSim> | null }) {
  let { nodo, sim } = params;
  const comportamiento = drag<SVGGElement, unknown>()
    .subject(() => ({ x: nodo.x ?? 0, y: nodo.y ?? 0 }))
    .on("start", (ev: { active: number }) => {
      if (!ev.active) sim?.alphaTarget(0.25).restart();
      nodo.fx = nodo.x;
      nodo.fy = nodo.y;
    })
    .on("drag", (ev: { x: number; y: number }) => {
      nodo.fx = ev.x;
      nodo.fy = ev.y;
    })
    .on("end", (ev: { active: number }) => {
      if (!ev.active) sim?.alphaTarget(0);
      nodo.fx = null;
      nodo.fy = null;
    });
  const sel = select(el).call(comportamiento);
  return {
    update(p: typeof params) {
      nodo = p.nodo;
      sim = p.sim;
    },
    destroy() {
      sel.on(".drag", null);
    },
  };
}
