/**
 * De dónde sale cada categoría del mapa y en qué se aparta de su fuente (ADR-0008). Se suma a la
 * entrada del glosario con el mismo id (los tests exigen que exista). Las definiciones están parafraseadas de la literatura (ver
 * docs/teoria-politica.md §Referencias); falta cotejarlas con los textos originales.
 */

/** literatura: el concepto viene tal cual de un autor · adaptacion: viene de un autor, pero lo
 * aplicamos distinto · propio: lo creó el proyecto. */
export type Origen = "literatura" | "adaptacion" | "propio";

export const ETIQUETA_ORIGEN: Record<Origen, string> = {
  literatura: "De estudios publicados",
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
      "Hood propone que el Estado gobierna con cuatro recursos: nodalidad, autoridad, tesoro y organización. Cada recurso le sirve para dos cosas: conocer lo que pasa en la sociedad y actuar sobre ella.",
    enElMapa: "Cada instrumento lleva un solo tipo: el del recurso que más pesa en él. En la red es la forma del nodo.",
    ojo: "Muchos instrumentos combinan recursos: una convocatoria entrega dinero, pero también fija reglas. Asignar uno solo es una decisión nuestra.",
  },
  "nato-nodalidad": {
    origen: "literatura",
    teoria:
      "La posición del Estado en el centro de las redes de información: recibe información de la sociedad y la difunde.",
    enElMapa:
      "Sistemas de información, plataformas, estadísticas, campañas y orientación. Por ejemplo, ScienTI, la plataforma que registra a los investigadores.",
  },
  "nato-autoridad": {
    origen: "literatura",
    teoria: "El poder legal u oficial del Estado para ordenar, prohibir, permitir o certificar.",
    enElMapa:
      "Leyes, decretos, reglamentos y documentos CONPES (las políticas que aprueba el consejo de planeación). Por ejemplo, la ley que crea el Ministerio.",
  },
  "nato-tesoro": {
    origen: "literatura",
    teoria: "El dinero y los bienes que el Estado puede entregar, con los que paga, subsidia o premia.",
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
      "Se apoya en dos ideas. Howlett y Cashore separan los fines de una política en tres niveles: metas generales, objetivos de programa y ajustes concretos. Hall distingue tres órdenes de cambio; el tercero cambia las metas mismas y la forma de ver el problema (el paradigma).",
    enElMapa: "Comparamos el objetivo que declara el informe de cada gobierno para la misma área.",
    ojo: "Lo que declara un informe está más cerca de un objetivo de programa que de un paradigma. Un «se reformula» no es, por sí solo, un cambio de tercer orden: hay que argumentarlo.",
  },
  "objetivo-se-mantiene": {
    origen: "propio",
    teoria:
      "Se parece al «mantenimiento» de la tipología de sucesión de políticas de Hogwood y Peters: la política sigue con los mismos fines.",
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
    teoria:
      "No lo equiparamos a la «terminación» de Hogwood y Peters, y es deliberado: el silencio de un informe no es un final.",
    enElMapa: "El informe posterior no declara objetivo para el área.",
    ojo: "Si el área conserva instrumentos activos, es un área huérfana.",
  },
  "objetivo-nuevo": {
    origen: "propio",
    teoria:
      "Se parece a la innovación de Hogwood y Peters: el gobierno entra en un área donde antes no tenía política declarada.",
    enElMapa: "Solo el informe posterior declara el área.",
    ojo: "Que el informe anterior no la mencione no prueba que no existiera.",
  },

  // ─── Modos de cambio ─────────────────────────────────────────────────────────────────────────
  "modo-de-cambio": {
    origen: "adaptacion",
    teoria:
      "Mahoney y Thelen describen cuatro formas en que las instituciones cambian poco a poco: desplazamiento, estratificación, deriva y conversión. Antes, Streeck y Thelen (2005) contaban una quinta: el agotamiento.",
    enElMapa:
      "Estratificación y terminación se asignan solas, según en qué informe aparece el instrumento. Los demás modos los asigna la IA leyendo el texto.",
    ojo: "Los autores estudian reglas a lo largo de años; nosotros comparamos dos informes. Por eso algunos modos del mapa son una adaptación: cada uno dice su origen.",
  },
  "modo-continuidad-estable": {
    origen: "adaptacion",
    teoria:
      "Pierson explica por qué las políticas persisten: una vez en marcha, revertirlas cuesta cada vez más. Mahoney y Thelen no la cuentan como modo, porque su tipología es de cambio.",
    enElMapa: "La asigna la IA cuando el instrumento aparece en los dos informes sin señales de otro fin.",
    ojo: "Que siga no quiere decir que funcione igual: puede haber una deriva que el informe no muestra.",
  },
  "modo-conversion": {
    origen: "literatura",
    teoria: "La regla sigue formalmente igual, pero los actores la reinterpretan y la ponen al servicio de otros fines.",
    enElMapa: "La asigna la IA cuando el informe posterior usa el instrumento para otro propósito o para otra población.",
    ojo: "Solo se puede afirmar si se ve el fin de cada gobierno. Cuando ningún agente de IA propuso un modo, el programa que arma la red puso «conversión»: esos casos hay que revisarlos.",
  },
  "modo-estratificacion": {
    origen: "adaptacion",
    teoria:
      "Se agregan reglas nuevas encima o al lado de las existentes, que siguen en pie. Con el tiempo, lo nuevo cambia el conjunto.",
    enElMapa: "Se asigna sola: basta con que el instrumento aparezca solo en el informe posterior.",
    ojo: "Nuestro criterio no comprueba que lo anterior siga. Si lo nuevo reemplaza a otro instrumento, en la teoría es desplazamiento, no estratificación.",
  },
  "modo-terminacion": {
    origen: "adaptacion",
    teoria:
      "Junta tres ideas. Desplazamiento: se quita una regla y se pone otra (Mahoney y Thelen). Terminación: se pone fin a una política (deLeon). Agotamiento: la regla se extingue sin reemplazo (Streeck y Thelen).",
    enElMapa: "Se asigna sola: basta con que el instrumento falte en el informe posterior.",
    ojo: "Que el informe posterior no lo mencione no prueba que haya terminado. Como con el objetivo «no declarado», hay que buscarlo en otras fuentes.",
  },
  "modo-reversion": {
    origen: "propio",
    teoria:
      "No está en Mahoney y Thelen. Lo más cercano es el desmantelamiento de políticas (Bauer y otros): recortar, reducir o eliminar una política.",
    enElMapa: "La asigna la IA cuando el gobierno posterior usa el instrumento en sentido contrario, por ejemplo de promover a restringir.",
    ojo: "Viene de la «tensión» de PID+T. Invertir el rumbo no es lo mismo que desmantelar.",
  },
  "modo-deriva": {
    origen: "literatura",
    teoria:
      "La regla sigue igual, pero el entorno cambia y los actores deciden no ajustarla. Su efecto cambia sin que nadie la toque.",
    enElMapa: "El instrumento aparece igual en los dos informes, pero en otro contexto su efecto cambia.",
    ojo: "La deriva no se ve en un informe: hay que conocer el contexto. En el mapa es una pregunta para el plenario, no una conclusión.",
  },

  // ─── Otras categorías propias ────────────────────────────────────────────────────────────────
  presencia: {
    origen: "propio",
    enElMapa: "La IA la asigna leyendo cada informe: propuesto, logrado o pendiente.",
  },
  confianza: {
    origen: "propio",
    enElMapa: "La asigna quien clasifica, hoy la IA. Una confianza baja pide volver al documento.",
  },
};
