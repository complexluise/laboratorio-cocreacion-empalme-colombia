<script lang="ts">
  import type { EstadoRed } from "$lib/state/red.svelte.ts";

  interface Props {
    estado: EstadoRed;
    onajustar: () => void;
  }
  let { estado, onajustar }: Props = $props();

  const nInstrumentos = $derived(estado.red.nodos.filter((n) => n.tipo === "ins").length);
  const nPoliticas = $derived(estado.red.nodos.length - nInstrumentos);
</script>

<div class="toolbar">
  <label class="campo">
    <span class="lbl">Vigencia</span>
    <select bind:value={estado.vigencia}>
      <option value="ambos">Ambos gobiernos</option>
      <option value="2018-2022">2018–2022</option>
      <option value="2022-2026">2022–2026</option>
    </select>
  </label>

  <div class="acciones">
    <span class="conteo" aria-live="polite">{nPoliticas} políticas · {nInstrumentos} instrumentos</span>
    {#if estado.hayFiltros}
      <button type="button" class="sec" onclick={() => estado.limpiarFiltros()}>Limpiar filtros</button>
    {/if}
    <button type="button" onclick={onajustar}>Ajustar vista</button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px 14px;
  }
  .campo {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .lbl {
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  select {
    font: inherit;
    font-size: 14px;
    padding: 7px 9px;
    border: 1px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    color: var(--tinta);
  }
  select:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
  .acciones {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .conteo {
    font: 12px var(--fuente-dato);
    color: var(--tinta-suave);
    white-space: nowrap;
  }
  button {
    font: inherit;
    font-size: 13px;
    padding: 7px 12px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: var(--acento);
    color: white;
    cursor: pointer;
    white-space: nowrap;
  }
  button.sec {
    background: transparent;
    color: var(--acento);
  }
</style>
