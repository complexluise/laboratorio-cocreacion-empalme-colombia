import {
  construirRed,
  idInstrumento,
  idPolitica,
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
 * Foco de la exploración (ids crudos del dataset, sin prefijo):
 * - `politica` → aísla su subred (solo ella y sus instrumentos).
 * - `instrumento` → resalta su vecindario y atenúa el resto (dentro de la subred si hay una).
 */
export interface Foco {
  politica: string | null;
  instrumento: string | null;
}

/** Un tramo de la miga de pan: `Red completa › Política › Instrumento`. */
export interface TramoRuta {
  nivel: "red" | "politica" | "instrumento";
  etiqueta: string;
}

const SIN_FOCO: Foco = { politica: null, instrumento: null };

/**
 * Store central de la exploración (runes). Separa las intenciones del usuario:
 * - FILTRAR (`vigencia`, `modos`, `natos`): qué parte de la red se ve. Componen por intersección.
 * - ENFOCAR (`foco`): dónde está mirando. Independiente de los filtros; si un filtro oculta lo
 *   enfocado, se sale de ese nivel de foco (nunca queda un foco invisible colgado).
 * - NAVEGAR (buscar) no vive acá: `buscar()` de @laboratorio/red + `enfocar()`.
 */
export class EstadoRed {
  #vigencia = $state<VigenciaSel>("ambos");
  readonly modos = new SvelteSet<ModoCambio>();
  readonly natos = new SvelteSet<ClaseNato>();
  foco = $state<Foco>(SIN_FOCO);

  readonly red: Red = $derived.by(() =>
    construirRed(
      this.dataset,
      { vigencia: this.#vigencia, modos: this.modos, natos: this.natos },
      { politica: this.foco.politica },
    ),
  );

  /** Red con los filtros pero sin aislar subred: dice qué nodos ocultan los filtros. */
  readonly #visiblesPorFiltros: Set<string> = $derived.by(
    () =>
      new Set(
        construirRed(this.dataset, { vigencia: this.#vigencia, modos: this.modos, natos: this.natos }).nodos.map(
          (n) => n.id,
        ),
      ),
  );

  /** El nodo protagonista del foco: el instrumento si hay, si no la política. */
  readonly nodoFoco: Nodo | null = $derived.by(() => {
    const id =
      this.foco.instrumento !== null
        ? idInstrumento(this.foco.instrumento)
        : this.foco.politica !== null
          ? idPolitica(this.foco.politica)
          : null;
    return id === null ? null : (this.red.nodos.find((n) => n.id === id) ?? null);
  });

  /** Vecindario resaltado: solo con un instrumento enfocado (la política ya aísla su subred). */
  readonly vecindario: Vecindario | null = $derived(
    this.foco.instrumento === null ? null : vecindario(this.red, idInstrumento(this.foco.instrumento)),
  );

  readonly ruta: TramoRuta[] = $derived.by(() => {
    const tramos: TramoRuta[] = [{ nivel: "red", etiqueta: "Red completa" }];
    const { politica, instrumento } = this.foco;
    if (politica !== null) {
      const p = this.dataset.politicas?.find((x) => x.id === politica);
      tramos.push({ nivel: "politica", etiqueta: p?.nombre ?? politica });
    }
    if (instrumento !== null) {
      const o = this.dataset.objetos.find((x) => x.id === instrumento);
      tramos.push({ nivel: "instrumento", etiqueta: o?.nombre ?? instrumento });
    }
    return tramos;
  });

  readonly hayFoco: boolean = $derived(this.foco.politica !== null || this.foco.instrumento !== null);

  readonly nFiltros: number = $derived((this.#vigencia !== "ambos" ? 1 : 0) + this.modos.size + this.natos.size);

  readonly hayFiltros: boolean = $derived(this.nFiltros > 0);

  // Propiedad de parámetro: se asigna antes que los campos derivados que la leen.
  constructor(readonly dataset: Dataset) {}

  // ---- FILTRAR ----

  get vigencia(): VigenciaSel {
    return this.#vigencia;
  }
  set vigencia(v: VigenciaSel) {
    this.#vigencia = v;
    this.#sanearFoco();
  }

  alternarModo(m: ModoCambio) {
    if (!this.modos.delete(m)) this.modos.add(m);
    this.#sanearFoco();
  }

  alternarNato(c: ClaseNato) {
    if (!this.natos.delete(c)) this.natos.add(c);
    this.#sanearFoco();
  }

  /** Solo limpia filtros: el foco se conserva (y sigue visible en la miga de pan). */
  limpiarFiltros() {
    this.#vigencia = "ambos";
    this.modos.clear();
    this.natos.clear();
  }

  // ---- ENFOCAR ----

  /** ¿Los filtros actuales ocultan este nodo? (con independencia de la subred enfocada) */
  estaOculto(idNodo: string): boolean {
    return !this.#visiblesPorFiltros.has(idNodo);
  }

  /**
   * Enfoca un nodo por su id (`pol:…` / `ins:…`). NAVEGAR SIEMPRE LLEGA: si los filtros ocultan el
   * destino, se limpian primero (el buscador lo avisa). Ids inexistentes no cambian nada.
   * Política → aísla su subred. Instrumento → resalta su vecindario; conserva la subred actual
   * solo si el instrumento pertenece a esa política.
   */
  enfocar(idNodo: string) {
    const id = idNodo.slice(4);
    const esPolitica = idNodo.startsWith("pol:");
    const obj = esPolitica ? undefined : this.dataset.objetos.find((o) => o.id === id);
    if (esPolitica ? !this.dataset.politicas?.some((p) => p.id === id) : !obj) return;
    if (this.estaOculto(idNodo)) this.limpiarFiltros();

    if (esPolitica) {
      this.foco = { politica: id, instrumento: null };
      return;
    }
    const actual = this.foco.politica;
    const seQueda = actual !== null && (obj!.politicas ?? []).includes(actual);
    this.foco = { politica: seQueda ? actual : null, instrumento: id };
  }

  /** Vuelve a un tramo de la miga de pan. */
  irA(nivel: TramoRuta["nivel"]) {
    if (nivel === "red") this.salirDelFoco();
    else if (nivel === "politica") this.foco = { politica: this.foco.politica, instrumento: null };
  }

  /** Sube un nivel: instrumento → su subred (o red completa) → red completa. */
  subirNivel() {
    if (this.foco.instrumento !== null) this.foco = { politica: this.foco.politica, instrumento: null };
    else this.salirDelFoco();
  }

  salirDelFoco() {
    this.foco = SIN_FOCO;
  }

  /** Si un filtro deja fuera lo enfocado, se sale de ese nivel (sin estado colgado). */
  #sanearFoco() {
    const visibles = new Set(this.red.nodos.map((n) => n.id));
    let { politica, instrumento } = this.foco;
    if (politica !== null && !visibles.has(idPolitica(politica))) {
      politica = null;
      instrumento = null;
    }
    if (instrumento !== null && !visibles.has(idInstrumento(instrumento))) instrumento = null;
    if (politica !== this.foco.politica || instrumento !== this.foco.instrumento) {
      this.foco = { politica, instrumento };
    }
  }
}
