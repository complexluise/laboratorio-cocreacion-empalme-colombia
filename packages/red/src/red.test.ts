import { describe, expect, it } from "vitest";
import { DS } from "./fixture.test-util.ts";
import { FILTROS_INICIALES, construirRed, firmaTopologia, normalizar, type Filtros } from "./red.ts";

const f = (p: Partial<Filtros> = {}): Filtros => ({ ...FILTROS_INICIALES, ...p });
const ids = (red: ReturnType<typeof construirRed>) => red.nodos.map((n) => n.id).sort();

describe("construirRed", () => {
  it("sin filtros: todos los instrumentos y solo las políticas con instrumentos", () => {
    const red = construirRed(DS, f());
    expect(ids(red)).toEqual(["ins:a", "ins:b", "ins:c", "ins:d", "pol:pA", "pol:pB"]);
  });

  it("enlaces de pertenencia (bipartita) + relaciones entre visibles, sin auto-lazos", () => {
    const red = construirRed(DS, f());
    const pert = red.enlaces.filter((e) => e.clase === "pertenencia").map((e) => e.id).sort();
    expect(pert).toEqual(["ins:a->pol:pA", "ins:b->pol:pA", "ins:b->pol:pB", "ins:c->pol:pB"]);
    const rel = red.enlaces.filter((e) => e.clase === "relacion");
    expect(rel).toHaveLength(2);
  });

  it("vigencia: solo los activos en esa vigencia; relaciones con extremo oculto se caen", () => {
    const red = construirRed(DS, f({ vigencia: "2022-2026" }));
    expect(ids(red)).toEqual(["ins:a", "ins:b", "ins:d", "pol:pA", "pol:pB"]);
    expect(red.enlaces.some((e) => e.clase === "relacion")).toBe(false);
  });

  it("modo de cambio: filtra por el conjunto elegido", () => {
    const red = construirRed(DS, f({ modos: new Set(["terminacion"]) }));
    expect(ids(red)).toEqual(["ins:c", "pol:pB"]);
  });

  it("tipo NATO: los objetivos se filtran como clase 'objetivo'", () => {
    expect(ids(construirRed(DS, f({ natos: new Set(["objetivo"]) })))).toEqual(["ins:d"]);
    expect(ids(construirRed(DS, f({ natos: new Set(["tesoro", "autoridad"]) })))).toEqual([
      "ins:a",
      "ins:b",
      "pol:pA",
      "pol:pB",
    ]);
  });

  it("enfocar por política: aísla su subred (solo esa política y sus instrumentos)", () => {
    const red = construirRed(DS, f({ politica: "pA" }));
    expect(ids(red)).toEqual(["ins:a", "ins:b", "pol:pA"]);
    expect(red.enlaces.every((e) => e.target !== "pol:pB")).toBe(true);
  });

  it("buscar: por nombre, alias o nombre de política, sin tildes ni mayúsculas", () => {
    expect(ids(construirRed(DS, f({ busqueda: "ondas" })))).toEqual(["ins:c", "pol:pB"]);
    expect(ids(construirRed(DS, f({ busqueda: "2162" })))).toEqual(["ins:a", "pol:pA"]);
    expect(ids(construirRed(DS, f({ busqueda: "EDUCACION" })))).toEqual(["ins:a", "ins:b", "pol:pA", "pol:pB"]);
  });

  it("los filtros componen por intersección", () => {
    const red = construirRed(DS, f({ vigencia: "2022-2026", natos: new Set(["tesoro"]), politica: "pB" }));
    expect(ids(red)).toEqual(["ins:b", "pol:pB"]);
  });

  it("la firma de topología cambia con los filtros y es estable si no cambian", () => {
    expect(firmaTopologia(construirRed(DS, f()))).toBe(firmaTopologia(construirRed(DS, f())));
    expect(firmaTopologia(construirRed(DS, f()))).not.toBe(
      firmaTopologia(construirRed(DS, f({ vigencia: "2018-2022" }))),
    );
  });
});

describe("normalizar", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizar("  Innovación ÑANDÚ ")).toBe("innovacion nandu");
  });
});
