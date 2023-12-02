<script context="module">
	export const prerender = true;
</script>

<script>
	import Tabla from '$lib/UI/Tabla.svelte';
	import { BarLoader } from 'svelte-loading-spinners';
	import Callout from '$lib/UI/Callout.svelte';
	import Search from '$lib/UI/Search.svelte';
	import Share from '$lib/UI/Share.svelte';
	import Cafecito from '$lib/UI/Cafecito.svelte';
	import Nav from '$lib/UI/Nav.svelte';
	import Top from '$lib/UI/Top.svelte'
	let data = [];
	let columns = ['', '', 'Ticker', 'Nombre', 'Precio', 'Cambio'];
	let searchedValue = '';
	let filteredData = [];
	let watchlist = [];
	$: {
		if (searchedValue === '') {
			filteredData = data;
		} else {
			filteredData = data.filter(
				(cedear) =>
					cedear.symbol.includes(searchedValue.toUpperCase()) ||
					cedear.name.toUpperCase().includes(searchedValue.toUpperCase())
			);
		}
	}
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
			urlReader();
			if (JSON.parse(localStorage.getItem('watchlist')) !== null) {
				watchlist = JSON.parse(localStorage.getItem('watchlist'));
			}
		})
		.catch(function (error) {
			console.log(error);
		});
	function search(e) {
		searchedValue = e.detail.searchedValue;
		if (searchedValue === '') {
			window.history.pushState(
				{ page: 'Listado de Cedears' },
				'Listado de Cedears',
				window.location.origin
			);
		} else {
			window.history.pushState(
				{ page: 'Listado de Cedears' },
				'Listado de Cedears',
				window.location.origin + '/?search=' + searchedValue
			);
		}
	}
	function urlReader() {
		// Read search params in url
		let searchParams = window.location.search;
		let searchQuery = new URLSearchParams(searchParams);
		let searchValue = searchQuery.get('search');
		searchValue !== null ? (searchedValue = searchValue) : (searchedValue = '');
	}
	function watchlisted(event) {
		let symbol = event.detail.symbol;
		// Add symbol to watchlist
		watchlist = [...watchlist, symbol];
		// Save watchlist in localStorage
		localStorage.setItem('watchlist', JSON.stringify(watchlist));
		console.log(JSON.parse(localStorage.getItem('watchlist')));
		sa_event('Watchlisted ' + symbol);
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
		sa_event('Unwatchlisted ' + symbol);
		window.splitbee.track('unwatchlisted', {
			symbol: symbol
		});
	}
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
	<h1>Listado de CEDEARs</h1>

	{#if data.length > 0}
	<Top {data}></Top>
	<Search on:search={search} {searchedValue} />
		<Tabla
			on:unwatchlisted={(e) => unwatchlisted(e)}
			on:watchlisted={(e) => watchlisted(e)}
			{watchlist}
			data={filteredData}
			{columns}
		/>
	{:else}
		<div class="loader">
			<BarLoader color="#4e76fe" />
		</div>
	{/if}
	{#if searchedValue.length > 0}
		<Share />
	{/if}
</main>

<Cafecito />

<Nav />

<style>
	main {
		width: 720px;
		margin: 2rem auto;
		max-width: 90vw;
		margin-bottom: 8rem;
	}
	h1 {
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 20rem;
	}
	@media screen and (max-width: 700px) {
		h1 {
			font-size: 1.5rem;
		}

		main {
			margin-bottom: 6rem;
		}
	}
</style>
