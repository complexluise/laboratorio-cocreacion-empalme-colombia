<script lang="ts">
  import type { EstadoRed } from "$lib/state/red.svelte.ts";

  /** Dónde está mirando el usuario: `Red completa › Política › Instrumento  ✕`. */
  interface Props {
    estado: EstadoRed;
  }
  let { estado }: Props = $props();
</script>

{#if estado.hayFoco}
  <nav class="miga" aria-label="Foco actual">
    <ol>
      {#each estado.ruta as tramo, i (tramo.nivel)}
        {@const ultimo = i === estado.ruta.length - 1}
        <li class:ultimo>
          {#if ultimo}
            <span aria-current="location" title={tramo.etiqueta}>{tramo.etiqueta}</span>
          {:else}
            <button type="button" onclick={() => estado.irA(tramo.nivel)} title={tramo.etiqueta}>{tramo.etiqueta}</button>
          {/if}
        </li>
      {/each}
    </ol>
    <button type="button" class="salir" aria-label="Salir del foco (Esc)" title="Salir del foco (Esc)" onclick={() => estado.salirDelFoco()}
      >✕</button
    >
  </nav>
{/if}

<style>
  .miga {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 4px;
    max-width: 100%;
    padding: 4px 4px 4px 12px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 999px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.08);
    font-size: 13px;
  }
  ol {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  li + li::before {
    content: "›";
    padding: 0 6px;
    color: var(--tinta-suave);
  }
  li:not(.ultimo) {
    flex: 0 1 auto;
    max-width: 9em;
  }
  li.ultimo {
    flex: 1 1 0;
    font-weight: 600;
  }
  li > * {
    display: block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    min-height: 40px;
    color: var(--acento);
    cursor: pointer;
  }
  .salir {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: var(--tinta);
    font-size: 15px;
  }
  .salir:hover {
    background: var(--fondo);
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
