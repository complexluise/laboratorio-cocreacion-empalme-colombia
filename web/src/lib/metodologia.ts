import { CAMBIOS_OBJETIVO, MODOS_CAMBIO, TIPOS_NATO, TIPOS_RELACION } from "@laboratorio/red";
import { ETIQUETA_CAMBIO_OBJETIVO, ETIQUETA_MODO, ETIQUETA_NATO, ETIQUETA_RELACION } from "$lib/visual.ts";

/**
 * «Cómo lo hicimos» (ADR-0006, ADR-0007). Tres piezas:
 * - CATEGORIAS: con qué se lee un informe para convertirlo en red (el libro de códigos);
 * - RECETA: los pasos para repetirlo, cada uno declara si usa IA y dónde;
 * - PASOS: el registro de lo que le pedimos a la IA para construir el sitio, con los prompts TAL
 *   CUAL (con sus erratas): son la evidencia. Las conversaciones del inicio no se guardaron.
 * Espejo en docs/metodologia.md.
 */

// ─── Las categorías ────────────────────────────────────────────────────────────────────────────

export interface Categoria {
  /** Lo que se busca en el texto. */
  que: string;
  /** La pregunta que se le hace al texto. */
  pregunta: string;
  /** Los valores posibles, o qué se anota. */
  valores: string;
  /** Entrada del glosario que lo explica. */
  glosario: string;
}

const lista = (xs: readonly string[]) => xs.join(" · ");

/** Qué se le pregunta a cada informe. Los valores salen del mismo vocabulario que usa la red. */
export const CATEGORIAS: Categoria[] = [
  {
    que: "Política pública",
    pregunta: "¿Sobre qué problema público actúa el Estado?",
    valores: "Un área que atraviesa gobiernos, con el objetivo que declara cada uno.",
    glosario: "politica-publica",
  },
  {
    que: "Cambio del objetivo",
    pregunta: "¿Cambió lo que se busca en esa área?",
    valores: lista(CAMBIOS_OBJETIVO.map((c) => ETIQUETA_CAMBIO_OBJETIVO[c])),
    glosario: "cambio-del-objetivo",
  },
  {
    que: "Instrumento",
    pregunta: "¿Con qué actúa el Estado?",
    valores: "Un programa, una norma, un fondo, un sistema o una convocatoria, con nombre propio.",
    glosario: "instrumento",
  },
  {
    que: "Tipo de instrumento",
    pregunta: "¿Qué recurso del Estado usa?",
    valores: lista(TIPOS_NATO.map((t) => ETIQUETA_NATO[t])),
    glosario: "nato",
  },
  {
    que: "Presencia",
    pregunta: "¿Cómo aparece en el informe de cada gobierno?",
    valores: "propuesto · logrado · pendiente",
    glosario: "presencia",
  },
  {
    que: "Modo de cambio",
    pregunta: "¿Qué le pasó entre un gobierno y el otro?",
    valores: lista(MODOS_CAMBIO.map((m) => ETIQUETA_MODO[m])),
    glosario: "modo-de-cambio",
  },
  {
    que: "Relación",
    pregunta: "¿Cómo se conecta con otro instrumento?",
    valores: lista(TIPOS_RELACION.map((r) => ETIQUETA_RELACION[r])),
    glosario: "relacion-entre-instrumentos",
  },
  {
    que: "Evidencia",
    pregunta: "¿Dónde lo dice el informe?",
    valores: "La página y la cifra, tal cual, y qué tan segura es la lectura: alta, media o baja.",
    glosario: "confianza",
  },
];

// ─── La receta ─────────────────────────────────────────────────────────────────────────────────

export type Quien = "personas" | "ia" | "programa";

export const ETIQUETA_QUIEN: Record<Quien, string> = {
  personas: "Personas",
  ia: "IA",
  programa: "Programa",
};

export interface PasoReceta {
  id: string;
  titulo: string;
  quien: Quien[];
  /** Qué hacer, para quien quiera repetirlo. */
  hacer: string;
  /** Dónde entra la IA y con qué. Obligatorio si `quien` incluye "ia". */
  ia?: string;
  /** Id de la instrucción (INSTRUCCIONES_DATOS) que usamos en este paso. */
  instruccion?: string;
  /** Qué hicimos en este mapa y en qué estado quedó. */
  enEsteMapa: string;
}

export const RECETA: PasoReceta[] = [
  {
    id: "reunir",
    titulo: "Reunir los documentos",
    quien: ["programa"],
    hacer: "Descarguen los informes de empalme de los dos gobiernos que van a comparar y anoten de dónde sale cada uno.",
    enEsteMapa:
      "Un programa descargó los informes que publica el Departamento Nacional de Planeación (DNP). Para Ciencia, Tecnología e Innovación usamos los dos informes principales de MinCiencias.",
  },
  {
    id: "texto",
    titulo: "Pasarlos a texto",
    quien: ["programa", "ia"],
    hacer: "Conviertan cada documento a texto, página por página. Así cada dato podrá citar su página.",
    ia: "Solo en los documentos escaneados: un modelo de IA lee la imagen y la transcribe.",
    instruccion: "ocr",
    enEsteMapa: "Usamos Gemini por API. Nadie revisó las transcripciones línea a línea.",
  },
  {
    id: "categorias",
    titulo: "Fijar las categorías antes de leer",
    quien: ["personas"],
    hacer:
      "Decidan qué van a buscar y con qué palabras lo van a clasificar. Sin categorías fijas, cada lectura clasifica distinto y los dos gobiernos no se pueden comparar.",
    enEsteMapa: "Salieron de la teoría política. Son las de la tabla «Las categorías».",
  },
  {
    id: "extraer",
    titulo: "Extraer con IA, una política a la vez",
    quien: ["ia"],
    hacer:
      "Denle a un modelo de IA el texto y las categorías. Pídanle los instrumentos de cada política, con su clasificación y la página y la cifra que la respaldan. Pídanle que no invente.",
    ia: "Aquí la IA lee y clasifica. Conviene usarla por API: todos los textos reciben la misma instrucción y las respuestas vuelven con el mismo formato. Aun así, otra corrida puede dar otra red.",
    instruccion: "extraer",
    enEsteMapa:
      "Primero usamos Gemini por API, un gobierno a la vez. Los fondos que sirven a muchas políticas quedaron en una sola y la red se partió en islas. La rehicimos con agentes de Claude, uno por política.",
  },
  {
    id: "unir",
    titulo: "Unir los repetidos",
    quien: ["ia", "programa"],
    hacer:
      "El mismo instrumento aparece en varias políticas, o con otro nombre en el otro gobierno. Únanlo, sin fusionar instrumentos que solo comparten el tema.",
    ia: "Un agente de IA propone qué unir. Un programa, sin IA, arma el resultado.",
    instruccion: "unir",
    enEsteMapa:
      "Cuando ningún agente propuso cómo cambió un instrumento presente en los dos gobiernos, el programa le asignó «conversión». Esos casos hay que revisarlos.",
  },
  {
    id: "verificar",
    titulo: "Verificar contra la fuente",
    quien: ["ia", "personas"],
    hacer:
      "Comparen cada instrumento con la página que cita: primero con otra IA, después con personas.",
    ia: "Una segunda IA, con el encargo de encontrar errores. Ayuda, pero no reemplaza a las personas.",
    enEsteMapa:
      "La red hecha con Gemini pasó por esta revisión con IA y se corrigió. La red actual, hecha con Claude, todavía no: ni con IA ni, dato por dato, con personas. Es el paso pendiente.",
  },
  {
    id: "areas",
    titulo: "Agrupar en áreas comparables",
    quien: ["ia", "personas"],
    hacer:
      "Cada gobierno nombra sus políticas a su manera. Júntenlas en áreas que atraviesen los dos gobiernos y anoten cómo cambió el objetivo.",
    ia: "La IA propone la agrupación; las personas la aprueban.",
    enEsteMapa: "Quedaron 14 áreas. El equipo aprobó cómo se dividieron, no el contenido de cada una.",
  },
  {
    id: "publicar",
    titulo: "Comprobar y publicar",
    quien: ["programa"],
    hacer: "Un programa comprueba que los datos usen solo las categorías fijadas y arma la red, el sitio y el Excel.",
    enEsteMapa: "Sin IA: con los mismos datos, siempre da el mismo resultado.",
  },
  {
    id: "cocrear",
    titulo: "Revisar y ampliar en el taller",
    quien: ["personas"],
    hacer:
      "Cada grupo toma una política, la contrasta con los informes y con otras fuentes, y deja sus hallazgos en la bitácora. El equipo lleva al mapa lo que encuentren.",
    enEsteMapa: "Es la vía prevista para la revisión humana que le falta a la red.",
  },
];

// ─── El registro: lo que le pedimos a la IA ─────────────────────────────────────────────────────

export interface Paso {
  id: string;
  titulo: string;
  /** Los mensajes que le enviamos a la IA, literales. */
  pedimos: string[];
  /** Decisiones que tomamos cuando la IA nos planteó opciones. */
  decidimos?: string[];
  /** Qué hizo la IA, en palabras simples. */
  hizo: string;
  resultado: string;
}

export const PASOS: Paso[] = [
  {
    id: "extraer",
    titulo: "Leer los informes y armar la red",
    pedimos: [],
    hizo: "Descargó los informes de empalme que publica el Departamento Nacional de Planeación (DNP) y los pasó a texto. Gemini transcribió los documentos escaneados e hizo un primer listado de instrumentos. Después, varios agentes de Claude leyeron los informes, una política a la vez. Con eso armaron la red: políticas, instrumentos, cómo cambió cada uno y la página que lo respalda.",
    resultado: "La red de Ciencia, Tecnología e Innovación (CTeI).",
  },
  {
    id: "orden",
    titulo: "Ordenar la forma de trabajar",
    pedimos: [
      "Quiero que hagamos la epica #6.  Antes de eso queremos implementar la disciplina kybernetes del repo de sostaina porque ese nos ayuda a interaciuar con Claude.",
      "Ya hice el commit del ci, confirmo el gitflow. ahora ten en cuenta que la epic conssite en pasarnos a svelte por lo tanto es necesario adoptar la demás parte de la disciplina espcial el uso de pnpm y etc. Lets work.",
      "ahora que veo es que a la red hace falta aplicar un algoritmo de node overlapping y el de texto para que no se solape.",
    ],
    hizo: "Adoptamos unas reglas de trabajo: cada tarea se anota, cada decisión se registra y un agente revisor busca errores antes de publicar. La IA rehízo el sitio con otra tecnología y separó los nodos y los textos de la red para que no se encimen.",
    resultado: "Primera versión publicada (v0.1).",
  },
  {
    id: "interfaz",
    titulo: "Reordenar la pantalla de la red",
    pedimos: [
      "Ahora vamos a hacer una retroalimentación y reodenación del layout,  porque hay cosas que no tienen una jerarquia clara, se mezclan las cosas. necesitamos establecer una semantica clara. necesitamos aplicar las buenas practicas de diseño en interfases como red y de busqueda por ejemplo actualmente si busco regalias se va filtrando el grafo y me toca luego dar click en limpiar filtros lo cual me deja ver toda la red y mantiene la info del sidebar. ese comportmaient no es el correcto seria mejor que apareciera una lista y al seleccionar te lleva al nodo enfocado en su subred. lo primero es hacer un diagnostico y luego un encuadre.",
    ],
    decidimos: [
      "Los filtros van en un panel a la izquierda.",
      "Al buscar una política, la red muestra solo lo suyo; al buscar un instrumento, atenúa el resto.",
      "La leyenda solo explica; no filtra.",
    ],
    hizo: "Hizo un diagnóstico, nos planteó opciones y rehízo la pantalla: el buscador ahora muestra una lista y lleva al elemento elegido, con su entorno.",
    resultado: "Segunda versión (v0.2).",
  },
  {
    id: "politica",
    titulo: "Precisar qué es una política pública",
    pedimos: [
      "Según la definición una política publica tiene asociada un objetivo de política ( que incluso puede estar muy asociado s como en particular un gobierno va a dirigir esa política pública. Primero reflexionemos acerca de esto para ver cómo encuadrarlo",
      "De lo que queda\n1. Granularidad misión\n2. Apropiación social y ciencia abierta por aparte\n3. antes pero puede ser ampliable\n4. Si tratemos lo así\n\nEsto déjalo en SOLO UNO issue y abordemos esto para ver cómo cambia la red dejalo en un branch",
    ],
    decidimos: [
      "Una política pública es un área que atraviesa gobiernos.",
      "El cambio del objetivo se clasifica con categorías fijas: se mantiene, se reformula, es nuevo o ya no se declara.",
      "Cada instrumento se vincula a la política, no al objetivo de cada gobierno.",
    ],
    hizo: "Propuso tres maneras de representarlo en la red y, con lo que decidimos, reagrupó la red en áreas, cada una con el objetivo que declara cada gobierno.",
    resultado: "14 áreas de política, con su objetivo por gobierno.",
  },
  {
    id: "sitio",
    titulo: "La actividad, la teoría y el glosario",
    pedimos: [
      "Esta red esta bien ya la dejamos así. vamos a completar lo que falta, Primero necesito la pagina de landing donde se muestra cual es nuestra actividad de cocreación, la teoria para poder construir , luego hacemos una pagina de glosario donde coloquemos cada sigla cada palabra nueva. que no sea de uso comun y expliquemos la ontologia uqe tenemos aquí con la teoria politica. Para eso aclaremos, lo que los grupos/equipo van a seleccionar es una politica publica la van describir entre los dos gobiernos, buscando información complementario y llenando una bitacora donde hay unos formatos que van llenando. esta es una plantilla de lo que debe inspirarse la bitacora: […]",
    ],
    decidimos: ["Al abrir el sitio se ve la actividad, no la red."],
    hizo: "Escribió la página de inicio y el glosario a partir de nuestra plantilla de la bitácora. El agente revisor encontró errores, entre ellos quién creó MinCiencias, y la IA los corrigió.",
    resultado: "Página de inicio con la actividad y la teoría, y un glosario.",
  },
  {
    id: "bitacora",
    titulo: "La bitácora de cada grupo",
    pedimos: [
      "Un docx con el formato listo para llenar. así no este prellenado.",
      "Se recoge el docx y se integra y se convierte en un dato estructurado.",
    ],
    decidimos: ["Una bitácora en Word, en blanco, lista para llenar.", "Recogemos las bitácoras y las convertimos en datos."],
    hizo: "Tomó como ejemplo nuestra bitácora de CTeI (la escribimos nosotros). Creó la bitácora en Word, en blanco, y un programa que la lee y la convierte en datos. El revisor encontró casos en que el programa perdía datos sin avisar; se corrigieron.",
    resultado: "La bitácora para descargar y un ejemplo lleno de CTeI.",
  },
  {
    id: "actividad",
    titulo: "Una actividad más dinámica",
    pedimos: [
      "quiero descargar el excel",
      "Listo eso esta buenismo tambien va con PR e incluyamos el boton para descargar y ponle una mircointeracción me gutaai que la actividad fuera más dinamica y pedagogica.",
    ],
    hizo: "Pasó la red a Excel, agregó botones de descarga y convirtió la actividad en cuatro pasos. Sumó una práctica para clasificar instrumentos reales antes de llenar la bitácora.",
    resultado: "La red en Excel, la actividad paso a paso y la práctica.",
  },
  {
    id: "cierre",
    titulo: "Cerrar la versión",
    pedimos: ["Cortemos aquí ya tenemos suficiente para esta iteración.", "Los documentos deben estar alineados con todo incluyendo el README"],
    hizo: "Publicó la versión y puso al día la documentación.",
    resultado: "Tercera versión (v0.3).",
  },
  {
    id: "declaracion",
    titulo: "La declaración de uso de IA",
    pedimos: [
      "Nos falta ahora redacta una metodologia y una declaración del uso de IA como la usamos cual nuestra particiapción y así mismo colocar esta advertencia que este contenido fue generado usando inteligencia artificial y aún no se ha revisado al 100% y como este ejercicio es justo el como se puede interacutuar con la maquina y elaboración de artfactos para colaborar. primero encuadremos y debatamos.",
      "Eso se siente como matar un raton con una bomba nuclear. en realidad debe ser más senicillo, olvida git nuestro publico NO estecnico. más bien lo que busco es algo más parecido al documento y que esten los prompts que fueron enviados y que se proceso y eso. el paso a paso de lo que se hizo eso es más util omo declaración. Por otro lado a la finl se debe hacer un agente adversario , este agente debe personalizarse como un quisquilloso por la redundacia y que le gusta el lengjua claro, y las ideas claras y consisas.",
      "Necesitamos un documento del pipeline de extracción que se uso para obtener el grafo. (en un inicio usabamos gemini por api pero luego lo hicimos como un workflow de claude eso debe incluirse. visto desde el sistema completo.",
    ],
    hizo: "La primera versión fue un diagrama técnico basado en el historial del código. La descartamos por compleja y la IA la rehízo como un paso a paso con los mensajes. También documentó cómo se extrajo la red. Al final, un agente editor, exigente con la redundancia y la claridad, revisó los textos.",
    resultado: "Esta página, el aviso en las demás y el documento técnico de la extracción.",
  },
  {
    id: "receta",
    titulo: "Un glosario en orden y la metodología como receta",
    pedimos: [
      "Vamos con otra rama (creale un nombre mucho más diciente del trabajo) ahora vamos a realizar un ajuste de la actividad los textos y el glosario ( por ejemplo dice La ontologia del mapa eso no significa nada es mejor un glosario que se va abordando. y piensa aquí desde la teoria de la información los conceptos más relevantes son aquellos que permiten describri lo posterior. y para HACER el mapa es claro que hay unos conceptos categorias y tipolologias que nos permitieran elaborar una red a partir de los textos (esto hace parte de la metodologia  y reducimos tanto detalle entorno a la fecha y más bien como una receta replicable eso es lo que importnate en una metodologia declarando explicitamtne donde usar la IA. (primero con una API como gemini y luego una verificiación)",
    ],
    decidimos: [
      "El glosario se lee en orden: primero las palabras que permiten explicar las siguientes.",
      "La metodología es una receta que otros pueden repetir, y cada paso dice si usa IA.",
      "Las categorías con que se lee un informe son parte de la metodología.",
      "Este registro de mensajes se conserva, sin fechas.",
    ],
    hizo: "Reordenó el glosario en seis secciones y marcó en qué términos se apoya cada uno. Escribió la receta y la tabla de categorías, y pasó este registro al final de la página.",
    resultado: "El glosario en orden y esta página como receta.",
  },
  {
    id: "fuentes",
    titulo: "Revisar las definiciones contra sus fuentes",
    pedimos: [
      "Listo veo que el glosario esta mucho mejor organizado ahora hay algunos que necesitamos densificar lo primeo es buscar los articulos cientificaos que menciona. para así nutrir los tipos de instrucmenteos, el cambio de objetivo (si tiene fuente o lo inventamos nosotros mencionar) también los modo de cambio necesitan más explicaciones. primero elaborar una propuesta de que vas a nutrir. esto porque estas definiciones son delicadas y necesitamos tener seguridad de que estan bien.",
      "Dame los articulos para descargar y hagamos la PR para actualizar el glosario.",
    ],
    decidimos: [
      "Cada categoría dice si viene de la literatura, si la adaptamos o si es nuestra.",
      "Se corrige donde el glosario exageraba lo que dice la teoría, como llamar «tercer orden» a todo cambio de objetivo.",
    ],
    hizo: "Buscó los artículos citados y comparó cada definición con resúmenes de esas obras: no pudo abrir los textos originales. Propuso qué agregar y qué corregir; con nuestro visto bueno, escribió las definiciones y una bibliografía con enlaces, que se abre desde el glosario. Falta cotejar las definiciones con los originales.",
    resultado: "Tipos de instrumento, cambio del objetivo y modos de cambio con su origen, su base teórica y sus límites.",
  },
  {
    id: "inicio",
    titulo: "Una portada más directa",
    pedimos: [
      "Ahora en torno a la primera pagina la activadad quita la sección\n\"No cambien los títulos de las tablas.... \nesa asimetría documental se registra tal cual, sin supuestos.\"\nCambia el lenguaje de \"Practiquen\" a \"Practiquemos\" mejora el lenguaje.\nY quita la ultima parte de las preguntas",
    ],
    hizo: "Quitó de la portada la guía de la bitácora, el ejemplo de CTeI y sus lecciones; los dos archivos de Word se siguen descargando. Pasó la práctica a primera persona del plural y quitó la pregunta final del plenario.",
    resultado: "Una portada más corta, que habla en «nosotros».",
  },
];

export interface InstruccionDatos {
  id: string;
  modelo: string;
  para: string;
  texto: string;
}

/** Las instrucciones con que la IA procesó los informes (extraccion/). Literales o extractos. */
export const INSTRUCCIONES_DATOS: InstruccionDatos[] = [
  {
    id: "ocr",
    modelo: "Gemini",
    para: "Transcribir los documentos escaneados",
    texto:
      "Transcribe COMPLETAMENTE el texto de este documento escaneado en español. Es un acta o resolución oficial del Ministerio de Ciencia de Colombia. Devuelve solo el texto transcrito en markdown limpio, respetando encabezados, listas, tablas y firmas. No agregues comentarios ni resúmenes. Si una página está en blanco o ilegible, indícalo con [página ilegible].",
  },
  {
    id: "extraer",
    modelo: "Claude",
    para: "Extraer los instrumentos de cada política (extracto)",
    texto:
      "Eres analista de politica publica colombiana (sector CTeI). Extrae los INSTRUMENTOS de la politica […] a lo largo de DOS gobiernos, leyendo los informes. […] Un INSTRUMENTO es el medio concreto con que el Estado actua: programa, norma, fondo/fuente de financiacion, convocatoria, sistema. […] modo_cambio GUIADO POR EVIDENCIA (compara nombres, logica y CIFRAS entre gobiernos; no por defecto) […] evidencia: por vigencia, paginas y cifras (texto tal cual). No inventes. […] narrativa: g2018 (que fue bajo Duque), g2022 (que fue bajo Petro), cambio (1-2 frases). Extrae solo instrumentos de PRIMER NIVEL con identidad propia. Exhaustivo pero sin redundancia.",
  },
  {
    id: "unir",
    modelo: "Claude",
    para: "Unir el mismo instrumento cuando aparece en varias políticas o gobiernos (extracto)",
    texto:
      "Agrupa las 'refs' que son el MISMO instrumento concreto (mismo fondo/programa/norma/sistema), aunque cambie el nombre entre gobiernos o lo liste mas de una politica. […] NO fusiones instrumentos distintos que comparten tema/palabras (una convocatoria de un fondo NO es un programa de becas) […]",
  },
];

export type EstadoRevision = "fuente" | "parcial" | "pendiente" | "personas";

export interface Capa {
  capa: string;
  quien: string;
  revision: string;
  estado: EstadoRevision;
}

export const ETIQUETA_ESTADO: Record<EstadoRevision, string> = {
  fuente: "Fuente oficial",
  parcial: "Revisión parcial",
  pendiente: "Sin revisión humana",
  personas: "Escrito por personas",
};

/** Qué tan revisada está cada parte. No declarar «revisada» una capa que no lo está. */
export const CAPAS: Capa[] = [
  { capa: "Informes de empalme", quien: "Las entidades de cada gobierno; los publica el DNP", revision: "Se usan tal cual.", estado: "fuente" },
  { capa: "Texto de los informes escaneados", quien: "Gemini", revision: "Nadie lo revisó línea a línea.", estado: "pendiente" },
  {
    capa: "La red",
    quien: "Agentes de Claude",
    revision: "Casi todos los instrumentos citan su página en el informe. Nadie ha revisado la red completa, y hay descripciones que contradicen su modo de cambio.",
    estado: "pendiente",
  },
  { capa: "Áreas de política", quien: "Propuestas por la IA", revision: "El equipo aprobó cómo se dividieron; no revisó el contenido de cada área.", estado: "parcial" },
  {
    capa: "Textos del sitio y glosario",
    quien: "Claude, a partir de nuestro encuadre",
    revision: "Leídos por el equipo, sin revisión completa. Las definiciones teóricas se contrastaron con resúmenes de la literatura; falta cotejarlas con los textos originales.",
    estado: "parcial",
  },
  { capa: "Ejemplo de bitácora CTeI", quien: "El equipo", revision: "La IA solo le dio formato.", estado: "personas" },
  { capa: "Bitácoras de los grupos", quien: "Los grupos del taller", revision: "Sin intervención de la IA.", estado: "personas" },
];
