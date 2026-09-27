import { describe, expect, it } from "vitest";
import { DS } from "./fixture.test-util.ts";
import { FILTROS_INICIALES, construirRed } from "./red.ts";
import { vecindario } from "./vecindario.ts";

const red = construirRed(DS, FILTROS_INICIALES);
const orden = (s: Set<string>) => [...s].sort();

describe("vecindario", () => {
  it("instrumento: él + vecinos directos + 1 salto por relaciones", () => {
    // a → pA (pertenencia), c (habilita); desde c un salto por relación → d. No llega a pB.
    const v = vecindario(red, "ins:a");
    expect(orden(v.nodos)).toEqual(["ins:a", "ins:c", "ins:d", "pol:pA"]);
  });

  it("política: ella + sus instrumentos + 1 salto por relaciones desde ellos", () => {
    // pB → b, c ; c relaciona con a y d.
    const v = vecindario(red, "pol:pB");
    expect(orden(v.nodos)).toEqual(["ins:a", "ins:b", "ins:c", "ins:d", "pol:pB"]);
  });

  it("el salto extra es solo por relaciones, no por pertenencia", () => {
    // b → pA, pB. No sigue de pA hacia a por pertenencia.
    const v = vecindario(red, "ins:b");
    expect(orden(v.nodos)).toEqual(["ins:b", "pol:pA", "pol:pB"]);
  });

  it("resalta solo enlaces con ambos extremos en el vecindario", () => {
    const v = vecindario(red, "ins:b");
    expect(orden(v.enlaces)).toEqual(["ins:b->pol:pA", "ins:b->pol:pB"]);
  });

  it("id inexistente: vecindario vacío", () => {
    expect(vecindario(red, "ins:zzz").nodos.size).toBe(0);
  });
});
