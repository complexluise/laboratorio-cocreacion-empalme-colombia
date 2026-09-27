import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * file:// no carga <script type="module"> (Chrome lo bloquea por CORS con origen null). El bundle
 * sale como IIFE clásico y el <script> se vuelve `defer` sin type=module ni crossorigin.
 */
function scriptClasico(): Plugin {
  return {
    name: "script-clasico",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src=/g, "<script defer src=")
        .replace(/ crossorigin(?=[ >])/g, "");
    },
  };
}

// base './' => rutas relativas: sirve en el subpath de GitHub Pages y abriendo dist/ por file://.
export default defineConfig({
  base: "./",
  plugins: [svelte(), scriptClasico()],
  resolve: {
    alias: { $lib: fileURLToPath(new URL("./src/lib", import.meta.url)) },
  },
  build: {
    outDir: "dist",
    modulePreload: false,
    rollupOptions: { output: { format: "iife" } },
  },
  test: {
    name: "web",
    include: ["src/**/*.test.ts"],
    environment: "jsdom",
  },
});
