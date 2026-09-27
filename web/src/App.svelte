<script lang="ts">
  import { dataset } from "$lib/data";
  import ControlesZoom from "$lib/components/ControlesZoom.svelte";
  import Buscador from "$lib/components/Buscador.svelte";
  import DetailPanel from "$lib/components/DetailPanel.svelte";
  import Filtros from "$lib/components/Filtros.svelte";
  import Leyenda from "$lib/components/Leyenda.svelte";
  import Marca from "$lib/components/Marca.svelte";
  import MigaDePan from "$lib/components/MigaDePan.svelte";
  import { CONTROLES_NULOS, type ControlesVista } from "$lib/graph/acciones.ts";
  import GraphView from "$lib/graph/GraphView.svelte";
  import { EstadoRed } from "$lib/state/red.svelte.ts";
  import { nombreSector } from "$lib/visual.ts";

  /**
   * Layout MOBILE FIRST. Una intención = un lugar:
   * - NAVEGAR: buscador en la cabecera (siempre visible).
   * - FILTRAR: hoja de filtros (botón con n.º de filtros activos).
   * - ENFOCAR: miga de pan sobre el lienzo; el detalle del foco en la hoja inferior.
   * - LEER: leyenda (solo lectura) y controles de zoom sobre el lienzo.
   * Una sola hoja inferior, en el flujo del grid (nunca tapa el grafo).
   */
  const estado = new EstadoRed(dataset);
  let controles = $state<ControlesVista>(CONTROLES_NULOS);
  let leyendaAbierta = $state(false);

  // La hoja muestra UNA cosa: filtros, o el detalle (del foco o "cómo leer la red").
  let hoja = $state<"filtros" | "detalle">("detalle");
  let hojaAbierta = $state(false);

  // Enfocar algo abre su detalle; salir del foco pliega la hoja.
  $effect(() => {
    const hayFoco = estado.nodoFoco !== null;
    hoja = "detalle";
    hojaAbierta = hayFoco;
  });

  function alternarFiltros() {
    if (hoja === "filtros" && hojaAbierta) {
      hoja = "detalle";
      hojaAbierta = false;
    } else {
      hoja = "filtros";
      hojaAbierta = true;
    }
  }

  const tituloHoja = $derived(
    hoja === "filtros"
      ? "Filtros"
      : estado.nodoFoco === null
        ? "Cómo leer la red"
        : estado.nodoFoco.tipo === "pol"
          ? estado.nodoFoco.pol.nombre
          : estado.nodoFoco.obj.nombre,
  );
</script>

<div class="app">
  <header class="cabecera">
    <Marca contexto="{nombreSector(estado.dataset.sector)} · empalme 2018↔2026" />
    <Buscador dataset={estado.dataset} onelegir={(id) => estado.enfocar(id)} oculto={(id) => estado.estaOculto(id)} />
    <button
      type="button"
      class="btn-filtros"
      class:activo={estado.hayFiltros}
      aria-expanded={hoja === "filtros" && hojaAbierta}
      aria-controls="hoja"
      onclick={alternarFiltros}
    >
      Filtros
      {#if estado.hayFiltros}<span class="contador" aria-label="{estado.nFiltros} activos">{estado.nFiltros}</span>{/if}
    </button>
  </header>

  <main class="cuerpo">
    <section class="lienzo" aria-label="Red de políticas e instrumentos">
      <GraphView
        red={estado.red}
        foco={estado.vecindario}
        seleccionado={estado.nodoFoco?.id ?? null}
        onseleccionar={(id) => (id === null ? estado.subirNivel() : estado.enfocar(id))}
        onsalir={() => estado.salirDelFoco()}
        oncontroles={(c) => (controles = c)}
      />
      <div class="sobre sup-izq"><MigaDePan {estado} /></div>
      <div class="sobre inf-izq"><Leyenda bind:abierta={leyendaAbierta} /></div>
      <div class="sobre inf-der"><ControlesZoom {controles} /></div>
    </section>

    <aside id="hoja" class="hoja" class:abierta={hojaAbierta} aria-label={tituloHoja}>
      <div class="asa">
        <button type="button" class="asa-btn" aria-expanded={hojaAbierta} onclick={() => (hojaAbierta = !hojaAbierta)}>
          <span class="barra" aria-hidden="true"></span>
          <span class="asa-titulo">{tituloHoja}</span>
          {#if hoja !== "filtros"}<span aria-hidden="true">{hojaAbierta ? "▾" : "▴"}</span>{/if}
        </button>
        {#if hoja === "filtros"}
          <button type="button" class="cerrar" aria-label="Cerrar filtros" onclick={alternarFiltros}>✕</button>
        {/if}
      </div>
      {#if hojaAbierta}
        <div class="contenido">
          {#if hoja === "filtros"}
            <Filtros {estado} />
          {:else}
            <DetailPanel {estado} />
          {/if}
        </div>
      {/if}
    </aside>
  </main>
</div>

<style>
  /* ---------- Base: mobile ---------- */
  .app {
    display: grid;
    grid-template-columns: minmax(0, 1fr); /* el svg nunca ensancha la página */
    grid-template-rows: auto minmax(0, 1fr);
    height: 100dvh;
    background: var(--fondo);
  }
  .cabecera {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    padding-top: max(8px, env(safe-area-inset-top));
    background: var(--papel);
    border-bottom: 1px solid var(--borde);
    position: relative;
    z-index: 20; /* la lista del buscador pasa por encima del lienzo */
  }
  .btn-filtros {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 12px;
    font: inherit;
    font-size: 14px;
    border: 1px solid var(--borde);
    border-radius: 10px;
    background: var(--papel);
    color: var(--tinta);
    cursor: pointer;
  }
  .btn-filtros.activo {
    border-color: var(--acento);
    color: var(--acento);
  }
  .contador {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--acento);
    color: white;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
    text-align: center;
  }

  .cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    min-height: 0;
    min-width: 0;
  }
  .lienzo {
    position: relative;
    min-width: 0;
    min-height: 0;
  }
  .sobre {
    position: absolute;
    z-index: 5;
  }
  .sup-izq {
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    pointer-events: none; /* la franja no bloquea el pan; la miga sí recibe clics */
  }
  .sup-izq > :global(*) {
    pointer-events: auto;
  }
  .inf-izq {
    left: 10px;
    bottom: 10px;
    max-height: calc(100% - 70px);
    display: flex;
    align-items: flex-end;
  }
  .inf-der {
    right: 10px;
    bottom: 10px;
  }

  .hoja {
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: 52px;
    background: var(--papel);
    border-top: 1px solid var(--borde);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -6px 20px rgb(0 0 0 / 0.06);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .hoja.abierta {
    max-height: 55dvh;
  }
  .asa {
    flex: none;
    display: flex;
    align-items: center;
  }
  .asa-btn {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 52px;
    padding: 0 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    background: none;
    border: none;
    color: var(--tinta);
    cursor: pointer;
    position: relative;
  }
  .barra {
    position: absolute;
    top: 6px;
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
  .cerrar {
    flex: none;
    width: 44px;
    height: 44px;
    margin-right: 6px;
    font: inherit;
    font-size: 16px;
    border: none;
    background: none;
    color: var(--tinta);
    cursor: pointer;
  }
  .contenido {
    min-height: 0;
    overflow-y: auto;
    padding: 4px 16px 20px;
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
