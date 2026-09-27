<script lang="ts">
  /**
   * Descarga de un material del taller (bitácora, ejemplo, Excel de la red). Microinteracción: al
   * pulsar, la flecha cae en la bandeja y el botón confirma «Descargado» unos segundos. Con
   * `prefers-reduced-motion` solo cambia el texto. Sigue siendo un <a download>: funciona sin JS.
   */
  interface Props {
    href: string;
    etiqueta: string;
    /** Formato y para qué sirve, en una línea («Word · para llenar en grupo»). */
    detalle?: string;
    primario?: boolean;
  }
  let { href, etiqueta, detalle, primario = false }: Props = $props();

  let estado = $state<"quieto" | "bajando" | "listo">("quieto");
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  function alPulsar() {
    clearTimeout(temporizador);
    estado = "bajando";
    temporizador = setTimeout(() => {
      estado = "listo";
      temporizador = setTimeout(() => (estado = "quieto"), 2600);
    }, 650);
  }

  $effect(() => () => clearTimeout(temporizador));
</script>

<a class="descarga" class:primario class:bajando={estado === "bajando"} class:listo={estado === "listo"} {href} download onclick={alPulsar}>
  <span class="icono" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="22" height="22">
      <g class="flecha"><path d="M12 4v10M7.5 9.5 12 14l4.5-4.5" /></g>
      <path class="check" d="M6.5 12.5 10.5 16.5 17.5 8.5" />
      <path class="bandeja" d="M4 16v3h16v-3" />
    </svg>
  </span>
  <span class="texto">
    <span class="etiqueta">{estado === "listo" ? "Descargado" : etiqueta}</span>
    {#if detalle}<span class="detalle">{detalle}</span>{/if}
  </span>
</a>
<span class="oculto-visual" aria-live="polite">{estado === "listo" ? `${etiqueta}: descargado` : ""}</span>

<style>
  .descarga {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 18px 8px 12px;
    border-radius: 14px;
    border: 1px solid var(--acento);
    background: var(--papel);
    color: var(--acento) !important;
    text-decoration: none;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      background-color 200ms ease;
  }
  .descarga:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgb(79 70 229 / 0.18);
  }
  .descarga:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: none;
  }
  .descarga:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 3px;
  }
  .primario {
    background: var(--acento);
    color: white !important;
  }
  .listo {
    border-color: #2e7d32;
    background: #e8f5e9;
    color: #1b5e20 !important;
  }
  .icono {
    flex: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: color-mix(in srgb, currentColor 12%, transparent);
    overflow: hidden;
  }
  svg path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .flecha,
  .bandeja {
    transform-box: fill-box;
    transform-origin: center;
  }
  .check {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    opacity: 0;
  }
  .texto {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }
  .etiqueta {
    font-weight: 650;
    font-size: 15.5px;
  }
  .detalle {
    font-size: 12.5px;
    opacity: 0.8;
  }
  .oculto-visual {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  @media (prefers-reduced-motion: no-preference) {
    .descarga:hover .flecha {
      animation: flotar 900ms ease-in-out infinite;
    }
    .bajando .flecha {
      animation: caer 650ms cubic-bezier(0.5, 0, 0.75, 0) forwards;
    }
    .bajando .bandeja {
      animation: recibir 650ms ease-out;
    }
    .listo .check {
      transition:
        stroke-dashoffset 380ms ease-out,
        opacity 120ms;
    }
  }
  .listo .flecha {
    opacity: 0;
  }
  .listo .check {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  .listo .bandeja {
    opacity: 0;
  }

  @keyframes flotar {
    50% {
      transform: translateY(2px);
    }
  }
  @keyframes caer {
    40% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(16px);
      opacity: 0;
    }
  }
  @keyframes recibir {
    60% {
      transform: translateY(1.5px) scaleX(1.08);
    }
  }
</style>
