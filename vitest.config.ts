import { defineConfig } from "vitest/config";

// Cada sistema viable corre sus tests en su propio proyecto (web necesita el plugin de Svelte).
export default defineConfig({
  test: {
    projects: ["packages/*", "web"],
  },
});
