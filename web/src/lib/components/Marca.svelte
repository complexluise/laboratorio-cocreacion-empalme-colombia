<script lang="ts">
  interface Props {
    /** Línea secundaria: sector y periodo que se está explorando. */
    contexto?: string;
  }
  let { contexto = "política pública · red navegable" }: Props = $props();
</script>

<!-- Wordmark del laboratorio: glifo nodo-enlace (dos políticas que comparten un instrumento). -->
<div class="marca">
  <svg class="glifo" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
    <line x1="8" y1="10" x2="16" y2="22" />
    <line x1="24" y1="10" x2="16" y2="22" />
    <circle class="pol" cx="8" cy="10" r="5" />
    <circle class="pol" cx="24" cy="10" r="5" />
    <rect class="ins" x="12.5" y="18.5" width="7" height="7" rx="1.5" />
  </svg>
  <div class="texto">
    <span class="nombre">Laboratorio de Cocreación</span>
    <span class="bajada">{contexto}</span>
  </div>
</div>

<style>
  .marca {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .glifo {
    flex: none;
  }
  line {
    stroke: var(--tinta);
    stroke-width: 2;
  }
  .pol {
    fill: var(--papel);
    stroke: var(--tinta);
    stroke-width: 2.4;
  }
  .ins {
    fill: var(--acento);
  }
  .texto {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .nombre {
    font-family: var(--fuente-display);
    font-weight: 650;
    font-size: 17px;
    letter-spacing: -0.01em;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Mobile first: en pantallas angostas solo el glifo; el nombre aparece cuando hay lugar. */
  .texto {
    display: none;
  }
  @media (min-width: 600px) {
    .texto {
      display: flex;
    }
  }
  .bajada {
    font-size: 11px;
    color: var(--tinta-suave);
    letter-spacing: 0.03em;
  }
</style>
