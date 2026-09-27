import { describe, expect, it } from "vitest";
import { DS } from "./fixture.test-util.ts";
import { FILTROS_INICIALES, construirRed, firmaTopologia, normalizar, type Filtros, type NodoPolitica } from "./red.ts";
import { objetivoEn } from "./tipos.ts";

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

  it("los filtros componen por intersección", () => {
    const red = construirRed(DS, f({ vigencia: "2022-2026", natos: new Set(["tesoro"]) }));
    expect(ids(red)).toEqual(["ins:b", "pol:pA", "pol:pB"]);
  });

  it("subred de una política: solo esa política y sus instrumentos", () => {
    const red = construirRed(DS, f(), { politica: "pA" });
    expect(ids(red)).toEqual(["ins:a", "ins:b", "pol:pA"]);
    expect(red.enlaces.every((e) => e.target !== "pol:pB")).toBe(true);
  });

  it("la subred compone con los filtros", () => {
    const red = construirRed(DS, f({ vigencia: "2022-2026", natos: new Set(["tesoro"]) }), { politica: "pB" });
    expect(ids(red)).toEqual(["ins:b", "pol:pB"]);
  });

  it("deduplica enlaces si el dato repite una política o una relación", () => {
    const sucio = {
      ...DS,
      objetos: DS.objetos.map((o) => (o.id === "a" ? { ...o, politicas: ["pA", "pA"] } : o)),
      relaciones: [...(DS.relaciones ?? []), { source: "a", target: "c", tipo: "habilita" as const }],
    };
    const red = construirRed(sucio, f());
    const idsEnlaces = red.enlaces.map((e) => e.id);
    expect(new Set(idsEnlaces).size).toBe(idsEnlaces.length);
    expect(red.enlaces).toHaveLength(construirRed(DS, f()).enlaces.length);
  });

  it("la firma de topología cambia con los filtros y es estable si no cambian", () => {
    expect(firmaTopologia(construirRed(DS, f()))).toBe(firmaTopologia(construirRed(DS, f())));
    expect(firmaTopologia(construirRed(DS, f()))).not.toBe(
      firmaTopologia(construirRed(DS, f({ vigencia: "2018-2022" }))),
    );
  });
});

describe("objetivo por gobierno", () => {
  it("un hub de política se marca sin objetivo en la vigencia que no lo declara", () => {
    const pol = (v: Filtros["vigencia"]) =>
      construirRed(DS, f({ vigencia: v })).nodos.find((n) => n.id === "pol:pB") as NodoPolitica | undefined;
    expect(pol("2018-2022")?.sinObjetivo).toBe(false);
    // pB no declara objetivo en 2022, pero su instrumento b sigue: el área queda "huérfana".
    expect(pol("2022-2026")?.sinObjetivo).toBe(true);
    expect(pol("ambos")?.sinObjetivo).toBe(false);
  });

  it("objetivoEn devuelve el objetivo declarado en esa vigencia", () => {
    const pB = DS.politicas![1]!;
    expect(objetivoEn(pB, "2018-2022")?.enunciados).toEqual(["Aprovechar la biodiversidad"]);
    expect(objetivoEn(pB, "2022-2026")).toBeUndefined();
  });

  it("una política sin 'objetivos' (dato legado) nunca se marca sin objetivo", () => {
    const legado = { ...DS, politicas: DS.politicas!.map(({ objetivos: _o, ...p }) => p) };
    const n = construirRed(legado, f({ vigencia: "2022-2026" })).nodos.find((x) => x.id === "pol:pB") as NodoPolitica;
    expect(n.sinObjetivo).toBe(false);
  });
});

describe("normalizar", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizar("  Innovación ÑANDÚ ")).toBe("innovacion nandu");
  });
});
