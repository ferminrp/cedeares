<script>
  import Tabla from "./UI/Tabla.svelte";
  import { BarLoader } from "svelte-loading-spinners";
  import Callout from "./UI/Callout.svelte"

  let data = [];
  let columns = ["", "Symbol", "Name", "Price", "Daily"];

  const cedeares = fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU"
  )
    .then((response) => response.json())
    .then((info) => {
      for (let i = 0; i < info.values.length; i++) {
        let row = {};
        row.symbol = info.values[i][0];
        row.name = info.values[i][1];
        row.price = info.values[i][2];
        row.change = info.values[i][3];
        info.values[i][4] !== undefined
          ? (row.image = info.values[i][4])
          : (row.image = "https://i.imgur.com/ERGz8GO.png");
        data = [...data, row];
      }
    });
</script>

<main>
  <h1>Listado de CEDEARs</h1>

 <Callout color="#FDD2C1">Bienvenido! Aca vas a poder analizar todos los CEDEARs que actualmente cotizan en el mercado. Pronto vas a poder guardar tus favoritos para seguir tus inversiones.</Callout>

  {#if data.length > 0}
    <Tabla {data} {columns} />
  {:else}
    <div class="loader">
      <BarLoader />
    </div>
  {/if}
</main>

<style>
  main {
    width: 720px;
    margin: auto;
    max-width: 90vw;
  }

  h1 {
	font-family: "Nunito", sans-serif;
	font-weight: 800;
  }

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20rem;
  }
</style>
