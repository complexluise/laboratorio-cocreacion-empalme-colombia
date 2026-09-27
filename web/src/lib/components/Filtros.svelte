<script lang="ts">
  import { CLASES_NATO, MODOS_CAMBIO, claseNato, type VigenciaSel } from "@laboratorio/red";
  import type { EstadoRed } from "$lib/state/red.svelte.ts";
  import { COLOR_MODO, DESCRIPCION_MODO, DESCRIPCION_NATO, ETIQUETA_MODO, ETIQUETA_NATO, GLIFO_NATO } from "$lib/visual.ts";

  /**
   * FILTRAR: qué parte de la red se ve. Solo filtros (el foco vive en la miga de pan).
   * Modo y NATO son chips de "mostrar solo": sin ninguno marcado se ve todo.
   */
  interface Props {
    estado: EstadoRed;
  }
  let { estado }: Props = $props();

  const VIGENCIAS: { valor: VigenciaSel; etiqueta: string }[] = [
    { valor: "2018-2022", etiqueta: "2018–22" },
    { valor: "ambos", etiqueta: "Ambos" },
    { valor: "2022-2026", etiqueta: "2022–26" },
  ];

  // Solo las clases NATO que existen en el dato (p. ej. ya no hay nodos "objetivo de política").
  const clases = $derived(CLASES_NATO.filter((c) => estado.dataset.objetos.some((o) => claseNato(o) === c)));

  const nInstrumentos = $derived(estado.red.nodos.filter((n) => n.tipo === "ins").length);
  const nPoliticas = $derived(estado.red.nodos.length - nInstrumentos);
</script>

<section class="filtros" aria-labelledby="filtros-titulo">
  <h2 id="filtros-titulo" class="oculto-visual">Filtros</h2>

  <fieldset>
    <legend>Gobierno (vigencia)</legend>
    <div class="segmentado">
      {#each VIGENCIAS as v (v.valor)}
        <label class:activo={estado.vigencia === v.valor}>
          <input type="radio" name="vigencia" value={v.valor} bind:group={estado.vigencia} />
          {v.etiqueta}
        </label>
      {/each}
    </div>
  </fieldset>

  <fieldset>
    <legend>Modo de cambio <span class="ayuda">mostrar solo</span></legend>
    <div class="chips">
      {#each MODOS_CAMBIO as m (m)}
        <button
          type="button"
          class="chip"
          aria-pressed={estado.modos.has(m)}
          title={DESCRIPCION_MODO[m]}
          onclick={() => estado.alternarModo(m)}
        >
          <span class="muestra" style:background={COLOR_MODO[m]} aria-hidden="true"></span>{ETIQUETA_MODO[m]}
        </button>
      {/each}
    </div>
  </fieldset>

  <fieldset>
    <legend>Tipo de instrumento (NATO) <span class="ayuda">mostrar solo</span></legend>
    <div class="chips">
      {#each clases as c (c)}
        <button
          type="button"
          class="chip"
          aria-pressed={estado.natos.has(c)}
          title={DESCRIPCION_NATO[c]}
          onclick={() => estado.alternarNato(c)}
        >
          <span class="glifo" aria-hidden="true">{GLIFO_NATO[c]}</span>{ETIQUETA_NATO[c]}
        </button>
      {/each}
    </div>
  </fieldset>

  <footer>
    <span class="conteo" aria-live="polite">{nPoliticas} políticas · {nInstrumentos} instrumentos</span>
    <button type="button" class="limpiar" disabled={!estado.hayFiltros} onclick={() => estado.limpiarFiltros()}>
      Limpiar filtros
    </button>
  </footer>
</section>

<style>
  .filtros {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .oculto-visual {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  fieldset {
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }
  legend {
    padding: 0;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--tinta);
  }
  .ayuda {
    font-weight: 400;
    color: var(--tinta-suave);
    margin-left: 4px;
  }
  .segmentado {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--borde);
    border-radius: 10px;
    overflow: hidden;
  }
  .segmentado label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    font-size: 14px;
    cursor: pointer;
    background: var(--papel);
  }
  .segmentado label + label {
    border-left: 1px solid var(--borde);
  }
  .segmentado label.activo {
    background: var(--acento);
    color: white;
    font-weight: 600;
  }
  .segmentado input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .segmentado label:has(input:focus-visible) {
    outline: 2px solid var(--acento);
    outline-offset: -3px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 40px;
    padding: 0 12px;
    font: inherit;
    font-size: 13.5px;
    border-radius: 999px;
    border: 1px solid var(--borde);
    background: var(--papel);
    color: var(--tinta);
    cursor: pointer;
  }
  .chip[aria-pressed="true"] {
    border-color: var(--acento);
    background: var(--acento-suave);
    box-shadow: inset 0 0 0 1px var(--acento);
    font-weight: 600;
  }
  .muestra {
    width: 11px;
    height: 11px;
    border-radius: 3px;
  }
  .glifo {
    color: var(--tinta-suave);
  }
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid var(--borde);
  }
  .conteo {
    font: 12px var(--fuente-dato);
    color: var(--tinta-suave);
  }
  .limpiar {
    min-height: 40px;
    padding: 0 14px;
    font: inherit;
    font-size: 13.5px;
    border-radius: 10px;
    border: 1px solid var(--acento);
    background: transparent;
    color: var(--acento);
    cursor: pointer;
  }
  .limpiar:disabled {
    border-color: var(--borde);
    color: var(--tinta-suave);
    cursor: default;
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
