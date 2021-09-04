<script context="module">
	export const prerender = false;
</script>

<script>
	import Estrategia from '$lib/estrategias/Estrategia.svelte';
	import { BarLoader } from 'svelte-loading-spinners';
	import Callout from '$lib/UI/Callout.svelte';
	import Share from '$lib/UI/Share.svelte';
	import Cafecito from '$lib/UI/Cafecito.svelte';
	let data = [];
	let columns = ['', '', 'Ticker', 'Nombre', 'Precio', 'Cambio'];

	let watchlist = [];

	const cedeares = fetch(
		'https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU'
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
					: (row.image = 'https://i.imgur.com/ERGz8GO.png');
				data = [...data, row];
			}
			if (JSON.parse(localStorage.getItem('watchlist')) !== null) {
				watchlist = JSON.parse(localStorage.getItem('watchlist'));
			}
		});

	function watchlisted(event) {
		let symbol = event.detail.symbol;
		// Add symbol to watchlist
		watchlist = [...watchlist, symbol];
		// Save watchlist in localStorage
		localStorage.setItem('watchlist', JSON.stringify(watchlist));
		console.log(JSON.parse(localStorage.getItem('watchlist')));
		window.splitbee.track('Watchlisted', {
			symbol: symbol
		});
	}
	function unwatchlisted(event) {
		let symbol = event.detail.symbol;
		// Add symbol to watchlist
		watchlist = watchlist.filter((cedear) => cedear !== symbol);
		// Save watchlist in localStorage
		localStorage.setItem('watchlist', JSON.stringify(watchlist));
		console.log(JSON.parse(localStorage.getItem('watchlist')));
		window.splitbee.track('unwatchlisted', {
			symbol: symbol
		});
	}

	import { estrategias } from '$lib/estrategias/estrategias.js';
	console.log(estrategias);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Listado de Cedears</title>
	<meta name="title" content="Listado de Cedears" />
	<meta name="description" content="Herramientas para invertir en CEDEARs" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cedears.ar/" />
	<meta property="og:title" content="Listado de Cedears" />
	<meta property="og:description" content="Herramientas para invertir en CEDEARs" />
	<meta property="og:image" content="https://cedears.ar/assets/meta_image.jpg" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@ferminrp" />
	<meta name="twitter:creator" content="@ferminrp" />
	<meta property="twitter:url" content="https://cedears.ar/" />
	<meta property="twitter:title" content="Listado de Cedears" />
	<meta property="twitter:description" content="Herramientas para invertir en CEDEARs" />
	<meta property="twitter:image" content="https://cedears.ar/assets/meta_image.jpg" />
</svelte:head>

<main>
	<h1>Listados de la Comunidad</h1>

	<Callout color="#FDD2C1"
		>Estos listados fueron sugeridos por la comunidad, podes sugerir nuevos <a
			href="https://google.com">acá</a
		>!</Callout
	>

	{#each estrategias as estrategia}
		<Estrategia cedears="{estrategia.cedears}" nombre={estrategia.nombre} descripcion={estrategia.descripcion} {data} {watchlist} {columns}/>
	{/each}

	
</main>

<Cafecito />

<style>
	main {
		width: 720px;
		margin: auto;
		max-width: 90vw;
		margin-bottom: 3rem;
	}
	h1,
	h3 {
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 20rem;
	}
</style>
