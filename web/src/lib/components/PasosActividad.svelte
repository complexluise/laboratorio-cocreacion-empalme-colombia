<script lang="ts">
  import { prefersReducedMotion } from "svelte/motion";
  import { fly } from "svelte/transition";
  import BotonDescarga from "$lib/components/BotonDescarga.svelte";
  import { hrefDe } from "$lib/rutas.ts";

  /**
   * La actividad como RECORRIDO de cuatro pasos (issue #32): cada paso dice qué hacer, con qué
   * material, qué pregunta guía la conversación y qué produce el grupo. Patrón de pestañas (ARIA
   * tabs, flechas del teclado) con barra de progreso; en pantallas angostas los pasos son números.
   */
  interface Props {
    /** Excel de la red del sector (web/public/red-<slug>.xlsx). */
    excel: string;
  }
  let { excel }: Props = $props();

  type Material =
    | { tipo: "enlace"; href: string; etiqueta: string }
    | { tipo: "descarga"; href: string; etiqueta: string; detalle: string };

  interface Paso {
    titulo: string;
    corto: string;
    que: string;
    materiales: Material[];
    pregunta: string;
    producto: string;
  }

  const PASOS: Paso[] = $derived([
    {
      titulo: "Elegir una política pública",
      corto: "Elegir",
      que: "Exploren la red y elijan un área. Miren el anillo de la política: ¿su objetivo se mantiene, se reformula, es nuevo o ya no se declara? Descarguen la bitácora y anoten la política elegida.",
      materiales: [
        { tipo: "enlace", href: hrefDe("red"), etiqueta: "Abrir la red" },
        { tipo: "descarga", href: "./bitacora-laboratorio.docx", etiqueta: "La bitácora", detalle: "Word · para llenar en grupo" },
      ],
      pregunta: "¿Por qué esta política y no otra? ¿Qué esperan encontrar al compararla?",
      producto: "La política elegida, en los datos del grupo.",
    },
    {
      titulo: "Describirla entre los dos gobiernos",
      corto: "Describir",
      que: "Con el informe de empalme, ubiquen la política en cada gobierno y comparen sus instrumentos. El Excel de la red les deja filtrar los instrumentos de su política por tipo y por modo de cambio.",
      materiales: [
        { tipo: "descarga", href: excel, etiqueta: "La red en Excel", detalle: "Excel · para filtrar y consultar" },
        { tipo: "enlace", href: hrefDe("glosario", "tabla-puente"), etiqueta: "¿Qué es la tabla puente?" },
      ],
      pregunta: "¿Qué instrumentos siguen, cuáles cambian de uso, cuáles se suman y cuáles se dejan?",
      producto: "Las secciones 1 y 1.1 de la bitácora: ubicación, avance e instrumentos.",
    },
    {
      titulo: "Buscar información complementaria",
      corto: "Buscar",
      que: "El informe no lo dice todo. Busquen las metas en Sinergia, el Plan Nacional de Desarrollo, el capítulo de inversión pública, las normas y los documentos CONPES. Si algo no aparece, escriban «Sin dato»: también es un hallazgo.",
      materiales: [
        { tipo: "enlace", href: hrefDe("glosario", "meta-cuatrienio"), etiqueta: "Meta del cuatrienio" },
        { tipo: "enlace", href: hrefDe("glosario", "gestion-vs-impacto"), etiqueta: "Gestión, producto e impacto" },
      ],
      pregunta: "¿Estas cifras miden lo mismo en los dos gobiernos? ¿Contra qué meta se comparan?",
      producto: "Las siete subcategorías lado a lado y la tabla de fuentes.",
    },
    {
      titulo: "Concluir y llevar al plenario",
      corto: "Concluir",
      que: "Cierren la bitácora: qué les enseñó el ejercicio y una hipótesis sobre lo que comparten las otras políticas. Miren el ejemplo lleno si dudan del nivel de detalle.",
      materiales: [
        { tipo: "descarga", href: "./bitacora-ejemplo-ctei.docx", etiqueta: "Ejemplo lleno: CTeI", detalle: "Word · de referencia" },
      ],
      pregunta: "¿Qué patrón creen que comparten las otras políticas? ¿Qué le falta al mapa?",
      producto: "La bitácora completa, entregada al equipo para integrarla al mapa.",
    },
  ]);

  let actual = $state(0);
  let direccion = $state(1);
  const paso = $derived(PASOS[actual]!);
  const pestañas: HTMLButtonElement[] = [];

  function ir(i: number, enfocar = false) {
    const destino = (i + PASOS.length) % PASOS.length;
    direccion = destino >= actual ? 1 : -1;
    actual = destino;
    if (enfocar) pestañas[destino]?.focus();
  }

  function onkeydown(ev: KeyboardEvent) {
    const mov = { ArrowRight: 1, ArrowLeft: -1, Home: -actual, End: PASOS.length - 1 - actual }[ev.key];
    if (mov === undefined) return;
    ev.preventDefault();
    ir(actual + mov, true);
  }
</script>

<div class="recorrido">
  <div class="progreso" aria-hidden="true"><span style:width="{((actual + 1) / PASOS.length) * 100}%"></span></div>

  <div class="pasos" role="tablist" aria-label="Pasos de la actividad">
    {#each PASOS as p, i (p.titulo)}
      <button
        type="button"
        role="tab"
        id="paso-tab-{i}"
        aria-controls="paso-panel"
        aria-selected={i === actual}
        tabindex={i === actual ? 0 : -1}
        class:hecho={i < actual}
        bind:this={pestañas[i]}
        onclick={() => ir(i)}
        {onkeydown}
      >
        <span class="num">{#if i < actual}✓{:else}{i + 1}{/if}</span>
        <span class="corto">{p.corto}</span>
      </button>
    {/each}
  </div>

  <div class="panel" role="tabpanel" id="paso-panel" aria-labelledby="paso-tab-{actual}">
    {#key actual}
      <div class="contenido" in:fly={{ x: prefersReducedMotion.current ? 0 : 24 * direccion, duration: prefersReducedMotion.current ? 0 : 260 }}>
        <p class="cuenta">Paso {actual + 1} de {PASOS.length}</p>
        <h3>{paso.titulo}</h3>
        <p>{paso.que}</p>

        <div class="materiales">
          {#each paso.materiales as m (m.href)}
            {#if m.tipo === "descarga"}
              <BotonDescarga href={m.href} etiqueta={m.etiqueta} detalle={m.detalle} />
            {:else}
              <a class="enlace" href={m.href}>{m.etiqueta} →</a>
            {/if}
          {/each}
        </div>

        <div class="guia">
          <p class="rotulo">Pregunta guía</p>
          <p class="pregunta">{paso.pregunta}</p>
        </div>
        <p class="producto"><strong>Lo que produce el grupo:</strong> {paso.producto}</p>
      </div>
    {/key}

    <div class="navegacion">
      <button type="button" class="nav" disabled={actual === 0} onclick={() => ir(actual - 1)}>← Anterior</button>
      {#if actual < PASOS.length - 1}
        <button type="button" class="nav siguiente" onclick={() => ir(actual + 1)}>Siguiente paso →</button>
      {:else}
        <a class="nav siguiente" href={hrefDe("red")}>Empezar en la red →</a>
      {/if}
    </div>
  </div>
</div>

<style>
  .recorrido {
    margin: 18px 0;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 16px;
    overflow: hidden;
  }
  .progreso {
    height: 4px;
    background: var(--borde);
  }
  .progreso span {
    display: block;
    height: 100%;
    background: var(--acento);
    transition: width 320ms ease;
  }
  .pasos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-bottom: 1px solid var(--borde);
  }
  .pasos button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-height: 64px;
    padding: 10px 4px;
    font: inherit;
    font-size: 13px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--tinta-suave);
    cursor: pointer;
  }
  .pasos button[aria-selected="true"] {
    color: var(--acento);
    border-bottom-color: var(--acento);
    font-weight: 650;
  }
  .num {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid currentColor;
    font-weight: 700;
    transition:
      transform 200ms ease,
      background-color 200ms ease;
  }
  [aria-selected="true"] .num {
    background: var(--acento);
    border-color: var(--acento);
    color: white;
    transform: scale(1.08);
  }
  .hecho .num {
    background: var(--acento-suave);
    border-color: var(--acento);
    color: var(--acento);
  }
  .pasos button:focus-visible,
  .nav:focus-visible,
  .enlace:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: -2px;
  }
  .panel {
    padding: 16px;
    overflow: hidden;
  }
  .cuenta {
    margin: 0;
    font: 600 12px var(--fuente-ui);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--acento);
  }
  h3 {
    margin: 4px 0 6px !important;
    font-family: var(--fuente-display);
    font-size: 20px !important;
  }
  .contenido > p {
    margin: 0 0 12px;
  }
  .materiales {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 4px 0 14px;
  }
  .enlace {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 4px;
    font-weight: 600;
  }
  .guia {
    padding: 12px 14px;
    border-left: 3px solid var(--acento);
    background: var(--acento-suave);
    border-radius: 0 12px 12px 0;
  }
  .guia p {
    margin: 0;
  }
  .rotulo {
    font: 600 11.5px var(--fuente-ui) !important;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--acento);
  }
  .pregunta {
    font-size: 17px !important;
    font-weight: 600;
    line-height: 1.4 !important;
  }
  .producto {
    margin: 12px 0 0 !important;
    font-size: 14.5px !important;
    color: var(--tinta-suave);
  }
  .navegacion {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--borde);
  }
  .nav {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    font: inherit;
    font-size: 14.5px;
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid var(--borde);
    background: var(--papel);
    color: var(--tinta) !important;
    text-decoration: none;
    cursor: pointer;
  }
  .nav:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .nav.siguiente {
    border-color: var(--acento);
    background: var(--acento);
    color: white !important;
  }
  @media (min-width: 640px) {
    .pasos button {
      flex-direction: row;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
    }
    .panel {
      padding: 20px 24px;
    }
  }
</style>
