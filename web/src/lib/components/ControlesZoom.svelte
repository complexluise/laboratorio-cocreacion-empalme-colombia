<script lang="ts">
  import type { ControlesVista } from "$lib/graph/acciones.ts";

  interface Props {
    controles: ControlesVista;
  }
  let { controles }: Props = $props();
</script>

<div class="zoom" role="group" aria-label="Zoom de la red">
  <button type="button" aria-label="Acercar" title="Acercar" onclick={() => controles.acercar()}>+</button>
  <button type="button" aria-label="Alejar" title="Alejar" onclick={() => controles.alejar()}>−</button>
  <button type="button" aria-label="Ajustar la vista a la red" title="Ajustar vista" onclick={() => controles.ajustar()}>⤢</button>
</div>

<style>
  .zoom {
    display: flex;
    flex-direction: column;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.08);
    overflow: hidden;
  }
  button {
    width: 44px;
    height: 44px;
    font: inherit;
    font-size: 20px;
    line-height: 1;
    background: none;
    border: none;
    color: var(--tinta);
    cursor: pointer;
  }
  button + button {
    border-top: 1px solid var(--borde);
  }
  button:hover {
    background: var(--fondo);
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: -2px;
  }
</style>
