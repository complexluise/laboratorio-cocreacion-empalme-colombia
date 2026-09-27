<script lang="ts">
  import type { Dataset, ModoCambio } from "@laboratorio/red";
  import { evaluar, MODOS_PRACTICA, preguntasPractica, type Evaluacion } from "$lib/practica.ts";
  import { hrefDe } from "$lib/rutas.ts";
  import { COLOR_MODO, DESCRIPCION_MODO, ETIQUETA_MODO, ETIQUETA_NATO, GLIFO_NATO } from "$lib/visual.ts";

  /**
   * Práctica «¿Qué le pasó a este instrumento?» (issue #32): instrumentos reales de la red; se elige
   * el modo de cambio y se recibe retroalimentación (acierto: la narrativa del dato; error: una
   * pista según la presencia). Se puede reintentar; el puntaje cuenta aciertos al primer intento.
   */
  interface Props {
    dataset: Dataset;
  }
  let { dataset }: Props = $props();

  const preguntas = $derived(preguntasPractica(dataset));
  let i = $state(0);
  let intentos = $state<ModoCambio[]>([]);
  let resultado = $state<Evaluacion | null>(null);
  let aciertosPrimera = $state(0);
  let terminado = $state(false);

  const p = $derived(preguntas[i]);
  const resuelta = $derived(resultado?.correcta === true);

  function responder(m: ModoCambio) {
    if (!p || resuelta || intentos.includes(m)) return;
    resultado = evaluar(p, m);
    if (resultado.correcta && intentos.length === 0) aciertosPrimera++;
    intentos = [...intentos, m];
  }

  function siguiente() {
    if (i + 1 >= preguntas.length) {
      terminado = true;
      return;
    }
    i++;
    intentos = [];
    resultado = null;
  }

  function reiniciar() {
    i = 0;
    intentos = [];
    resultado = null;
    aciertosPrimera = 0;
    terminado = false;
  }

  const ETQ_VIG = { "2018-2022": "2018–22", "2022-2026": "2022–26" } as const;
</script>

{#if preguntas.length > 0}
  <div class="practica">
    {#if terminado}
      <div class="final">
        <p class="grande">{aciertosPrimera} de {preguntas.length}</p>
        <p>al primer intento. Lo importante no es el puntaje: es mirar primero <strong>en qué gobiernos aparece</strong> el
          instrumento y después <strong>si cambió su uso</strong>. Así se lee la red y así se llena la bitácora.</p>
        <div class="acciones">
          <a class="btn primario" href={hrefDe("red")}>Buscar más en la red</a>
          <button type="button" class="btn" onclick={reiniciar}>Practicar otra vez</button>
        </div>
      </div>
    {:else if p}
      <div class="cabeza">
        <span class="cuenta">Instrumento {i + 1} de {preguntas.length}</span>
        <span class="puntos" aria-hidden="true">
          {#each preguntas as _, k (k)}<span class:hecho={k < i || (k === i && resuelta)} class:actual={k === i}></span>{/each}
        </span>
      </div>

      <h3 class="nombre">
        {#if p.tipoNato}<span class="glifo" title="Tipo NATO: {ETIQUETA_NATO[p.tipoNato]}" aria-hidden="true">{GLIFO_NATO[p.tipoNato]}</span>{/if}
        {p.nombre}
      </h3>
      <ul class="presencia" aria-label="En qué gobiernos aparece">
        {#each Object.entries(p.presencia) as [v, modo] (v)}
          <li class:ausente={modo === null}>
            <span class="vig">{ETQ_VIG[v as keyof typeof ETQ_VIG]}</span>
            <span class="modo">{modo ?? "no aparece"}</span>
          </li>
        {/each}
      </ul>

      <p class="consigna" id="consigna-{i}">¿Qué le pasó entre un gobierno y otro?</p>
      <div class="opciones" role="group" aria-labelledby="consigna-{i}">
        {#each MODOS_PRACTICA as m (m)}
          {@const elegida = intentos.includes(m)}
          {@const ok = elegida && m === p.correcta}
          <button
            type="button"
            class="opcion"
            class:ok
            class:mal={elegida && !ok}
            disabled={resuelta || elegida}
            aria-pressed={elegida}
            title={DESCRIPCION_MODO[m]}
            onclick={() => responder(m)}
          >
            <span class="muestra" style:background={COLOR_MODO[m]} aria-hidden="true"></span>
            {ETIQUETA_MODO[m]}
            {#if ok}<span class="marca" aria-hidden="true">✓</span>{:else if elegida}<span class="marca" aria-hidden="true">✕</span>{/if}
          </button>
        {/each}
      </div>

      <div class="retro" aria-live="polite">
        {#if resultado}
          {#key intentos.length}
            <div class="mensaje" class:ok={resultado.correcta} class:mal={!resultado.correcta}>
              <p>{resultado.mensaje}</p>
              {#if resultado.correcta && (p.antes || p.despues)}
                <dl class="narrativa">
                  {#if p.antes}<div><dt>2018–2022</dt><dd>{p.antes}</dd></div>{/if}
                  {#if p.despues}<div><dt>2022–2026</dt><dd>{p.despues}</dd></div>{/if}
                </dl>
              {/if}
            </div>
          {/key}
        {/if}
      </div>

      {#if resuelta}
        <div class="acciones">
          <button type="button" class="btn primario" onclick={siguiente}>
            {i + 1 >= preguntas.length ? "Ver resultado" : "Siguiente instrumento →"}
          </button>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .practica {
    margin: 16px 0;
    padding: 16px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 16px;
  }
  .cabeza {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cuenta {
    font: 600 12px var(--fuente-ui);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--acento);
  }
  .puntos {
    display: flex;
    gap: 6px;
  }
  .puntos span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--borde);
    transition:
      background-color 200ms,
      transform 200ms;
  }
  .puntos .actual {
    transform: scale(1.3);
    background: var(--acento-suave);
    box-shadow: inset 0 0 0 2px var(--acento);
  }
  .puntos .hecho {
    background: var(--acento);
  }
  .nombre {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin: 10px 0 8px !important;
    font-family: var(--fuente-display);
    font-size: 19px !important;
    line-height: 1.3;
  }
  .glifo {
    color: var(--tinta-suave);
  }
  .presencia {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 0 0 14px;
    padding: 0;
    list-style: none;
  }
  .presencia li {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    border-radius: 10px;
    background: var(--fondo);
    border: 1px solid var(--borde);
  }
  .presencia .ausente {
    background: repeating-linear-gradient(-45deg, transparent 0 6px, rgb(0 0 0 / 0.035) 6px 12px);
    color: var(--tinta-suave);
  }
  .vig {
    font: 600 11.5px var(--fuente-dato);
    color: var(--tinta-suave);
  }
  .modo {
    font-weight: 650;
  }
  .consigna {
    margin: 0 0 8px !important;
    font-weight: 600;
  }
  .opciones {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .opcion {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 12px;
    font: inherit;
    font-size: 14.5px;
    text-align: left;
    border-radius: 12px;
    border: 1px solid var(--borde);
    background: var(--papel);
    color: var(--tinta);
    cursor: pointer;
    transition:
      transform 140ms ease,
      border-color 160ms,
      background-color 160ms;
  }
  .opcion:hover:not(:disabled) {
    border-color: var(--acento);
    transform: translateY(-1px);
  }
  .opcion:active:not(:disabled) {
    transform: scale(0.98);
  }
  .opcion:focus-visible,
  .btn:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
  .opcion:disabled {
    cursor: default;
  }
  .opcion.ok {
    border-color: #2e7d32;
    background: #e8f5e9;
    font-weight: 650;
  }
  .opcion.mal {
    border-color: #c62828;
    background: #fdecea;
    opacity: 0.8;
  }
  .muestra {
    flex: none;
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  .marca {
    margin-left: auto;
    font-weight: 700;
  }
  .retro {
    min-height: 8px;
  }
  .mensaje {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 15px;
  }
  .mensaje p {
    margin: 0;
  }
  .mensaje.ok {
    background: #e8f5e9;
    border-left: 3px solid #2e7d32;
  }
  .mensaje.mal {
    background: #fff4e5;
    border-left: 3px solid #ef6c00;
  }
  .narrativa {
    display: grid;
    gap: 8px;
    margin: 10px 0 0;
  }
  .narrativa dt {
    font: 600 11.5px var(--fuente-dato);
    color: var(--tinta-suave);
  }
  .narrativa dd {
    margin: 2px 0 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    min-height: 46px;
    padding: 0 18px;
    font: inherit;
    font-weight: 600;
    font-size: 15px;
    border-radius: 12px;
    border: 1px solid var(--acento);
    background: var(--papel);
    color: var(--acento) !important;
    text-decoration: none;
    cursor: pointer;
  }
  .btn.primario {
    background: var(--acento);
    color: white !important;
  }
  .final {
    text-align: center;
  }
  .grande {
    margin: 4px 0 !important;
    font: 650 40px var(--fuente-display);
    color: var(--acento);
  }
  .final .acciones {
    justify-content: center;
  }

  @media (prefers-reduced-motion: no-preference) {
    .opcion.ok {
      animation: pulso 420ms ease-out;
    }
    .opcion.mal {
      animation: sacudir 360ms ease-in-out;
    }
    .mensaje {
      animation: aparecer 240ms ease-out;
    }
  }
  @keyframes pulso {
    40% {
      transform: scale(1.04);
      box-shadow: 0 0 0 6px rgb(46 125 50 / 0.18);
    }
  }
  @keyframes sacudir {
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }
  @keyframes aparecer {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
  @media (min-width: 640px) {
    .practica {
      padding: 20px 24px;
    }
    .opciones {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
