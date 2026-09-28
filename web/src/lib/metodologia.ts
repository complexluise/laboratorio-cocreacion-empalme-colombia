import evidenciaJson from "$lib/evidencia.json";

/**
 * Metodología y declaración de uso de IA (issue #37, ADR-0006). El FLUJO de trabajo como fases,
 * cada una con quién hizo qué (personas / IA / máquina determinista) y su rastro en git. La
 * evidencia (cifras e hitos) la escribe `scripts/evidencia_git.py` en lib/evidencia.json.
 */

export type Actor = "persona" | "ia" | "automatico";

export const ETIQUETA_ACTOR: Record<Actor, string> = {
  persona: "Personas",
  ia: "IA",
  automatico: "Automático",
};

export const DESCRIPCION_ACTOR: Record<Actor, string> = {
  persona: "El equipo del laboratorio o los grupos del taller.",
  ia: "Un modelo de lenguaje (Claude o Gemini) que propone, redacta o clasifica.",
  automatico: "Código determinista: siempre da el mismo resultado y se puede volver a correr.",
};

export interface Fase {
  id: string;
  titulo: string;
  actores: Actor[];
  /** Qué hicieron las personas en esta fase. */
  persona: string;
  /** Qué hizo la máquina (IA o código). */
  maquina: string;
  /** Qué rastro deja en el repositorio. */
  rastro: string;
  /** Fase que todavía no ocurre (sin evidencia en git). */
  porVenir?: boolean;
}

export const FASES: Fase[] = [
  {
    id: "encuadrar",
    titulo: "Encuadrar",
    actores: ["persona", "ia"],
    persona: "Definimos la pregunta, el marco teórico (instrumentos, cambio institucional) y la actividad del seminario.",
    maquina: "La IA ordenó y redactó el encuadre a partir de las conversaciones con el equipo.",
    rastro: "Un issue por trabajo y el encuadre en docs/.",
  },
  {
    id: "fuente",
    titulo: "Reunir la fuente",
    actores: ["persona", "automatico", "ia"],
    persona: "Elegimos la fuente (los informes de empalme publicados por el DNP) y el sector piloto.",
    maquina: "Scripts escritos con IA descargan los informes y los pasan a texto; los PDF escaneados se transcriben con Gemini.",
    rastro: "Los scripts de extraccion/ en su commit.",
  },
  {
    id: "extraer",
    titulo: "Extraer la red",
    actores: ["ia"],
    persona: "Revisamos resultados y pedimos rehacer cuando la red salía desconectada.",
    maquina: "La IA leyó los informes y propuso políticas, instrumentos, tipo NATO, modo de cambio y narrativa con página. Primero Gemini; luego varios agentes de Claude reconstruyeron la red: es la que se publica hoy.",
    rastro: "El dataset y el script que lo produjo, en el mismo commit.",
  },
  {
    id: "revisar",
    titulo: "Revisar contra la fuente",
    actores: ["ia", "persona", "automatico"],
    persona: "Aprobamos la agrupación en áreas (ADR-0004), que sí se aplica a la red vigente. La revisión humana dato por dato está PENDIENTE.",
    maquina: "Agentes de IA contrastaron la primera extracción (Gemini) con los informes y dejaron correcciones con evidencia. Esa red se reemplazó después por la de Claude, que no pasó por esa revisión.",
    rastro: "data/correcciones/: las correcciones de la versión Gemini y la curaduría de áreas.",
  },
  {
    id: "decidir",
    titulo: "Decidir",
    actores: ["persona", "ia"],
    persona: "Tomamos las decisiones: respondimos las opciones que planteó la IA y aprobamos cada una.",
    maquina: "La IA propuso alternativas con sus costos y redactó el registro de la decisión.",
    rastro: "Un ADR por decisión en docs/decisiones/.",
  },
  {
    id: "construir",
    titulo: "Construir",
    actores: ["ia", "automatico"],
    persona: "Pedimos cada pieza y probamos el sitio y los materiales.",
    maquina: "La IA escribió casi todo el código y los textos (sitio, glosario, bitácora, Excel). Los tests y el contrato de datos los validan.",
    rastro: "Commits con el trailer Co-Authored-By del modelo.",
  },
  {
    id: "verificar",
    titulo: "Verificar",
    actores: ["ia", "automatico", "persona"],
    persona: "Leímos los hallazgos y el PR antes de integrarlo.",
    maquina: "Desde que adoptamos la disciplina de trabajo (ADR-0001), un agente verificador revisa los cambios buscando errores y la integración continua corre tests, tipos y fronteras. Antes no había esta verificación.",
    rastro: "Commits «hallazgos del verificador» y los checks del PR.",
  },
  {
    id: "liberar",
    titulo: "Liberar",
    actores: ["persona", "automatico"],
    persona: "Desde la v0.1.0 (PR #7) aprobamos cada integración y cada versión. Al arranque, los cambios se subían directo a la rama publicada, sin PR.",
    maquina: "GitHub Pages publica lo que llega a main.",
    rastro: "Merge de cada PR y un tag por versión.",
  },
  {
    id: "taller",
    titulo: "Taller: revisar entre todos",
    actores: ["persona"],
    persona: "Los grupos contrastan la red con los informes, llenan la bitácora y señalan errores. Es la revisión que falta.",
    maquina: "El lector de la bitácora la convierte en dato; lo que cambie vuelve a «Revisar».",
    rastro: "Cuando ocurra: data/bitacoras/ y los issues de cada error reportado.",
    porVenir: true,
  },
];

/** A qué fase vuelve el taller: sus hallazgos reabren la revisión. */
export const RETORNO_TALLER = "revisar";

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

/** Qué tan revisada está cada capa del contenido. Honesto por capa, no una cifra global. */
export const CAPAS: Capa[] = [
  {
    capa: "Informes de empalme",
    quien: "Cada gobierno, publicados por el DNP",
    revision: "Se usan tal cual; no se modifican.",
    estado: "fuente",
  },
  {
    capa: "Texto extraído de los informes",
    quien: "Automático; OCR con Gemini en los escaneados",
    revision: "No se revisó línea a línea.",
    estado: "pendiente",
  },
  {
    capa: "La red: políticas, instrumentos, modos de cambio",
    quien: "IA: agentes de Claude, con evidencia por página",
    revision: "La revisión adversarial se hizo sobre una versión anterior (Gemini) y no cubre la actual. Revisión humana pendiente; hay casos conocidos donde la narrativa contradice el modo.",
    estado: "pendiente",
  },
  {
    capa: "Áreas de política",
    quien: "Propuestas con IA",
    revision: "Aprobadas por el equipo (ADR-0004).",
    estado: "parcial",
  },
  {
    capa: "Textos del sitio, glosario y teoría",
    quien: "IA, desde el encuadre del equipo",
    revision: "Leídos por el equipo, sin revisión completa. Las citas bibliográficas conviene verificarlas en la fuente.",
    estado: "parcial",
  },
  {
    capa: "Código y materiales descargables",
    quien: "IA",
    revision: "Tests automáticos, contrato de datos y verificador; el equipo los probó.",
    estado: "parcial",
  },
  {
    capa: "Ejemplo de bitácora CTeI",
    quien: "El equipo; la IA lo pasó al formato",
    revision: "Escrito por el equipo a partir de su plantilla; la IA lo llevó al formato de la bitácora.",
    estado: "personas",
  },
  {
    capa: "Bitácoras de los grupos",
    quien: "Los grupos del taller",
    revision: "Las escriben personas; el equipo las integra.",
    estado: "personas",
  },
];

export interface Hito {
  fase: string;
  commit: string;
  que: string;
  autor: string;
  fecha: string;
  asunto: string;
  coautores: string[];
}

export interface Evidencia {
  corte: { commit: string; fecha: string };
  periodo: { desde: string; hasta: string };
  commits: { total: number; agente: number; persona_con_ia: number; persona: number };
  modelos: Record<string, number>;
  prs_integrados: number[];
  releases: { tag: string; commit: string; fecha: string }[];
  adrs: { id: string; titulo: string; archivo: string }[];
  hitos: Hito[];
}

export const evidencia = evidenciaJson as Evidencia;

export const REPO = "https://github.com/complexluise/laboratorio-cocreacion-empalme-colombia";

export const urlCommit = (hash: string) => `${REPO}/commit/${hash}`;
export const urlPR = (n: number) => `${REPO}/pull/${n}`;
export const urlArchivo = (ruta: string) => `${REPO}/blob/main/${ruta}`;

export function hitosDe(ev: Evidencia, fase: string): Hito[] {
  return ev.hitos.filter((h) => h.fase === fase);
}

/** Quién firmó un hito, en palabras: git distingue al agente, a la persona y la coautoría. */
export function firma(h: Hito): string {
  if (h.asunto.startsWith("Merge pull request")) return "integración aprobada con la cuenta del PO";
  if (h.autor === "Claude") return "firmado por el agente (Claude)";
  return h.coautores.length > 0 ? `persona del equipo, con ${h.coautores.join(" y ")}` : "persona del equipo, sin IA declarada";
}
