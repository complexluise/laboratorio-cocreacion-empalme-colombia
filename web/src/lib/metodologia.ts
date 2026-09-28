/**
 * «Cómo lo hicimos» (issue #37, ADR-0006): el paso a paso del laboratorio con los PROMPTS que
 * enviamos a la IA, lo que decidimos y lo que resultó. Los prompts van TAL CUAL se escribieron
 * (con sus erratas): son la evidencia. Fuente: las conversaciones con Claude Code del 27 y 28 de
 * septiembre de 2026; las anteriores no se guardaron. Espejo en docs/metodologia.md.
 */

export interface Paso {
  id: string;
  fecha: string;
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
    fecha: "26 y 27 sep",
    titulo: "Leer los informes y armar la red",
    pedimos: [],
    hizo: "Descargó los informes de empalme que publica el Departamento Nacional de Planeación (DNP) y los pasó a texto. Gemini transcribió los documentos escaneados e hizo un primer listado de instrumentos. Después, varios agentes de Claude leyeron los informes, una política a la vez. Con eso armaron la red: políticas, instrumentos, cómo cambió cada uno y la página que lo respalda.",
    resultado: "La red de Ciencia, Tecnología e Innovación (CTeI).",
  },
  {
    id: "orden",
    fecha: "27 sep",
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
    fecha: "27 sep",
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
    fecha: "27 sep",
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
    fecha: "27 sep",
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
    fecha: "27 sep",
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
    fecha: "27 sep",
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
    fecha: "27 sep",
    titulo: "Cerrar la versión",
    pedimos: ["Cortemos aquí ya tenemos suficiente para esta iteración.", "Los documentos deben estar alineados con todo incluyendo el README"],
    hizo: "Publicó la versión y puso al día la documentación.",
    resultado: "Tercera versión (v0.3).",
  },
  {
    id: "declaracion",
    fecha: "27 y 28 sep",
    titulo: "Esta página",
    pedimos: [
      "Nos falta ahora redacta una metodologia y una declaración del uso de IA como la usamos cual nuestra particiapción y así mismo colocar esta advertencia que este contenido fue generado usando inteligencia artificial y aún no se ha revisado al 100% y como este ejercicio es justo el como se puede interacutuar con la maquina y elaboración de artfactos para colaborar. primero encuadremos y debatamos.",
      "Eso se siente como matar un raton con una bomba nuclear. en realidad debe ser más senicillo, olvida git nuestro publico NO estecnico. más bien lo que busco es algo más parecido al documento y que esten los prompts que fueron enviados y que se proceso y eso. el paso a paso de lo que se hizo eso es más util omo declaración. Por otro lado a la finl se debe hacer un agente adversario , este agente debe personalizarse como un quisquilloso por la redundacia y que le gusta el lengjua claro, y las ideas claras y consisas.",
    ],
    hizo: "La primera versión fue un diagrama técnico basado en el historial del código. La descartamos por compleja y la IA la rehízo como este paso a paso. Al final, un agente editor, exigente con la redundancia y la claridad, revisó el texto.",
    resultado: "Esta página y el aviso en las demás.",
  },
];

export interface InstruccionDatos {
  modelo: string;
  para: string;
  texto: string;
}

/** Las instrucciones con que la IA procesó los informes (extraccion/). Literales o extractos. */
export const INSTRUCCIONES_DATOS: InstruccionDatos[] = [
  {
    modelo: "Gemini",
    para: "Transcribir los documentos escaneados",
    texto:
      "Transcribe COMPLETAMENTE el texto de este documento escaneado en español. Es un acta o resolución oficial del Ministerio de Ciencia de Colombia. Devuelve solo el texto transcrito en markdown limpio, respetando encabezados, listas, tablas y firmas. No agregues comentarios ni resúmenes. Si una página está en blanco o ilegible, indícalo con [página ilegible].",
  },
  {
    modelo: "Claude",
    para: "Extraer los instrumentos de cada política (extracto)",
    texto:
      "Eres analista de politica publica colombiana (sector CTeI). Extrae los INSTRUMENTOS de la politica […] a lo largo de DOS gobiernos, leyendo los informes. […] Un INSTRUMENTO es el medio concreto con que el Estado actua: programa, norma, fondo/fuente de financiacion, convocatoria, sistema. […] modo_cambio GUIADO POR EVIDENCIA (compara nombres, logica y CIFRAS entre gobiernos; no por defecto) […] evidencia: por vigencia, paginas y cifras (texto tal cual). No inventes. […] narrativa: g2018 (que fue bajo Duque), g2022 (que fue bajo Petro), cambio (1-2 frases). Extrae solo instrumentos de PRIMER NIVEL con identidad propia. Exhaustivo pero sin redundancia.",
  },
  {
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
    revision: "Leídos por el equipo, sin revisión completa. Conviene verificar las citas.",
    estado: "parcial",
  },
  { capa: "Ejemplo de bitácora CTeI", quien: "El equipo", revision: "La IA solo le dio formato.", estado: "personas" },
  { capa: "Bitácoras de los grupos", quien: "Los grupos del taller", revision: "Sin intervención de la IA.", estado: "personas" },
];
