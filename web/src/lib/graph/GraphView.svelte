<script lang="ts">
  import { firmaTopologia, claseNato, type Red, type Vecindario } from "@laboratorio/red";
  import type { Simulation } from "d3-force";
  import { zoomIdentity, type ZoomTransform } from "d3-zoom";
  import { untrack } from "svelte";
  import { COLOR_MODO, RADIO_POLITICA, pathSimbolo } from "$lib/visual.ts";
  import { arrastrable, zoomable, type ControlZoom } from "./acciones.ts";
  import type { ControlesVista } from "./acciones.ts";
  import { colocarEtiquetas, type Obstaculo, type PedidoEtiqueta } from "./etiquetas.ts";
  import { crearSimulacion, type EnlaceSim, type NodoSim } from "./forces.ts";
  import { guardarPosiciones, prepararSimulacion, type Posiciones } from "./posiciones.ts";

  interface Props {
    red: Red;
    foco: Vecindario | null;
    seleccionado: string | null;
    /** Clic en un nodo (id) o en el vacío (null: subir un nivel de foco). */
    onseleccionar: (id: string | null) => void;
    /** Esc: salir del foco (volver a la red completa). */
    onsalir?: () => void;
    /** Recibe los controles de vista (botones del lienzo): encuadrar, acercar, alejar. */
    oncontroles?: (c: ControlesVista) => void;
  }
  let { red, foco, seleccionado, onseleccionar, onsalir, oncontroles }: Props = $props();

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
  // Cada cambio de topología (filtros, subred) re-encuadra: ya con las posiciones cacheadas y otra
  // vez cuando la física se asienta. El foco de un instrumento encuadra su vecindario.
  let encuadrarAlTerminar = true;

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
    nueva.on("tick", () => {
      tick++;
      // Encuadra apenas la red está casi asentada (no espera al final: ~2 s en vez de ~6 s).
      if (encuadrarAlTerminar && nueva.alpha() < 0.08) {
        encuadrarAlTerminar = false;
        encuadrarFoco();
      }
    });
    nueva.on("end", () => guardarPosiciones(preparado.nodos, cache));
    nodos = preparado.nodos;
    enlaces = preparado.enlaces;
    sim = nueva;
    encuadrarAlTerminar = true;
    const raf = previa ? requestAnimationFrame(() => encuadrarFoco()) : 0;
    return () => {
      cancelAnimationFrame(raf);
      nueva.stop();
    };
  });

  function ajustar(soloIds?: Set<string>) {
    const cuales = soloIds ? nodos.filter((n) => soloIds.has(n.id)) : nodos;
    if (!control || cuales.length === 0) return;
    const xs = cuales.map((n) => n.x ?? 0);
    const ys = cuales.map((n) => n.y ?? 0);
    const x = Math.min(...xs) - 30;
    const y = Math.min(...ys) - 30;
    control.ajustar(
      { x, y, ancho: Math.max(...xs) + 30 - x, alto: Math.max(...ys) + 30 - y },
      { ancho, alto },
    );
  }
  $effect(() =>
    oncontroles?.({
      ajustar: () => ajustar(),
      acercar: () => control?.escalar(1.4),
      alejar: () => control?.escalar(1 / 1.4),
    }),
  );

  /** Si el usuario hace zoom, pan o arrastra, su gesto manda: no se re-encuadra al asentarse. */
  const ongesto = () => (encuadrarAlTerminar = false);

  /** Encuadra el vecindario enfocado si hay, si no toda la red visible. */
  function encuadrarFoco() {
    const vecinos = untrack(() => foco?.nodos);
    ajustar(vecinos && vecinos.size ? vecinos : undefined);
  }

  // Al seleccionar, la vista se acerca a su vecindario: así caben sus etiquetas sin solaparse.
  let ultimoFoco: string | null = null;
  $effect(() => {
    const id = seleccionado;
    const vecinos = foco?.nodos;
    if (id === null || !vecinos || id === ultimoFoco) {
      ultimoFoco = id;
      return;
    }
    ultimoFoco = id;
    untrack(() => ajustar(vecinos));
  });

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

  // Con una política enfocada la red ES su subred: todos sus nodos son alcanzables con Tab.
  const enSubred = $derived(seleccionado?.startsWith("pol:") ?? false);
  const apagado = (id: string) => foco !== null && !foco.nodos.has(id);
  const enlaceApagado = (id: string) => foco !== null && !foco.enlaces.has(id);
  // Etiquetas sin solape: tamaño constante en pantalla (fuente del mundo = px / zoom), así al
  // acercarse caben más (zoom semántico). Prioridad: seleccionado/hover > políticas > foco > resto.
  const FUENTE_PX = 11;
  const RADIO_INSTRUMENTO = 9;
  const escala = $derived(transformacion.k);
  const etiquetas = $derived.by(() => {
    void tick; // re-colocar en cada paso de la física
    const pedidos: PedidoEtiqueta[] = [];
    const obstaculos: Obstaculo[] = [];
    for (const n of nodos) {
      const esPol = n.nodo.tipo === "pol";
      const radio = esPol ? RADIO_POLITICA : RADIO_INSTRUMENTO;
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      obstaculos.push({ id: n.id, x, y, radio: radio + 2 / escala });
      const forzada = n.id === seleccionado || n.id === hover;
      const enFoco = foco !== null && foco.nodos.has(n.id);
      if (foco !== null && !enFoco && !forzada) continue; // lo atenuado no se rotula
      const nombre = n.nodo.tipo === "pol" ? n.nodo.pol.nombre : n.nodo.obj.nombre;
      pedidos.push({
        id: n.id,
        x,
        y,
        radio,
        texto: recortar(nombre, forzada ? 44 : esPol ? 34 : 28),
        prioridad: (esPol ? 10 : 1) + (enFoco ? 5 : 0),
        forzada,
      });
    }
    return colocarEtiquetas(pedidos, obstaculos, FUENTE_PX / escala);
  });

  /** Lee una coordenada de D3 atada a `tick`, para que Svelte la re-evalúe en cada paso. */
  const en = (_tick: number, v: number | undefined) => v ?? 0;

  function recortar(s: string, max: number) {
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }

  function onkeydown(ev: KeyboardEvent) {
    const t = ev.target as HTMLElement | null;
    if (t?.closest("input, select, textarea, [role=dialog]")) return; // Esc de un campo es del campo
    if (ev.key === "Escape") (onsalir ?? (() => onseleccionar(null)))();
  }
</script>

<svelte:window {onkeydown} />

<div class="lienzo" bind:clientWidth={ancho} bind:clientHeight={alto}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <svg
    width={ancho}
    height={alto}
    role="group"
    aria-label="Red de políticas públicas e instrumentos (Tab recorre las políticas; Enter enfoca; Esc vuelve a la red completa)"
    use:zoomable={{ onzoom: (t) => (transformacion = t), onlisto: (c) => (control = c), ongesto }}
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
            tabindex={n.nodo.tipo === "pol" || enSubred || foco?.nodos.has(n.id) ? 0 : -1}
            aria-pressed={n.id === seleccionado}
            aria-label={n.nodo.tipo === "pol" ? n.nodo.pol.nombre : n.nodo.obj.nombre}
            use:arrastrable={{ nodo: n, sim, ongesto }}
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
              {@const cambio = n.nodo.pol.cambio_objetivo}
              <!-- Anillo = cambio del objetivo: doble (se reformula), acento (nuevo), punteado
                   (no declarado). Hueco y punteado: sin objetivo en la vigencia elegida. -->
              {#if cambio === "se-reformula"}<circle class="anillo-ext" r={RADIO_POLITICA + 4} />{/if}
              <circle
                r={RADIO_POLITICA}
                class="hub cambio-{cambio ?? 'sin-dato'}"
                class:huerfana={n.nodo.sinObjetivo}
              />
            {:else}
              <path
                d={pathSimbolo(claseNato(n.nodo.obj))}
                fill={COLOR_MODO[n.nodo.obj.modo_cambio]}
              />
            {/if}
            <title>{n.nodo.tipo === "pol" ? n.nodo.pol.nombre : n.nodo.obj.nombre}</title>
          </g>
        {/each}
      </g>
      <g
        class="etiquetas"
        aria-hidden="true"
        style:font-size="{FUENTE_PX / escala}px"
        style:stroke-width="{3 / escala}px"
      >
        {#each etiquetas as e (e.id)}
          <text x={e.x} y={e.y} text-anchor={e.ancla} class:pol={e.id.startsWith("pol:")}>{e.texto}</text>
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
  .nodo .anillo-ext {
    fill: none;
    stroke-width: 1.5;
  }
  .nodo .hub.cambio-nuevo {
    stroke: var(--acento, #4f46e5);
  }
  .nodo .hub.cambio-no-declarado {
    stroke-dasharray: 4 3;
  }
  /* Área sin objetivo declarado por el gobierno de la vigencia elegida, con instrumentos vivos. */
  .nodo .hub.huerfana {
    fill: var(--fondo, #f5f5f3);
    stroke: var(--tinta-suave, #5d6371);
    stroke-dasharray: 3 3;
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
  .etiquetas text {
    font-family: var(--fuente-ui, system-ui, sans-serif);
    font-weight: 500;
    fill: var(--tinta, #1f2430);
    paint-order: stroke;
    stroke: var(--papel, #fff);
    stroke-linejoin: round;
    pointer-events: none;
  }
  .etiquetas text.pol {
    font-weight: 650;
  }
</style>
