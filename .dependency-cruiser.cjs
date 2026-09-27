/**
 * Fronteras de los sistemas viables (VSM) — ver docs/FRONTERAS.md.
 * - packages/* : cada paquete es un sistema viable; su frontera es `exports`.
 * - web/src    : la app consume paquetes por NOMBRE (@laboratorio/x), nunca su src/ por ruta.
 * - Dentro de web: la lógica (lib/state, lib/graph/*.ts, lib/data) no depende de componentes.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Sin ciclos: un ciclo = fronteras difusas.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "frontera-entre-paquetes",
      comment:
        "Un módulo de packages/X/src no puede importar el src/ de packages/Y por ruta relativa. Cruzá por '@laboratorio/Y'.",
      severity: "error",
      from: { path: "^packages/([^/]+)/src/" },
      to: { path: "^packages/([^/]+)/src/", pathNot: "^packages/$1/src/" },
    },
    {
      name: "web-cruza-por-nombre",
      comment: "web/ usa los paquetes por su nombre (@laboratorio/x), no importando packages/*/src por ruta relativa.",
      severity: "error",
      from: { path: "^web/src/" },
      to: { path: "^packages/[^/]+/src/", dependencyTypes: ["local"] },
    },
    {
      name: "paquetes-no-dependen-de-web",
      comment: "El dominio no conoce a su consumidor: packages/* nunca importa de web/.",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^web/" },
    },
    {
      name: "nadie-importa-extraccion",
      comment: "La frontera con el pipeline es el DATO (data/schema), no el código de extraccion/.",
      severity: "error",
      from: {},
      to: { path: "^extraccion/" },
    },
    {
      name: "logica-sin-componentes",
      comment: "La lógica de la web (state, graph/*.ts, data) no depende de componentes .svelte.",
      severity: "error",
      from: { path: "^web/src/lib/(state|data)/|^web/src/lib/graph/[^/]+\\.ts$" },
      to: { path: "\\.svelte$" },
    },
    {
      name: "no-huerfanos",
      comment: "Módulos huérfanos = código muerto. Entradas, configs y tipos se excluyen.",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: [
          "\\.d\\.ts$",
          "(^|/)index\\.ts$",
          "(^|/)main\\.ts$",
          "(^|/)(vite|vitest|svelte)\\.config\\.[jt]s$",
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: ["\\.test\\.ts$", "\\.test-util\\.ts$", "(^|/)dist/"] },
    tsPreCompilationDeps: true,
    // tsconfig.depcruise.json suma el alias `$lib` de la web: sin él, lo importado solo vía $lib
    // parecía huérfano y esas aristas no se chequeaban contra las reglas.
    tsConfig: { fileName: "tsconfig.depcruise.json" },
    enhancedResolveOptions: { extensions: [".ts", ".js", ".svelte", ".json"] },
  },
};
