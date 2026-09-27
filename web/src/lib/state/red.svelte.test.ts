import { describe, expect, it } from "vitest";
import type { Dataset } from "@laboratorio/red";
import { EstadoRed } from "./red.svelte.ts";

const obj = (id: string, extra: object = {}) => ({
  id,
  nombre: id,
  es_objetivo: false,
  tipo_nato: "tesoro" as const,
  politicas: ["p"],
  presencia: { "2018-2022": { activo: true } },
  modo_cambio: "deriva" as const,
  evidencia: [{ vigencia: "2018-2022" }],
  ...extra,
});
const DS: Dataset = {
  sector: "t",
  politicas: [{ id: "p", nombre: "P" }, { id: "q", nombre: "Q" }],
  objetos: [obj("a"), obj("b", { modo_cambio: "conversion", politicas: ["q"] })],
};
const ids = (e: EstadoRed) => e.red.nodos.map((n) => n.id).sort();

describe("EstadoRed", () => {
  it("la red deriva de los filtros y compone por intersección", () => {
    const e = new EstadoRed(DS);
    expect(ids(e)).toEqual(["ins:a", "ins:b", "pol:p", "pol:q"]);
    e.alternarModo("deriva");
    expect(ids(e)).toEqual(["ins:a", "pol:p"]);
    e.enfocarPolitica("q");
    expect(ids(e)).toEqual([]);
    e.alternarModo("deriva");
    expect(ids(e)).toEqual(["ins:b", "pol:q"]);
  });

  it("alternar agrega y quita del conjunto", () => {
    const e = new EstadoRed(DS);
    e.alternarNato("objetivo");
    expect(e.natos.has("objetivo")).toBe(true);
    e.alternarNato("objetivo");
    expect(e.natos.size).toBe(0);
  });

  it("la selección da foco; si el nodo queda oculto, el foco se cae", () => {
    const e = new EstadoRed(DS);
    e.seleccionar("ins:a");
    expect(e.foco?.nodos.has("pol:p")).toBe(true);
    e.busqueda = "b";
    expect(e.nodoSeleccionado).toBeNull();
    expect(e.foco).toBeNull();
  });

  it("limpiar restablece todo y hayFiltros lo refleja", () => {
    const e = new EstadoRed(DS);
    e.vigencia = "2022-2026";
    e.alternarNato("tesoro");
    expect(e.hayFiltros).toBe(true);
    e.limpiar();
    expect(e.hayFiltros).toBe(false);
    expect(ids(e)).toHaveLength(4);
  });
});
