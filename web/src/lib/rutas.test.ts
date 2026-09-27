import { describe, expect, it } from "vitest";
import { hrefDe, resolverRuta, TITULO_PAGINA } from "./rutas.ts";

describe("resolverRuta", () => {
  it("sin hash, o con #/ , es el inicio", () => {
    expect(resolverRuta("")).toEqual({ pagina: "inicio" });
    expect(resolverRuta("#")).toEqual({ pagina: "inicio" });
    expect(resolverRuta("#/")).toEqual({ pagina: "inicio" });
  });

  it("reconoce la red y el glosario", () => {
    expect(resolverRuta("#/red")).toEqual({ pagina: "red" });
    expect(resolverRuta("#/glosario")).toEqual({ pagina: "glosario" });
  });

  it("tolera barra final y mayúsculas", () => {
    expect(resolverRuta("#/red/")).toEqual({ pagina: "red" });
    expect(resolverRuta("#/Glosario")).toEqual({ pagina: "glosario" });
  });

  it("el glosario acepta un término como ancla", () => {
    expect(resolverRuta("#/glosario/nato")).toEqual({ pagina: "glosario", ancla: "nato" });
  });

  it("las secciones del inicio también son anclas", () => {
    expect(resolverRuta("#/inicio/bitacora")).toEqual({ pagina: "inicio", ancla: "bitacora" });
  });

  it("una ruta desconocida vuelve al inicio", () => {
    expect(resolverRuta("#/nada")).toEqual({ pagina: "inicio" });
    expect(resolverRuta("#algo")).toEqual({ pagina: "inicio" });
  });

  it("el ancla se decodifica y pasa a minúsculas", () => {
    expect(resolverRuta("#/GLOSARIO/NATO")).toEqual({ pagina: "glosario", ancla: "nato" });
    expect(resolverRuta("#/glosario/a%C3%B1o")).toEqual({ pagina: "glosario", ancla: "año" });
    expect(resolverRuta("#/glosario/%E0%A4%A")).toEqual({ pagina: "glosario", ancla: "%e0%a4%a" });
  });

  it("la red ignora anclas", () => {
    expect(resolverRuta("#/red/x")).toEqual({ pagina: "red" });
  });
});

describe("hrefDe", () => {
  it("construye el hash de cada página, con ancla opcional", () => {
    expect(hrefDe("inicio")).toBe("#/");
    expect(hrefDe("red")).toBe("#/red");
    expect(hrefDe("glosario", "sgr")).toBe("#/glosario/sgr");
    expect(hrefDe("inicio", "bitacora")).toBe("#/inicio/bitacora");
  });

  it("ida y vuelta", () => {
    expect(resolverRuta(hrefDe("glosario", "pdet"))).toEqual({ pagina: "glosario", ancla: "pdet" });
  });

  it("cada página tiene título", () => {
    expect(Object.keys(TITULO_PAGINA).sort()).toEqual(["glosario", "inicio", "red"]);
  });
});
