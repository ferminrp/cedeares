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
				{ page: 'Estadisticas abiertas de Cedears.ar' },
				'Estadisticas abiertas de Cedears.ar',
				window.location.origin
			);
		} else {
			window.history.pushState(
				{ page: 'Estadisticas abiertas de Cedears.ar' },
				'Estadisticas abiertas de Cedears.ar',
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
	<title>Open Stats</title>
	<meta name="title" content="Estadisticas abiertas de Cedears.ar" />
	<meta name="description" content="Todos los datos de trafico de cedears.ar" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cedears.ar/" />
	<meta property="og:title" content="Estadisticas abiertas de Cedears.ar" />
	<meta property="og:description" content="Todos los datos de trafico de cedears.ar" />
	<meta property="og:image" content="https://cedears.ar/assets/meta_image.jpg" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@ferminrp" />
	<meta name="twitter:creator" content="@ferminrp" />
	<meta property="twitter:url" content="https://cedears.ar/" />
	<meta property="twitter:title" content="Estadisticas abiertas de Cedears.ar" />
	<meta property="twitter:description" content="Todos los datos de trafico de cedears.ar" />
	<meta property="twitter:image" content="https://cedears.ar/assets/meta_image.jpg" />
</svelte:head>

<main>
	<h1>Open Stats</h1>

    <p>
        This website has <span id="pageviews"></span> page views in the last month.
      </p>
      <div
        data-sa-graph-url="https://simpleanalytics.com/cedears.ar?color=eb5425"
        data-sa-page-views-selector="#pageviews"
      >
        <p>
          Ad blockers don't like the Simple Analytics embed, disable yours to view
          this chart.
        </p>
      </div>
      <script src="https://scripts.simpleanalyticscdn.com/embed.js"></script>
</main>

<Cafecito />

<Nav />

<style>
	main {
		width: 720px;
		margin: 2rem auto;
		max-width: 90vw;
        font-family: 'Nunito', sans-serif;
	}
	h1 {
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}

</style>
