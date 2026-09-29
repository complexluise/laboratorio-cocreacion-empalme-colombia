import {
  CAMBIOS_OBJETIVO,
  MODOS_CAMBIO,
  TIPOS_NATO,
  TIPOS_RELACION,
  type CambioObjetivo,
  type ModoCambio,
  type TipoNato,
  type TipoRelacion,
} from "@laboratorio/red";
import { FUNDAMENTOS, type Fundamento } from "$lib/fundamentos.ts";
import {
  DESCRIPCION_CAMBIO_OBJETIVO,
  DESCRIPCION_MODO,
  DESCRIPCION_NATO,
  ETIQUETA_CAMBIO_OBJETIVO,
  ETIQUETA_MODO,
  ETIQUETA_NATO,
  ETIQUETA_RELACION,
} from "$lib/visual.ts";

/**
 * Glosario del laboratorio, como RECORRIDO: se lee en orden y cada término se define solo con los
 * anteriores (el campo `usa`). Van primero los conceptos que más permiten describir lo que sigue.
 * El vocabulario CONTROLADO (modos de cambio, tipos NATO, cambio del objetivo, relaciones) se genera
 * de las mismas etiquetas y descripciones que usa la red, para que glosario y mapa no se
 * desincronicen. El resto es texto curado. Las siglas son de consulta y van al final.
 */
export const GRUPOS = ["base", "instrumento", "cambio", "red", "bitacora", "proceso", "siglas"] as const;
export type Grupo = (typeof GRUPOS)[number];

export const TITULO_GRUPO: Record<Grupo, string> = {
  base: "1 · Qué se compara",
  instrumento: "2 · Cómo se describe un instrumento",
  cambio: "3 · Cómo se lee el cambio",
  red: "4 · Cómo se arma la red",
  bitacora: "5 · Para llenar la bitácora",
  proceso: "6 · Cómo se hizo el mapa",
  siglas: "Siglas e instituciones",
};

export const INTRO_GRUPO: Record<Grupo, string> = {
  base: "Empiecen aquí: estas palabras sirven para explicar las demás.",
  instrumento: "Con qué recurso actúa el Estado, cómo aparece cada instrumento en los informes y qué tan segura es cada lectura.",
  cambio: "Qué le pasa a una política y a sus instrumentos cuando cambia el gobierno.",
  red: "Cómo se unen políticas e instrumentos, y qué se ve solo al mirar el conjunto.",
  bitacora: "Las palabras que aparecen al describir una política entre los dos gobiernos.",
  proceso: "Las palabras para entender dónde entró la inteligencia artificial.",
  siglas: "Para consultar: siglas, entidades e instrumentos que aparecen en los informes y en la red.",
};

export interface Entrada {
  /** Slug estable: es el ancla de `#/glosario/<id>`. */
  id: string;
  grupo: Grupo;
  termino: string;
  /** Qué significa la sigla, o el término en inglés de la literatura. */
  expansion?: string;
  definicion: string;
  /** Autor u obra de referencia. */
  fuente?: string;
  /** Términos ANTERIORES en el recorrido que hacen falta para entender este. */
  usa?: string[];
  /** Otras entradas relacionadas (pueden venir después). */
  ver?: string[];
  /** De dónde sale la categoría y en qué se aparta de su fuente (lib/fundamentos.ts). */
  fundamento?: Fundamento;
}

/** Una entrada antes de ubicarla en el recorrido. */
type Definicion = Omit<Entrada, "grupo">;

export const idModo = (m: ModoCambio) => `modo-${m}`;
export const idNato = (t: TipoNato) => `nato-${t}`;
export const idCambioObjetivo = (c: CambioObjetivo) => `objetivo-${c}`;
export const idRelacion = (r: TipoRelacion) => `relacion-${r}`;

const TERMINO_EN_INGLES: Partial<Record<ModoCambio, string>> = {
  "continuidad-estable": "path dependence",
  conversion: "conversion",
  estratificacion: "layering",
  terminacion: "displacement · termination",
  deriva: "drift",
};

/** No todos los modos vienen de Mahoney & Thelen (ver docs/teoria-politica.md). */
const FUENTE_MODO: Record<ModoCambio, string> = {
  "continuidad-estable": "Pierson (2004)",
  conversion: "Mahoney & Thelen (2010)",
  estratificacion: "Mahoney & Thelen (2010)",
  terminacion: "Mahoney & Thelen (2010, displacement); deLeon (1978, termination); Streeck & Thelen (2005, exhaustion)",
  reversion: "Categoría propia del proyecto; cercana a Bauer et al. (2012, dismantling)",
  deriva: "Mahoney & Thelen (2010)",
};

const DESCRIPCION_RELACION: Record<TipoRelacion, string> = {
  habilita: "Una norma o instrumento da existencia o soporte legal a otro (p. ej. una ley que crea un sistema).",
  financia: "Una fuente de financiación costea a otro instrumento (p. ej. regalías que fondean convocatorias).",
  "depende-de": "Un instrumento requiere a otro como condición o precedente.",
  encadena: "Dos instrumentos se encadenan o se potencian (sinergia): uno origina o alimenta al otro.",
};

const VOCABULARIO: Definicion[] = [
  ...MODOS_CAMBIO.map(
    (m): Definicion => ({
      id: idModo(m),
      termino: `Modo de cambio: ${ETIQUETA_MODO[m]}`,
      ...(TERMINO_EN_INGLES[m] ? { expansion: TERMINO_EN_INGLES[m] } : {}),
      definicion: DESCRIPCION_MODO[m],
      fuente: FUENTE_MODO[m],
      usa: ["modo-de-cambio"],
    }),
  ),
  ...TIPOS_NATO.map(
    (t): Definicion => ({
      id: idNato(t),
      termino: `Tipo NATO: ${ETIQUETA_NATO[t]}`,
      definicion: DESCRIPCION_NATO[t],
      fuente: "Hood (1983); Hood & Margetts (2007)",
      usa: ["nato"],
    }),
  ),
  ...CAMBIOS_OBJETIVO.map(
    (c): Definicion => ({
      id: idCambioObjetivo(c),
      termino: `Cambio del objetivo: ${ETIQUETA_CAMBIO_OBJETIVO[c]}`,
      definicion: DESCRIPCION_CAMBIO_OBJETIVO[c],
      fuente: "Categoría propia del proyecto (ADR-0004); analogía con Hogwood & Peters (1983)",
      usa: ["cambio-del-objetivo"],
    }),
  ),
  ...TIPOS_RELACION.map(
    (r): Definicion => ({
      id: idRelacion(r),
      termino: `Relación: ${ETIQUETA_RELACION[r]}`,
      definicion: DESCRIPCION_RELACION[r],
      usa: ["relacion-entre-instrumentos"],
    }),
  ),
];


const MAPA: Definicion[] = [
  {
    id: "politica-publica",
    termino: "Política pública",
    definicion:
      "Un área o problema público que atraviesa gobiernos (p. ej. bioeconomía, talento humano). Combina fines —el objetivo que declara cada gobierno— y medios —los instrumentos con que lo persigue. En la red es el nodo grande, al que se conectan sus instrumentos, y es lo que cada grupo elige para trabajar.",
    fuente: "Howlett & Cashore (2009); ADR-0004 del proyecto",
    ver: ["objetivo-de-politica", "instrumento", "fines-y-medios"],
  },
  {
    id: "objetivo-de-politica",
    usa: ["politica-publica", "vigencia"],
    termino: "Objetivo de política",
    definicion:
      "Lo que un gobierno declara que busca en un área: su prioridad u orientación. La misma política puede tener un objetivo distinto en cada gobierno; por eso se registra por vigencia, con los nombres con que cada informe la declara.",
    ver: ["politica-publica", "cambio-del-objetivo"],
  },
  {
    id: "cambio-del-objetivo",
    usa: ["objetivo-de-politica", "ordenes-del-cambio"],
    termino: "Cambio del objetivo",
    definicion:
      "Cómo cambia el objetivo de una política entre los dos gobiernos: se mantiene, se reformula, no declarado o nuevo. En la red se lee en el anillo del nodo de la política. Mira el fin, no los medios.",
    fuente: "Categorías propias (ADR-0004); se apoyan en Howlett & Cashore (2009) y Hall (1993)",
    ver: ["ordenes-del-cambio", "no-declarado-no-es-abandono"],
  },
  {
    id: "no-declarado-no-es-abandono",
    usa: ["informe-de-empalme", "cambio-del-objetivo"],
    termino: "No declarado (y no «abandonado»)",
    definicion:
      "Cada informe de empalme lo escribe un gobierno sobre sí mismo: que no mencione un objetivo no prueba que lo haya abandonado. Por eso el mapa dice «no declarado». Si el área conserva instrumentos activos, se muestra como área huérfana.",
    ver: ["area-huerfana", "informe-de-empalme"],
  },
  {
    id: "area-huerfana",
    usa: ["no-declarado-no-es-abandono", "dependencia-de-la-trayectoria"],
    termino: "Área huérfana",
    definicion:
      "Una política que en un gobierno no tiene objetivo declarado, pero cuyos instrumentos siguen activos. Hace visible la dependencia de la trayectoria: los medios persisten aunque el fin ya no se nombre.",
    ver: ["dependencia-de-la-trayectoria", "no-declarado-no-es-abandono"],
  },
  {
    id: "instrumento",
    usa: ["politica-publica"],
    termino: "Instrumento de política pública",
    expansion: "policy instrument",
    definicion:
      "El medio concreto con que el Estado actúa: un programa, una norma, una fuente de financiación, un sistema, una convocatoria o una beca. Tiene identidad propia y puede cruzar gobiernos con el mismo nombre. No es neutro: condensa una idea de cómo gobernar.",
    fuente: "Hood (1983); Lascoumes & Le Galès (2004)",
    ver: ["nato", "modo-de-cambio"],
  },
  {
    id: "nato",
    usa: ["instrumento"],
    termino: "NATO (tipos de instrumento)",
    expansion: "Nodalidad, Autoridad, Tesoro, Organización",
    definicion:
      "Clasifica un instrumento según el recurso del Estado que moviliza: información (nodalidad), normas (autoridad), dinero (tesoro) o capacidad propia (organización). En la red es la forma del nodo.",
    fuente: "Hood, The Tools of Government (1983); Hood & Margetts (2007)",
    ver: TIPOS_NATO.map(idNato),
  },
  {
    id: "modo-de-cambio",
    usa: ["instrumento", "cambio-institucional-gradual"],
    termino: "Modo de cambio",
    definicion:
      "Qué le pasó a un instrumento entre un gobierno y otro: continuidad, conversión, estratificación, terminación, reversión o deriva. En la red es el color del nodo.",
    fuente: "Mahoney & Thelen (2010); Streeck & Thelen (2005); Pierson (2004)",
    ver: [...MODOS_CAMBIO.map(idModo), "cambio-institucional-gradual"],
  },
  {
    id: "vigencia",
    usa: ["empalme"],
    termino: "Vigencia",
    definicion:
      "En este mapa, el periodo de un gobierno: 2018–2022 (gobierno Duque) y 2022–2026 (gobierno Petro). El mapa pone lado a lado lo que reporta el informe de cada vigencia.",
    ver: ["presencia"],
  },
  {
    id: "presencia",
    usa: ["instrumento", "vigencia", "informe-de-empalme"],
    termino: "Presencia (propuesto · logrado · pendiente)",
    definicion:
      "Cómo aparece un instrumento en el informe de una vigencia: propuesto (anunciado, sin ejecución reportada), logrado (ejecutado, con resultado reportado) o pendiente (inconcluso, en riesgo o recomendado al gobierno siguiente).",
    ver: ["vigencia"],
  },
  {
    id: "confianza",
    usa: ["informe-de-empalme"],
    termino: "Confianza (alta · media · baja)",
    definicion:
      "Qué tan sólida es la evidencia de una clasificación: alta (clara y suficiente), media (parcial o interpretación razonable) o baja (indicio débil: verificar contra el documento).",
    ver: ["informe-de-empalme"],
  },
  {
    id: "relacion-entre-instrumentos",
    usa: ["instrumento", "red-bipartita"],
    termino: "Relación entre instrumentos",
    definicion:
      "Arista entre dos instrumentos distintos: uno habilita, financia, depende de o se encadena con otro. En la red son las líneas que no pasan por una política.",
    ver: TIPOS_RELACION.map(idRelacion),
  },
  {
    id: "red-bipartita",
    usa: ["politica-publica", "instrumento"],
    termino: "Red bipartita",
    definicion:
      "Una red con dos clases de nodo —políticas e instrumentos— donde las líneas unen un instrumento con las políticas a las que sirve. Un instrumento compartido por varias políticas es un puente: ahí se ve lo que ningún grupo ve solo.",
    ver: ["emergencia"],
  },
];

const TEORIA: Definicion[] = [
  {
    id: "fines-y-medios",
    usa: ["objetivo-de-politica", "instrumento"],
    termino: "Fines y medios",
    definicion:
      "Separar fines (objetivos) y medios (instrumentos) permite ver cuándo cambia el fin sin cambiar los medios, y al revés.",
    fuente: "Howlett & Cashore (2009)",
    ver: ["politica-publica", "ordenes-del-cambio"],
  },
  {
    id: "ordenes-del-cambio",
    usa: ["fines-y-medios"],
    termino: "Órdenes del cambio de política",
    definicion:
      "Primer orden: se ajusta cómo se usa un instrumento. Segundo orden: se cambian los instrumentos. Tercer orden: se cambian las metas mismas, el paradigma. El mapa registra el cambio del objetivo declarado; que llegue a ser de tercer orden hay que argumentarlo.",
    fuente: "Hall, «Policy Paradigms, Social Learning, and the State» (1993)",
    ver: ["cambio-del-objetivo"],
  },
  {
    id: "institucionalismo-historico",
    termino: "Institucionalismo histórico",
    definicion:
      "Corriente que estudia cómo las instituciones se forman y cambian en el tiempo, y cómo decisiones pasadas condicionan las presentes. Es el marco con que se lee el empalme.",
    fuente: "Streeck & Thelen (2005); Pierson (2004)",
    ver: ["cambio-institucional-gradual", "dependencia-de-la-trayectoria"],
  },
  {
    id: "cambio-institucional-gradual",
    usa: ["institucionalismo-historico"],
    termino: "Cambio institucional gradual",
    definicion:
      "Las instituciones rara vez cambian de golpe: cambian sumando capas, redirigiendo lo que existe, dejando de mantenerlo o reemplazándolo. De ahí salen los modos de cambio del mapa.",
    fuente: "Mahoney & Thelen, Explaining Institutional Change (2010)",
    ver: ["modo-de-cambio"],
  },
  {
    id: "dependencia-de-la-trayectoria",
    usa: ["institucionalismo-historico"],
    termino: "Dependencia de la trayectoria",
    expansion: "path dependence",
    definicion:
      "Lo que ya existe tiende a persistir porque revertirlo es costoso: se acumulan capacidades, beneficiarios y compromisos. Explica la continuidad de instrumentos entre gobiernos distintos.",
    fuente: "Pierson (2000; 2004)",
    ver: [idModo("continuidad-estable"), "area-huerfana"],
  },
  {
    id: "sucesion-de-politicas",
    usa: ["empalme"],
    termino: "Sucesión de políticas",
    expansion: "policy succession",
    definicion:
      "Los gobiernos casi nunca parten de cero: con lo heredado hacen mantenimiento, sucesión, innovación o terminación. Es el marco de lectura natural de un informe de empalme.",
    fuente: "Hogwood & Peters, Policy Dynamics (1983)",
    ver: ["empalme"],
  },
  {
    id: "terminacion-de-politicas",
    usa: ["politica-publica", "instrumento"],
    termino: "Terminación de políticas",
    definicion: "Por qué y cómo se termina una política o un instrumento; la contracara de la persistencia.",
    fuente: "deLeon (1978)",
    ver: [idModo("terminacion")],
  },
  {
    id: "pid",
    usa: ["vigencia", "emergencia"],
    termino: "PID+T",
    expansion: "Descomposición Parcial de Información + Tensión",
    definicion:
      "Analogía metodológica propia del proyecto: descompone qué aporta cada gobierno en redundancia (ambos), unicidad (uno solo), sinergia (la combinación) y tensión (reversión). Viene de la teoría de la información, no de la ciencia política: es cómo medimos; el institucionalismo histórico dice qué significa.",
    fuente: "Williams & Beer (2010)",
    ver: ["cambio-institucional-gradual"],
  },
  {
    id: "emergencia",
    usa: ["red-bipartita"],
    termino: "Emergencia",
    definicion:
      "Patrones que solo aparecen al integrar las partes: instrumentos que comparten varias políticas, regularidades del cambio entre sectores, coherencia de un gobierno. Es lo que busca la sesión de integración.",
    ver: ["red-bipartita", "plenario"],
  },
  {
    id: "cocreacion",
    termino: "Laboratorio de cocreación",
    definicion:
      "Espacio donde las personas participantes no solo consultan el mapa: lo corrigen y lo amplían con su lectura y con información complementaria. El mapa con los aportes del seminario es el producto.",
    ver: ["bitacora"],
  },
];

const BITACORA: Definicion[] = [
  {
    id: "bitacora",
    usa: ["cocreacion", "politica-publica"],
    termino: "Bitácora",
    definicion:
      "El registro que llena cada grupo sobre su política: ubicación y avance, instrumentos, siete subcategorías comparadas entre gobiernos (objetivo, instituciones, población, normativa, recursos, metas, impacto) y los hallazgos para el plenario.",
    ver: ["tabla-puente", "hueco-de-informacion"],
  },
  {
    id: "empalme",
    termino: "Empalme",
    definicion:
      "Transición entre el gobierno saliente y el entrante: el primero entrega el estado de lo que deja y el segundo lo recibe.",
    ver: ["informe-de-empalme", "sucesion-de-politicas"],
  },
  {
    id: "informe-de-empalme",
    usa: ["empalme"],
    termino: "Informe de empalme",
    definicion:
      "Documento con que un gobierno reporta su gestión al siguiente. Es la fuente primaria del mapa. Lo escribe cada gobierno sobre sí mismo: informa, pero no es una evaluación independiente.",
    ver: ["no-declarado-no-es-abandono"],
  },
  {
    id: "tabla-puente",
    usa: ["informe-de-empalme"],
    termino: "Tabla puente",
    definicion:
      "Correspondencia entre cómo organiza cada gobierno su informe (pactos, transformaciones, secciones) para saber qué parte de uno se compara con qué parte del otro. Sin ella, se comparan números que no miden lo mismo.",
    ver: ["pacto-transversal", "transformacion"],
  },
  {
    id: "pacto-transversal",
    usa: ["tabla-puente"],
    termino: "Pacto (PND 2018–2022)",
    definicion:
      "Unidad de organización del Plan Nacional de Desarrollo «Pacto por Colombia, pacto por la equidad». La CTeI fue el Pacto Transversal IX, con su propio porcentaje de cumplimiento.",
    ver: ["pnd", "tabla-puente"],
  },
  {
    id: "transformacion",
    usa: ["tabla-puente"],
    termino: "Transformación (PND 2022–2026)",
    definicion:
      "Unidad de organización del Plan Nacional de Desarrollo «Colombia, potencia mundial de la vida». La CTeI quedó repartida en secciones de dos transformaciones distintas, sin un indicador único.",
    ver: ["pnd", "tabla-puente"],
  },
  {
    id: "avance-reportado",
    usa: ["informe-de-empalme"],
    termino: "Avance reportado",
    definicion:
      "El porcentaje de cumplimiento que declara un informe. Solo es comparable si ambos gobiernos miden contra metas equivalentes; si uno reporta porcentaje y el otro solo narra logros, se anota la asimetría.",
    ver: ["meta-cuatrienio", "sinergia"],
  },
  {
    id: "meta-cuatrienio",
    usa: ["avance-reportado"],
    termino: "Meta del cuatrienio",
    definicion:
      "Valor que el Plan Nacional de Desarrollo se propone alcanzar en los cuatro años de gobierno. Una cifra de ejecución sin su meta no dice si se cumplió: comparar 5.706 contra 3.126 sin metas es comparar manzanas con peras.",
    ver: ["sinergia", "avance-reportado"],
  },
  {
    id: "gestion-vs-impacto",
    termino: "Métrica de gestión, producto e impacto",
    definicion:
      "La gestión mide lo que hizo la entidad (convocatorias abiertas); el producto, lo que entregó (becas otorgadas, artículos publicados); el impacto, lo que cambió en la población gracias a eso, y requiere una evaluación. Los informes de empalme casi siempre reportan gestión y producto.",
    ver: ["evaluacion-de-impacto"],
  },
  {
    id: "evaluacion-de-impacto",
    usa: ["gestion-vs-impacto"],
    termino: "Evaluación de impacto",
    definicion:
      "Estudio que estima el efecto causal de una política comparándolo con lo que habría pasado sin ella. Si no la hay, la fila «impacto» de la bitácora queda vacía, y ese vacío es un hallazgo.",
    ver: ["gestion-vs-impacto"],
  },
  {
    id: "hueco-de-informacion",
    usa: ["informe-de-empalme"],
    termino: "Hueco de información (asimetría documental)",
    definicion:
      "Dato que un informe no trae (la norma, los recursos, la población). Se anota como hueco, se busca en información complementaria y nunca se rellena con supuestos.",
    ver: ["informacion-complementaria"],
  },
  {
    id: "informacion-complementaria",
    usa: ["hueco-de-informacion"],
    termino: "Información complementaria",
    definicion:
      "Fuentes más allá del informe de empalme para llenar los huecos: Sinergia, el PND y sus bases, el capítulo de inversión pública, normas y documentos CONPES, informes de la entidad.",
    ver: ["sinergia", "pnd", "conpes"],
  },
  {
    id: "enfoque-diferencial",
    termino: "Enfoque diferencial",
    definicion:
      "Atención explícita a grupos con necesidades o derechos particulares (mujeres, jóvenes, pueblos indígenas, comunidades NARP, personas con discapacidad) al definir la población de una política.",
    ver: ["narp"],
  },
  {
    id: "enfoque-territorial",
    termino: "Enfoque territorial y cierre de brechas",
    definicion:
      "Orientar la política según las diferencias entre regiones y priorizar los territorios rezagados (p. ej. Pacífico, Amazonía, Catatumbo, municipios PDET y ZOMAC).",
    ver: ["pdet", "zomac"],
  },
  {
    id: "hipotesis",
    termino: "Hipótesis del grupo",
    definicion:
      "Al cerrar la primera sesión, cada grupo escribe qué patrón cree que comparten las demás políticas. En la integración se contrasta con el mapa completo.",
    ver: ["plenario", "emergencia"],
  },
  {
    id: "plenario",
    usa: ["hipotesis", "emergencia"],
    termino: "Plenario",
    definicion:
      "Sesión conjunta donde se integran los aportes de todos los grupos y se discuten los patrones que emergen: instrumentos compartidos, regularidades del cambio, coherencia de gobierno y lo que le falta al mapa.",
    ver: ["emergencia"],
  },
];

type Sigla = [id: string, sigla: string, expansion: string, definicion: string, ver?: string[]];

const SIGLAS: Sigla[] = [
  ["ctei", "CTeI", "Ciencia, Tecnología e Innovación", "El sector piloto del mapa."],
  ["dnp", "DNP", "Departamento Nacional de Planeación", "Entidad que coordina la planeación del país, el PND y el seguimiento con Sinergia.", ["pnd", "sinergia"]],
  ["pnd", "PND", "Plan Nacional de Desarrollo", "La hoja de ruta de cada gobierno, aprobada por ley. 2018–2022: «Pacto por Colombia, pacto por la equidad»; 2022–2026: «Colombia, potencia mundial de la vida».", ["pacto-transversal", "transformacion"]],
  ["sinergia", "Sinergia", "Sistema Nacional de Evaluación de Gestión y Resultados", "Sistema del DNP que hace seguimiento a las metas del PND. Ahí se busca la meta de un indicador para poder comparar cifras. No confundir con la sinergia entre instrumentos.", ["meta-cuatrienio", idRelacion("encadena")]],
  ["minciencias", "MinCiencias", "Ministerio de Ciencia, Tecnología e Innovación", "Cabeza del sector. Reemplazó a Colciencias durante el gobierno 2018–2022: la Ley 1951 de 2019 lo creó y la Ley 2162 de 2021 volvió a expedir su creación. Pasar de departamento administrativo a ministerio es un cambio institucional en sí mismo.", ["colciencias"]],
  ["colciencias", "Colciencias", "Departamento Administrativo de Ciencia, Tecnología e Innovación", "Entidad rectora de la CTeI hasta su transformación en MinCiencias (Leyes 1951 de 2019 y 2162 de 2021).", ["minciencias"]],
  ["sncti", "SNCTI", "Sistema Nacional de Ciencia, Tecnología e Innovación", "El conjunto de actores (Estado, universidades, centros, empresas, sociedad) y reglas que articulan la CTeI en el país."],
  ["sgr", "SGR", "Sistema General de Regalías", "Distribuye los ingresos de la explotación de recursos naturales no renovables. Tiene una asignación para CTeI que se adjudica por convocatorias.", ["ocad", "fctei"]],
  ["fctei", "FCTeI", "Fondo / Asignación de CTeI del SGR", "La porción de las regalías destinada a ciencia, tecnología e innovación.", ["sgr"]],
  ["ocad", "OCAD", "Órgano Colegiado de Administración y Decisión", "Instancia que decide qué proyectos se financian con regalías; en CTeI, el OCAD CTeI aprueba las convocatorias.", ["sgr"]],
  ["ffjc", "FFJC", "Fondo Francisco José de Caldas", "Fondo que administra recursos de distintas fuentes para financiar la CTeI."],
  ["conpes", "CONPES", "Consejo Nacional de Política Económica y Social", "Máxima autoridad de planeación; sus documentos CONPES fijan políticas (p. ej. CONPES 4069 de 2021, Política Nacional de CTeI 2022–2031)."],
  ["piiom", "PIIOM", "Políticas de Investigación e Innovación Orientadas por Misiones", "Marco del gobierno 2022–2026 que organiza la CTeI en misiones (bioeconomía, transición energética, derecho a la alimentación, soberanía sanitaria, ciencia para la paz). En el mapa, cada misión es un área.", ["mision-de-sabios"]],
  ["mision-de-sabios", "Misión de Sabios", "Misión Internacional de Sabios (2019)", "Grupo de expertos convocado en 2019 que propuso focos y recomendaciones para la CTeI; antecedente de las políticas orientadas por misiones.", ["piiom"]],
  ["conacti", "CONACTI", "Consejo Nacional de Política de Ciencia, Tecnología e Innovación", "Instancia de gobernanza del SNCTI."],
  ["codecti", "CODECTI", "Consejos Departamentales de Ciencia, Tecnología e Innovación", "Instancias regionales del SNCTI."],
  ["ccn", "CCN", "Consejo Científico Nacional", "Órgano asesor del SNCTI."],
  ["cnbt", "CNBT", "Consejo Nacional de Beneficios Tributarios en CTeI", "Aprueba el cupo y los proyectos que acceden a deducciones y descuentos tributarios por invertir en CTeI.", ["cupo-tributario"]],
  ["cupo-tributario", "Cupo de inversión tributaria", "Deducción y descuento tributario por inversión en CTeI", "Beneficio fiscal a empresas que invierten en investigación y desarrollo: un instrumento de tesoro (el Estado deja de recaudar).", [idNato("tesoro")]],
  ["pgn", "PGN", "Presupuesto General de la Nación", "El presupuesto anual del Gobierno nacional."],
  ["bpin", "BPIN", "Banco de Programas y Proyectos de Inversión Nacional", "Registro donde se identifican los proyectos de inversión pública."],
  ["pdet", "PDET", "Programas de Desarrollo con Enfoque Territorial", "Planes para los 170 municipios más afectados por el conflicto. Desarrollan el punto 1 del Acuerdo de Paz de 2016 y se crearon con el Decreto Ley 893 de 2017.", ["enfoque-territorial"]],
  ["zomac", "ZOMAC", "Zonas Más Afectadas por el Conflicto Armado", "Municipios con beneficios especiales (p. ej. tributarios) para promover su desarrollo.", ["enfoque-territorial"]],
  ["narp", "NARP", "Negros, Afrocolombianos, Raizales y Palenqueros", "Denominación de las comunidades étnicas afrodescendientes en la política pública.", ["enfoque-diferencial"]],
  ["nna", "NNA", "Niños, Niñas y Adolescentes", "Población objetivo de programas como Ondas."],
  ["dha", "DHA", "Derecho Humano a la Alimentación", "Área de política (misión PIIOM) del gobierno 2022–2026."],
  ["steam", "STEAM", "Ciencia, Tecnología, Ingeniería, Artes y Matemáticas", "Enfoque de formación que integra esas áreas."],
  ["ies", "IES", "Instituciones de Educación Superior", "Universidades, instituciones universitarias, tecnológicas y técnicas."],
  ["icetex", "ICETEX", "Instituto Colombiano de Crédito Educativo y Estudios Técnicos en el Exterior", "Entidad que administra créditos y becas educativas, incluidos créditos-beca de posgrado."],
  ["i-d", "I+D", "Investigación y Desarrollo", "Actividad creativa y sistemática para aumentar el conocimiento y aplicarlo."],
  ["acti", "ACTI", "Actividades de Ciencia, Tecnología e Innovación", "Categoría estadística más amplia que la I+D (incluye formación, apropiación, servicios científicos)."],
  ["ocyt", "OCyT", "Observatorio Colombiano de Ciencia y Tecnología", "Produce los indicadores del sector."],
  ["cric", "CRIC", "Consejo Regional Indígena del Cauca", "Organización indígena con la que MinCiencias firmó convenios de cooperación."],
  ["mpc", "MPC", "Mesa Permanente de Concertación con los Pueblos y Organizaciones Indígenas", "Espacio de concertación entre el Gobierno y los pueblos indígenas."],
  ["scienti", "ScienTI (CvLAC, GrupLAC)", "Plataforma de información del SNCTI", "Registra investigadores (CvLAC) y grupos (GrupLAC); es la base del reconocimiento de actores."],
  ["otri", "OTRI", "Oficina de Transferencia de Resultados de Investigación", "Unidad que lleva los resultados de investigación al sector productivo."],
  ["ia", "IA", "Inteligencia Artificial", "En la red, un área de política nueva del gobierno 2022–2026 (hoja de ruta, comité asesor, proyecto de ley). También es la herramienta con que se construyó este laboratorio: ver «Cómo lo hicimos».", ["modelo-de-lenguaje"]],
  ["celac", "CELAC", "Comunidad de Estados Latinoamericanos y Caribeños", "Espacio regional en el que Colombia ejerció la presidencia pro tempore en ciencia."],
  ["cepal", "CEPAL", "Comisión Económica para América Latina y el Caribe", "Comisión regional de Naciones Unidas."],
  ["dane", "DANE", "Departamento Administrativo Nacional de Estadística", "Entidad de estadísticas oficiales."],
  ["sena", "SENA", "Servicio Nacional de Aprendizaje", "Entidad de formación para el trabajo; SENAinnova es su línea de innovación."],
  ["cop", "COP", "Peso colombiano", "Moneda en que se expresan las cifras (p. ej. «$6,50 billones COP»)."],
  ["pib", "PIB", "Producto Interno Bruto", "La inversión en I+D suele expresarse como porcentaje del PIB."],
];

const PROCESO: Definicion[] = [
  {
    id: "prompt",
    termino: "Prompt",
    definicion:
      "El mensaje o la instrucción que se le escribe a una IA. En «Cómo lo hicimos» están los que enviamos, tal cual los escribimos.",
    ver: ["modelo-de-lenguaje"],
  },
  {
    id: "modelo-de-lenguaje",
    usa: ["prompt"],
    termino: "Modelo de lenguaje",
    expansion: "LLM, large language model",
    definicion:
      "Programa de IA que, entrenado con enormes cantidades de texto, genera texto nuevo: resume, clasifica, redacta, escribe código. Produce borradores creíbles, no verdades: por eso hay que revisarlo. En este laboratorio se usaron Claude y Gemini.",
    ver: ["agente-de-ia", "revision-adversarial"],
  },
  {
    id: "agente-de-ia",
    usa: ["modelo-de-lenguaje", "prompt"],
    termino: "Agente de IA",
    definicion:
      "Un modelo de lenguaje que, además de conversar, ejecuta tareas: lee archivos, escribe código y lo prueba. Aquí trabajaron varios, cada uno con un rol: uno planifica y documenta, otro programa, otro revisa. El equipo aprobó los cambios del sitio; la red la armaron agentes, sin revisión humana completa.",
    ver: ["modelo-de-lenguaje", "revision-adversarial", "prompt"],
  },
  {
    id: "api",
    usa: ["modelo-de-lenguaje"],
    termino: "API",
    expansion: "Interfaz de programación de aplicaciones",
    definicion:
      "La vía por la que un programa, y no una persona en un chat, le envía textos a un modelo de IA. Todos van con la misma instrucción y las respuestas vuelven con el mismo formato. Cada consulta se paga.",
    ver: ["ocr"],
  },
  {
    id: "ocr",
    usa: ["modelo-de-lenguaje"],
    termino: "OCR",
    expansion: "Reconocimiento óptico de caracteres",
    definicion:
      "Convertir la imagen de un documento escaneado en texto. Los informes escaneados se transcribieron con un modelo de IA (Gemini); ese texto no se revisó línea a línea.",
  },
  {
    id: "revision-adversarial",
    usa: ["agente-de-ia"],
    termino: "Revisión adversarial",
    definicion:
      "Revisar un trabajo con el encargo explícito de encontrarle errores, no de aprobarlo. Aquí la hizo un agente revisor antes de publicar los cambios del sitio. Reduce errores, pero no reemplaza la revisión humana.",
    ver: ["agente-de-ia"],
  },
];

const SIGLAS_ENTRADAS: Entrada[] = SIGLAS.map(([id, termino, expansion, definicion, ver]) => ({
  id,
  grupo: "siglas",
  termino,
  expansion,
  definicion,
  ...(ver ? { ver } : {}),
}));

const DEFINICIONES = new Map(
  [...MAPA, ...VOCABULARIO, ...TEORIA, ...BITACORA, ...PROCESO].map((d): [string, Definicion] => {
    const fundamento = FUNDAMENTOS[d.id];
    return [d.id, fundamento ? { ...d, fundamento } : d];
  }),
);

/**
 * El orden de lectura. Cada término se apoya solo en los anteriores (`usa`): primero lo que más
 * permite describir lo que sigue. Los valores del vocabulario controlado van tras su término.
 */
const RECORRIDO: Record<Exclude<Grupo, "siglas">, readonly string[]> = {
  base: ["empalme", "informe-de-empalme", "vigencia", "politica-publica", "objetivo-de-politica", "instrumento", "fines-y-medios"],
  instrumento: ["nato", ...TIPOS_NATO.map(idNato), "presencia", "confianza"],
  cambio: [
    "ordenes-del-cambio",
    "cambio-del-objetivo",
    ...CAMBIOS_OBJETIVO.map(idCambioObjetivo),
    "no-declarado-no-es-abandono",
    "institucionalismo-historico",
    "cambio-institucional-gradual",
    "modo-de-cambio",
    ...MODOS_CAMBIO.map(idModo),
    "sucesion-de-politicas",
    "dependencia-de-la-trayectoria",
    "terminacion-de-politicas",
    "area-huerfana",
  ],
  red: ["red-bipartita", "relacion-entre-instrumentos", ...TIPOS_RELACION.map(idRelacion), "emergencia", "pid"],
  bitacora: [
    "cocreacion",
    "bitacora",
    "tabla-puente",
    "pacto-transversal",
    "transformacion",
    "avance-reportado",
    "meta-cuatrienio",
    "gestion-vs-impacto",
    "evaluacion-de-impacto",
    "hueco-de-informacion",
    "informacion-complementaria",
    "enfoque-diferencial",
    "enfoque-territorial",
    "hipotesis",
    "plenario",
  ],
  proceso: ["prompt", "modelo-de-lenguaje", "api", "ocr", "agente-de-ia", "revision-adversarial"],
};

const EN_RECORRIDO = new Set(Object.values(RECORRIDO).flat());

/** Definiciones sin lugar en el recorrido, o ids del recorrido sin definición. Debe quedar vacío. */
export const FUERA_DEL_RECORRIDO: readonly string[] = [
  ...[...DEFINICIONES.keys()].filter((id) => !EN_RECORRIDO.has(id)),
  ...[...EN_RECORRIDO].filter((id) => !DEFINICIONES.has(id)),
];

export const GLOSARIO: readonly Entrada[] = [
  ...GRUPOS.flatMap((grupo) =>
    grupo === "siglas"
      ? []
      : RECORRIDO[grupo].flatMap((id) => {
          const d = DEFINICIONES.get(id);
          return d ? [{ ...d, grupo }] : [];
        }),
  ),
  ...SIGLAS_ENTRADAS,
];

const POR_ID = new Map(GLOSARIO.map((e) => [e.id, e]));
export const entradaPorId = (id: string): Entrada | undefined => POR_ID.get(id);

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Filtra por texto en término, expansión y definición (sin tildes ni mayúsculas). */
export function filtrarGlosario(consulta: string, entradas: readonly Entrada[] = GLOSARIO): Entrada[] {
  const q = normalizar(consulta.trim());
  if (q === "") return [...entradas];
  return entradas.filter((e) => normalizar(`${e.termino} ${e.expansion ?? ""} ${e.definicion}`).includes(q));
}
