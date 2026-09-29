import { beforeEach, describe, expect, it } from "vitest";
import { fijarObjetivo, guardarScroll, scrollGuardado, tomarObjetivo } from "./scroll-memory.ts";

describe("scroll-memory", () => {
  beforeEach(() => {
    fijarObjetivo(undefined); // dejar el objetivo limpio entre casos
  });

  it("guarda y recupera la posición por hash", () => {
    guardarScroll("#/metodologia", 800);
    expect(scrollGuardado("#/metodologia")).toBe(800);
  });

  it("devuelve undefined para una ruta sin posición guardada", () => {
    expect(scrollGuardado("#/ruta-nunca-visitada")).toBeUndefined();
  });

  it("sobrescribe la posición al volver a guardar la misma ruta", () => {
    guardarScroll("#/glosario", 100);
    guardarScroll("#/glosario", 240);
    expect(scrollGuardado("#/glosario")).toBe(240);
  });

  it("ignora el hash vacío (páginas sin contenedor de scroll)", () => {
    guardarScroll("", 500);
    expect(scrollGuardado("")).toBeUndefined();
  });

  it("consume el objetivo: solo restaura una vez", () => {
    fijarObjetivo(650);
    expect(tomarObjetivo()).toBe(650);
    expect(tomarObjetivo()).toBeUndefined();
  });

  it("fijar undefined limpia el objetivo pendiente", () => {
    fijarObjetivo(320);
    fijarObjetivo(undefined);
    expect(tomarObjetivo()).toBeUndefined();
  });
});
