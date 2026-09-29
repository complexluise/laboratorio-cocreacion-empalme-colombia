import { describe, expect, it } from "vitest";
import { CAPAS, INSTRUCCIONES_DATOS, PASOS } from "./metodologia.ts";

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
