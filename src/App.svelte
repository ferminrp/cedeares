<script>
  import Tabla from "./UI/Tabla.svelte";

  let data = [];
  let columns = ["Symbol","Name", "Price", "Change"];

  const cedeares = fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:D193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU"
  )
    .then((response) => response.json())
    .then(info => {
		for (let i = 0; i < info.values.length; i++) {
			let row = {}
			row.symbol = info.values[i][0];
			row.name = info.values[i][1];
			row.price = info.values[i][2];
			row.change = info.values[i][3];
			data = [...data, row];
		}
	});
</script>

<main>
<h1>Listado de CEDEARs</h1>

{#if data.length > 0}
	<Tabla {data} {columns} />
{/if}

</main>

<style>
	main {
		width: 720px;
		margin: auto;
		max-width: 90vw;
	}
</style>
