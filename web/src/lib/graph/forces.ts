import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { Enlace, Nodo } from "@laboratorio/red";

/**
 * Parámetros de la física, expuestos para tuning. Filosofía: MENOS GRAVEDAD que el PoC —
 * centro blando (forceX/forceY en vez de forceCenter), repulsión acotada por distancia y
 * enlaces más largos y flojos, para que la red respire y los grupos se lean.
 */
export const FUERZAS = {
  centro: 0.035,
  carga: { politica: -480, instrumento: -90, distanciaMax: 420 },
  pertenencia: { distancia: 95, fuerza: 0.22 },
  relacion: { distancia: 110, fuerza: 0.04 },
  colision: { politica: 42, instrumento: 16 },
  alphaDecay: 0.03,
} as const;

export interface NodoSim extends SimulationNodeDatum {
  id: string;
  nodo: Nodo;
}

export interface EnlaceSim extends SimulationLinkDatum<NodoSim> {
  id: string;
  enlace: Enlace;
  source: NodoSim;
  target: NodoSim;
}

/** Simulación centrada en (0,0): el lienzo traslada al centro, así un resize no la reinicia. */
export function crearSimulacion(nodos: NodoSim[], enlaces: EnlaceSim[]): Simulation<NodoSim, EnlaceSim> {
  const esPol = (n: NodoSim) => n.nodo.tipo === "pol";
  return forceSimulation(nodos)
    .alphaDecay(FUERZAS.alphaDecay)
    .force(
      "enlace",
      forceLink<NodoSim, EnlaceSim>(enlaces)
        .id((n) => n.id)
        .distance((e) =>
          e.enlace.clase === "pertenencia" ? FUERZAS.pertenencia.distancia : FUERZAS.relacion.distancia,
        )
        .strength((e) =>
          e.enlace.clase === "pertenencia" ? FUERZAS.pertenencia.fuerza : FUERZAS.relacion.fuerza,
        ),
    )
    .force(
      "carga",
      forceManyBody<NodoSim>()
        .strength((n) => (esPol(n) ? FUERZAS.carga.politica : FUERZAS.carga.instrumento))
        .distanceMax(FUERZAS.carga.distanciaMax),
    )
    .force(
      "colision",
      forceCollide<NodoSim>((n) => (esPol(n) ? FUERZAS.colision.politica : FUERZAS.colision.instrumento)),
    )
    .force("x", forceX<NodoSim>(0).strength(FUERZAS.centro))
    .force("y", forceY<NodoSim>(0).strength(FUERZAS.centro));
}
