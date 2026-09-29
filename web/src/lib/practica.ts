import { activoEn, normalizar, VIGENCIAS, type Dataset, type ModoCambio, type Objeto, type TipoNato, type Vigencia } from "@laboratorio/red";
import { ETIQUETA_MODO } from "$lib/visual.ts";

/**
 * Práctica «¿Qué le pasó a este instrumento?» (issue #32): ejemplos REALES de la red, uno por modo
 * de cambio, para ensayar la lectura antes de llenar la bitácora. Solo se eligen ejemplos
 * COHERENTES: su presencia por gobierno corresponde al modo y su narrativa no nombra otro modo.
 */
export const MODOS_PRACTICA = ["continuidad-estable", "conversion", "estratificacion", "terminacion"] as const satisfies readonly ModoCambio[];

export type PresenciaVista = Record<Vigencia, string | null>;

export interface Pregunta {
  id: string;
  nombre: string;
  tipoNato?: TipoNato;
  /** Por gobierno: propuesto / logrado / pendiente / presente, o null si no aparece. */
  presencia: PresenciaVista;
  correcta: ModoCambio;
  antes?: string;
  despues?: string;
  explicacion?: string;
}

export interface Evaluacion {
  correcta: boolean;
  mensaje: string;
}

/** Qué presencia exige cada modo: [¿en 2018–2022?, ¿en 2022–2026?]. */
const PATRON: Record<(typeof MODOS_PRACTICA)[number], [boolean, boolean]> = {
  "continuidad-estable": [true, true],
  conversion: [true, true],
  estratificacion: [false, true],
  terminacion: [true, false],
};

/** Palabras con que una narrativa nombra cada modo (para descartar ejemplos que se contradicen). */
const NOMBRES: Record<ModoCambio, string[]> = {
  "continuidad-estable": ["continuidad"],
  conversion: ["conversion"],
  estratificacion: ["estratificacion", "instrumento nuevo"],
  terminacion: ["terminacion"],
  reversion: ["reversion"],
  deriva: ["deriva"],
};

function coherente(o: Objeto, modo: (typeof MODOS_PRACTICA)[number]): boolean {
  if (o.es_objetivo || o.modo_cambio !== modo) return false;
  const [en18, en22] = PATRON[modo];
  if (activoEn(o, "2018-2022") !== en18 || activoEn(o, "2022-2026") !== en22) return false;
  const n = o.narrativa;
  if ((en18 && !n?.g2018) || (en22 && !n?.g2022)) return false;
  const inicio = normalizar(n?.cambio ?? "").slice(0, 40);
  const otro = (Object.keys(NOMBRES) as ModoCambio[]).some((m) => m !== modo && NOMBRES[m].some((p) => inicio.startsWith(p)));
  return !otro;
}

export function preguntasPractica(dataset: Dataset): Pregunta[] {
  const preguntas: Pregunta[] = [];
  for (const modo of MODOS_PRACTICA) {
    const o = dataset.objetos.find((x) => coherente(x, modo));
    if (!o) continue;
    const presencia = Object.fromEntries(
      VIGENCIAS.map((v) => [v, activoEn(o, v) ? (o.presencia[v]?.modo ?? "presente") : null]),
    ) as PresenciaVista;
    preguntas.push({
      id: o.id,
      nombre: o.nombre,
      ...(o.tipo_nato ? { tipoNato: o.tipo_nato } : {}),
      presencia,
      correcta: modo,
      ...(o.narrativa?.g2018 ? { antes: o.narrativa.g2018 } : {}),
      ...(o.narrativa?.g2022 ? { despues: o.narrativa.g2022 } : {}),
      ...(o.narrativa?.cambio ? { explicacion: o.narrativa.cambio } : {}),
    });
  }
  return preguntas;
}

/** Pista según lo que muestra la presencia: lo primero que hay que mirar. */
function pista(p: Pregunta): string {
  const en18 = p.presencia["2018-2022"] !== null;
  const en22 = p.presencia["2022-2026"] !== null;
  if (en18 && en22)
    return "Aparece en ambos gobiernos: el modo se decide por si sigue igual o cambia de uso. Comparemos lo que hacía antes y después.";
  if (en22) return "Solo aparece en el gobierno posterior: ¿se suma a lo que existía?";
  return "Solo aparece en el gobierno anterior: ¿qué pasó con él después?";
}

export function evaluar(p: Pregunta, respuesta: ModoCambio): Evaluacion {
  if (respuesta === p.correcta) {
    return { correcta: true, mensaje: `¡Sí! Es ${ETIQUETA_MODO[p.correcta]}.${p.explicacion ? ` ${p.explicacion}` : ""}` };
  }
  return { correcta: false, mensaje: `No es ${ETIQUETA_MODO[respuesta]}. ${pista(p)}` };
}
