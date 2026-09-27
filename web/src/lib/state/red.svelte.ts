import {
  construirRed,
  vecindario,
  type ClaseNato,
  type Dataset,
  type ModoCambio,
  type Nodo,
  type Red,
  type Vecindario,
  type VigenciaSel,
} from "@laboratorio/red";
import { SvelteSet } from "svelte/reactivity";

/**
 * Store central de la exploración (runes). Los filtros COMPONEN POR INTERSECCIÓN (ver
 * `construirRed`); `modos`/`natos` vacíos = sin restricción. La selección no altera la
 * topología: solo el foco de vecindario.
 */
export class EstadoRed {
  vigencia = $state<VigenciaSel>("ambos");
  busqueda = $state("");
  politica = $state<string | null>(null);
  readonly modos = new SvelteSet<ModoCambio>();
  readonly natos = new SvelteSet<ClaseNato>();
  seleccionado = $state<string | null>(null);

  readonly red: Red = $derived.by(() =>
    construirRed(this.dataset, {
      vigencia: this.vigencia,
      busqueda: this.busqueda,
      politica: this.politica,
      modos: this.modos,
      natos: this.natos,
    }),
  );

  /** El nodo seleccionado, si sigue visible tras filtrar. */
  readonly nodoSeleccionado: Nodo | null = $derived(
    this.seleccionado === null ? null : (this.red.nodos.find((n) => n.id === this.seleccionado) ?? null),
  );

  readonly foco: Vecindario | null = $derived(
    this.nodoSeleccionado === null ? null : vecindario(this.red, this.nodoSeleccionado.id),
  );

  readonly hayFiltros: boolean = $derived(
    this.vigencia !== "ambos" ||
      this.busqueda.trim() !== "" ||
      this.politica !== null ||
      this.modos.size > 0 ||
      this.natos.size > 0,
  );

  // Propiedad de parámetro: se asigna antes que los campos derivados que la leen.
  constructor(readonly dataset: Dataset) {}

  seleccionar(id: string | null) {
    this.seleccionado = id;
  }

  alternarModo(m: ModoCambio) {
    if (!this.modos.delete(m)) this.modos.add(m);
  }

  alternarNato(c: ClaseNato) {
    if (!this.natos.delete(c)) this.natos.add(c);
  }

  enfocarPolitica(id: string | null) {
    this.politica = id;
  }

  limpiar() {
    this.vigencia = "ambos";
    this.busqueda = "";
    this.politica = null;
    this.modos.clear();
    this.natos.clear();
  }
}
