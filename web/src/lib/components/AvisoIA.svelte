<script lang="ts">
  import { hrefDe, type Pagina } from "$lib/rutas.ts";

  /**
   * Aviso de IA (ADR-0006, issue #37): el contenido se hizo con IA y aún no se revisa al 100 %, y
   * revisarlo es parte del ejercicio. Va bajo la cabecera de todas las páginas salvo la metodología
   * (que lo desarrolla). Se puede plegar; la preferencia es de cada navegador (localStorage, con
   * try/catch: sin almacenamiento el aviso simplemente vuelve a mostrarse).
   */
  interface Props {
    pagina: Pagina;
  }
  let { pagina }: Props = $props();

  const CLAVE = "aviso-ia-plegado-v1";

  function leer(): boolean {
    try {
      return localStorage.getItem(CLAVE) === "1";
    } catch {
      return false;
    }
  }

  let plegado = $state(leer());

  function plegar() {
    plegado = true;
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      /* sin almacenamiento: se pliega solo en esta visita */
    }
  }
</script>

{#if pagina !== "metodologia" && !plegado}
  <aside class="aviso" aria-label="Aviso sobre el uso de inteligencia artificial">
    <span class="sello" aria-hidden="true">IA</span>
    <p>
      <strong>Hecho con inteligencia artificial y aún sin revisar al 100 %.</strong>
      <span class="largo">Revisarlo es parte del ejercicio.</span>
      <a href={hrefDe("metodologia")}>Cómo lo hicimos →</a>
    </p>
    <button type="button" class="cerrar" aria-label="Ocultar el aviso" onclick={plegar}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
    </button>
  </aside>
{/if}

<style>
  .aviso {
    order: 99; /* siempre la última fila de la cabecera */
    flex: 1 0 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 2px -12px -8px;
    padding: 6px 6px 6px 12px;
    background: #fff8e6;
    border-top: 1px solid #f1dfae;
    color: #5b4a1c;
  }
  .sello {
    flex: none;
    display: grid;
    place-items: center;
    width: 26px;
    height: 20px;
    border-radius: 5px;
    background: #7a5d10;
    color: #fff8e6;
    font: 700 11px var(--fuente-ui);
    letter-spacing: 0.04em;
  }
  p {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.35;
  }
  .largo {
    display: none;
  }
  a {
    color: #5b3f00;
    font-weight: 650;
    white-space: nowrap;
  }
  .cerrar {
    flex: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    cursor: pointer;
  }
  .cerrar:hover {
    background: rgb(0 0 0 / 0.06);
  }
  .cerrar path {
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  a:focus-visible,
  .cerrar:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }
  @media (min-width: 640px) {
    .largo {
      display: inline;
    }
  }
  @media (min-width: 861px) {
    .aviso {
      margin: 2px -18px -10px;
      padding-left: 18px;
    }
  }
</style>
