<script context="module">
	export const prerender = true;
</script>

<script>
	import Estrategia from '$lib/estrategias/Estrategia.svelte';
	import { BarLoader } from 'svelte-loading-spinners';
	import Callout from '$lib/UI/Callout.svelte';
	import Share from '$lib/UI/Share.svelte';
	import Cafecito from '$lib/UI/Cafecito.svelte';
	import Nav from '$lib/UI/Nav.svelte';
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
		})
		.catch(function (error) {
			console.log(error);
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

	let estrategias = [
		{
			nombre: 'Vehículos Autónomos',
			descripcion:
				'Invertí en las empresas que llevan la delantera en la industria de vehículos autónomos!',
			cedears: ['NVDA', 'TM', 'GOOGL', 'TSLA']
		},
		{
			nombre: 'Inteligencia Artificial',
			descripcion:
				'Con el impulso de la revolución tecnológica actual, se prevé un aumento en las ganancias de muchas industrias. Invertí en las acciones mas demandadas!',
			cedears: ['GOOGL', 'NVDA', 'FB', 'AMZN']
		}
	];
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
	<h1>Packs de la Comunidad</h1>

	<Callout color="#b4c5ff"
		>Estos listados fueron sugeridos por la comunidad, podes sugerir nuevos <a
			href="https://tally.so/r/wvNk4w"
			target="_blank">acá</a
		>!</Callout
	>

	{#each estrategias as estrategia}
		<Estrategia
			on:watchlisted={watchlisted}
			on:unwatchlisted={unwatchlisted}
			cedears={estrategia.cedears}
			nombre={estrategia.nombre}
			descripcion={estrategia.descripcion}
			{data}
			{watchlist}
			{columns}
		/>
	{/each}
</main>

<Cafecito />

<Nav page="listados" />

<style>
	main {
		width: 720px;
		margin: 2rem auto 15rem auto;
		max-width: 90vw;
		padding-bottom: 5rem;
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

	/* Media query max width 700px */
	@media screen and (max-width: 700px) {
		h1 {
			font-size: 1.5rem;
		}

		main {
			margin-bottom: 6rem;
		}
	}
</style>
