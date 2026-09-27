<script lang="ts">
  import { dataset } from "$lib/data";
</script>

<main>
  <h1>Laboratorio de Cocreación</h1>
  <p>{dataset.objetos.length} instrumentos · {dataset.politicas?.length ?? 0} políticas</p>
</main>
