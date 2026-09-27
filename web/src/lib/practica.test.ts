import type { Dataset, Objeto } from "@laboratorio/red";
import { describe, expect, it } from "vitest";
import { dataset } from "$lib/data";
import { evaluar, MODOS_PRACTICA, preguntasPractica } from "./practica.ts";

const ins = (id: string, o: Partial<Objeto>): Objeto => ({ id, nombre: id, politicas: [], ...o }) as Objeto;

const mini = {
  sector: "x",
  politicas: [],
  relaciones: [],
  objetos: [
    // incoherente: dice continuidad pero su narrativa dice terminación -> se descarta
    ins("a", {
      modo_cambio: "continuidad-estable",
      presencia: { "2018-2022": { activo: true, modo: "logrado" }, "2022-2026": { activo: true, modo: "logrado" } },
      narrativa: { g2018: "x", g2022: "y", cambio: "Terminación: desaparece" },
    }),
    ins("b", {
      modo_cambio: "continuidad-estable",
      tipo_nato: "tesoro",
      presencia: { "2018-2022": { activo: true, modo: "logrado" }, "2022-2026": { activo: true, modo: "logrado" } },
      narrativa: { g2018: "antes", g2022: "después", cambio: "Continuidad estable: sigue" },
    }),
    // incoherente: estratificación con presencia en 2018 -> se descarta
    ins("c", { modo_cambio: "estratificacion", presencia: { "2018-2022": { activo: true, modo: "logrado" } } }),
    ins("d", { modo_cambio: "estratificacion", presencia: { "2022-2026": { activo: true, modo: "propuesto" } }, narrativa: { g2022: "nuevo", cambio: "Instrumento nuevo" } }),
    ins("e", { modo_cambio: "terminacion", presencia: { "2018-2022": { activo: true, modo: "logrado" } }, narrativa: { g2018: "viejo" } }),
    ins("f", {
      modo_cambio: "conversion",
      presencia: { "2018-2022": { activo: true, modo: "logrado" }, "2022-2026": { activo: true, modo: "logrado" } },
      narrativa: { g2018: "uno", g2022: "otro", cambio: "Conversión: otro fin" },
    }),
  ],
} as unknown as Dataset;

describe("preguntasPractica", () => {
  it("una pregunta por modo, en orden, con ejemplos coherentes", () => {
    const ps = preguntasPractica(mini);
    expect(ps.map((p) => p.correcta)).toEqual([...MODOS_PRACTICA]);
    expect(ps.map((p) => p.id)).toEqual(["b", "f", "d", "e"]);
  });

  it("muestra la presencia por gobierno y la narrativa", () => {
    const [b] = preguntasPractica(mini);
    expect(b?.presencia).toEqual({ "2018-2022": "logrado", "2022-2026": "logrado" });
    expect(b?.antes).toBe("antes");
    expect(b?.despues).toBe("después");
  });

  it("omite un modo sin ejemplo coherente", () => {
    const sinConversion = { ...mini, objetos: mini.objetos.filter((o) => o.id !== "f") } as Dataset;
    expect(preguntasPractica(sinConversion).map((p) => p.correcta)).not.toContain("conversion");
  });

  it("con el dataset real hay una pregunta por cada modo de la práctica", () => {
    expect(preguntasPractica(dataset).map((p) => p.correcta)).toEqual([...MODOS_PRACTICA]);
  });
});

describe("evaluar", () => {
  const [b] = preguntasPractica(mini);

  it("acierta y explica", () => {
    const r = evaluar(b!, "continuidad-estable");
    expect(r.correcta).toBe(true);
    expect(r.mensaje).toMatch(/continuidad estable/i);
  });

  it("falla con una pista que depende de la presencia", () => {
    const r = evaluar(b!, "estratificacion");
    expect(r.correcta).toBe(false);
    expect(r.mensaje).toMatch(/ambos gobiernos/i);
  });
});
