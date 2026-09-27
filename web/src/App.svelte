<script lang="ts">
  import { dataset } from "$lib/data";
  import DetailPanel from "$lib/components/DetailPanel.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import Toolbar from "$lib/components/Toolbar.svelte";
  import GraphView from "$lib/graph/GraphView.svelte";
  import { EstadoRed } from "$lib/state/red.svelte.ts";

  const estado = new EstadoRed(dataset);
  let ajustar = $state<() => void>(() => {});
</script>

<div class="app">
  <header class="cabecera">
    <div class="titulo">
      <span class="eyebrow">Empalme 2018–2022 ↔ 2022–2026</span>
      <h1>Red de políticas e instrumentos · <em>Ciencia y Tecnología</em></h1>
    </div>
    <Toolbar {estado} onajustar={() => ajustar()} />
  </header>

  <main class="cuerpo">
    <section class="grafo" aria-label="Red">
      <GraphView
        red={estado.red}
        foco={estado.foco}
        seleccionado={estado.nodoSeleccionado?.id ?? null}
        onseleccionar={(id) => estado.seleccionar(id)}
        onajustar={(f) => (ajustar = f)}
      />
    </section>
    <aside class="panel">
      <Legend {estado} />
      <DetailPanel {estado} />
    </aside>
  </main>
</div>

<style>
  .app {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100dvh;
  }
  .cabecera {
    padding: 12px 16px;
    border-bottom: 1px solid var(--borde);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  h1 {
    margin: 2px 0 0;
    font-size: 18px;
  }
  h1 em {
    font-style: normal;
    color: var(--acento);
  }
  .cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    min-height: 0;
  }
  .grafo {
    min-width: 0;
    min-height: 0;
  }
  .panel {
    border-left: 1px solid var(--borde);
    overflow-y: auto;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
</style>
