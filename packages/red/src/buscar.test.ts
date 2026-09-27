import { describe, expect, it } from "vitest";
import { DS } from "./fixture.test-util.ts";
import { buscar } from "./buscar.ts";

describe("buscar", () => {
  it("consulta vacía o de espacios: sin resultados", () => {
    expect(buscar(DS, "")).toEqual({ politicas: [], instrumentos: [], total: 0 });
    expect(buscar(DS, "   ").total).toBe(0);
  });

  it("agrupa políticas e instrumentos y devuelve ids de nodo", () => {
    const r = buscar(DS, "c");
    expect(r.politicas.every((x) => x.id.startsWith("pol:"))).toBe(true);
    expect(r.instrumentos.every((x) => x.id.startsWith("ins:"))).toBe(true);
  });

  it("sin tildes ni mayúsculas, y NO arrastra las políticas de un instrumento", () => {
    const r = buscar(DS, "EDUCACION");
    expect(r.politicas.map((x) => x.id)).toEqual(["pol:pA"]);
    expect(r.instrumentos).toEqual([]); // antes, buscar una política traía sus instrumentos
  });

  it("encuentra por alias y lo informa", () => {
    const [a] = buscar(DS, "2162").instrumentos;
    expect(a).toMatchObject({ id: "ins:a", nombre: "Ley de Ciencia", alias: "Ley 2162" });
  });

  it("encuentra un área por el nombre de una política declarada (y lo informa como alias)", () => {
    const [p] = buscar(DS, "colombia bio").politicas;
    expect(p).toMatchObject({ id: "pol:pB", alias: "Colombia BIO" });
  });

  it("marca el tramo coincidente del nombre (para resaltar)", () => {
    const [o] = buscar(DS, "ondas").instrumentos;
    expect(o!.nombre.slice(o!.tramo![0], o!.tramo![1])).toBe("Ondas");
  });

  it("ordena: comienzo de palabra antes que coincidencia interna", () => {
    const ds = {
      ...DS,
      objetos: [
        { ...DS.objetos[0]!, id: "x1", nombre: "Transregalías" },
        { ...DS.objetos[0]!, id: "x2", nombre: "Sistema de Regalías" },
      ],
    };
    expect(buscar(ds, "regal").instrumentos.map((x) => x.id)).toEqual(["ins:x2", "ins:x1"]);
  });

  it("respeta el límite por grupo e informa el total", () => {
    const r = buscar(DS, "a", 1);
    expect(r.politicas.length).toBeLessThanOrEqual(1);
    expect(r.instrumentos.length).toBeLessThanOrEqual(1);
    expect(r.total).toBeGreaterThan(r.politicas.length + r.instrumentos.length);
  });
});
