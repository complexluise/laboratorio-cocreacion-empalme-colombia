<script lang="ts">
  import type { EstadoRed } from "$lib/state/red.svelte.ts";

  interface Props {
    estado: EstadoRed;
    onajustar: () => void;
  }
  let { estado, onajustar }: Props = $props();

  const politicas = $derived(
    [...(estado.dataset.politicas ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
  );
  const nInstrumentos = $derived(estado.red.nodos.filter((n) => n.tipo === "ins").length);
  const nPoliticas = $derived(estado.red.nodos.length - nInstrumentos);
</script>

<div class="toolbar" role="search">
  <label class="campo buscar">
    <span class="lbl">Buscar</span>
    <input type="search" placeholder="Instrumento, alias o política…" bind:value={estado.busqueda} />
  </label>

  <label class="campo">
    <span class="lbl">Vigencia</span>
    <select bind:value={estado.vigencia}>
      <option value="ambos">Ambos gobiernos</option>
      <option value="2018-2022">2018–2022</option>
      <option value="2022-2026">2022–2026</option>
    </select>
  </label>

  <label class="campo politica">
    <span class="lbl">Enfocar política</span>
    <select
      value={estado.politica ?? ""}
      onchange={(e) => estado.enfocarPolitica(e.currentTarget.value || null)}
    >
      <option value="">Todas las políticas</option>
      {#each politicas as p (p.id)}
        <option value={p.id}>{p.nombre}</option>
      {/each}
    </select>
  </label>

  <div class="acciones">
    <span class="conteo" aria-live="polite">{nPoliticas} políticas · {nInstrumentos} instrumentos</span>
    {#if estado.hayFiltros}
      <button type="button" class="sec" onclick={() => estado.limpiar()}>Limpiar filtros</button>
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
    min-width: 0;
  }
  .buscar {
    flex: 1 1 200px;
  }
  .politica {
    flex: 1 1 220px;
    max-width: 340px;
  }
  .lbl {
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  input,
  select {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    font: inherit;
    font-size: 14px;
    padding: 7px 9px;
    border: 1px solid var(--borde);
    border-radius: 8px;
    background: var(--papel);
    color: var(--tinta);
  }
  input:focus-visible,
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
