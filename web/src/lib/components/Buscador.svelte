<script lang="ts">
  import { buscar, claseNato, type Dataset, type Resultado } from "@laboratorio/red";
  import { COLOR_MODO, GLIFO_NATO } from "$lib/visual.ts";

  /**
   * Buscador para NAVEGAR (patrón ARIA combobox + listbox): escribir no toca la red; elegir un
   * resultado lo enfoca (política → su subred; instrumento → su vecindario).
   */
  interface Props {
    dataset: Dataset;
    onelegir: (idNodo: string) => void;
  }
  let { dataset, onelegir }: Props = $props();

  const ID = "buscador";
  let consulta = $state("");
  let abierto = $state(false);
  let activo = $state(0);
  let entrada: HTMLInputElement | undefined = $state();

  const resultados = $derived(buscar(dataset, consulta));
  const opciones = $derived([...resultados.politicas, ...resultados.instrumentos]);
  const mostrar = $derived(abierto && consulta.trim() !== "");

  $effect(() => {
    void consulta;
    activo = 0; // nueva consulta: el primer resultado queda activo
  });

  function elegir(r: Resultado | undefined) {
    if (!r) return;
    onelegir(r.id);
    consulta = "";
    abierto = false;
    entrada?.blur();
  }

  function onkeydown(ev: KeyboardEvent) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      abierto = true;
      if (opciones.length === 0) return;
      const paso = ev.key === "ArrowDown" ? 1 : -1;
      activo = (activo + paso + opciones.length) % opciones.length;
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      elegir(opciones[activo]);
    } else if (ev.key === "Escape") {
      ev.stopPropagation(); // Esc acá cierra el buscador; no sale del foco de la red
      if (consulta) consulta = "";
      else entrada?.blur();
      abierto = false;
    }
  }

  const idOpcion = (i: number) => `${ID}-op-${i}`;

  /** Parte el nombre en [antes, coincidencia, después] para resaltar. */
  function partes(r: Resultado): [string, string, string] {
    if (!r.tramo) return [r.nombre, "", ""];
    const [i, f] = r.tramo;
    return [r.nombre.slice(0, i), r.nombre.slice(i, f), r.nombre.slice(f)];
  }
</script>

<div class="buscador" role="search">
  <input
    bind:this={entrada}
    bind:value={consulta}
    type="search"
    role="combobox"
    aria-label="Buscar política o instrumento"
    aria-expanded={mostrar}
    aria-controls="{ID}-lista"
    aria-autocomplete="list"
    aria-activedescendant={mostrar && opciones.length ? idOpcion(activo) : undefined}
    placeholder="Buscar política o instrumento…"
    autocomplete="off"
    spellcheck="false"
    onfocus={() => (abierto = true)}
    oninput={() => (abierto = true)}
    onblur={() => (abierto = false)}
    {onkeydown}
  />

  {#if mostrar}
    <!-- onmousedown preventDefault: elegir con el mouse sin que el blur cierre la lista antes -->
    <div id="{ID}-lista" class="lista" role="listbox" aria-label="Resultados" tabindex="-1" onmousedown={(e) => e.preventDefault()}>
      {#if opciones.length === 0}
        <p class="vacio">Sin resultados para «{consulta.trim()}»</p>
      {:else}
        {#each [{ titulo: "Políticas", items: resultados.politicas, base: 0 }, { titulo: "Instrumentos", items: resultados.instrumentos, base: resultados.politicas.length }] as grupo (grupo.titulo)}
          {#if grupo.items.length}
            <div role="group" aria-label={grupo.titulo}>
              <div class="grupo" aria-hidden="true">{grupo.titulo}</div>
              {#each grupo.items as r, j (r.id)}
                {@const i = grupo.base + j}
                {@const [antes, match, despues] = partes(r)}
                <div
                  id={idOpcion(i)}
                  class="opcion"
                  class:activa={i === activo}
                  role="option"
                  aria-selected={i === activo}
                  tabindex="-1"
                  onclick={() => elegir(r)}
                  onkeydown={() => {}}
                  onpointermove={() => (activo = i)}
                >
                  {#if r.obj}
                    <span class="glifo" style:color={COLOR_MODO[r.obj.modo_cambio]} aria-hidden="true"
                      >{GLIFO_NATO[claseNato(r.obj)]}</span
                    >
                  {:else}
                    <span class="glifo pol" aria-hidden="true">○</span>
                  {/if}
                  <span class="texto">
                    <span class="nombre">{antes}<mark>{match}</mark>{despues}</span>
                    {#if r.alias}<span class="alias">alias: {r.alias}</span>{/if}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        {/each}
        {#if resultados.total > opciones.length}
          <p class="mas">{opciones.length} de {resultados.total} · precisa la búsqueda</p>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .buscador {
    position: relative;
    min-width: 0;
    flex: 1;
  }
  input {
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    font-size: 15px;
    padding: 9px 12px;
    min-height: 44px;
    border: 1px solid var(--borde);
    border-radius: 10px;
    background: var(--fondo);
    color: var(--tinta);
  }
  input:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 0;
    background: var(--papel);
  }
  .lista {
    position: absolute;
    z-index: 30;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: min(60dvh, 420px);
    overflow-y: auto;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.14);
    padding: 6px;
  }
  .grupo {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
    padding: 8px 10px 4px;
  }
  .opcion {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 10px;
    min-height: 44px;
    box-sizing: border-box;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.3;
  }
  .opcion.activa {
    background: var(--acento-suave);
  }
  .glifo {
    flex: none;
    width: 1.1em;
    text-align: center;
  }
  .glifo.pol {
    color: var(--tinta);
    font-weight: 700;
  }
  .texto {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .alias {
    font-size: 12px;
    color: var(--tinta-suave);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  mark {
    background: none;
    color: var(--acento);
    font-weight: 650;
  }
  .vacio,
  .mas {
    margin: 0;
    padding: 10px;
    font-size: 13px;
    color: var(--tinta-suave);
  }
</style>
