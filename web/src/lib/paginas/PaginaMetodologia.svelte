<script lang="ts">
  import { CAPAS, CATEGORIAS, ETIQUETA_ESTADO } from "$lib/metodologia.ts";
  import PaginaTexto from "$lib/paginas/PaginaTexto.svelte";
  import { hrefDe } from "$lib/rutas.ts";

  /**
   * Cómo lo hicimos (ADR-0006, ADR-0007): la advertencia, las categorías con que se lee un informe,
   * el diagrama del pipeline (la receta de un vistazo) y qué está revisado. Público no técnico.
   * Contenido en lib/metodologia.ts; el diagrama, en web/public/pipeline-red-bipartita.png.
   */
  interface Props {
    ancla?: string | undefined;
    visita?: number;
  }
  let { ancla, visita = 0 }: Props = $props();

  const ISSUES = "https://github.com/complexluise/laboratorio-cocreacion-empalme-colombia/issues/new";
  const g = (id: string) => hrefDe("glosario", id);
</script>

<PaginaTexto pagina="metodologia" {ancla} {visita}>
  <header>
    <p class="antetitulo">Cómo lo hicimos</p>
    <h1>Una receta para convertir informes en una red</h1>
    <p class="bajada">
      Qué le preguntamos a cada informe, el camino para repetirlo y en cuáles pasos entra la inteligencia artificial.
    </p>
  </header>

  <section id="advertencia" tabindex="-1" class="advertencia" aria-labelledby="t-advertencia">
    <p class="sello"><span aria-hidden="true">IA</span> Advertencia</p>
    <h2 id="t-advertencia">Este contenido se generó con inteligencia artificial y aún no se ha revisado al 100 %</h2>
    <p>La IA produjo la red, los textos y los materiales. Puede haber errores de clasificación, de cifras o de citas.</p>
    <p>
      Es parte del ejercicio. La IA no construye el mapa por nosotros: entrega un primer borrador desechable, un insumo en
      bruto. La inteligencia la ponemos las personas —ver otros patrones, notar lo sutil, discutir el método y marcar dónde
      no se cumple y qué falta agregar. Es <strong>inteligencia amplificada, no artificial</strong>: la máquina no piensa en
      nuestro lugar, nos da más alcance; el timón lo llevamos nosotros. Cada error que encuentren mejora el mapa.
    </p>
  </section>

  <section id="categorias" tabindex="-1" aria-labelledby="t-categorias">
    <h2 id="t-categorias">Las categorías: qué le preguntamos a cada informe</h2>
    <p>
      Un texto se vuelve red cuando se decide antes qué buscar en él. Estas preguntas convierten cada informe en puntos
      (políticas e instrumentos) y en líneas (qué instrumento sirve a qué política y cómo se
      conectan entre sí). Cada una se explica en el
      <a href={hrefDe("glosario")}>glosario</a>.
    </p>
    <div class="tabla categorias" role="table" aria-label="Categorías con que se lee cada informe">
      <div class="fila cab" role="row">
        <span role="columnheader">Qué se busca</span>
        <span role="columnheader">Pregunta</span>
        <span role="columnheader">Valores</span>
      </div>
      {#each CATEGORIAS as c (c.que)}
        <div class="fila" role="row">
          <span role="rowheader" class="capa"><a href={g(c.glosario)}>{c.que}</a></span>
          <span role="cell">{c.pregunta}</span>
          <span role="cell" class="valores">{c.valores}</span>
        </div>
      {/each}
    </div>
  </section>

  <section id="receta" tabindex="-1" aria-labelledby="t-receta">
    <h2 id="t-receta">La receta, de un vistazo</h2>
    <p>
      De los informes del DNP a la red, con los puntos donde algo vuelve atrás para corregirse. Cada paso lo hace una
      persona, la IA o un programa (código que siempre hace lo mismo, sin IA). Usamos dos modelos de IA:
      <strong>Gemini</strong> (de Google) transcribe los documentos escaneados, y <strong>Claude</strong> (de Anthropic) lee
      los informes y arma la red.
    </p>
    <figure class="diagrama">
      <a
        href="./pipeline-red-bipartita.png"
        target="_blank"
        rel="noopener"
        aria-label="Abrir el diagrama del pipeline en tamaño completo"
      >
        <img
          src="./pipeline-red-bipartita.png"
          alt="Diagrama del pipeline: empieza en «Descargar del DNP», que baja a «Pasar a texto» con OCR de Gemini; sigue «Leer con IA» —primero con Gemini (legado), reemplazado por agentes de Claude—, «Curar las áreas» y «Publicar y validar»; termina en «Usar la red». Con tres lazos de retroalimentación: revisión con IA, validación del contrato y las bitácoras del taller."
          width="1920"
          height="1080"
          loading="lazy"
        />
      </a>
      <figcaption>Tocá el diagrama para abrirlo en grande.</figcaption>
    </figure>
  </section>

  <section id="revision" tabindex="-1" aria-labelledby="t-revision">
    <h2 id="t-revision">Qué está revisado</h2>
    <div class="tabla capas" role="table" aria-label="Estado de revisión de cada parte">
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

  .diagrama {
    position: relative;
    margin: 16px 0 0;
  }
  .diagrama a {
    display: block;
    border-radius: 14px;
  }
  .diagrama img {
    display: block;
    width: 100%;
    height: auto;
    padding: 10px;
    background: #fff;
    border: 1px solid var(--borde);
    border-radius: 14px;
  }
  .diagrama figcaption {
    margin-top: 8px;
    font-size: 14px;
    color: var(--tinta-suave);
    text-align: center;
  }

  .tabla {
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
  .valores {
    color: var(--tinta-suave);
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
    .categorias .fila {
      grid-template-columns: 0.9fr 1.3fr 1.5fr;
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
  @media (min-width: 861px) {
    .diagrama {
      width: min(1040px, 94vw);
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
