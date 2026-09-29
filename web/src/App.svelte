<script lang="ts">
  import PaginaGlosario from "$lib/paginas/PaginaGlosario.svelte";
  import PaginaMetodologia from "$lib/paginas/PaginaMetodologia.svelte";
  import PaginaInicio from "$lib/paginas/PaginaInicio.svelte";
  import PaginaRed from "$lib/paginas/PaginaRed.svelte";
  import { resolverRuta, TITULO_PAGINA } from "$lib/rutas.ts";
  import { fijarObjetivo, guardarScroll, scrollGuardado } from "$lib/scroll-memory.ts";

  /** Shell del sitio: la ruta sale del hash (sirve en file:// y en el subpath de Pages). */
  let ruta = $state(resolverRuta(typeof location === "undefined" ? "" : location.hash));

  /** El próximo `hashchange` viene de un clic en un enlace (un «push»): no se restaura scroll. */
  let navPorClic = false;

  const hashDe = (url: string) => {
    const i = url.indexOf("#");
    return i === -1 ? "" : url.slice(i);
  };

  $effect(() => {
    const alCambiar = (ev: HashChangeEvent) => {
      // Guardar dónde estaba el scroll de la página que se deja (su `.area`, si tiene).
      const area = document.querySelector<HTMLElement>(".area");
      if (area) guardarScroll(hashDe(ev.oldURL), area.scrollTop);
      // Restaurar solo en navegación de historial (atrás/adelante), no al hacer clic en un enlace.
      fijarObjetivo(navPorClic ? undefined : scrollGuardado(location.hash));
      navPorClic = false;
      ruta = resolverRuta(location.hash);
    };
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  });

  $effect(() => {
    document.title = TITULO_PAGINA[ruta.pagina];
  });

  // Tocar el enlace de la ruta en la que ya se está no dispara `hashchange`: se avisa a la página
  // para que vuelva a saltar a su ancla (o arriba). Un enlace a otra ruta marca un «push».
  let visita = $state(0);
  function alClic(ev: MouseEvent) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const enlace = (ev.target as Element | null)?.closest?.("a[href^='#/']");
    if (!enlace) return;
    if (enlace.getAttribute("href") === location.hash) {
      fijarObjetivo(undefined);
      visita++;
    } else {
      navPorClic = true;
    }
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
