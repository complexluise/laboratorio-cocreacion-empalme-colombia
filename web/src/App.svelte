<script lang="ts">
  import { dataset } from "$lib/data";
  import DetailPanel from "$lib/components/DetailPanel.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import Marca from "$lib/components/Marca.svelte";
  import Buscador from "$lib/components/Buscador.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import GraphView from "$lib/graph/GraphView.svelte";
  import { EstadoRed } from "$lib/state/red.svelte.ts";

  const estado = new EstadoRed(dataset);
  let ajustar = $state<() => void>(() => {});

  // Mobile: la toolbar y la leyenda se pliegan; el panel es una hoja inferior EN EL FLUJO (fila
  // del grid), así nunca tapa el grafo: el lienzo se achica y la física se re-centra sola.
  const consulta = typeof window === "undefined" ? null : window.matchMedia("(max-width: 860px)");
  let movil = $state(consulta?.matches ?? false);
  $effect(() => {
    if (!consulta) return;
    const alCambiar = (e: MediaQueryListEvent) => (movil = e.matches);
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  });

  let filtrosAbiertos = $state(false);
  let leyendaAbierta = $state(!(consulta?.matches ?? false));
  let hojaAbierta = $state(false);

  // Al seleccionar un nodo en mobile se abre la hoja; al deseleccionar se pliega.
  $effect(() => {
    hojaAbierta = estado.nodoFoco !== null;
  });

  const tituloHoja = $derived(
    estado.nodoFoco === null
      ? "Detalle"
      : estado.nodoFoco.tipo === "pol"
        ? estado.nodoFoco.pol.nombre
        : estado.nodoFoco.obj.nombre,
  );
</script>

<div class="app" class:movil>
  <header class="cabecera">
    <div class="fila">
      <Marca />
      <Buscador dataset={estado.dataset} onelegir={(id) => estado.enfocar(id)} oculto={(id) => estado.estaOculto(id)} />
      {#if movil}
        <button
          type="button"
          class="plegable"
          aria-expanded={filtrosAbiertos}
          aria-controls="toolbar"
          onclick={() => {
            filtrosAbiertos = !filtrosAbiertos;
            if (filtrosAbiertos) hojaAbierta = false; // una cosa a la vez: el grafo no se asfixia
          }}
        >
          Filtros{estado.hayFiltros ? " •" : ""}
        </button>
      {/if}
    </div>
    <div class="contexto">
      <span class="eyebrow">Empalme 2018–2022 ↔ 2022–2026</span>
      <h1>Red de políticas e instrumentos · <em>Ciencia y Tecnología</em></h1>
    </div>
    {#if !movil || filtrosAbiertos}
      <div id="toolbar">
        <Toolbar {estado} onajustar={() => ajustar()} />
      </div>
    {/if}
  </header>

  <main class="cuerpo">
    <section class="grafo" aria-label="Red">
      <GraphView
        red={estado.red}
        foco={estado.vecindario}
        seleccionado={estado.nodoFoco?.id ?? null}
        onseleccionar={(id) => (id === null ? estado.subirNivel() : estado.enfocar(id))}
        onsalir={() => estado.salirDelFoco()}
        onajustar={(f) => (ajustar = f)}
      />
    </section>

    <aside class="panel" class:abierta={hojaAbierta} aria-label="Detalle y leyenda">
      {#if movil}
        <button
          type="button"
          class="asa"
          aria-expanded={hojaAbierta}
          onclick={() => (hojaAbierta = !hojaAbierta)}
        >
          <span class="barra" aria-hidden="true"></span>
          <span class="asa-titulo">{tituloHoja}</span>
          <span aria-hidden="true">{hojaAbierta ? "▾" : "▴"}</span>
        </button>
      {/if}
      {#if !movil || hojaAbierta}
        <div class="contenido">
          <Legend {estado} bind:abierta={leyendaAbierta} />
          <DetailPanel {estado} />
        </div>
      {/if}
    </aside>
  </main>
</div>

<style>
  .app {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100dvh;
    background: var(--fondo);
  }
  .cabecera {
    padding: 12px 16px;
    background: var(--papel);
    border-bottom: 1px solid var(--borde);
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .fila {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  h1 {
    font-family: var(--fuente-display);
    font-weight: 600;
    margin: 2px 0 0;
    font-size: 20px;
    letter-spacing: -0.01em;
  }
  h1 em {
    font-style: normal;
    color: var(--acento);
  }
  .cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    min-height: 0;
  }
  .grafo {
    min-width: 0;
    min-height: 0;
  }
  .panel {
    background: var(--papel);
    border-left: 1px solid var(--borde);
    min-height: 0;
    overflow-y: auto;
  }
  .contenido {
    padding: 14px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .plegable {
    font: inherit;
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: var(--acento-suave);
    color: var(--acento);
    cursor: pointer;
  }

  /* ---- Mobile: grafo arriba, hoja inferior en el flujo (no se superpone) ---- */
  .movil .cabecera {
    padding: 10px 16px;
    gap: 8px;
  }
  .movil .eyebrow {
    display: none;
  }
  .movil h1 {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .movil .cuerpo {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
  }
  .movil .panel {
    border-left: none;
    border-top: 1px solid var(--borde);
    border-radius: 14px 14px 0 0;
    box-shadow: 0 -6px 20px rgb(0 0 0 / 0.06);
    max-height: 44px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .movil .panel.abierta {
    max-height: 48dvh;
  }
  .movil .contenido {
    overflow-y: auto;
    min-height: 0;
  }
  .asa {
    flex: none;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 44px;
    padding: 0 16px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    background: none;
    border: none;
    color: var(--tinta);
    cursor: pointer;
    position: relative;
  }
  .barra {
    position: absolute;
    top: 5px;
    left: 50%;
    width: 36px;
    height: 4px;
    margin-left: -18px;
    border-radius: 2px;
    background: var(--borde);
  }
  .asa-titulo {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
