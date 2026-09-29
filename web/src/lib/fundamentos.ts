/**
 * De dónde sale cada categoría del mapa y en qué se aparta de su fuente (ADR-0008). Se suma a la
 * entrada del glosario con el mismo id (los tests exigen que exista). Las definiciones están parafraseadas de la literatura (ver
 * docs/teoria-politica.md §Referencias); falta cotejarlas con los textos originales.
 */

/** literatura: el concepto viene tal cual de un autor · adaptacion: viene de un autor, pero lo
 * aplicamos distinto · propio: lo creó el proyecto. */
export type Origen = "literatura" | "adaptacion" | "propio";

export const ETIQUETA_ORIGEN: Record<Origen, string> = {
  literatura: "De la literatura",
  adaptacion: "Adaptación nuestra",
  propio: "Propio del proyecto",
};

export interface Fundamento {
  origen: Origen;
  /** Qué dice la teoría, parafraseado. */
  teoria?: string;
  /** Cómo se asigna en el mapa. */
  enElMapa?: string;
  /** En qué se aparta nuestro uso del original, o qué no prueba. */
  ojo?: string;
}

export const FUNDAMENTOS: Record<string, Fundamento> = {
  // ─── Tipos de instrumento (Hood) ─────────────────────────────────────────────────────────────
  nato: {
    origen: "literatura",
    teoria:
      "Hood propone que el Estado gobierna con cuatro recursos: nodalidad, autoridad, tesoro y organización. Cada recurso le sirve para dos cosas: conocer lo que pasa en la sociedad (detectar) y actuar sobre ella (efectuar). Hood y Margetts actualizaron el esquema en 2007 para la era digital.",
    enElMapa: "Cada instrumento lleva un solo tipo: el del recurso que más pesa en él. En la red es la forma del nodo.",
    ojo: "Muchos instrumentos combinan recursos: una convocatoria entrega dinero, pero también fija reglas. Asignar uno solo es una decisión nuestra.",
  },
  "nato-nodalidad": {
    origen: "literatura",
    teoria:
      "La posición del Estado en el centro de las redes de información: recibe información de la sociedad y la difunde. No es cualquier dato: es estar en el nodo por donde pasa la información.",
    enElMapa: "Sistemas de información, plataformas, estadísticas, campañas y orientación. Por ejemplo, ScienTI.",
  },
  "nato-autoridad": {
    origen: "literatura",
    teoria: "El poder legal u oficial del Estado para ordenar, prohibir, permitir o certificar.",
    enElMapa: "Leyes, decretos, documentos CONPES y reglamentos. Por ejemplo, la ley que crea el Ministerio.",
  },
  "nato-tesoro": {
    origen: "literatura",
    teoria: "El dinero y los bienes intercambiables del Estado, con los que paga, subsidia o premia.",
    enElMapa: "Fondos, convocatorias, becas y créditos. También los beneficios tributarios: el Estado deja de cobrar.",
    ojo: "Poner los beneficios tributarios en tesoro es una decisión nuestra.",
  },
  "nato-organizacion": {
    origen: "literatura",
    teoria:
      "Las personas, sedes, equipos y capacidades propias del Estado. Con ellas actúa directamente, sin pasar por otros.",
    enElMapa: "Entidades y programas que el Estado ejecuta con su propio personal.",
    ojo: "No todo programa es organización: un programa que reparte dinero es tesoro.",
  },

  // ─── Cambio del objetivo ─────────────────────────────────────────────────────────────────────
  "cambio-del-objetivo": {
    origen: "propio",
    teoria:
      "Se apoya en dos ideas. Howlett y Cashore separan los fines de una política en tres niveles: metas generales, objetivos de programa y ajustes concretos. Hall distingue tres órdenes de cambio; el tercero cambia las metas mismas, el paradigma.",
    enElMapa:
      "Comparamos el objetivo que declara el informe de cada gobierno para la misma área. Las cuatro categorías las creamos nosotros (ADR-0004).",
    ojo: "Lo que declara un informe está más cerca de un objetivo de programa que de un paradigma. Un «se reformula» no es, por sí solo, un cambio de tercer orden: hay que argumentarlo.",
  },
  "objetivo-se-mantiene": {
    origen: "propio",
    teoria: "Se parece al mantenimiento de Hogwood y Peters: la política sigue con los mismos fines.",
    enElMapa: "Los dos informes declaran para el área un objetivo equivalente, aunque cambien las palabras.",
  },
  "objetivo-se-reformula": {
    origen: "propio",
    teoria:
      "Se parece a la sucesión de Hogwood y Peters: se renuevan objetivos y programas sin abandonar las metas generales.",
    enElMapa: "Los dos gobiernos atienden el área, pero con otro enfoque u objetivo.",
    ojo: "Puede ser un ajuste menor o un cambio de paradigma: la categoría no los distingue.",
  },
  "objetivo-no-declarado": {
    origen: "propio",
    teoria: "No tiene equivalente en la literatura, a propósito: no es una terminación.",
    enElMapa: "El informe posterior no declara objetivo para el área.",
    ojo: "El silencio de un informe no prueba abandono. Si el área conserva instrumentos activos, es un área huérfana.",
  },
  "objetivo-nuevo": {
    origen: "propio",
    teoria:
      "Se parece a la innovación de Hogwood y Peters: el gobierno entra en un campo donde antes no tenía política declarada.",
    enElMapa: "Solo el informe posterior declara el área.",
    ojo: "Que el informe anterior no la mencione no prueba que no existiera.",
  },

  // ─── Modos de cambio ─────────────────────────────────────────────────────────────────────────
  "modo-de-cambio": {
    origen: "adaptacion",
    teoria:
      "Mahoney y Thelen describen cuatro formas en que las instituciones cambian poco a poco: desplazamiento, estratificación, deriva y conversión. Streeck y Thelen sumaban una quinta: el agotamiento.",
    enElMapa:
      "Aplicamos esas ideas a cada instrumento entre dos informes. Estratificación y terminación salen de en qué informe aparece; los demás modos, de leer el texto.",
    ojo: "Los autores estudian reglas a lo largo de años; nosotros comparamos dos informes. Por eso los modos del mapa son una adaptación, no la tipología original.",
  },
  "modo-continuidad-estable": {
    origen: "adaptacion",
    teoria:
      "Pierson explica por qué las cosas persisten: una vez en marcha, revertirlas cuesta cada vez más. Mahoney y Thelen no la cuentan como modo, porque su tipología es de cambio.",
    enElMapa: "El instrumento aparece en los dos informes con el mismo uso.",
    ojo: "Que siga no quiere decir que funcione igual: puede haber una deriva que el informe no muestra.",
  },
  "modo-conversion": {
    origen: "literatura",
    teoria: "La regla sigue formalmente igual, pero los actores la reinterpretan y la ponen al servicio de otros fines.",
    enElMapa: "El instrumento aparece en los dos informes, pero con otro propósito o para otra población.",
    ojo: "Solo se puede afirmar si se ve el fin de cada gobierno. En algunos instrumentos la IA la asignó por defecto: hay que revisarlos.",
  },
  "modo-estratificacion": {
    origen: "adaptacion",
    teoria:
      "Se agregan reglas nuevas encima o al lado de las existentes, que siguen en pie. Con el tiempo, lo nuevo cambia el conjunto.",
    enElMapa: "El instrumento aparece solo en el informe posterior.",
    ojo: "La regla no comprueba que lo anterior siga. Si lo nuevo reemplaza a otro instrumento, en la teoría es desplazamiento, no estratificación.",
  },
  "modo-terminacion": {
    origen: "adaptacion",
    teoria:
      "Junta tres ideas: el desplazamiento (se quita una regla y se pone otra, Mahoney y Thelen), la terminación (se pone fin a una política, deLeon) y el agotamiento (se extingue sin reemplazo, Streeck y Thelen).",
    enElMapa: "El instrumento aparece solo en el informe anterior.",
    ojo: "Que el informe posterior no lo mencione no prueba que haya terminado. Como con el objetivo «no declarado», hay que buscarlo en otras fuentes.",
  },
  "modo-reversion": {
    origen: "propio",
    teoria:
      "No está en Mahoney y Thelen. Lo más cercano es el desmantelamiento de políticas (Bauer y otros): recortar, reducir o eliminar una política.",
    enElMapa: "El instrumento sigue, pero el gobierno posterior lo usa en sentido contrario, por ejemplo de promover a restringir.",
    ojo: "Es una categoría nuestra: viene de la «tensión» de PID+T. Invertir el rumbo no es lo mismo que desmantelar.",
  },
  "modo-deriva": {
    origen: "literatura",
    teoria:
      "La regla sigue igual, pero el entorno cambia y los actores deciden no ajustarla. Su efecto cambia sin que nadie la toque.",
    enElMapa: "El instrumento aparece igual en los dos informes, pero el contexto lo hace rendir distinto.",
    ojo: "La deriva no se ve en un informe: hay que conocer el contexto. En el mapa es una pregunta para el plenario, no una conclusión.",
  },

  // ─── Otras categorías propias ────────────────────────────────────────────────────────────────
  presencia: {
    origen: "propio",
    enElMapa: "Se asigna por informe: qué dice cada uno sobre el instrumento.",
  },
  confianza: {
    origen: "propio",
    enElMapa: "La asigna quien clasifica, hoy la IA. Una confianza baja pide volver al documento.",
  },
};
