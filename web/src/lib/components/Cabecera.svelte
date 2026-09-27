<script lang="ts">
  import type { Snippet } from "svelte";
  import Marca from "$lib/components/Marca.svelte";
  import { hrefDe, type Pagina } from "$lib/rutas.ts";

  /**
   * Cabecera COMÚN a todas las páginas: la marca (vuelve al inicio), las herramientas propias de la
   * página (en la red: buscador y filtros) y el menú del sitio. Mobile first: en pantallas angostas
   * el menú se pliega en un botón; en escritorio los enlaces van en línea.
   */
  interface Props {
    pagina: Pagina;
    contexto?: string;
    children?: Snippet;
  }
  let { pagina, contexto, children }: Props = $props();

  const ENLACES: { pagina: Pagina; etiqueta: string }[] = [
    { pagina: "inicio", etiqueta: "La actividad" },
    { pagina: "red", etiqueta: "La red" },
    { pagina: "glosario", etiqueta: "Glosario" },
  ];

  let menuAbierto = $state(false);
  let raiz: HTMLElement | undefined = $state();

  // Cambiar de página cierra el menú.
  $effect(() => {
    void pagina;
    menuAbierto = false;
  });

  function alClicDocumento(ev: MouseEvent) {
    if (menuAbierto && raiz && !raiz.contains(ev.target as Node)) menuAbierto = false;
  }
  function alTecla(ev: KeyboardEvent) {
    if (ev.key === "Escape" && menuAbierto) menuAbierto = false;
  }
</script>

<svelte:document onclick={alClicDocumento} onkeydown={alTecla} />

<header class="cabecera" bind:this={raiz}>
  <a class="inicio" href={hrefDe("inicio")} aria-label="Laboratorio de Cocreación — inicio">
    <Marca {contexto} nombreSiempre={children === undefined} />
  </a>

  {#if children}
    <div class="herramientas">{@render children()}</div>
  {:else}
    <div class="espacio"></div>
  {/if}

  <nav class="menu" aria-label="Secciones del sitio">
    <button
      type="button"
      class="btn-menu"
      aria-expanded={menuAbierto}
      aria-controls="menu-sitio"
      aria-label="Menú"
      onclick={() => (menuAbierto = !menuAbierto)}
    >
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
    </button>
    <ul id="menu-sitio" class:abierto={menuAbierto}>
      {#each ENLACES as e (e.pagina)}
        <li>
          <a href={hrefDe(e.pagina)} aria-current={pagina === e.pagina ? "page" : undefined}>{e.etiqueta}</a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<style>
  .cabecera {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    padding-top: max(8px, env(safe-area-inset-top));
    background: var(--papel);
    border-bottom: 1px solid var(--borde);
    position: relative;
    z-index: 20; /* listas desplegables (buscador, menú) sobre el contenido */
  }
  .inicio {
    flex: none;
    min-width: 0;
    color: inherit;
    text-decoration: none;
    border-radius: 8px;
  }
  .herramientas {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .espacio {
    flex: 1;
  }
  .menu {
    flex: none;
    position: relative;
  }
  .btn-menu {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--borde);
    border-radius: 10px;
    background: var(--papel);
    color: var(--tinta);
    cursor: pointer;
  }
  .btn-menu path {
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  ul {
    display: none;
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 190px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
  }
  ul.abierto {
    display: block;
  }
  ul a {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    color: var(--tinta);
    text-decoration: none;
    font-size: 15px;
  }
  ul a:hover {
    background: var(--fondo);
  }
  ul a[aria-current="page"] {
    color: var(--acento);
    font-weight: 650;
    background: var(--acento-suave);
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }

  /* ---------- Ampliación: escritorio (> 860 px) — enlaces en línea ---------- */
  @media (min-width: 861px) {
    .cabecera {
      gap: 16px;
      padding: 10px 18px;
    }
    .herramientas :global(.buscador) {
      max-width: 560px;
    }
    .btn-menu {
      display: none;
    }
    ul {
      display: flex;
      position: static;
      gap: 2px;
      padding: 0;
      min-width: 0;
      border: none;
      box-shadow: none;
      background: none;
    }
    ul a {
      min-height: 40px;
      font-size: 14px;
      white-space: nowrap;
    }
  }
</style>
