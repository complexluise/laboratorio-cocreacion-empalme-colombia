import type { Dataset, Objeto } from "./tipos.ts";

function obj(p: Partial<Objeto> & Pick<Objeto, "id">): Objeto {
  return {
    nombre: p.id,
    es_objetivo: false,
    tipo_nato: "autoridad",
    presencia: { "2018-2022": { activo: true }, "2022-2026": { activo: true } },
    modo_cambio: "continuidad-estable",
    evidencia: [{ vigencia: "2018-2022" }],
    ...p,
  };
}

/**
 * Red chica de prueba:
 *   pA ← a (ley, ambos, continuidad) ; pA ← b (fondo, solo 2022, estratificación)
 *   pB ← b ; pB ← c (programa, solo 2018, terminación)
 *   d (objetivo, sin política)       ; relaciones: a -habilita-> c ; c -financia-> d
 */
export const DS: Dataset = {
  sector: "prueba",
  politicas: [
    {
      id: "pA",
      nombre: "Política de Educación Superior",
      cambio_objetivo: "se-mantiene",
      objetivos: {
        "2018-2022": { enunciados: ["Ampliar cobertura"], declaradas: ["Plan de Educación 2018"] },
        "2022-2026": { enunciados: ["Ampliar cobertura"], declaradas: ["Plan de Educación 2018"] },
      },
    },
    {
      id: "pB",
      nombre: "Misión Bioeconomía",
      cambio_objetivo: "no-declarado",
      objetivos: { "2018-2022": { enunciados: ["Aprovechar la biodiversidad"], declaradas: ["Colombia BIO"] } },
    },
    { id: "pC", nombre: "Política sin instrumentos" },
  ],
  objetos: [
    obj({ id: "a", nombre: "Ley de Ciencia", politicas: ["pA"], alias: ["Ley 2162"] }),
    obj({
      id: "b",
      nombre: "Fondo CTeI",
      tipo_nato: "tesoro",
      politicas: ["pA", "pB"],
      presencia: { "2022-2026": { activo: true } },
      modo_cambio: "estratificacion",
    }),
    obj({
      id: "c",
      nombre: "Programa Ondas",
      tipo_nato: "organizacion",
      politicas: ["pB"],
      presencia: { "2018-2022": { activo: true } },
      modo_cambio: "terminacion",
    }),
    obj({ id: "d", nombre: "Meta de inversión", es_objetivo: true, tipo_nato: undefined, politicas: [] }),
  ],
  relaciones: [
    { source: "a", target: "c", tipo: "habilita" },
    { source: "c", target: "d", tipo: "financia" },
    { source: "a", target: "a", tipo: "encadena" },
  ],
};
