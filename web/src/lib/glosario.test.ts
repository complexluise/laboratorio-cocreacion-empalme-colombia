import { CAMBIOS_OBJETIVO, MODOS_CAMBIO, TIPOS_NATO, TIPOS_RELACION } from "@laboratorio/red";
import { describe, expect, it } from "vitest";
import {
  GLOSARIO,
  GRUPOS,
  entradaPorId,
  filtrarGlosario,
  idCambioObjetivo,
  idModo,
  idNato,
  idRelacion,
} from "./glosario.ts";

describe("glosario", () => {
  it("los ids son únicos y sirven de ancla (slug)", () => {
    const ids = GLOSARIO.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("ningún término del vocabulario controlado queda sin entrada", () => {
    const esperados = [
      ...MODOS_CAMBIO.map(idModo),
      ...TIPOS_NATO.map(idNato),
      ...CAMBIOS_OBJETIVO.map(idCambioObjetivo),
      ...TIPOS_RELACION.map(idRelacion),
    ];
    for (const id of esperados) expect(entradaPorId(id), id).toBeDefined();
  });

  it("las referencias cruzadas apuntan a entradas que existen", () => {
    for (const e of GLOSARIO) for (const v of e.ver ?? []) expect(entradaPorId(v), `${e.id} → ${v}`).toBeDefined();
  });

  it("cada grupo tiene entradas y cada entrada una definición", () => {
    for (const g of GRUPOS) expect(GLOSARIO.some((e) => e.grupo === g), g).toBe(true);
    for (const e of GLOSARIO) expect(e.definicion.length, e.id).toBeGreaterThan(20);
  });

  it("filtra por término, expansión o definición, sin tildes ni mayúsculas", () => {
    expect(filtrarGlosario("zomac").map((e) => e.id)).toContain("zomac");
    expect(filtrarGlosario("planeacion").map((e) => e.id)).toContain("dnp");
    expect(filtrarGlosario("LAYERING").map((e) => e.id)).toContain(idModo("estratificacion"));
    expect(filtrarGlosario("  ")).toHaveLength(GLOSARIO.length);
    expect(filtrarGlosario("xyzzy")).toHaveLength(0);
  });
});
