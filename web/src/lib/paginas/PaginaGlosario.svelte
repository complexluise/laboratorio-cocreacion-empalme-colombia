<script lang="ts">
  import { entradaPorId, filtrarGlosario, GRUPOS, INTRO_GRUPO, TITULO_GRUPO } from "$lib/glosario.ts";
  import PaginaTexto from "$lib/paginas/PaginaTexto.svelte";
  import { hrefDe } from "$lib/rutas.ts";

  /** Glosario: siglas, términos y la ontología del mapa leída con la teoría política. */
  interface Props {
    ancla?: string | undefined;
    visita?: number;
  }
  let { ancla, visita = 0 }: Props = $props();

  let consulta = $state("");

  // Navegar a una entrada o grupo limpia el filtro: si no, el destino podría no estar en pantalla.
  // (pre: antes de que PaginaTexto salte al ancla con el DOM ya actualizado)
  $effect.pre(() => {
    void visita;
    if (ancla !== undefined) consulta = "";
  });
  const visibles = $derived(filtrarGlosario(consulta));
  const porGrupo = $derived(
    GRUPOS.map((g) => ({ grupo: g, entradas: visibles.filter((e) => e.grupo === g) })).filter((g) => g.entradas.length > 0),
  );
</script>

<PaginaTexto pagina="glosario" {ancla} {visita}>
  <p class="antetitulo">Glosario</p>
  <h1>Las palabras del laboratorio</h1>
  <p class="bajada">
    Cada sigla y cada término que no es de uso común, y cómo se lee el mapa con la teoría política. Cada entrada tiene
    su propio enlace para citarla.
  </p>

  <div class="herramientas">
    <label class="filtro">
      <span class="oculto-visual">Filtrar el glosario</span>
      <input type="search" placeholder="Filtrar: SGR, conversión, tabla puente…" bind:value={consulta} autocomplete="off" />
    </label>
    <nav aria-label="Grupos del glosario">
      <ul class="indice">
        {#each GRUPOS as g (g)}
          <li><a href={hrefDe("glosario", `grupo-${g}`)}>{TITULO_GRUPO[g]}</a></li>
        {/each}
      </ul>
    </nav>
  </div>

  <p class="conteo" aria-live="polite">
    {#if consulta.trim() !== ""}{visibles.length} {visibles.length === 1 ? "entrada" : "entradas"}{/if}
  </p>

  {#each porGrupo as { grupo, entradas } (grupo)}
    <section class="grupo" aria-labelledby="grupo-{grupo}">
      <h2 id="grupo-{grupo}" tabindex="-1">{TITULO_GRUPO[grupo]}</h2>
      <p class="intro">{INTRO_GRUPO[grupo]}</p>
      <dl>
        {#each entradas as e (e.id)}
          <div class="entrada" class:destacada={e.id === ancla} id={e.id} tabindex="-1">
            <dt>
              <a class="termino" href={hrefDe("glosario", e.id)}>{e.termino}</a>
              {#if e.expansion}<span class="expansion">{e.expansion}</span>{/if}
            </dt>
            <dd>
              <p>{e.definicion}</p>
              {#if e.fuente}<p class="fuente">Fuente: {e.fuente}</p>{/if}
              {#if e.ver && e.ver.length > 0}
                <p class="ver">
                  Ver también:
                  {#each e.ver as v, i (v)}{#if i > 0},{" "}{/if}<a href={hrefDe("glosario", v)}>{entradaPorId(v)?.termino ?? v}</a>{/each}
                </p>
              {/if}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  {:else}
    <p class="vacio">Ninguna entrada coincide con «{consulta}».</p>
  {/each}

  <p class="volver"><a href={hrefDe("red")}>Explorar la red →</a></p>
</PaginaTexto>

<style>
  .oculto-visual {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .herramientas {
    position: sticky;
    top: 0;
    z-index: 2;
    margin: 18px -16px 0;
    padding: 10px 16px;
    background: color-mix(in srgb, var(--fondo) 92%, transparent);
    backdrop-filter: blur(6px);
    border-bottom: 1px solid var(--borde);
  }
  .filtro input {
    width: 100%;
    min-height: 44px;
    padding: 0 14px;
    font: inherit;
    font-size: 16px;
    border: 1px solid var(--borde);
    border-radius: 10px;
    background: var(--papel);
    color: var(--tinta);
  }
  .indice {
    display: flex;
    gap: 6px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .indice a {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    font-size: 13.5px;
    white-space: nowrap;
    text-decoration: none;
    color: var(--tinta);
    border: 1px solid var(--borde);
    border-radius: 999px;
    background: var(--papel);
  }
  .conteo {
    min-height: 1em;
    margin: 8px 0 0;
    font: 12px var(--fuente-dato);
    color: var(--tinta-suave);
  }
  .grupo {
    margin-top: 28px;
  }
  .grupo h2 {
    scroll-margin-top: 120px;
  }
  .intro {
    color: var(--tinta-suave);
    margin: 0 0 12px;
  }
  dl {
    margin: 0;
    display: grid;
    gap: 10px;
  }
  .entrada {
    padding: 14px 16px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
    scroll-margin-top: 120px;
  }
  .entrada.destacada {
    border-color: var(--acento);
    box-shadow: inset 0 0 0 1px var(--acento);
  }
  dt {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
  }
  .termino {
    font-weight: 700;
    font-size: 16.5px;
    color: var(--tinta) !important;
    text-decoration: none;
  }
  .termino:hover {
    text-decoration: underline;
  }
  .expansion {
    font-size: 14px;
    color: var(--tinta-suave);
    font-style: italic;
  }
  dd {
    margin: 4px 0 0;
  }
  dd p {
    margin: 4px 0 0;
  }
  .fuente,
  .ver {
    font-size: 14px !important;
    color: var(--tinta-suave);
  }
  .vacio {
    margin-top: 24px;
    color: var(--tinta-suave);
  }
  .volver {
    margin-top: 32px;
    font-weight: 600;
  }
  @media (min-width: 861px) {
    .herramientas {
      margin: 22px -24px 0;
      padding: 12px 24px;
    }
  }
</style>
