import { describe, expect, it } from "vitest";
import { entradaPorId } from "./glosario.ts";
import { CAPAS, CATEGORIAS, INSTRUCCIONES_DATOS, PASOS, RECETA } from "./metodologia.ts";

describe("la receta", () => {
  it("cada paso tiene id único", () => {
    const ids = RECETA.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("declara la IA donde la usa, y solo ahí", () => {
    for (const p of RECETA) expect(Boolean(p.ia), p.id).toBe(p.quien.includes("ia"));
  });

  it("cada instrucción de la IA está en un paso, y cada paso cita una que existe", () => {
    const citadas = RECETA.flatMap((p) => (p.instruccion ? [p.instruccion] : []));
    expect(citadas.sort()).toEqual(INSTRUCCIONES_DATOS.map((i) => i.id).sort());
  });

  it("la verificación sigue a la extracción con IA", () => {
    const i = (id: string) => RECETA.findIndex((p) => p.id === id);
    expect(i("extraer")).toBeGreaterThanOrEqual(0);
    expect(i("verificar")).toBeGreaterThan(i("extraer"));
  });
});

describe("las categorías", () => {
  it("cada una remite a una entrada del glosario", () => {
    for (const c of CATEGORIAS) expect(entradaPorId(c.glosario), c.que).toBeDefined();
  });
});

describe("el paso a paso", () => {
  it("cada paso tiene id único, lo que hizo la IA y su resultado", () => {
    const ids = PASOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PASOS) expect(p.hizo && p.resultado, p.id).toBeTruthy();
  });

  it("solo el primer paso (sin conversación guardada) va sin prompts", () => {
    const sinPrompts = PASOS.filter((p) => p.pedimos.length === 0).map((p) => p.id);
    expect(sinPrompts).toEqual([PASOS[0]!.id]);
  });

  it("los prompts no están vacíos", () => {
    for (const p of PASOS) for (const m of p.pedimos) expect(m.trim().length, p.id).toBeGreaterThan(0);
  });

  it("hay instrucciones de procesamiento de los informes", () => {
    expect(INSTRUCCIONES_DATOS.length).toBeGreaterThan(0);
  });
});

describe("qué está revisado", () => {
  it("la red se declara sin revisión humana", () => {
    expect(CAPAS.find((c) => c.capa === "La red")?.estado).toBe("pendiente");
  });
});
