import { drag } from "d3-drag";
import type { Simulation } from "d3-force";
import { select } from "d3-selection";
import "d3-transition"; // extiende Selection con .transition() para el encuadre animado
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import type { EnlaceSim, NodoSim } from "./forces.ts";

/**
 * Acciones `use:` que conectan D3 con el DOM que renderiza Svelte. D3 manda en la física y en
 * los gestos (zoom/pan/drag, también táctiles); Svelte manda en el markup.
 */

/**
 * El centrado del lienzo vive DENTRO del transform de d3-zoom (no como un translate aparte):
 * así el punto bajo el cursor queda fijo al hacer zoom con rueda o pinch.
 */
export interface ControlZoom {
  ajustar: (caja: { x: number; y: number; ancho: number; alto: number }, lienzo: { ancho: number; alto: number }) => void;
  /** Desplaza la vista en px de pantalla (p. ej. medio delta de un resize, para mantener el centro). */
  desplazar: (dx: number, dy: number) => void;
  /** Acerca (>1) o aleja (<1) respecto del centro del lienzo (botones +/−). */
  escalar: (factor: number) => void;
}

export function zoomable(
  svg: SVGSVGElement,
  params: {
    onzoom: (t: ZoomTransform) => void;
    onlisto?: (c: ControlZoom) => void;
    /** Zoom/pan hecho por el usuario (rueda, pinch, arrastre), no por el programa. */
    ongesto?: () => void;
  },
) {
  let { onzoom, ongesto } = params;
  const comportamiento: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.15, 5])
    .on("zoom", (ev: { transform: ZoomTransform; sourceEvent: unknown }) => {
      if (ev.sourceEvent) ongesto?.();
      onzoom(ev.transform);
    });
  const sel = select(svg).call(comportamiento).on("dblclick.zoom", null);

  params.onlisto?.({
    ajustar(caja, lienzo) {
      if (caja.ancho <= 0 || caja.alto <= 0 || lienzo.ancho <= 0) return;
      const margen = 40;
      const k = Math.min(
        2,
        Math.max(0.15, Math.min((lienzo.ancho - margen) / caja.ancho, (lienzo.alto - margen) / caja.alto)),
      );
      const cx = caja.x + caja.ancho / 2;
      const cy = caja.y + caja.alto / 2;
      const destino = zoomIdentity.translate(lienzo.ancho / 2, lienzo.alto / 2).scale(k).translate(-cx, -cy);
      sel.transition().duration(450).call(comportamiento.transform, destino);
    },
    desplazar(dx, dy) {
      const t = zoomTransform(svg);
      sel.call(comportamiento.transform, zoomIdentity.translate(t.x + dx, t.y + dy).scale(t.k));
    },
    escalar(factor) {
      sel.transition().duration(250).call(comportamiento.scaleBy, factor);
    },
  });

  return {
    update(p: typeof params) {
      onzoom = p.onzoom;
      ongesto = p.ongesto;
    },
    destroy() {
      sel.on(".zoom", null);
    },
  };
}

export function arrastrable(
  el: SVGGElement,
  params: { nodo: NodoSim; sim: Simulation<NodoSim, EnlaceSim> | null; ongesto?: () => void },
) {
  let { nodo, sim, ongesto } = params;
  const comportamiento = drag<SVGGElement, unknown>()
    .subject(() => ({ x: nodo.x ?? 0, y: nodo.y ?? 0 }))
    .on("start", (ev: { active: number }) => {
      ongesto?.();
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
      ongesto = p.ongesto;
    },
    destroy() {
      sel.on(".drag", null);
    },
  };
}
/** Controles de vista que el lienzo expone a los botones que lo acompañan. */
export interface ControlesVista {
  ajustar: () => void;
  acercar: () => void;
  alejar: () => void;
}

export const CONTROLES_NULOS: ControlesVista = { ajustar() {}, acercar() {}, alejar() {} };
