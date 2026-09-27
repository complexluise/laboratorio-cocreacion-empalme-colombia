<script lang="ts">
  import { VIGENCIAS, claseNato, idInstrumento, idPolitica, type Objeto, type Politica } from "@laboratorio/red";
  import type { EstadoRed } from "$lib/state/red.svelte.ts";
  import { COLOR_MODO, ETIQUETA_MODO, ETIQUETA_NATO, ETIQUETA_RELACION, GLIFO_NATO } from "$lib/visual.ts";

  interface Props {
    estado: EstadoRed;
  }
  let { estado }: Props = $props();

  const nodo = $derived(estado.nodoFoco);
  const polPorId = $derived(new Map((estado.dataset.politicas ?? []).map((p) => [p.id, p])));
  const objPorId = $derived(new Map(estado.dataset.objetos.map((o) => [o.id, o])));

  function instrumentosDe(p: Politica): Objeto[] {
    return estado.dataset.objetos.filter((o) => (o.politicas ?? []).includes(p.id));
  }

  function relacionesDe(o: Objeto) {
    return (estado.dataset.relaciones ?? [])
      .filter((r) => r.source !== r.target && (r.source === o.id || r.target === o.id))
      .map((r) => {
        const saliente = r.source === o.id;
        const otro = objPorId.get(saliente ? r.target : r.source);
        return { r, saliente, otro };
      })
      .filter((x) => x.otro !== undefined);
  }

  /** ¿El nodo está en la red visible? Si no, el vínculo se muestra pero no navega. */
  const visible = (id: string) => estado.red.nodos.some((n) => n.id === id);
</script>

<div class="detalle">
  {#if nodo === null}
    <p class="vacio">
      Selecciona un nodo para ver su detalle y resaltar su <strong>vecindario</strong>. Los círculos son
      <strong>políticas</strong>; los símbolos, los <strong>instrumentos</strong> que las sirven.
    </p>
  {:else if nodo.tipo === "pol"}
    {@const p = nodo.pol}
    {@const suyos = instrumentosDe(p)}
    <header>
      <span class="eyebrow">Política pública</span>
      <h2>{p.nombre}</h2>
    </header>
    {#if p.objetivo}
      <h3>Objetivo</h3>
      <p>{p.objetivo}</p>
    {/if}
    <h3>Instrumentos ({suyos.length})</h3>
    <ul class="lista">
      {#each suyos as o (o.id)}
        <li>
          <button
            type="button"
            class="vinculo"
            disabled={!visible(idInstrumento(o.id))}
            onclick={() => estado.enfocar(idInstrumento(o.id))}
          >
            <span class="glifo" style:color={COLOR_MODO[o.modo_cambio]} aria-hidden="true"
              >{GLIFO_NATO[claseNato(o)]}</span
            >
            {o.nombre}
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    {@const o = nodo.obj}
    {@const color = COLOR_MODO[o.modo_cambio]}
    <header>
      <span class="eyebrow">{o.es_objetivo ? "Objetivo de política" : "Instrumento"}</span>
      <h2>{o.nombre}</h2>
      <div class="regla" style:background={color}></div>
    </header>
    <div class="badges">
      <span class="badge" style:background={color}>{ETIQUETA_MODO[o.modo_cambio]}</span>
      {#if !o.es_objetivo && o.tipo_nato}
        <span class="badge linea">{GLIFO_NATO[o.tipo_nato]} {ETIQUETA_NATO[o.tipo_nato]}</span>
      {/if}
      {#if o.confianza}<span class="badge linea">confianza {o.confianza}</span>{/if}
    </div>

    <h3>Políticas que sirve</h3>
    <ul class="lista">
      {#each o.politicas ?? [] as pid (pid)}
        <li>
          <button
            type="button"
            class="vinculo"
            disabled={!visible(idPolitica(pid))}
            onclick={() => estado.enfocar(idPolitica(pid))}>{polPorId.get(pid)?.nombre ?? pid}</button
          >
        </li>
      {:else}
        <li class="tenue">—</li>
      {/each}
    </ul>

    <h3>Presencia por vigencia</h3>
    <table>
      <tbody>
        {#each VIGENCIAS as v (v)}
          {@const pr = o.presencia[v]}
          <tr>
            <td>{v}</td>
            <td>{pr?.activo ? `activo${pr.modo ? ` · ${pr.modo}` : ""}` : "—"}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if o.narrativa && (o.narrativa.g2018 || o.narrativa.g2022 || o.narrativa.cambio)}
      <h3>Qué fue bajo cada gobierno</h3>
      {#if o.narrativa.g2018}
        <div class="vig">2018–2022</div>
        <p>{o.narrativa.g2018}</p>
      {/if}
      {#if o.narrativa.g2022}
        <div class="vig">2022–2026</div>
        <p>{o.narrativa.g2022}</p>
      {/if}
      {#if o.narrativa.cambio}
        <p class="cambio" style:border-color={color}>{o.narrativa.cambio}</p>
      {/if}
    {/if}

    {#if relacionesDe(o).length}
      <h3>Relaciones con otros instrumentos</h3>
      <ul class="lista">
        {#each relacionesDe(o) as { r, saliente, otro } (`${r.source}-${r.tipo}-${r.target}`)}
          <li>
            <span class="rel">{saliente ? ETIQUETA_RELACION[r.tipo] : `← ${ETIQUETA_RELACION[r.tipo]}`}</span>
            <button
              type="button"
              class="vinculo"
              disabled={!visible(idInstrumento(otro!.id))}
              onclick={() => estado.enfocar(idInstrumento(otro!.id))}>{otro!.nombre}</button
            >
          </li>
        {/each}
      </ul>
    {/if}

    {#if o.entidades?.length}
      <h3>Entidades</h3>
      <p>{o.entidades.join(", ")}</p>
    {/if}
    {#if o.alias?.length}
      <h3>Alias</h3>
      <p class="tenue">{o.alias.join(" · ")}</p>
    {/if}

    <h3>Evidencia</h3>
    {#each o.evidencia as ev, i (i)}
      <div class="vig">{ev.vigencia}{ev.paginas?.length ? ` · págs. ${ev.paginas.join(", ")}` : ""}</div>
      {#each ev.cifras ?? [] as cf, j (j)}
        <p class="cifra">— {cf.texto ?? `${cf.metrica ?? ""}: ${cf.valor ?? ""}`}</p>
      {/each}
    {/each}
  {/if}
</div>

<style>
  .detalle {
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--tinta);
  }
  .vacio {
    color: var(--tinta-suave);
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
  }
  h2 {
    font-family: var(--fuente-display);
    font-size: 19px;
    line-height: 1.25;
    margin: 2px 0 8px;
  }
  h3 {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--tinta-suave);
    margin: 16px 0 6px;
  }
  p {
    margin: 0 0 6px;
  }
  .regla {
    height: 3px;
    border-radius: 2px;
    width: 48px;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .badge {
    font-size: 11.5px;
    padding: 2px 9px;
    border-radius: 999px;
    color: white;
  }
  .badge.linea {
    color: var(--tinta);
    border: 1px solid var(--borde);
  }
  .lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .vinculo {
    font: inherit;
    text-align: left;
    background: none;
    border: none;
    padding: 2px 0;
    color: var(--tinta);
    cursor: pointer;
  }
  .vinculo:hover:not(:disabled) {
    color: var(--acento);
    text-decoration: underline;
  }
  .vinculo:disabled {
    cursor: default;
    color: var(--tinta-suave);
  }
  .glifo {
    display: inline-block;
    width: 1.1em;
  }
  .rel {
    font: 11px var(--fuente-dato);
    color: var(--tinta-suave);
    margin-right: 6px;
  }
  table {
    border-collapse: collapse;
    font: 12.5px var(--fuente-dato);
  }
  td {
    padding: 2px 14px 2px 0;
  }
  .vig {
    font: 11px var(--fuente-dato);
    color: var(--tinta-suave);
    margin-top: 6px;
  }
  .cambio {
    border-left: 3px solid;
    padding-left: 9px;
    margin-top: 8px;
  }
  .cifra,
  .tenue {
    color: var(--tinta-suave);
  }
  button:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 1px;
  }
</style>
