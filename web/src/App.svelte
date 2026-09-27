<script lang="ts">
  import PaginaGlosario from "$lib/paginas/PaginaGlosario.svelte";
  import PaginaInicio from "$lib/paginas/PaginaInicio.svelte";
  import PaginaRed from "$lib/paginas/PaginaRed.svelte";
  import { resolverRuta, TITULO_PAGINA } from "$lib/rutas.ts";

  /** Shell del sitio: la ruta sale del hash (sirve en file:// y en el subpath de Pages). */
  let ruta = $state(resolverRuta(typeof location === "undefined" ? "" : location.hash));

  $effect(() => {
    const alCambiar = () => (ruta = resolverRuta(location.hash));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  });

  $effect(() => {
    document.title = TITULO_PAGINA[ruta.pagina];
  });
</script>

{#if ruta.pagina === "red"}
  <PaginaRed />
{:else if ruta.pagina === "glosario"}
  <PaginaGlosario ancla={ruta.ancla} />
{:else}
  <PaginaInicio ancla={ruta.ancla} />
{/if}
