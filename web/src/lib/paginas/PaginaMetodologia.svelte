<script lang="ts">
  import Flujograma from "$lib/components/Flujograma.svelte";
  import { CAPAS, ETIQUETA_ESTADO, evidencia, REPO, urlArchivo, urlCommit, urlPR } from "$lib/metodologia.ts";
  import PaginaTexto from "$lib/paginas/PaginaTexto.svelte";
  import { hrefDe } from "$lib/rutas.ts";

  /**
   * Cómo lo hicimos (issue #37, ADR-0006): advertencia, metodología como flujograma, git como
   * evidencia y declaración de uso de IA. Las cifras salen de lib/evidencia.json
   * (scripts/evidencia_git.py), no se escriben a mano. Fuente del texto: docs/metodologia.md.
   */
  interface Props {
    ancla?: string | undefined;
    visita?: number;
  }
  let { ancla, visita = 0 }: Props = $props();

  const c = evidencia.commits;
  const pct = (n: number) => (c.total > 0 ? (n / c.total) * 100 : 0);
  const SEGMENTOS = [
    { clase: "agente", n: c.agente, etiqueta: "firmados por el agente de IA" },
    { clase: "mixto", n: c.persona_con_ia, etiqueta: "firmados por una persona con la IA como coautora" },
    { clase: "persona", n: c.persona, etiqueta: "firmados por una persona sin IA declarada" },
  ];
  const ultimaVersion = evidencia.releases.at(-1)?.tag ?? "—";

  const PRINCIPIOS = [
    {
      titulo: "La máquina propone, las personas deciden.",
      texto: "La IA plantea opciones con sus costos; el equipo elige y aprueba. Ninguna decisión de diseño ni de contenido entra sin esa aprobación.",
    },
    {
      titulo: "Todo cambio deja rastro.",
      texto: "Cada trabajo empieza en un issue; cada decisión queda en un ADR; cada cambio es un commit que declara si participó la IA; cada integración es un PR aprobado; cada versión, un tag.",
    },
    {
      titulo: "Un contrato entre la extracción y el sitio.",
      texto: "Los datos solo llegan a la web si cumplen un esquema que se valida automáticamente. Lo que la IA produce se puede comprobar sin volver a preguntarle.",
    },
    {
      titulo: "Una revisión que busca errores.",
      texto: "Un agente verificador revisa cada cambio con la tarea de encontrarle fallas. Otros agentes contrastaron la red con los informes y dejaron correcciones con evidencia.",
    },
    {
      titulo: "Los huecos se declaran.",
      texto: "Lo que la fuente no dice se escribe «Sin dato». Ni la IA ni las personas rellenan con supuestos.",
    },
    {
      titulo: "El taller es la revisión que falta.",
      texto: "La red es un borrador verificable. Los grupos la contrastan con los informes, y sus hallazgos corrigen el mapa.",
    },
  ];
</script>

<PaginaTexto pagina="metodologia" {ancla} {visita}>
  <header class="portada">
    <p class="antetitulo">Cómo lo hicimos</p>
    <h1>Un laboratorio hecho en colaboración con la máquina</h1>
    <p class="bajada">
      Este sitio, su red y sus materiales se construyeron con inteligencia artificial, bajo la dirección de un equipo humano.
      Aquí contamos cómo trabajamos, qué hizo cada parte y dónde está la evidencia: en el historial de <strong>git</strong> del
      proyecto.
    </p>
  </header>

  <!-- ─────────────── Advertencia ─────────────── -->
  <section id="advertencia" tabindex="-1" class="advertencia" aria-labelledby="t-advertencia">
    <p class="sello"><span aria-hidden="true">IA</span> Advertencia</p>
    <h2 id="t-advertencia">Este contenido se generó con inteligencia artificial y aún no se ha revisado al 100 %</h2>
    <p>
      La red de políticas e instrumentos, los textos del sitio, el glosario y los materiales del taller se produjeron con
      modelos de IA. Los revisamos por partes, con agentes que buscan errores y con lectura humana, pero
      <strong>la revisión humana completa todavía no está hecha</strong>. Puede haber clasificaciones discutibles, cifras mal
      atribuidas o citas por verificar.
    </p>
    <p>
      No es un descuido que escondamos: es el punto del ejercicio. El laboratorio es también una práctica de <strong>cómo
      interactuar con la máquina y elaborar artefactos para colaborar</strong>: la máquina produce un borrador rápido y
      verificable, y las personas lo contrastan, lo discuten y lo corrigen. Cada error que encuentren mejora el mapa.
    </p>
    <div class="acciones">
      <a class="btn primario" href="{REPO}/issues/new" rel="noopener" target="_blank">Reportar un error</a>
      <a class="btn" href={hrefDe("metodologia", "revision")}>Qué está revisado</a>
    </div>
  </section>

  <!-- ─────────────── Metodología ─────────────── -->
  <section id="metodologia" tabindex="-1" aria-labelledby="t-metodologia">
    <p class="antetitulo">La metodología</p>
    <h2 id="t-metodologia">Seis reglas de trabajo</h2>
    <ol class="principios">
      {#each PRINCIPIOS as p, i (p.titulo)}
        <li><span class="n" aria-hidden="true">{i + 1}</span><p><strong>{p.titulo}</strong> {p.texto}</p></li>
      {/each}
    </ol>
  </section>

  <!-- ─────────────── Flujo ─────────────── -->
  <section id="flujo" tabindex="-1" aria-labelledby="t-flujo">
    <p class="antetitulo">El flujo</p>
    <h2 id="t-flujo">De los informes al mapa, y de vuelta</h2>
    <p>
      Nueve fases, de la pregunta al taller. En cada una, qué hicimos las personas, qué hizo la máquina y qué rastro quedó.
      Abran la evidencia de una fase para ver sus commits. El taller cierra el ciclo: lo que encuentren los grupos vuelve a
      la revisión.
    </p>
    <Flujograma {evidencia} />
  </section>

  <!-- ─────────────── Evidencia ─────────────── -->
  <section id="evidencia" tabindex="-1" aria-labelledby="t-evidencia">
    <p class="antetitulo">La evidencia</p>
    <h2 id="t-evidencia">Git es nuestra evidencia</h2>
    <p>
      Git registra cada cambio del proyecto: quién lo firmó, cuándo y, con la línea <code>Co-Authored-By</code>, qué modelo de
      IA participó. Estas cifras se leen del historial con un script, no se escriben a mano.
    </p>

    <ul class="cifras">
      <li><span class="valor">{c.total}</span><span class="etiqueta">commits</span></li>
      <li><span class="valor">{evidencia.prs_integrados.length}</span><span class="etiqueta">PR aprobados e integrados</span></li>
      <li><span class="valor">{evidencia.adrs.length}</span><span class="etiqueta">decisiones registradas</span></li>
      <li><span class="valor">{evidencia.releases.length}</span><span class="etiqueta">versiones publicadas</span></li>
    </ul>

    <h3>¿Quién firmó cada commit?</h3>
    <div class="barra" role="img" aria-label="De {c.total} commits: {c.agente} del agente de IA, {c.persona_con_ia} de una persona con la IA como coautora, {c.persona} de una persona sin IA declarada.">
      {#each SEGMENTOS as s (s.clase)}
        {#if s.n > 0}<span class={s.clase} style:width="{pct(s.n)}%"></span>{/if}
      {/each}
    </div>
    <ul class="leyenda">
      {#each SEGMENTOS as s (s.clase)}
        <li><span class="muestra {s.clase}" aria-hidden="true"></span><strong>{s.n}</strong> {s.etiqueta}</li>
      {/each}
    </ul>
    <p class="nota">
      Casi todo el código y el texto lo escribió la IA. Lo que hicimos las personas no siempre queda en un commit: está en los
      <a href="{REPO}/issues?q=is%3Aissue" rel="noopener" target="_blank">issues</a>, en las
      <a href={urlArchivo("docs/decisiones")} rel="noopener" target="_blank">decisiones</a> y en la aprobación de cada
      <a href="{REPO}/pulls?q=is%3Apr+is%3Amerged" rel="noopener" target="_blank">PR</a>.
    </p>

    <h3>Qué dice git y qué no</h3>
    <div class="dos">
      <div>
        <p class="rotulo si">Dice</p>
        <ul>
          <li>Quién firmó cada cambio y cuándo.</li>
          <li>Qué modelo de IA participó (la línea <code>Co-Authored-By</code>).</li>
          <li>Qué se aprobó e integró, y en qué versión salió.</li>
        </ul>
      </div>
      <div>
        <p class="rotulo no">No dice</p>
        <ul>
          <li>De quién fue cada idea: las conversaciones con la IA no quedan en el repositorio.</li>
          <li>Cuánto se revisó un texto antes de aprobarlo.</li>
          <li>
            Quién pulsó «merge»: los PR se integran con la cuenta del equipo, a veces ejecutado por el agente con autorización
            explícita. El hilo de cada PR lo muestra.
          </li>
        </ul>
      </div>
    </div>

    <h3>Las decisiones</h3>
    <ul class="adrs">
      {#each evidencia.adrs as a (a.id)}
        <li><a href={urlArchivo(a.archivo)} rel="noopener" target="_blank">{a.id}</a> {a.titulo}</li>
      {/each}
    </ul>

    <h3>Compruébenlo ustedes</h3>
    <p>Con una copia del repositorio, este comando lista cada commit con su autor y su coautor de IA:</p>
    <pre><code>git log --format='%h %an · %(trailers:key=Co-Authored-By,valueonly)'</code></pre>
    <p class="nota">
      Corte: commit <a class="hash" href={urlCommit(evidencia.corte.commit)} rel="noopener" target="_blank">{evidencia.corte.commit}</a>
      ({evidencia.corte.fecha}), versión {ultimaVersion}. Último PR contado:
      {#if evidencia.prs_integrados.length > 0}
        {@const ultimo = evidencia.prs_integrados.at(-1)!}
        <a href={urlPR(ultimo)} rel="noopener" target="_blank">#{ultimo}</a>.
      {/if}
      La foto se actualiza en cada versión.
    </p>
  </section>

  <!-- ─────────────── Declaración ─────────────── -->
  <section id="declaracion" tabindex="-1" aria-labelledby="t-declaracion">
    <p class="antetitulo">Declaración de uso de IA</p>
    <h2 id="t-declaracion">Qué hizo la IA y qué hicimos nosotros</h2>

    <h3>Herramientas</h3>
    <ul>
      <li>
        <strong>Claude</strong> (Anthropic), a través de Claude Code: redactó el código, los textos y la documentación, reconstruyó
        la red leyendo los informes y revisó cada cambio. Trabajó con agentes con roles distintos: uno cuida la coherencia de
        los documentos, otro escribe el código y otro lo verifica.
      </li>
      <li>
        <strong>Gemini</strong> (Google): transcribió los PDF escaneados y produjo una primera extracción de la red, que después se
        reemplazó.
      </li>
    </ul>

    <div class="dos">
      <div>
        <h3>Lo que hizo la IA</h3>
        <ul>
          <li>Extraer y clasificar políticas e instrumentos de los informes.</li>
          <li>Escribir casi todo el código y los textos del sitio, el glosario y los materiales.</li>
          <li>Proponer opciones de diseño con sus pros y contras.</li>
          <li>Revisar cambios y datos buscando errores.</li>
        </ul>
      </div>
      <div>
        <h3>Lo que hicimos las personas</h3>
        <ul>
          <li>Plantear la pregunta, el marco teórico y la actividad.</li>
          <li>Elegir la fuente y el sector piloto.</li>
          <li>Escribir el ejemplo de CTeI que inspira la bitácora; la IA lo llevó al formato de la plantilla.</li>
          <li>Decidir entre las opciones y aprobar cada integración y cada versión.</li>
          <li>Probar el sitio y pedir correcciones.</li>
          <li>Conducir el taller e integrar las bitácoras de los grupos.</li>
        </ul>
      </div>
    </div>

    <h3>Lo que la IA no decide</h3>
    <ul>
      <li>No evalúa ni califica gobiernos. El laboratorio tampoco lo hace.</li>
      <li>No publica: todo pasa por un PR que el equipo aprueba.</li>
      <li>No rellena huecos: si la fuente no lo dice, queda «Sin dato».</li>
      <li>No escribe las bitácoras de los grupos.</li>
    </ul>

    <h3 id="revision" tabindex="-1">Qué tan revisado está cada parte</h3>
    <div class="capas" role="table" aria-label="Estado de revisión por capa del contenido">
      <div class="fila cab" role="row">
        <span role="columnheader">Capa</span>
        <span role="columnheader">Quién la produjo</span>
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

  <!-- ─────────────── Reportar ─────────────── -->
  <section id="reportar" tabindex="-1" aria-labelledby="t-reportar">
    <h2 id="t-reportar">¿Encontraron un error?</h2>
    <p>
      Díganlo en el taller o abran un <a href="{REPO}/issues/new" rel="noopener" target="_blank">issue en GitHub</a> con qué
      está mal y dónde lo vieron (el instrumento, la página del informe). Cada reporte queda con rastro, igual que el resto
      del trabajo. Para el vocabulario, el <a href={hrefDe("glosario")}>glosario</a>; para la actividad, el
      <a href={hrefDe("inicio", "actividad")}>inicio</a>.
    </p>
  </section>
</PaginaTexto>

<style>
  section {
    margin-top: 44px;
    scroll-margin-top: 12px;
    outline: none;
  }
  .portada {
    margin-bottom: 8px;
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
    font-weight: 600;
    font-size: 15px;
    border-radius: 12px;
    border: 1px solid var(--acento);
    background: var(--papel);
    color: var(--acento) !important;
    text-decoration: none;
  }
  .btn.primario {
    background: var(--acento);
    color: white !important;
  }
  .principios {
    display: grid;
    gap: 10px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }
  .principios li {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
  }
  .principios p {
    margin: 0;
  }
  .n {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--acento-suave);
    color: var(--acento);
    font-weight: 700;
  }
  .cifras {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 16px 0;
    padding: 0;
    list-style: none;
  }
  .cifras li {
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    background: var(--papel);
    border: 1px solid var(--borde);
    border-radius: 12px;
  }
  .valor {
    font: 650 30px var(--fuente-display);
    line-height: 1.1;
  }
  .etiqueta {
    font-size: 13.5px;
    color: var(--tinta-suave);
  }
  .barra {
    display: flex;
    height: 22px;
    gap: 2px;
    border-radius: 6px;
    overflow: hidden;
  }
  .barra span,
  .muestra {
    background: #5f6b7a;
  }
  .agente {
    background: var(--acento) !important;
  }
  .mixto {
    background: repeating-linear-gradient(-45deg, #b45309 0 5px, var(--acento) 5px 10px) !important;
  }
  .persona {
    background: #b45309 !important;
  }
  .leyenda {
    display: grid;
    gap: 4px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
  }
  .leyenda li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14.5px;
  }
  .muestra {
    flex: none;
    width: 14px;
    height: 14px;
    border-radius: 3px;
  }
  .nota {
    font-size: 14.5px !important;
    color: var(--tinta-suave);
  }
  .dos {
    display: grid;
    gap: 4px 20px;
  }
  .dos ul {
    margin: 4px 0 0;
    padding-left: 20px;
  }
  .rotulo {
    margin: 12px 0 0 !important;
    font: 700 12px var(--fuente-ui) !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .rotulo.si {
    color: #2e7d32;
  }
  .rotulo.no {
    color: #b45309;
  }
  .adrs {
    padding-left: 0;
    list-style: none;
  }
  .adrs a,
  .hash {
    font: 600 14px var(--fuente-dato);
    margin-right: 6px;
  }
  pre {
    margin: 8px 0;
    padding: 12px 14px;
    overflow-x: auto;
    background: #23262e;
    color: #f5f5f3;
    border-radius: 10px;
    font-size: 13px;
  }
  code {
    font-family: var(--fuente-dato);
    font-size: 0.9em;
    white-space: nowrap;
  }
  pre code {
    white-space: pre;
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
  .fila:first-child,
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
    .cifras {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .dos {
      grid-template-columns: 1fr 1fr;
    }
    .advertencia {
      padding: 22px 24px;
    }
    .fila {
      grid-template-columns: 1.1fr 1fr 1.6fr;
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
