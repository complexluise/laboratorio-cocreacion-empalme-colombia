<script lang="ts">
  import { CLASES_NATO, MODOS_CAMBIO } from "@laboratorio/red";
  import { COLOR_MODO, DESCRIPCION_MODO, DESCRIPCION_NATO, ETIQUETA_MODO, ETIQUETA_NATO, GLIFO_NATO } from "$lib/visual.ts";

  /** Cómo LEER la red. Solo lectura: filtrar vive en el panel de filtros. */
  interface Props {
    abierta?: boolean;
  }
  let { abierta = $bindable(false) }: Props = $props();
</script>

<section class="leyenda" class:abierta aria-label="Leyenda">
  <button type="button" class="plegar" aria-expanded={abierta} onclick={() => (abierta = !abierta)}>
    <span>Leyenda</span><span aria-hidden="true">{abierta ? "▾" : "▴"}</span>
  </button>
  {#if abierta}
    <div class="cuerpo">
      <div class="grupo">
        <span class="titulo">Color · modo de cambio</span>
        <ul>
          {#each MODOS_CAMBIO as m (m)}
            <li title={DESCRIPCION_MODO[m]}><span class="muestra" style:background={COLOR_MODO[m]}></span>{ETIQUETA_MODO[m]}</li>
          {/each}
        </ul>
      </div>
      <div class="grupo">
        <span class="titulo">Forma · tipo NATO</span>
        <ul>
          {#each CLASES_NATO as c (c)}
            <li title={DESCRIPCION_NATO[c]}><span class="glifo" aria-hidden="true">{GLIFO_NATO[c]}</span>{ETIQUETA_NATO[c]}</li>
          {/each}
        </ul>
      </div>
      <div class="grupo">
        <span class="titulo">Nodos y enlaces</span>
        <ul>
          <li><span class="k-pol" aria-hidden="true"></span>política pública</li>
          <li><span class="k-linea" aria-hidden="true"></span>instrumento sirve a política</li>
          <li><span class="k-linea rel" aria-hidden="true"></span>relación entre instrumentos</li>
        </ul>
      </div>
    </div>
  {/if}
</section>

<style>
  .leyenda {
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.08);
    font-size: 12.5px;
    max-width: min(300px, calc(100vw - 100px));
    max-height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .plegar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 40px;
    padding: 0 12px;
    font: inherit;
    font-weight: 600;
    background: none;
    border: none;
    color: var(--tinta);
    cursor: pointer;
  }
  .cuerpo {
    padding: 0 12px 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .titulo {
    font-size: 11px;
    color: var(--tinta-suave);
  }
  ul {
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 10px;
  }
  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .grupo:last-child ul {
    grid-template-columns: 1fr;
  }
  .muestra {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex: none;
  }
  .glifo {
    width: 12px;
    text-align: center;
    color: var(--tinta-suave);
  }
  .k-pol {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--tinta);
    background: var(--papel);
    flex: none;
  }
  .k-linea {
    width: 18px;
    border-top: 1.5px solid var(--enlace);
    flex: none;
  }
  .k-linea.rel {
    border-top: 1.5px dashed var(--relacion);
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: -2px;
  }
</style>
