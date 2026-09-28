import { describe, expect, it } from "vitest";
import { CAPAS, evidencia, FASES, firma, hitosDe, RETORNO_TALLER, type Hito } from "./metodologia.ts";

describe("el flujo de la metodología", () => {
  it("las fases tienen ids únicos y el retorno del taller existe", () => {
    const ids = FASES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(RETORNO_TALLER);
  });

  it("cada hito de la evidencia cae en una fase del flujo", () => {
    const ids = new Set(FASES.map((f) => f.id));
    for (const h of evidencia.hitos) expect(ids, h.commit).toContain(h.fase);
  });

  it("toda fase ocurrida tiene evidencia en git; la que está por venir, no", () => {
    for (const f of FASES) {
      if (f.porVenir) expect(hitosDe(evidencia, f.id), f.id).toHaveLength(0);
      else expect(hitosDe(evidencia, f.id).length, f.id).toBeGreaterThan(0);
    }
  });

  it("toda fase declara al menos un actor y lo que hizo cada parte", () => {
    for (const f of FASES) {
      expect(f.actores.length, f.id).toBeGreaterThan(0);
      expect(f.persona && f.maquina && f.rastro, f.id).toBeTruthy();
    }
  });
});

describe("la evidencia de git", () => {
  it("los commits suman por tipo de autoría", () => {
    const c = evidencia.commits;
    expect(c.agente + c.persona_con_ia + c.persona).toBe(c.total);
  });

  it("ninguna capa se declara revisada al 100 %", () => {
    expect(CAPAS.some((c) => c.estado === "parcial" || c.estado === "pendiente")).toBe(true);
  });
});

describe("firma", () => {
  const base: Hito = { fase: "x", commit: "abc1234", que: "", autor: "Claude", fecha: "2026-01-01", asunto: "feat: x", coautores: [] };
  it("distingue agente, persona con IA, persona sola e integración", () => {
    expect(firma(base)).toMatch(/agente/);
    expect(firma({ ...base, autor: "alguien", coautores: ["Claude"] })).toMatch(/con Claude/);
    expect(firma({ ...base, autor: "alguien" })).toMatch(/sin IA/);
    expect(firma({ ...base, autor: "alguien", asunto: "Merge pull request #8 from x" })).toMatch(/integración/);
  });
});
