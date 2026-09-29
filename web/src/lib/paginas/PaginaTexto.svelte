<script lang="ts">
  import type { Snippet } from "svelte";
  import Cabecera from "$lib/components/Cabecera.svelte";
  import type { Pagina } from "$lib/rutas.ts";
  import { tomarObjetivo } from "$lib/scroll-memory.ts";

  /**
   * Marco de las páginas de LECTURA (inicio, glosario): cabecera común y un área que scrollea
   * (el body no scrollea: la red ocupa la pantalla). Al llegar, salta a `ancla` si la hay; si no,
   * arriba. El foco va al contenido para que el lector de pantalla anuncie la página.
   */
  interface Props {
    pagina: Pagina;
    ancla?: string | undefined;
    /** Cambia al volver a tocar el enlace de la ruta actual (el hash no cambia): re-salta. */
    visita?: number;
    children: Snippet;
  }
  let { pagina, ancla, visita = 0, children }: Props = $props();

  let area: HTMLElement | undefined = $state();

  $effect(() => {
    void visita;
    if (!area) return;
    // Volver con «atrás/adelante»: restaurar la posición exacta (gana sobre el ancla).
    const restaurar = tomarObjetivo();
    if (restaurar !== undefined) {
      area.scrollTop = restaurar;
      area.focus({ preventScroll: true });
      return;
    }
    const destino = ancla ? area.querySelector<HTMLElement>(`[id="${CSS.escape(ancla)}"]`) : null;
    if (destino) {
      destino.scrollIntoView({ block: "start" });
      destino.focus({ preventScroll: true });
    } else {
      area.scrollTop = 0;
      area.focus({ preventScroll: true });
    }
  });
</script>

<div class="pagina">
  <Cabecera {pagina} contexto="políticas públicas entre gobiernos" />
  <main class="area" bind:this={area} tabindex="-1">
    <div class="columna">
      {@render children()}
    </div>
  </main>
</div>

<style>
  .pagina {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    height: 100dvh;
    background: var(--fondo);
  }
  .area {
    overflow-y: auto;
    outline: none;
    scroll-padding-top: 12px;
  }
  .columna {
    max-width: 760px;
    margin: 0 auto;
    padding: 20px 16px calc(48px + env(safe-area-inset-bottom));
  }
  @media (min-width: 861px) {
    .columna {
      padding: 40px 24px 72px;
    }
  }
  /* Tipografía de lectura compartida por inicio y glosario. */
  .columna :global(h1) {
    font-family: var(--fuente-display);
    font-size: clamp(28px, 7vw, 44px);
    line-height: 1.08;
    letter-spacing: -0.02em;
    margin: 8px 0 14px;
  }
  .columna :global(h2) {
    font-family: var(--fuente-display);
    font-size: clamp(21px, 4.6vw, 27px);
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin: 0 0 10px;
  }
  .columna :global(h3) {
    font-size: 16px;
    margin: 20px 0 6px;
  }
  .columna :global(p),
  .columna :global(li) {
    font-size: 16px;
    line-height: 1.6;
  }
  .columna :global(a) {
    color: var(--acento);
  }
  .columna :global(a:focus-visible),
  .columna :global(button:focus-visible),
  .columna :global(input:focus-visible) {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
  .columna :global([tabindex="-1"]:focus) {
    outline: none;
  }
  .columna :global(.antetitulo) {
    font: 600 12px var(--fuente-ui);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--acento);
    margin: 0;
  }
  .columna :global(.bajada) {
    font-size: 18px;
    line-height: 1.55;
    color: var(--tinta-suave);
  }
</style>
