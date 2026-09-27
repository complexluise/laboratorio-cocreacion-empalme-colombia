import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Dataset } from "@laboratorio/red";
import Buscador from "./Buscador.svelte";

const DS: Dataset = {
  sector: "t",
  politicas: [{ id: "p", nombre: "Política de Regalías" }],
  objetos: [
    {
      id: "sgr",
      nombre: "Sistema General de Regalías",
      es_objetivo: false,
      tipo_nato: "tesoro",
      politicas: ["p"],
      presencia: { "2018-2022": { activo: true } },
      modo_cambio: "conversion",
      evidencia: [{ vigencia: "2018-2022" }],
    },
  ],
};

function montar() {
  const onelegir = vi.fn();
  render(Buscador, { dataset: DS, onelegir });
  return { onelegir, input: screen.getByRole("combobox") };
}

afterEach(cleanup);

describe("Buscador", () => {
  it("escribir muestra la lista agrupada y NO elige nada", async () => {
    const { onelegir, input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Políticas" })).toBeTruthy();
    expect(onelegir).not.toHaveBeenCalled();
  });

  it("↓ + Enter elige el resultado activo y vacía el buscador", async () => {
    const { onelegir, input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onelegir).toHaveBeenCalledWith("ins:sgr");
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("Esc limpia la consulta y cierra la lista", async () => {
    const { input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regal" } });
    await fireEvent.keyDown(input, { key: "Escape" });
    expect((input as HTMLInputElement).value).toBe("");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("sin resultados lo dice", async () => {
    const { input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "zzz" } });
    expect(screen.getByText(/Sin resultados/)).toBeTruthy();
  });
});
