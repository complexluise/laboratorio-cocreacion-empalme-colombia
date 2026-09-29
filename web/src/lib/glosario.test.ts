import { CAMBIOS_OBJETIVO, MODOS_CAMBIO, TIPOS_NATO, TIPOS_RELACION } from "@laboratorio/red";
import { describe, expect, it } from "vitest";
import { FUNDAMENTOS } from "./fundamentos.ts";
import {
  FUERA_DEL_RECORRIDO,
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
    // `grupo-<g>` es el ancla de cada sección del glosario.
    for (const id of ids) expect(id.startsWith("grupo-"), id).toBe(false);
  });

  it("ningún término del vocabulario controlado queda sin entrada", () => {
    const esperados = [
      ...MODOS_CAMBIO.map(idModo),
      ...TIPOS_NATO.map(idNato),
      ...CAMBIOS_OBJETIVO.map(idCambioObjetivo),
      ...TIPOS_RELACION.map(idRelacion),
      "presencia",
      "confianza",
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

  it("todo término definido tiene su lugar en el recorrido", () => {
    expect(FUERA_DEL_RECORRIDO).toEqual([]);
  });

  it("se lee en orden: cada término se apoya solo en los anteriores", () => {
    const posicion = new Map(GLOSARIO.map((e, i) => [e.id, i]));
    for (const [i, e] of GLOSARIO.entries())
      for (const u of e.usa ?? []) {
        const j = posicion.get(u);
        expect(j, `${e.id} usa ${u}, que no existe`).toBeDefined();
        expect(j!, `${e.id} usa ${u}, que viene después`).toBeLessThan(i);
      }
  });

  it("los grupos van seguidos y en el orden de lectura", () => {
    const orden = GLOSARIO.map((e) => GRUPOS.indexOf(e.grupo));
    expect(orden).toEqual([...orden].sort((a, b) => a - b));
  });

  it("cada fundamento corresponde a una entrada del glosario", () => {
    for (const id of Object.keys(FUNDAMENTOS)) expect(entradaPorId(id), id).toBeDefined();
  });

  it("toda categoría del mapa declara su origen", () => {
    const categorias = [
      "nato",
      ...TIPOS_NATO.map(idNato),
      "cambio-del-objetivo",
      ...CAMBIOS_OBJETIVO.map(idCambioObjetivo),
      "modo-de-cambio",
      ...MODOS_CAMBIO.map(idModo),
      "presencia",
      "confianza",
    ];
    for (const id of categorias) expect(entradaPorId(id)?.fundamento?.origen, id).toBeDefined();
  });

  it("lo adaptado o propio dice en qué se aparta, o cómo se usa en el mapa", () => {
    for (const e of GLOSARIO) {
      const f = e.fundamento;
      if (f && f.origen === "adaptacion") expect(f.ojo, e.id).toBeTruthy();
      if (f && f.origen !== "literatura") expect(f.ojo ?? f.enElMapa, e.id).toBeTruthy();
    }
  });

  it("filtra por término, expansión o definición, sin tildes ni mayúsculas", () => {
    expect(filtrarGlosario("zomac").map((e) => e.id)).toContain("zomac");
    expect(filtrarGlosario("planeacion").map((e) => e.id)).toContain("dnp");
    expect(filtrarGlosario("LAYERING").map((e) => e.id)).toContain(idModo("estratificacion"));
    expect(filtrarGlosario("  ")).toHaveLength(GLOSARIO.length);
    expect(filtrarGlosario("xyzzy")).toHaveLength(0);
  });
});
