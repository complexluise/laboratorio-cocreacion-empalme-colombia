<script lang="ts">
  import { CLASES_NATO, MODOS_CAMBIO } from "@laboratorio/red";
  import type { EstadoRed } from "$lib/state/red.svelte.ts";
  import {
    COLOR_MODO,
    DESCRIPCION_MODO,
    DESCRIPCION_NATO,
    ETIQUETA_MODO,
    ETIQUETA_NATO,
    GLIFO_NATO,
  } from "$lib/visual.ts";

  interface Props {
    estado: EstadoRed;
    abierta?: boolean;
  }
  let { estado, abierta = $bindable(true) }: Props = $props();
</script>

<section class="leyenda" aria-label="Leyenda y filtros">
  <button type="button" class="plegar" aria-expanded={abierta} onclick={() => (abierta = !abierta)}>
    Leyenda y filtros <span aria-hidden="true">{abierta ? "▾" : "▸"}</span>
  </button>

  {#if abierta}
    <div class="grupo">
      <span class="grupo-lbl">Color · modo de cambio <em>(clic para filtrar)</em></span>
      <div class="items">
        {#each MODOS_CAMBIO as m (m)}
          <button
            type="button"
            class="item"
            class:inactivo={estado.modos.size > 0 && !estado.modos.has(m)}
            aria-pressed={estado.modos.has(m)}
            title={DESCRIPCION_MODO[m]}
            onclick={() => estado.alternarModo(m)}
          >
            <span class="muestra" style:background={COLOR_MODO[m]}></span>{ETIQUETA_MODO[m]}
          </button>
        {/each}
      </div>
    </div>

    <div class="grupo">
      <span class="grupo-lbl">Forma · tipo NATO <em>(clic para filtrar)</em></span>
      <div class="items">
        {#each CLASES_NATO as c (c)}
          <button
            type="button"
            class="item"
            class:inactivo={estado.natos.size > 0 && !estado.natos.has(c)}
            aria-pressed={estado.natos.has(c)}
            title={DESCRIPCION_NATO[c]}
            onclick={() => estado.alternarNato(c)}
          >
            <span class="glifo" aria-hidden="true">{GLIFO_NATO[c]}</span>{ETIQUETA_NATO[c]}
          </button>
        {/each}
      </div>
    </div>

    <div class="grupo">
      <span class="grupo-lbl">Nodos y enlaces</span>
      <div class="items estaticos">
        <span class="item"><span class="k-pol" aria-hidden="true"></span>política</span>
        <span class="item"><span class="k-linea" aria-hidden="true"></span>instrumento sirve a política</span>
        <span class="item"><span class="k-linea rel" aria-hidden="true"></span>relación entre instrumentos</span>
      </div>
    </div>
  {/if}
</section>

<style>
  .leyenda {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12.5px;
  }
  .plegar {
    align-self: flex-start;
    font: inherit;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: none;
    border: none;
    padding: 2px 0;
    color: var(--tinta);
    cursor: pointer;
  }
  .grupo {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .grupo-lbl {
    font-size: 11px;
    color: var(--tinta-suave);
  }
  .grupo-lbl em {
    font-style: normal;
    opacity: 0.8;
  }
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font: inherit;
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid var(--borde);
    background: var(--papel);
    color: var(--tinta);
  }
  button.item {
    cursor: pointer;
  }
  button.item[aria-pressed="true"] {
    border-color: var(--acento);
    box-shadow: inset 0 0 0 1px var(--acento);
  }
  .item.inactivo {
    opacity: 0.4;
  }
  .estaticos .item {
    border-color: transparent;
    padding-left: 0;
  }
  .muestra {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .glifo {
    font-size: 12px;
    color: var(--tinta-suave);
  }
  .k-pol {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--tinta);
    background: var(--papel);
  }
  .k-linea {
    width: 18px;
    border-top: 1.5px solid var(--enlace);
  }
  .k-linea.rel {
    border-top: 1.5px dashed var(--relacion);
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
