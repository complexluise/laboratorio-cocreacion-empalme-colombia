<script lang="ts">
  import { FILTROS_INICIALES, construirRed, vecindario } from "@laboratorio/red";
  import { dataset } from "$lib/data";
  import GraphView from "$lib/graph/GraphView.svelte";

  const red = construirRed(dataset, FILTROS_INICIALES);
  let seleccionado = $state<string | null>(null);
  const foco = $derived(seleccionado ? vecindario(red, seleccionado) : null);
</script>

<main>
  <GraphView {red} {foco} {seleccionado} onseleccionar={(id) => (seleccionado = id)} />
</main>

<style>
  main {
    height: 100dvh;
  }
</style>
