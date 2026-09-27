<script lang="ts">
  import { CAMBIOS_OBJETIVO, MODOS_CAMBIO, TIPOS_NATO } from "@laboratorio/red";
  import { dataset } from "$lib/data";
  import { idCambioObjetivo, idModo, idNato } from "$lib/glosario.ts";
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

  const PASOS = [
    {
      titulo: "Elegir una política pública",
      texto:
        "Cada grupo toma un área de la red —p. ej. bioeconomía, talento humano, ciencia abierta— y la sigue a través de los dos gobiernos.",
    },
    {
      titulo: "Describirla entre los dos gobiernos",
      texto:
        "Qué objetivo declaró cada uno y con qué instrumentos lo persiguió. La red ya propone una lectura: el grupo la verifica y la corrige.",
    },
    {
      titulo: "Buscar información complementaria",
      texto:
        "El informe de empalme no lo dice todo. Metas en Sinergia, el Plan Nacional de Desarrollo, el capítulo de inversión pública, normas y CONPES.",
    },
    {
      titulo: "Llenar la bitácora",
      texto:
        "Un registro con formatos que compara la política lado a lado, anota los huecos de información y deja los hallazgos para el plenario.",
    },
  ];

  const SECCIONES_BITACORA = [
    {
      n: "1",
      titulo: "Ubicación y avance",
      texto: "Dónde está la política en el documento de cada gobierno y qué avance reporta. Incluye la tabla puente.",
    },
    {
      n: "1.1",
      titulo: "Instrumentos",
      texto: "El principal, el de formación de talento y el fiscal, con su tipo (NATO) y su modo de cambio.",
    },
    {
      n: "2–8",
      titulo: "Siete subcategorías, lado a lado",
      texto: "Objetivo · Instituciones · Población · Normativa · Recursos · Metas · Impacto.",
    },
    {
      n: "✱",
      titulo: "Lo que enseña al plenario",
      texto: "Los hallazgos del grupo y una hipótesis sobre qué patrón comparten las demás políticas.",
    },
  ];

  /** Ejemplo CTeI (plantilla del equipo). Los vacíos se muestran como vacíos: eso es un hallazgo. */
  const EJEMPLO: { fila: string; antes: string; despues: string; vacio?: "antes" | "despues" | "ambos" }[] = [
    {
      fila: "Ubicación",
      antes: "Pacto Transversal IX — «Un sistema para construir el conocimiento de la Colombia del futuro».",
      despues: "Transformación 4.2 «CTeI para la transformación territorial» + 5.7.2 «Programas y proyectos de CTeI para la reducción de brechas».",
    },
    {
      fila: "Avance",
      antes: "94,41 % de cumplimiento en el cuatrienio.",
      despues: "No reporta un porcentaje único: narra logros.",
      vacio: "despues",
    },
    {
      fila: "Instrumento principal",
      antes: "Cupo de inversión para deducción y descuento tributario en CTeI.",
      despues: "Convocatorias: ColombIA Inteligente, ECONOVA, Ciencias Básicas y del Espacio, Océanos, Investigación Fundamental, FIS.",
    },
    {
      fila: "Objetivo",
      antes: "Movilizar talento, impulsar empresas de base tecnológica y cerrar brechas vía capacidades productivas regionales.",
      despues: "Consolidar capacidades de CTeI para la transformación productiva con enfoque territorial y de cierre de brechas.",
    },
    {
      fila: "Instituciones",
      antes: "Colciencias (y «aliados», sin especificar), según reporta el balance.",
      despues: "MinCiencias, ya como ministerio. El cambio ocurrió durante el gobierno anterior (2019–2021), pero cada informe reporta desde otra institucionalidad.",
    },
    {
      fila: "Población",
      antes: "No se desagrega en la fuente.",
      despues: "Universidades, centros, empresas y territorios; enfoque diferencial (jóvenes, mujeres, indígenas, NARP) y territorial (Pacífico, Amazonía, Catatumbo, PDET, ZOMAC).",
      vacio: "antes",
    },
    {
      fila: "Normativa",
      antes: "No se menciona norma específica.",
      despues: "Tampoco: ninguno ancla la política a una ley en esa sección.",
      vacio: "ambos",
    },
    {
      fila: "Recursos",
      antes: "$6,50 billones aprobados en cupo de inversión tributaria.",
      despues: "Sin cifra agregada: hay que buscarla en el capítulo de inversión pública.",
      vacio: "despues",
    },
    {
      fila: "Metas",
      antes: "5.706 jóvenes investigadores; 4.327 candidatos a doctorado; 58.522 artículos — con meta del cuatrienio y % de cumplimiento.",
      despues: "42 proyectos en 23 departamentos; 3.126 NNA en Ondas; 262 jóvenes en Ciencia para la Paz — solo ejecución, sin meta de referencia.",
    },
    {
      fila: "Impacto",
      antes: "Sin evidencia de impacto: solo métricas de gestión y producto.",
      despues: "Tampoco: solo métricas de gestión y producto.",
      vacio: "ambos",
    },
  ];

  const LECCIONES = [
    {
      titulo: "El objetivo revela el giro.",
      texto: "Mismo sector, otra filosofía: uno mide productividad y talento; el otro amarra todo al territorio y al cierre de brechas.",
    },
    {
      titulo: "Las metas engañan si no se homologan.",
      texto: "Comparar 5.706 con 3.126 es comparar manzanas con peras: primero hay que buscar la meta equivalente del PND 2022–2026 en Sinergia.",
    },
    {
      titulo: "El impacto queda vacío en ambos.",
      texto: "Ningún informe mide impacto, solo gestión. Es el hallazgo típico que el laboratorio lleva al plenario.",
    },
    {
      titulo: "Los huecos se anotan, no se rellenan.",
      texto: "Normativa y recursos faltan de forma distinta en cada informe: esa asimetría documental se registra tal cual, sin supuestos.",
    },
  ];

  const PREGUNTAS = [
    "¿Qué objetivo declaró cada gobierno y con qué instrumentos lo persiguió?",
    "¿Qué se mantuvo, qué se reconvirtió, qué se sumó y qué se terminó?",
    "¿Cómo contrastan las dos ejecuciones sobre los mismos instrumentos?",
  ];
</script>

<PaginaTexto pagina="inicio" {ancla} {visita}>
  <!-- ─────────────── Portada ─────────────── -->
  <header class="portada">
    <p class="antetitulo">Laboratorio de Cocreación · Empalme 2018 ↔ 2026</p>
    <h1>¿Qué hizo cada gobierno con la misma política pública?</h1>
    <p class="bajada">
      Leemos los informes de empalme de dos gobiernos como una <strong>red de políticas públicas e instrumentos</strong>, y la
      completamos entre todos: cada grupo toma una política, la describe entre los dos gobiernos y deja su hallazgo en una
      bitácora.
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
    <ol class="pasos">
      {#each PASOS as p, i (p.titulo)}
        <li>
          <span class="num" aria-hidden="true">{i + 1}</span>
          <div>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </div>
        </li>
      {/each}
    </ol>

    <div class="sesiones">
      <article>
        <h3>Sesión 1 · Análisis por política</h3>
        <p>
          Encuadre común y trabajo en grupo sobre la subred de la política elegida, con un paquete de evidencia (fragmentos
          con página y cifra). Cierra con una <a href={g("hipotesis")}>hipótesis</a> escrita.
        </p>
      </article>
      <article>
        <h3>Sesión 2 · Integración y plenario</h3>
        <p>
          Se revela el mapa con los aportes de todos los grupos y se contrastan las hipótesis. Lo que aparece solo al integrar
          —instrumentos compartidos, regularidades del cambio— es la <a href={g("emergencia")}>emergencia</a> que buscamos.
        </p>
      </article>
    </div>
  </section>

  <!-- ─────────────── La bitácora ─────────────── -->
  <section id="bitacora" tabindex="-1" aria-labelledby="t-bitacora">
    <p class="antetitulo">La bitácora</p>
    <h2 id="t-bitacora">Describir la política lado a lado</h2>
    <p>
      Cada grupo lleva una bitácora de su política. Arranca con lo que ya sabe la red —el objetivo que declaró cada gobierno y
      sus instrumentos— y el grupo la verifica, la corrige y la completa.
    </p>
    <ol class="secciones">
      {#each SECCIONES_BITACORA as s (s.n)}
        <li>
          <span class="n">{s.n}</span>
          <div>
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
          </div>
        </li>
      {/each}
    </ol>

    <div class="aviso">
      <strong>Antes de comparar números: la <a href={g("tabla-puente")}>tabla puente</a>.</strong>
      En 2018–2022 la CTeI es un pacto transversal con su propio porcentaje de cumplimiento; en 2022–2026 está repartida en dos
      transformaciones sin indicador único. Sin saber qué parte de un informe corresponde a qué parte del otro, cualquier
      comparación engaña.
    </div>

    <h3 class="ejemplo-titulo">Ejemplo aplicado: Ciencia, Tecnología e Innovación</h3>
    <div class="ejemplo" role="table" aria-label="Ejemplo de bitácora CTeI, 2018–2022 frente a 2022–2026">
      <div class="fila cab" role="row">
        <span role="columnheader">Categoría</span>
        <span role="columnheader">2018–2022 · Duque</span>
        <span role="columnheader">2022–2026 · Petro</span>
      </div>
      {#each EJEMPLO as e (e.fila)}
        <div class="fila" role="row">
          <span class="cat" role="rowheader">{e.fila}</span>
          <span role="cell" class:vacio={e.vacio === "antes" || e.vacio === "ambos"}>
            <span class="gob">2018–22<span class="oculto-visual">:</span></span>{e.antes}{#if e.vacio === "antes" || e.vacio === "ambos"}<span class="oculto-visual"> (hueco de información)</span>{/if}
          </span>
          <span role="cell" class:vacio={e.vacio === "despues" || e.vacio === "ambos"}>
            <span class="gob">2022–26<span class="oculto-visual">:</span></span>{e.despues}{#if e.vacio === "despues" || e.vacio === "ambos"}<span class="oculto-visual"> (hueco de información)</span>{/if}
          </span>
        </div>
      {/each}
    </div>
    <p class="leyenda-vacio"><span class="muestra-vacio" aria-hidden="true"></span> Hueco de información: se anota, no se rellena.</p>

    <h3>Lo que el ejercicio le enseña al taller</h3>
    <ul class="lecciones">
      {#each LECCIONES as l (l.titulo)}
        <li><strong>{l.titulo}</strong> {l.texto}</li>
      {/each}
    </ul>
  </section>

  <!-- ─────────────── La teoría ─────────────── -->
  <section id="teoria" tabindex="-1" aria-labelledby="t-teoria">
    <p class="antetitulo">La teoría para construir</p>
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
        Un programa, una ley, un fondo, un sistema. No es neutro: condensa una idea de cómo gobernar. Se clasifica por el
        recurso que moviliza (<a href={g("nato")}>NATO</a>); en la red es la <strong>forma</strong> del nodo.
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
        Cambiar el fin es el cambio más profundo —el de <a href={g("ordenes-del-cambio")}>tercer orden</a>—. En la red se lee
        en el anillo de cada política.
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
        Las instituciones rara vez cambian de golpe: suman capas, se redirigen, se dejan o se reemplazan. Es el
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

    <p class="salvedad">
      El proyecto también usa una analogía propia para medir —<a href={g("pid")}>PID+T</a>, de la teoría de la información—.
      Es <em>cómo medimos</em>; la teoría política de arriba es <em>qué significa</em>.
    </p>
  </section>

  <!-- ─────────────── Preguntas y cierre ─────────────── -->
  <section id="preguntas" tabindex="-1" aria-labelledby="t-preguntas">
    <p class="antetitulo">Las preguntas</p>
    <h2 id="t-preguntas">Lo que el mapa ayuda a responder</h2>
    <ol class="preguntas">
      {#each PREGUNTAS as p (p)}<li>{p}</li>{/each}
    </ol>
    <p>
      Y una pregunta de complejidad para el plenario: ¿los patrones de cambio son propios de cada política, o hay regularidades
      que las atraviesan?
    </p>
    <div class="acciones">
      <a class="btn primario" href={hrefDe("red")}>Explorar la red</a>
      <a class="btn" href={hrefDe("glosario")}>Ir al glosario</a>
    </div>
  </section>

  <footer class="pie">
    <p>
      Fuente: informes de empalme 2018–2022 y 2022–2026 (DNP). Vocabulario y decisiones en el
      <a href="https://github.com/complexluise/laboratorio-cocreacion-empalme-colombia" rel="noopener">repositorio del proyecto</a>.
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

  .pasos,
  .secciones {
    display: grid;
    gap: 10px;
    margin: 16px 0;
    padding: 0;
    list-style: none;
  }
  .pasos li,
  .secciones li {
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
  }
  .pasos h3,
  .secciones h3 {
    margin: 0 0 2px;
  }
  .pasos p,
  .secciones p {
    margin: 0;
    font-size: 15px;
    color: var(--tinta-suave);
  }
  .num {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--acento);
    color: white;
    font-weight: 700;
  }
  .n {
    flex: none;
    min-width: 40px;
    font: 650 15px var(--fuente-dato);
    color: var(--acento);
    padding-top: 1px;
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

  .aviso {
    margin: 16px 0;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.55;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-left: 3px solid var(--tinta);
    border-radius: 0 12px 12px 0;
  }
  .ejemplo-titulo {
    margin-top: 24px !important;
  }
  .ejemplo {
    position: relative;
    display: grid;
    border: 1px solid var(--borde);
    border-radius: 12px;
    overflow: hidden;
    background: var(--papel);
    font-size: 14.5px;
    line-height: 1.5;
  }
  /* Mobile: cada fila es un bloque; la categoría arriba y los dos gobiernos apilados. */
  .fila {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
  }
  .fila + .fila {
    border-top: 1px solid var(--borde);
  }
  /* En mobile la fila de encabezados se oculta a la vista pero no al lector de pantalla. */
  .fila.cab {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    padding: 0;
  }
  .oculto-visual {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .cat {
    font-weight: 700;
  }
  .gob {
    display: inline-block;
    margin-right: 8px;
    font: 600 11px var(--fuente-dato);
    color: var(--tinta-suave);
  }
  .vacio {
    padding: 2px 8px;
    margin: 0 -8px;
    border-radius: 6px;
    background: repeating-linear-gradient(-45deg, transparent 0 6px, rgb(0 0 0 / 0.035) 6px 12px);
    color: var(--tinta-suave);
    font-style: italic;
  }
  .leyenda-vacio {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px !important;
    color: var(--tinta-suave);
  }
  .muestra-vacio {
    width: 22px;
    height: 14px;
    border-radius: 4px;
    border: 1px solid var(--borde);
    background: repeating-linear-gradient(-45deg, transparent 0 4px, rgb(0 0 0 / 0.08) 4px 8px);
  }
  .lecciones {
    padding-left: 20px;
  }
  .lecciones li {
    margin-bottom: 8px;
  }

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
  .salvedad {
    font-size: 14.5px !important;
    color: var(--tinta-suave);
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
    .fila {
      grid-template-columns: 130px minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
    }
    .fila.cab {
      position: static;
      width: auto;
      height: auto;
      overflow: visible;
      clip-path: none;
      padding: 12px 14px;
      display: grid;
      background: var(--fondo);
      font: 600 12px var(--fuente-ui);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--tinta-suave);
    }
    /* En escritorio la columna ya dice el gobierno: la etiqueta queda solo para el lector. */
    .gob {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    .vacio {
      margin: -2px -8px;
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
