<script lang="ts">
  import { CAMBIOS_OBJETIVO, MODOS_CAMBIO, TIPOS_NATO } from "@laboratorio/red";
  import { dataset } from "$lib/data";
  import { GRUPOS, idCambioObjetivo, idModo, idNato, TITULO_GRUPO } from "$lib/glosario.ts";
  import BotonDescarga from "$lib/components/BotonDescarga.svelte";
  import PasosActividad from "$lib/components/PasosActividad.svelte";
  import Practica from "$lib/components/Practica.svelte";
  import PaginaTexto from "$lib/paginas/PaginaTexto.svelte";
  import { hrefDe } from "$lib/rutas.ts";
  import {
    COLOR_MODO,
    DESCRIPCION_CAMBIO_OBJETIVO,
    DESCRIPCION_MODO,
    DESCRIPCION_NATO,
    ETIQUETA_CAMBIO_OBJETIVO,
    ETIQUETA_MODO,
    ETIQUETA_NATO,
    GLIFO_NATO,
    nombreSector,
  } from "$lib/visual.ts";

  /**
   * Portada: qué es el laboratorio, cómo es la actividad (elegir una política, describirla entre
   * dos gobiernos, completar con información complementaria, llenar la bitácora) y la teoría para
   * construir. Fuente: docs/encuadre-actividad-trama.md (v0.4), docs/teoria-politica.md, ADR-0004.
   */
  interface Props {
    ancla?: string | undefined;
    visita?: number;
  }
  let { ancla, visita = 0 }: Props = $props();

  const g = (id: string) => hrefDe("glosario", id);

  const cifras = [
    { valor: dataset.politicas?.length ?? 0, etiqueta: "políticas públicas" },
    { valor: dataset.objetos.length, etiqueta: "instrumentos" },
    { valor: 2, etiqueta: "gobiernos comparados" },
  ];

  /** Excel de la red del sector (lo genera extraccion/red_excel.py en web/public). */
  const excel = `./red-${dataset.sector}.xlsx`;

  const PREGUNTAS = [
    "¿Qué objetivo declaró cada gobierno y con qué instrumentos lo persiguió?",
    "¿Qué se mantuvo, qué se reconvirtió, qué se sumó y qué se terminó?",
    "¿Qué hizo cada gobierno con los mismos instrumentos?",
  ];
</script>

<PaginaTexto pagina="inicio" {ancla} {visita}>
  <!-- ─────────────── Portada ─────────────── -->
  <header class="portada">
    <p class="antetitulo">Laboratorio de Cocreación · Gobiernos 2018–2022 y 2022–2026</p>
    <h1>¿Qué hizo cada gobierno con la misma política pública?</h1>
    <p class="bajada">
      Leemos los informes de empalme de dos gobiernos (el balance que cada gobierno le entrega al siguiente) como una
      <strong>red de políticas públicas e instrumentos</strong>. Luego la completamos entre todos: cada grupo toma una política,
      la compara entre los dos gobiernos y anota lo que encuentra en una bitácora.
    </p>
    <div class="acciones">
      <a class="btn primario" href={hrefDe("red")}>Explorar la red</a>
      <a class="btn" href={hrefDe("inicio", "actividad")}>Cómo es la actividad</a>
    </div>
    <ul class="cifras" aria-label="La red hoy · {nombreSector(dataset.sector)}">
      {#each cifras as c (c.etiqueta)}
        <li><span class="valor">{c.valor}</span><span class="etiqueta">{c.etiqueta}</span></li>
      {/each}
    </ul>
    <p class="nota">
      Sector piloto: {nombreSector(dataset.sector)}. El laboratorio <strong>no evalúa ni puntúa gobiernos</strong>: clasifica y
      conecta lo que cada uno reporta, con un vocabulario común.
    </p>
  </header>

  <!-- ─────────────── La actividad ─────────────── -->
  <section id="actividad" tabindex="-1" aria-labelledby="t-actividad">
    <p class="antetitulo">La actividad</p>
    <h2 id="t-actividad">Una política, dos gobiernos, una bitácora</h2>
    <p>
      Cada grupo recorre cuatro pasos. En cada uno: qué hacer, con qué material, la pregunta que guía la conversación y lo
      que el grupo produce. Si una palabra no es clara, busquémosla en el <a href={hrefDe("glosario")}>glosario</a>. Para
      empezar, basta con sus tres primeras secciones.
    </p>
    <PasosActividad {excel} />

    <div class="sesiones">
      <article>
        <h3>Sesión 1 · Análisis por política</h3>
        <p>
          Empezamos todos juntos y luego cada grupo trabaja su política con fragmentos del informe (con página y cifra).
          Cerramos con una <a href={g("hipotesis")}>hipótesis</a> escrita.
        </p>
      </article>
      <article>
        <h3>Sesión 2 · Integración y plenario</h3>
        <p>
          El equipo organizador muestra el mapa con los aportes de todos los grupos y comparamos las hipótesis. Lo que solo
          se ve al juntar todo —instrumentos compartidos, patrones de cambio— es lo que buscamos: la
          <a href={g("emergencia")}>emergencia</a>.
        </p>
      </article>
    </div>
  </section>

  <!-- ─────────────── La bitácora ─────────────── -->
  <section id="bitacora" tabindex="-1" aria-labelledby="t-bitacora">
    <p class="antetitulo">La bitácora</p>
    <h2 id="t-bitacora">Describir la política lado a lado</h2>
    <p>
      Cada grupo llena la bitácora de su política en Word (también sirve Google Docs). Partimos de la red y la completamos
      con el informe de empalme y otras fuentes.
    </p>
    <div class="descargas">
      <BotonDescarga href="./bitacora-laboratorio.docx" etiqueta="La bitácora" detalle="Word · para llenar en grupo" primario />
      <BotonDescarga href="./bitacora-ejemplo-ctei.docx" etiqueta="Ejemplo lleno: Ciencia, Tecnología e Innovación" detalle="Word · de referencia" />
      <BotonDescarga href={excel} etiqueta="La red en Excel" detalle="Excel · para filtrar y consultar" />
    </div>
  </section>

  <!-- ─────────────── La teoría ─────────────── -->
  <section id="teoria" tabindex="-1" aria-labelledby="t-teoria">
    <p class="antetitulo">Las ideas de fondo</p>
    <h2 id="t-teoria">Cinco ideas para leer el mapa</h2>
    <article class="idea">
      <h3>1 · Una política pública son fines y medios</h3>
      <p>
        Una <a href={g("politica-publica")}>política pública</a> es un área que atraviesa gobiernos. Cada gobierno le declara su
        <a href={g("objetivo-de-politica")}>objetivo</a> (el fin) y la persigue con <a href={g("instrumento")}>instrumentos</a>
        (los medios). Separar ambos deja ver cuándo cambia el fin sin cambiar los medios, y al revés.
      </p>
      <p class="cita">Howlett &amp; Cashore (2009)</p>
    </article>

    <article class="idea">
      <h3>2 · El instrumento: con qué gobierna el Estado</h3>
      <p>
        Un programa, una ley, un fondo, un sistema. No es neutro: condensa una idea de cómo gobernar. Se clasifica según el
        recurso del Estado que usa: información, autoridad, dinero u organización (<a href={g("nato")}>NATO</a>, por sus
        iniciales en inglés). En la red es la <strong>forma</strong> del nodo.
      </p>
      <ul class="claves">
        {#each TIPOS_NATO as t (t)}
          <li>
            <span class="glifo" aria-hidden="true">{GLIFO_NATO[t]}</span>
            <a href={g(idNato(t))}>{ETIQUETA_NATO[t]}</a>
            <span class="desc">{DESCRIPCION_NATO[t]}</span>
          </li>
        {/each}
      </ul>
      <p class="cita">Hood (1983); Lascoumes &amp; Le Galès (2004)</p>
    </article>

    <article class="idea">
      <h3>3 · Cómo cambia el objetivo</h3>
      <p>
        Cambiar el fin es el <a href={g("ordenes-del-cambio")}>cambio más profundo</a>. En la red se ve en el anillo de cada
        política.
      </p>
      <ul class="claves">
        {#each CAMBIOS_OBJETIVO as c (c)}
          <li>
            <a href={g(idCambioObjetivo(c))}>{ETIQUETA_CAMBIO_OBJETIVO[c]}</a>
            <span class="desc">{DESCRIPCION_CAMBIO_OBJETIVO[c]}</span>
          </li>
        {/each}
      </ul>
      <p class="nota-idea">
        Decimos «no declarado» y no «abandonado»: cada informe lo escribe un gobierno sobre sí mismo, y el silencio no prueba
        abandono.
      </p>
      <p class="cita">Hall (1993)</p>
    </article>

    <article class="idea">
      <h3>4 · Cómo cambia un instrumento</h3>
      <p>
        Las instituciones rara vez cambian de golpe: siguen igual, se usan para otro fin, suman piezas nuevas, se terminan,
        se revierten o se quedan quietas mientras el entorno cambia. Es el
        <a href={g("cambio-institucional-gradual")}>cambio institucional gradual</a>; en la red es el <strong>color</strong> del
        nodo.
      </p>
      <ul class="claves">
        {#each MODOS_CAMBIO as m (m)}
          <li>
            <span class="muestra" style:background={COLOR_MODO[m]} aria-hidden="true"></span>
            <a href={g(idModo(m))}>{ETIQUETA_MODO[m]}</a>
            <span class="desc">{DESCRIPCION_MODO[m]}</span>
          </li>
        {/each}
      </ul>
      <p class="cita">Mahoney &amp; Thelen (2010)</p>
    </article>

    <article class="idea">
      <h3>5 · Nadie parte de cero</h3>
      <p>
        Todo gobierno hereda el aparato del anterior y hace algo con él: mantenerlo, sucederlo, innovar o terminarlo (<a
          href={g("sucesion-de-politicas")}>sucesión de políticas</a
        >). Lo que ya existe tiende a persistir porque revertirlo cuesta (<a href={g("dependencia-de-la-trayectoria")}
          >dependencia de la trayectoria</a
        >). Por eso hay <a href={g("area-huerfana")}>áreas huérfanas</a>: políticas cuyo objetivo ya no se declara pero cuyos
        instrumentos siguen activos.
      </p>
      <p class="cita">Hogwood &amp; Peters (1983); Pierson (2004)</p>
    </article>

    <nav class="glosario-toc" aria-label="Ir al glosario por temas">
      <p class="titulo">Las palabras resaltadas están en el glosario:</p>
      <ul>
        {#each GRUPOS as gr (gr)}
          <li><a href={g(`grupo-${gr}`)}>{TITULO_GRUPO[gr]}</a></li>
        {/each}
      </ul>
    </nav>
  </section>

  <!-- ─────────────── Práctica ─────────────── -->
  <section id="practica" tabindex="-1" aria-labelledby="t-practica">
    <p class="antetitulo">Practiquemos antes de empezar</p>
    <h2 id="t-practica">¿Qué le pasó a este instrumento?</h2>
    <p>
      Tomemos algunos instrumentos reales de la red. Veamos en qué gobiernos aparece cada uno y elijamos su modo de cambio:
      es la misma lectura que haremos después con nuestra política.
    </p>
    <Practica {dataset} />
  </section>

  <!-- ─────────────── Preguntas y cierre ─────────────── -->
  <section id="preguntas" tabindex="-1" aria-labelledby="t-preguntas">
    <p class="antetitulo">Las preguntas</p>
    <h2 id="t-preguntas">Lo que el mapa ayuda a responder</h2>
    <ol class="preguntas">
      {#each PREGUNTAS as p (p)}<li>{p}</li>{/each}
    </ol>
    <div class="acciones">
      <a class="btn primario" href={hrefDe("red")}>Explorar la red</a>
      <a class="btn" href={hrefDe("glosario")}>Ir al glosario</a>
    </div>
  </section>

  <footer class="pie">
    <p>
      Fuente: informes de empalme 2018–2022 y 2022–2026 (DNP). El vocabulario y las decisiones del equipo están
      <a href="https://github.com/complexluise/laboratorio-cocreacion-empalme-colombia" rel="noopener">publicados en GitHub</a>.
      Hecho con inteligencia artificial y aún sin revisar al 100 %: <a href={hrefDe("metodologia")}>cómo lo hicimos</a>.
    </p>
  </footer>
</PaginaTexto>

<style>
  section,
  .portada {
    padding: 28px 0;
    border-top: 1px solid var(--borde);
    outline: none;
  }
  .portada {
    border-top: none;
    padding-top: 8px;
  }
  section {
    scroll-margin-top: 8px;
  }
  .bajada strong {
    color: var(--tinta);
  }

  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 20px;
    font-weight: 600;
    font-size: 15.5px;
    text-decoration: none;
    border-radius: 12px;
    border: 1px solid var(--acento);
    color: var(--acento) !important;
    background: var(--papel);
  }
  .btn.primario {
    background: var(--acento);
    color: white !important;
  }

  .cifras {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 8px 0 12px;
    padding: 0;
    list-style: none;
  }
  .cifras li {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
  }
  .valor {
    font: 650 28px var(--fuente-display);
    line-height: 1;
  }
  .etiqueta {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.3;
    color: var(--tinta-suave);
  }
  .nota {
    font-size: 14.5px !important;
    color: var(--tinta-suave);
  }


  .sesiones {
    display: grid;
    gap: 10px;
  }
  .sesiones article {
    padding: 14px 16px;
    border-left: 3px solid var(--acento);
    background: var(--acento-suave);
    border-radius: 0 12px 12px 0;
  }
  .sesiones h3 {
    margin: 0 0 4px;
  }
  .sesiones p {
    margin: 0;
    font-size: 15px;
  }

  .descargas {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0 6px;
  }
  /* Mobile: cada fila es un bloque; la categoría arriba y los dos gobiernos apilados. */
  /* En mobile la fila de encabezados se oculta a la vista pero no al lector de pantalla. */

  .idea {
    margin: 16px 0;
    padding: 16px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
  }
  .idea h3 {
    margin: 0 0 6px;
    font-family: var(--fuente-display);
    font-size: 18px;
  }
  .idea p {
    margin: 6px 0;
  }
  .claves {
    display: grid;
    gap: 8px;
    margin: 10px 0;
    padding: 0;
    list-style: none;
  }
  .claves li {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 10px;
    align-items: baseline;
    font-size: 15px;
    line-height: 1.45;
  }
  .claves li:not(:has(.glifo, .muestra)) {
    grid-template-columns: 1fr;
  }
  .claves a {
    font-weight: 600;
  }
  .claves .desc {
    grid-column: -2 / -1;
    color: var(--tinta-suave);
    font-size: 14px;
  }
  .glifo {
    grid-row: span 2;
    align-self: start;
    width: 14px;
    text-align: center;
    color: var(--tinta-suave);
  }
  .muestra {
    grid-row: span 2;
    align-self: start;
    margin-top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  .nota-idea {
    font-size: 14.5px !important;
    color: var(--tinta-suave);
  }
  .cita {
    font: 12.5px var(--fuente-dato) !important;
    color: var(--tinta-suave);
  }
  .glosario-toc {
    margin-top: 22px;
    padding: 16px 18px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 14px;
  }
  .glosario-toc .titulo {
    margin: 0 0 12px !important;
    font-size: 14.5px !important;
    color: var(--tinta-suave);
  }
  .glosario-toc ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .glosario-toc a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    color: var(--tinta);
    background: var(--fondo);
    border: 1px solid var(--borde);
    border-radius: 999px;
  }
  .glosario-toc a:hover {
    border-color: var(--acento);
    color: var(--acento);
  }
  .preguntas li {
    margin-bottom: 6px;
    font-weight: 600;
  }
  .pie {
    padding-top: 20px;
    border-top: 1px solid var(--borde);
    font-size: 13.5px;
    color: var(--tinta-suave);
  }
  .pie p {
    font-size: 13.5px;
  }

  /* ---------- Ampliación: pantallas medianas y escritorio ---------- */
  @media (min-width: 640px) {
    .sesiones {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (min-width: 861px) {
    section,
    .portada {
      padding: 44px 0;
    }
    .portada {
      padding-top: 16px;
    }
    .cifras li {
      padding: 16px;
    }
    .valor {
      font-size: 34px;
    }
  }
</style>
