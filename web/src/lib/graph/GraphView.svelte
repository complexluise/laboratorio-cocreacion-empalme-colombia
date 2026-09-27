<script lang="ts">
  import { firmaTopologia, claseNato, type Red, type Vecindario } from "@laboratorio/red";
  import type { Simulation } from "d3-force";
  import { zoomIdentity, type ZoomTransform } from "d3-zoom";
  import { untrack } from "svelte";
  import { COLOR_MODO, RADIO_POLITICA, pathSimbolo } from "$lib/visual.ts";
  import { arrastrable, zoomable, type ControlZoom } from "./acciones.ts";
  import { crearSimulacion, type EnlaceSim, type NodoSim } from "./forces.ts";
  import { guardarPosiciones, prepararSimulacion, type Posiciones } from "./posiciones.ts";

  interface Props {
    red: Red;
    foco: Vecindario | null;
    seleccionado: string | null;
    onseleccionar: (id: string | null) => void;
    /** Recibe una función para encuadrar la red en el lienzo ("Ajustar vista"). */
    onajustar?: (ajustar: () => void) => void;
  }
  let { red, foco, seleccionado, onseleccionar, onajustar }: Props = $props();

  let ancho = $state(0);
  let alto = $state(0);
  let transformacion = $state<ZoomTransform>(zoomIdentity);
  let hover = $state<string | null>(null);

  // D3 posee la física: los arrays son raw (no proxificados) y D3 los muta en sitio.
  // `tick` es la señal que le avisa a Svelte que re-lea las posiciones.
  let nodos = $state.raw<NodoSim[]>([]);
  let enlaces = $state.raw<EnlaceSim[]>([]);
  let tick = $state(0);
  let sim = $state.raw<Simulation<NodoSim, EnlaceSim> | null>(null);
  const cache: Posiciones = new Map();
  let control = $state.raw<ControlZoom | null>(null);
  let encuadrada = false; // la primera vez que la red se asienta, se encuadra sola

  // La simulación se reconstruye SOLO si cambia la topología (no con la selección ni el foco).
  const firma = $derived(firmaTopologia(red));
  $effect(() => {
    firma;
    const actual = untrack(() => red);
    const previa = untrack(() => sim);
    if (previa) {
      guardarPosiciones(untrack(() => nodos), cache);
      previa.stop();
    }
    const preparado = prepararSimulacion(actual, cache);
    const nueva = crearSimulacion(preparado.nodos, preparado.enlaces);
    if (previa) nueva.alpha(0.5);
    nueva.on("tick", () => tick++);
    nueva.on("end", () => {
      guardarPosiciones(preparado.nodos, cache);
      if (!encuadrada) {
        encuadrada = true;
        ajustar();
      }
    });
    nodos = preparado.nodos;
    enlaces = preparado.enlaces;
    sim = nueva;
    return () => nueva.stop();
  });

  function ajustar() {
    if (!control || nodos.length === 0) return;
    const xs = nodos.map((n) => n.x ?? 0);
    const ys = nodos.map((n) => n.y ?? 0);
    const x = Math.min(...xs) - 30;
    const y = Math.min(...ys) - 30;
    control.ajustar(
      { x, y, ancho: Math.max(...xs) + 30 - x, alto: Math.max(...ys) + 30 - y },
      { ancho, alto },
    );
  }
  $effect(() => onajustar?.(ajustar));

  // La simulación vive centrada en (0,0); al medir o redimensionar el lienzo, la vista se
  // desplaza medio delta para que (0,0) siga en el centro.
  let medido = { ancho: 0, alto: 0 };
  $effect(() => {
    if (!control || (ancho === medido.ancho && alto === medido.alto)) return;
    control.desplazar((ancho - medido.ancho) / 2, (alto - medido.alto) / 2);
    medido = { ancho, alto };
  });

  function teclaNodo(ev: KeyboardEvent, id: string) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      onseleccionar(id);
    }
  }

  const apagado = (id: string) => foco !== null && !foco.nodos.has(id);
  const enlaceApagado = (id: string) => foco !== null && !foco.enlaces.has(id);
  const conEtiqueta = (n: NodoSim) =>
    n.nodo.tipo === "pol" || n.id === hover || n.id === seleccionado || (foco !== null && foco.nodos.has(n.id));

  /** Lee una coordenada de D3 atada a `tick`, para que Svelte la re-evalúe en cada paso. */
  const en = (_tick: number, v: number | undefined) => v ?? 0;

  function recortar(s: string, max: number) {
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }

  function onkeydown(ev: KeyboardEvent) {
    if (ev.key === "Escape") onseleccionar(null);
  }
</script>

<svelte:window {onkeydown} />

<div class="lienzo" bind:clientWidth={ancho} bind:clientHeight={alto}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <svg
    width={ancho}
    height={alto}
    role="group"
    aria-label="Red de políticas públicas e instrumentos (Tab recorre las políticas; Enter selecciona; Esc deselecciona)"
    use:zoomable={{ onzoom: (t) => (transformacion = t), onlisto: (c) => (control = c) }}
    onclick={() => onseleccionar(null)}
  >
    <g transform={transformacion.toString()}>
      <g class="enlaces">
          {#each enlaces as e (e.id)}
            <line
              class={e.enlace.clase}
              class:apagado={enlaceApagado(e.id)}
              class:resaltado={foco !== null && !enlaceApagado(e.id)}
              x1={en(tick, e.source.x)}
              y1={en(tick, e.source.y)}
              x2={en(tick, e.target.x)}
              y2={en(tick, e.target.y)}
            />
          {/each}
        </g>
      <g class="nodos">
        {#each nodos as n (n.id)}
          <g
            class="nodo {n.nodo.tipo}"
            class:apagado={apagado(n.id)}
            class:sel={n.id === seleccionado}
            transform="translate({en(tick, n.x)},{en(tick, n.y)})"
            role="button"
            tabindex={n.nodo.tipo === "pol" || foco?.nodos.has(n.id) ? 0 : -1}
            aria-pressed={n.id === seleccionado}
            aria-label={n.nodo.tipo === "pol" ? n.nodo.pol.nombre : n.nodo.obj.nombre}
            use:arrastrable={{ nodo: n, sim }}
            onclick={(ev) => {
              ev.stopPropagation();
              onseleccionar(n.id);
            }}
            onkeydown={(ev) => teclaNodo(ev, n.id)}
            onfocus={() => (hover = n.id)}
            onblur={() => (hover = null)}
            onpointerenter={() => (hover = n.id)}
            onpointerleave={() => (hover = null)}
          >
            {#if n.nodo.tipo === "pol"}
              <circle r={RADIO_POLITICA} />
            {:else}
              <path
                d={pathSimbolo(claseNato(n.nodo.obj))}
                fill={COLOR_MODO[n.nodo.obj.modo_cambio]}
              />
            {/if}
            <title>{n.nodo.tipo === "pol" ? n.nodo.pol.nombre : n.nodo.obj.nombre}</title>
            {#if conEtiqueta(n)}
              <text class="etiqueta" y={n.nodo.tipo === "pol" ? 28 : 20}>
                {n.nodo.tipo === "pol" ? recortar(n.nodo.pol.nombre, 34) : recortar(n.nodo.obj.nombre, 30)}
              </text>
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>
  {#if red.nodos.length === 0}
    <p class="vacio" role="status">Ningún instrumento cumple estos filtros. Prueba con «Limpiar filtros».</p>
  {/if}
</div>

<style>
  .lienzo {
    position: relative;
    min-width: 0;
    min-height: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  svg {
    display: block;
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  svg:active {
    cursor: grabbing;
  }
  line {
    transition: opacity 0.2s;
  }
  line.pertenencia {
    stroke: var(--enlace, #b9bcc6);
    stroke-width: 1;
  }
  line.relacion {
    stroke: var(--relacion, #7c83b0);
    stroke-width: 1.2;
    stroke-dasharray: 3 3;
    opacity: 0.55;
  }
  line.resaltado {
    stroke: var(--acento, #4f46e5);
    stroke-width: 1.8;
    opacity: 1;
  }
  line.apagado {
    opacity: 0.08;
  }
  .vacio {
    position: absolute;
    inset: 40% 16px auto;
    margin: 0;
    text-align: center;
    color: var(--tinta-suave);
    font-size: 14px;
    pointer-events: none;
  }
  .nodo {
    cursor: pointer;
    outline: none;
    transition: opacity 0.2s;
  }
  .nodo.apagado {
    opacity: 0.14;
  }
  .nodo circle {
    fill: var(--papel, #fff);
    stroke: var(--tinta, #1f2430);
    stroke-width: 2.5;
  }
  .nodo path {
    stroke: rgb(0 0 0 / 0.25);
    stroke-width: 1;
  }
  .nodo:focus-visible circle,
  .nodo:focus-visible path,
  .nodo.sel circle,
  .nodo.sel path {
    stroke: var(--acento, #4f46e5);
    stroke-width: 3;
  }
  .etiqueta {
    font: 500 11px/1 var(--fuente-ui, system-ui, sans-serif);
    fill: var(--tinta, #1f2430);
    text-anchor: middle;
    paint-order: stroke;
    stroke: var(--papel, #fff);
    stroke-width: 3px;
    stroke-linejoin: round;
    pointer-events: none;
  }
  .pol .etiqueta {
    font-weight: 650;
    font-size: 12px;
  }
</style>
