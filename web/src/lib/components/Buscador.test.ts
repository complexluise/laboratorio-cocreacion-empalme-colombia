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

  it("anuncia siempre el n.º de resultados en una región viva", async () => {
    const { input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    expect(screen.getByRole("status").textContent).toMatch(/2 resultados/);
  });

  it("las flechas dan la vuelta y aria-activedescendant apunta a la opción activa", async () => {
    const { input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    const opciones = screen.getAllByRole("option");
    expect(input.getAttribute("aria-activedescendant")).toBe(opciones[0]!.id);
    await fireEvent.keyDown(input, { key: "ArrowUp" }); // desde la primera, vuelve a la última
    expect(input.getAttribute("aria-activedescendant")).toBe(opciones[1]!.id);
    expect(opciones[1]!.getAttribute("aria-selected")).toBe("true");
  });

  it("clic con el mouse elige (el blur no cierra la lista antes)", async () => {
    const { onelegir, input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    const politica = screen.getAllByRole("option")[0]!;
    const noDefault = await fireEvent.mouseDown(politica); // el panel previene el blur
    expect(noDefault).toBe(false);
    await fireEvent.click(politica);
    expect(onelegir).toHaveBeenCalledWith("pol:p");
  });

  it("Esc en el buscador no llega a la ventana (no saca del foco de la red)", async () => {
    const { input } = montar();
    const enVentana = vi.fn();
    window.addEventListener("keydown", enVentana);
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regal" } });
    await fireEvent.keyDown(input, { key: "Escape" });
    window.removeEventListener("keydown", enVentana);
    expect(enVentana).not.toHaveBeenCalled();
  });

  it("marca los resultados ocultos por los filtros", async () => {
    render(Buscador, { dataset: DS, onelegir: vi.fn(), oculto: (id: string) => id === "ins:sgr" });
    const input = screen.getByRole("combobox");
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "regalias" } });
    expect(screen.getByText(/oculto por los filtros/)).toBeTruthy();
  });

  it("sin resultados lo dice", async () => {
    const { input } = montar();
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "zzz" } });
    expect(screen.getByText(/Sin resultados/)).toBeTruthy();
  });
});
