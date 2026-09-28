<script lang="ts">
  import {
    DESCRIPCION_ACTOR,
    ETIQUETA_ACTOR,
    FASES,
    firma,
    hitosDe,
    RETORNO_TALLER,
    urlCommit,
    type Actor,
    type Evidencia,
  } from "$lib/metodologia.ts";
  import { hrefDe } from "$lib/rutas.ts";

  /**
   * El flujo de trabajo como diagrama vertical (mobile first): cada fase dice qué hicieron las
   * personas y qué la máquina, y despliega sus commits de evidencia. El tramo de «Revisar» al
   * «Taller» es un BUCLE: lo que encuentran los grupos vuelve a la revisión. Resaltar un actor
   * atenúa las fases donde no participa.
   */
  interface Props {
    evidencia: Evidencia;
  }
  let { evidencia }: Props = $props();

  const ACTORES: Actor[] = ["persona", "ia", "automatico"];
  let resaltado = $state<Actor | null>(null);
  let abiertas = $state<Record<string, boolean>>({});

  const inicioBucle = FASES.findIndex((f) => f.id === RETORNO_TALLER);
  const nombreRetorno = FASES[inicioBucle]?.titulo ?? "";
</script>

<div class="flujo">
  <div class="filtro" role="group" aria-label="Resaltar quién participa">
    <span class="rotulo">Resaltar:</span>
    {#each ACTORES as a (a)}
      <button
        type="button"
        class="chip {a}"
        aria-pressed={resaltado === a}
        title={DESCRIPCION_ACTOR[a]}
        onclick={() => (resaltado = resaltado === a ? null : a)}
      >
        <span class="punto" aria-hidden="true"></span>{ETIQUETA_ACTOR[a]}
      </button>
    {/each}
  </div>

  <ol class="fases">
    {#each FASES as f, i (f.id)}
      {@const hitos = hitosDe(evidencia, f.id)}
      {@const atenuada = resaltado !== null && !f.actores.includes(resaltado)}
      <li class="fase" tabindex="-1" class:por-venir={f.porVenir} class:atenuada class:en-bucle={i >= inicioBucle} id="fase-{f.id}">
        <span class="nodo" aria-hidden="true">{i + 1}</span>
        <div class="tarjeta">
          <div class="cab">
            <h3>{f.titulo}</h3>
            <ul class="actores" aria-label="Participan">
              {#each f.actores as a (a)}<li class="chip mini {a}"><span class="punto" aria-hidden="true"></span>{ETIQUETA_ACTOR[a]}</li>{/each}
            </ul>
          </div>
          <dl>
            <div><dt>Personas</dt><dd>{f.persona}</dd></div>
            <div><dt>Máquina</dt><dd>{f.maquina}</dd></div>
          </dl>
          <p class="rastro"><span aria-hidden="true">⎇</span> <strong>Rastro en git:</strong> {f.rastro}</p>

          {#if f.porVenir}
            <p class="retorno"><span aria-hidden="true">↺</span> Lo que encuentren los grupos vuelve a <a href={hrefDe("metodologia", `fase-${RETORNO_TALLER}`)}>{nombreRetorno}</a>. Todavía no ocurre: aún no hay evidencia.</p>
          {:else if hitos.length > 0}
            <button
              type="button"
              class="ver"
              aria-expanded={abiertas[f.id] ?? false}
              aria-controls="hitos-{f.id}"
              onclick={() => (abiertas[f.id] = !abiertas[f.id])}
            >
              <span class="flecha" aria-hidden="true">▸</span> Ver la evidencia ({hitos.length} {hitos.length === 1 ? "commit" : "commits"})
            </button>
            <ul class="hitos" id="hitos-{f.id}" hidden={!abiertas[f.id]}>
              {#each hitos as h (h.commit)}
                <li>
                  <a class="hash" href={urlCommit(h.commit)} rel="noopener" target="_blank">{h.commit}</a>
                  <span class="que">{h.que}</span>
                  <span class="meta">{h.fecha} · {firma(h)}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</div>

<style>
  .flujo {
    --persona: #b45309;
    --ia: var(--acento);
    --automatico: #5f6b7a;
    margin: 16px 0;
  }
  .filtro {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .rotulo {
    font-size: 13px;
    color: var(--tinta-suave);
  }
  .chip {
    --c: var(--automatico);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 12px;
    font: inherit;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
    background: var(--papel);
    color: var(--c);
    cursor: pointer;
    transition:
      background-color 160ms,
      color 160ms;
  }
  .chip.persona {
    --c: var(--persona);
  }
  .chip.ia {
    --c: var(--ia);
  }
  button.chip[aria-pressed="true"] {
    background: var(--c);
    color: white;
  }
  .punto {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
  .chip.mini {
    min-height: 0;
    padding: 2px 8px;
    font-size: 11.5px;
    cursor: default;
  }
  .fases {
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .fase {
    position: relative;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    padding-bottom: 14px;
    transition: opacity 200ms;
  }
  /* La línea que une los nodos. */
  .fase::before {
    content: "";
    position: absolute;
    left: 16px;
    top: 34px;
    bottom: 0;
    width: 2px;
    background: var(--borde);
  }
  .fase:last-child::before {
    display: none;
  }
  /* El bucle: del nodo de retorno al taller, un riel punteado a la derecha. */
  .en-bucle .tarjeta {
    box-shadow: 4px 0 0 -1px var(--fondo), 6px 0 0 -1px color-mix(in srgb, var(--persona) 55%, transparent);
  }
  .atenuada {
    opacity: 0.35;
  }
  .nodo {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--acento);
    color: white;
    font-weight: 700;
    font-size: 14px;
  }
  .por-venir .nodo {
    background: var(--papel);
    color: var(--persona);
    border: 2px dashed var(--persona);
  }
  .tarjeta {
    min-width: 0;
    padding: 12px 14px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 14px;
  }
  .por-venir .tarjeta {
    border-style: dashed;
    border-color: var(--persona);
    background: #fffaf2;
  }
  .cab {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 10px;
  }
  h3 {
    margin: 0 !important;
    font-family: var(--fuente-display);
    font-size: 18px !important;
  }
  .actores {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  dl {
    display: grid;
    gap: 6px;
    margin: 10px 0 0;
  }
  dt {
    font: 600 11px var(--fuente-ui);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  dd {
    margin: 1px 0 0;
    font-size: 15px;
    line-height: 1.5;
  }
  .rastro,
  .retorno {
    margin: 10px 0 0 !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    color: var(--tinta-suave);
  }
  .retorno {
    color: #7a4a06;
  }
  .ver {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    margin-top: 6px;
    padding: 0 10px 0 6px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--acento);
    cursor: pointer;
  }
  .ver:hover {
    background: var(--acento-suave);
  }
  .flecha {
    display: inline-block;
    transition: transform 180ms;
  }
  .ver[aria-expanded="true"] .flecha {
    transform: rotate(90deg);
  }
  .hitos {
    display: grid;
    gap: 8px;
    margin: 4px 0 0;
    padding: 10px 12px;
    list-style: none;
    background: var(--fondo);
    border-radius: 10px;
  }
  .hitos li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 10px;
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
  .hash {
    grid-row: span 2;
    font: 600 13px var(--fuente-dato);
  }
  .meta {
    font-size: 12.5px;
    color: var(--tinta-suave);
  }
  .chip:focus-visible,
  .ver:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .fase,
    .flecha,
    .chip {
      transition: none;
    }
  }
</style>
