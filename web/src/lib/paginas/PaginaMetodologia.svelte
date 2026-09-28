<script lang="ts">
  import { CAPAS, ETIQUETA_ESTADO, INSTRUCCIONES_DATOS, PASOS } from "$lib/metodologia.ts";
  import PaginaTexto from "$lib/paginas/PaginaTexto.svelte";
  import { hrefDe } from "$lib/rutas.ts";

  /**
   * Cómo lo hicimos (issue #37, ADR-0006): advertencia, cómo trabajamos, el paso a paso con los
   * prompts literales y lo que decidimos, las instrucciones que procesaron los informes y qué
   * está revisado. Público no técnico: lenguaje llano. Contenido en lib/metodologia.ts.
   */
  interface Props {
    ancla?: string | undefined;
    visita?: number;
  }
  let { ancla, visita = 0 }: Props = $props();

  const ISSUES = "https://github.com/complexluise/laboratorio-cocreacion-empalme-colombia/issues/new";
  /** Un prompt largo se muestra recortado, con la opción de leerlo entero. */
  const LARGO = 280;
</script>

<PaginaTexto pagina="metodologia" {ancla} {visita}>
  <header>
    <p class="antetitulo">Cómo lo hicimos</p>
    <h1>Un laboratorio hecho en conversación con la IA</h1>
    <p class="bajada">Aquí está el paso a paso: lo que le pedimos a la IA, lo que decidimos y lo que resultó.</p>
  </header>

  <section id="advertencia" tabindex="-1" class="advertencia" aria-labelledby="t-advertencia">
    <p class="sello"><span aria-hidden="true">IA</span> Advertencia</p>
    <h2 id="t-advertencia">Este contenido se generó con inteligencia artificial y aún no se ha revisado al 100 %</h2>
    <p>La IA produjo la red, los textos y los materiales. Puede haber errores de clasificación, de cifras o de citas.</p>
    <p>
      Es parte del ejercicio. El laboratorio también prueba <strong>cómo trabajar con la máquina para construir algo
      juntos</strong>: ella hace un borrador rápido y las personas lo revisan y lo corrigen. Cada error que encuentren mejora
      el mapa.
    </p>
  </section>

  <section id="como" tabindex="-1" aria-labelledby="t-como">
    <h2 id="t-como">Cómo trabajamos</h2>
    <ul class="claves">
      <li><strong>Pedimos con nuestras palabras.</strong> Sin programar: describimos qué queríamos y por qué.</li>
      <li><strong>La IA propone; nosotros decidimos.</strong> En las decisiones importantes, la IA planteó opciones y nosotros elegimos.</li>
      <li><strong>Un agente revisa.</strong> Otro agente de IA buscó errores antes de publicar los cambios del sitio.</li>
      <li><strong>Lo que falta se dice.</strong> Le pedimos a la IA no inventar: si un informe no trae un dato, se anota «Sin dato».</li>
    </ul>
    <p>
      Usamos <strong>Claude</strong> (de Anthropic) para casi todo: leer los informes, escribir el sitio y los textos, y revisar.
      Usamos <strong>Gemini</strong> (de Google) para transcribir documentos escaneados y hacer un primer listado de instrumentos. Las palabras nuevas están en el
      <a href={hrefDe("glosario")}>glosario</a>.
    </p>
  </section>

  <section id="pasos" tabindex="-1" aria-labelledby="t-pasos">
    <h2 id="t-pasos">Paso a paso</h2>
    <p>Los mensajes van tal cual los escribimos, con sus erratas. Del primer paso no guardamos los mensajes.</p>

    <ol class="pasos">
      {#each PASOS as p, i (p.id)}
        <li class="paso" id="paso-{p.id}">
          <span class="num" aria-hidden="true">{i + 1}</span>
          <article>
            <p class="fecha">{p.fecha}</p>
            <h3>{p.titulo}</h3>

            {#if p.pedimos.length > 0}
              <p class="rotulo">Lo que pedimos</p>
              {#each p.pedimos as m, j (j)}
                {#if m.length > LARGO}
                  <details class="mensaje">
                    <summary><span class="recorte">«{m.slice(0, LARGO)}…»</span> <span class="mas"><span class="abrir">Leer completo</span><span class="cerrar">Ocultar</span></span></summary>
                    <blockquote>{m}</blockquote>
                  </details>
                {:else}
                  <blockquote class="mensaje">{m}</blockquote>
                {/if}
              {/each}
            {/if}

            {#if p.decidimos}
              <p class="rotulo">Lo que decidimos</p>
              <ul class="decisiones">
                {#each p.decidimos as d, j (j)}<li>{d}</li>{/each}
              </ul>
            {/if}

            <p class="rotulo">Lo que hizo la IA</p>
            <p>{p.hizo}</p>
            <p class="resultado"><strong>Resultado:</strong> {p.resultado}</p>
          </article>
        </li>
      {/each}
    </ol>
  </section>

  <section id="instrucciones" tabindex="-1" aria-labelledby="t-instrucciones">
    <h2 id="t-instrucciones">Las instrucciones que le dimos a la IA para leer los informes</h2>
    <p>Van tal cual, en su lenguaje técnico. Estas son las principales:</p>
    {#each INSTRUCCIONES_DATOS as ins (ins.para)}
      <details class="instruccion">
        <summary><strong>{ins.para}</strong> · {ins.modelo}</summary>
        <blockquote>{ins.texto}</blockquote>
      </details>
    {/each}
  </section>

  <section id="revision" tabindex="-1" aria-labelledby="t-revision">
    <h2 id="t-revision">Qué está revisado</h2>
    <div class="capas" role="table" aria-label="Estado de revisión de cada parte">
      <div class="fila cab" role="row">
        <span role="columnheader">Parte</span>
        <span role="columnheader">Quién la hizo</span>
        <span role="columnheader">Revisión</span>
      </div>
      {#each CAPAS as k (k.capa)}
        <div class="fila" role="row">
          <span role="rowheader" class="capa">{k.capa}</span>
          <span role="cell">{k.quien}</span>
          <span role="cell"><span class="estado {k.estado}">{ETIQUETA_ESTADO[k.estado]}</span> {k.revision}</span>
        </div>
      {/each}
    </div>
  </section>

  <section id="reportar" tabindex="-1" aria-labelledby="t-reportar">
    <h2 id="t-reportar">¿Encontraron un error?</h2>
    <p>
      Díganlo en el taller o <a href={ISSUES} rel="noopener" target="_blank">escríbannos en GitHub</a> (necesitan una cuenta
      gratuita): qué está mal y dónde lo vieron.
    </p>
  </section>
</PaginaTexto>

<style>
  section {
    margin-top: 40px;
    scroll-margin-top: 12px;
    outline: none;
  }
  .advertencia {
    margin-top: 20px;
    padding: 18px 16px;
    background: #fff8e6;
    border: 1px solid #f1dfae;
    border-left: 4px solid #7a5d10;
    border-radius: 14px;
  }
  .advertencia h2 {
    font-size: clamp(19px, 4.2vw, 23px) !important;
  }
  .sello {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 6px !important;
    font: 700 12px var(--fuente-ui) !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7a5d10;
  }
  .sello span {
    padding: 2px 6px;
    border-radius: 5px;
    background: #7a5d10;
    color: #fff8e6;
  }
  .claves {
    padding-left: 20px;
  }
  .pasos {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
  }
  .paso {
    position: relative;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 12px;
    padding-bottom: 22px;
  }
  .paso::before {
    content: "";
    position: absolute;
    left: 15px;
    top: 34px;
    bottom: 0;
    width: 2px;
    background: var(--borde);
  }
  .paso:last-child::before {
    display: none;
  }
  .num {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--acento);
    color: white;
    font-weight: 700;
    font-size: 14px;
  }
  article {
    min-width: 0;
    padding: 14px 16px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 14px;
  }
  article p {
    margin: 0 0 8px;
  }
  .fecha {
    font: 600 12px var(--fuente-ui) !important;
    color: var(--tinta-suave);
    margin: 0 !important;
  }
  article h3 {
    margin: 2px 0 10px !important;
    font-family: var(--fuente-display);
    font-size: 19px !important;
  }
  .rotulo {
    margin: 12px 0 4px !important;
    font: 700 11.5px var(--fuente-ui) !important;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--acento);
  }
  blockquote {
    margin: 0;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }
  .mensaje {
    display: block;
    margin: 0 0 8px;
    padding: 10px 12px;
    background: var(--acento-suave);
    border-radius: 4px 12px 12px 12px;
    font-size: 15px;
    line-height: 1.5;
  }
  details.mensaje summary {
    cursor: pointer;
    list-style: none;
  }
  details.mensaje summary::-webkit-details-marker {
    display: none;
  }
  details.mensaje[open] .recorte {
    display: none;
  }
  .cerrar,
  details.mensaje[open] .abrir {
    display: none;
  }
  details.mensaje[open] .cerrar {
    display: inline;
  }
  .mas {
    font-size: 13px;
    font-weight: 650;
    color: var(--acento);
    white-space: nowrap;
  }
  .decisiones {
    margin: 0 0 4px;
    padding-left: 20px;
  }
  .decisiones li {
    font-size: 15px !important;
  }
  .resultado {
    margin: 10px 0 0 !important;
    padding-top: 8px;
    border-top: 1px dashed var(--borde);
    font-size: 15px !important;
  }
  .instruccion {
    margin: 8px 0;
    padding: 10px 14px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
  }
  .instruccion summary {
    cursor: pointer;
    min-height: 32px;
    font-size: 15px;
  }
  .instruccion blockquote {
    margin-top: 8px;
    padding: 10px 12px;
    background: var(--fondo);
    border-radius: 8px;
    font: 13.5px/1.55 var(--fuente-dato);
  }
  summary:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
  .capas {
    display: grid;
    margin-top: 10px;
    border: 1px solid var(--borde);
    border-radius: 12px;
    overflow: hidden;
    background: var(--papel);
  }
  .fila {
    display: grid;
    gap: 2px;
    padding: 10px 14px;
    border-top: 1px solid var(--borde);
    font-size: 14.5px;
    line-height: 1.45;
  }
  .fila.cab {
    display: none;
  }
  .fila.cab + .fila {
    border-top: none;
  }
  .capa {
    font-weight: 650;
  }
  .estado {
    display: inline-block;
    margin-right: 4px;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 650;
    white-space: nowrap;
  }
  .estado.fuente {
    background: #e8f5e9;
    color: #1b5e20;
  }
  .estado.parcial {
    background: #fff4e5;
    color: #8a4b00;
  }
  .estado.pendiente {
    background: #fdecea;
    color: #9b1c1c;
  }
  .estado.personas {
    background: var(--acento-suave);
    color: var(--acento);
  }
  @media (min-width: 640px) {
    .advertencia {
      padding: 22px 24px;
    }
    .fila {
      grid-template-columns: 1fr 1fr 1.6fr;
      gap: 14px;
    }
    .fila.cab {
      display: grid;
      background: var(--fondo);
      font: 600 12px var(--fuente-ui);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--tinta-suave);
    }
    .fila.cab + .fila {
      border-top: 1px solid var(--borde);
    }
  }
</style>
