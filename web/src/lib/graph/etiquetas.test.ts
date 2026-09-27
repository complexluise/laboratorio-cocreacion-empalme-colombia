import { describe, expect, it } from "vitest";
import { colocarEtiquetas, type Caja, type PedidoEtiqueta } from "./etiquetas.ts";

const solapan = (a: Caja, b: Caja) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const pedido = (id: string, x: number, y: number, prioridad = 1, extra: Partial<PedidoEtiqueta> = {}) => ({
  id,
  x,
  y,
  radio: 8,
  texto: `etiqueta ${id}`,
  prioridad,
  ...extra,
});

describe("colocarEtiquetas", () => {
  it("un nodo aislado se rotula abajo, centrado", () => {
    const [e] = colocarEtiquetas([pedido("a", 0, 0)], [], 11);
    expect(e).toMatchObject({ id: "a", ancla: "middle", x: 0 });
    expect(e!.caja.y0).toBeGreaterThan(0);
  });

  it("nunca deja dos etiquetas solapadas", () => {
    const pedidos = Array.from({ length: 40 }, (_, i) => pedido(`n${i}`, (i % 8) * 25, Math.floor(i / 8) * 12, i % 3));
    const out = colocarEtiquetas(pedidos, [], 11);
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) expect(solapan(out[i]!.caja, out[j]!.caja)).toBe(false);
    expect(out.length).toBeLessThan(pedidos.length); // algunas no caben y se omiten
  });

  it("gana la de mayor prioridad cuando compiten por el mismo lugar", () => {
    const out = colocarEtiquetas([pedido("baja", 0, 0, 1), pedido("alta", 1, 0, 5)], [], 11);
    expect(out[0]!.id).toBe("alta");
    expect(out.map((e) => e.id)).toContain("alta");
  });

  it("prueba otra posición si abajo está ocupado por un nodo", () => {
    const [e] = colocarEtiquetas([pedido("a", 0, 0)], [{ id: "b", x: 0, y: 20, radio: 10 }], 11);
    expect(e!.caja.y1).toBeLessThanOrEqual(0); // se fue arriba
  });

  it("una etiqueta forzada se coloca aunque no quepa", () => {
    const obst = [0, 1, 2, 3].map((i) => ({ id: `o${i}`, x: [0, 0, 40, -40][i]!, y: [20, -20, 0, 0][i]!, radio: 30 }));
    expect(colocarEtiquetas([pedido("a", 0, 0)], obst, 11)).toHaveLength(0);
    expect(colocarEtiquetas([pedido("a", 0, 0, 1, { forzada: true })], obst, 11)).toHaveLength(1);
  });
});
