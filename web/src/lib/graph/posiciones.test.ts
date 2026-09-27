import { describe, expect, it } from "vitest";
import { FILTROS_INICIALES, construirRed, type Dataset } from "@laboratorio/red";
import { guardarPosiciones, prepararSimulacion, type Posiciones } from "./posiciones.ts";

const DS: Dataset = {
  sector: "t",
  politicas: [{ id: "p", nombre: "P" }],
  objetos: ["a", "b"].map((id) => ({
    id,
    nombre: id,
    es_objetivo: false,
    tipo_nato: "tesoro" as const,
    politicas: ["p"],
    presencia: { "2018-2022": { activo: true } },
    modo_cambio: "deriva" as const,
    evidencia: [{ vigencia: "2018-2022" }],
  })),
  relaciones: [{ source: "a", target: "b", tipo: "habilita" }],
};
const red = construirRed(DS, FILTROS_INICIALES);

describe("prepararSimulacion", () => {
  it("reusa la posición cacheada por id", () => {
    const cache: Posiciones = new Map([["ins:a", { x: 123, y: -45 }]]);
    const { nodos } = prepararSimulacion(red, cache);
    expect(nodos.find((n) => n.id === "ins:a")).toMatchObject({ x: 123, y: -45 });
  });

  it("un nodo nuevo nace cerca de un vecino ya ubicado", () => {
    const cache: Posiciones = new Map([["pol:p", { x: 500, y: 500 }]]);
    const { nodos } = prepararSimulacion(red, cache);
    const b = nodos.find((n) => n.id === "ins:b")!;
    expect(Math.hypot(b.x! - 500, b.y! - 500)).toBeLessThan(30);
  });

  it("enlaces con referencias a los nodos de la simulación", () => {
    const { nodos, enlaces } = prepararSimulacion(red, new Map());
    expect(enlaces).toHaveLength(3);
    for (const e of enlaces) {
      expect(nodos).toContain(e.source);
      expect(nodos).toContain(e.target);
    }
  });

  it("guardarPosiciones persiste x/y por id", () => {
    const cache: Posiciones = new Map();
    const { nodos } = prepararSimulacion(red, cache);
    guardarPosiciones(nodos, cache);
    expect(cache.size).toBe(nodos.length);
  });
});
