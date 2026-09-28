<script lang="ts">
  import PaginaGlosario from "$lib/paginas/PaginaGlosario.svelte";
  import PaginaMetodologia from "$lib/paginas/PaginaMetodologia.svelte";
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

  // Tocar el enlace de la ruta en la que ya se está no dispara `hashchange`: se avisa a la página
  // para que vuelva a saltar a su ancla (o arriba).
  let visita = $state(0);
  function alClic(ev: MouseEvent) {
    const enlace = (ev.target as Element | null)?.closest?.("a[href^='#/']");
    if (enlace && enlace.getAttribute("href") === location.hash) visita++;
  }
</script>

<svelte:document onclick={alClic} />

{#if ruta.pagina === "red"}
  <PaginaRed />
{:else if ruta.pagina === "metodologia"}
  <PaginaMetodologia ancla={ruta.ancla} {visita} />
{:else if ruta.pagina === "glosario"}
  <PaginaGlosario ancla={ruta.ancla} {visita} />
{:else}
  <PaginaInicio ancla={ruta.ancla} {visita} />
{/if}
