import { describe, expect, it } from "vitest";
import type { Dataset } from "@laboratorio/red";
import { EstadoRed } from "./red.svelte.ts";

const obj = (id: string, extra: object = {}) => ({
  id,
  nombre: `Instrumento ${id}`,
  es_objetivo: false,
  tipo_nato: "tesoro" as const,
  politicas: ["p"],
  presencia: { "2018-2022": { activo: true } },
  modo_cambio: "deriva" as const,
  evidencia: [{ vigencia: "2018-2022" }],
  ...extra,
});
// p ← a, c ; q ← b, c ; a -habilita-> b
const DS: Dataset = {
  sector: "t",
  politicas: [
    { id: "p", nombre: "Política P" },
    { id: "q", nombre: "Política Q" },
  ],
  objetos: [
    obj("a"),
    obj("b", { modo_cambio: "conversion", politicas: ["q"], presencia: { "2022-2026": { activo: true } } }),
    obj("c", { politicas: ["p", "q"] }),
  ],
  relaciones: [{ source: "a", target: "b", tipo: "habilita" }],
};
const ids = (e: EstadoRed) => e.red.nodos.map((n) => n.id).sort();

describe("EstadoRed — filtros", () => {
  it("componen por intersección y no tocan el foco", () => {
    const e = new EstadoRed(DS);
    e.enfocar("ins:a");
    e.alternarModo("deriva");
    expect(ids(e)).toEqual(["ins:a", "ins:c", "pol:p", "pol:q"]);
    expect(e.foco.instrumento).toBe("a");
  });

  it("limpiarFiltros deja el foco intacto y visible en la ruta", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:q");
    e.alternarNato("tesoro");
    e.limpiarFiltros();
    expect(e.hayFiltros).toBe(false);
    expect(e.foco.politica).toBe("q");
    expect(e.ruta.map((t) => t.etiqueta)).toEqual(["Red completa", "Política Q"]);
  });

  it("nFiltros cuenta vigencia, modos y natos", () => {
    const e = new EstadoRed(DS);
    e.vigencia = "2022-2026";
    e.alternarModo("deriva");
    e.alternarNato("tesoro");
    expect(e.nFiltros).toBe(3);
  });
});

describe("EstadoRed — foco", () => {
  it("política aísla su subred; no hay vecindario atenuado", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:p");
    expect(ids(e)).toEqual(["ins:a", "ins:c", "pol:p"]);
    expect(e.nodoFoco?.id).toBe("pol:p");
    expect(e.vecindario).toBeNull();
  });

  it("instrumento en la red completa: resalta su vecindario sin ocultar nada", () => {
    const e = new EstadoRed(DS);
    e.enfocar("ins:a");
    expect(ids(e)).toHaveLength(5);
    expect(e.vecindario?.nodos.has("ins:b")).toBe(true);
    expect(e.ruta.map((t) => t.nivel)).toEqual(["red", "instrumento"]);
  });

  it("instrumento dentro de la subred de su política: conserva la subred", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:p");
    e.enfocar("ins:c");
    expect(e.foco).toEqual({ politica: "p", instrumento: "c" });
    expect(e.ruta.map((t) => t.nivel)).toEqual(["red", "politica", "instrumento"]);
  });

  it("instrumento ajeno a la subred actual: sale de la subred", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:p");
    e.enfocar("ins:b");
    expect(e.foco).toEqual({ politica: null, instrumento: "b" });
  });

  it("subirNivel e irA recorren la miga de pan; salirDelFoco vuelve a la red completa", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:p");
    e.enfocar("ins:c");
    e.subirNivel();
    expect(e.foco).toEqual({ politica: "p", instrumento: null });
    e.enfocar("ins:c");
    e.irA("red");
    expect(e.hayFoco).toBe(false);
    expect(ids(e)).toHaveLength(5);
  });

  it("si un filtro oculta el instrumento enfocado, se sale de ese nivel (sin foco colgado)", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:q");
    e.enfocar("ins:b");
    e.vigencia = "2018-2022"; // b solo está en 2022-2026
    expect(e.foco).toEqual({ politica: "q", instrumento: null });
    e.vigencia = "ambos";
    expect(e.foco.instrumento).toBeNull(); // no reaparece: se salió de verdad
  });

  it("enfocar una política oculta por filtros: limpia los filtros y llega (sin foco colgado)", () => {
    const e = new EstadoRed(DS);
    e.alternarModo("conversion"); // p no tiene instrumentos en conversión
    expect(e.estaOculto("pol:p")).toBe(true);
    e.enfocar("pol:p");
    expect(e.hayFiltros).toBe(false);
    expect(e.nodoFoco?.id).toBe("pol:p");
    expect(ids(e)).toEqual(["ins:a", "ins:c", "pol:p"]);
  });

  it("enfocar un instrumento oculto por filtros: limpia los filtros y llega", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:q");
    e.vigencia = "2022-2026"; // a solo está en 2018-2022
    e.enfocar("ins:a");
    expect(e.hayFiltros).toBe(false);
    expect(e.foco).toEqual({ politica: null, instrumento: "a" });
    expect(e.nodoFoco?.id).toBe("ins:a");
  });

  it("enfocar un id inexistente no cambia nada", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:q");
    e.enfocar("ins:nada");
    e.enfocar("pol:nada");
    expect(e.foco).toEqual({ politica: "q", instrumento: null });
  });

  it("si un filtro vacía la subred enfocada, se sale del foco", () => {
    const e = new EstadoRed(DS);
    e.enfocar("pol:q");
    e.alternarNato("autoridad"); // ningún instrumento es autoridad
    expect(e.hayFoco).toBe(false);
  });
});
