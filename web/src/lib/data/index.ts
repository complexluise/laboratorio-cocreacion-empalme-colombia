import type { Dataset } from "@laboratorio/red";
import ctei from "./ciencia-tecnologia.json";

/**
 * Dataset del sector, conforme a data/schema/objeto.schema.json. Lo escribe
 * `extraccion/generar_web.py` y se importa como módulo (bundleado: sin fetch, sirve en file://).
 */
export const dataset = ctei as Dataset;
