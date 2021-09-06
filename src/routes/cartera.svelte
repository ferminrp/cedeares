<script context="module">
	export const prerender = true;
</script>

<script>
	import { BarLoader } from 'svelte-loading-spinners';
	import NuevaInversion from '$lib/cartera/NuevaInversion.svelte';
	import Cafecito from '$lib/UI/Cafecito.svelte';
	import Nav from '$lib/UI/Nav.svelte';
	import CarteraEmpty from '$lib/cartera/CarteraEmpty.svelte';
	import Button from '$lib/UI/Button.svelte';
	import CarteraUsuario from '$lib/cartera/CarteraUsuario.svelte';
	import ValorTotal from '$lib/cartera/ValorTotal.svelte';

	let data = [];
	let columns = ['', '', 'Ticker', 'Nombre', 'Precio', 'Cambio'];
	let watchlist = [];
	let cartera = [];
	let adding = false;
	let carteraEnriquecida;
	let loading = true;
	let valorTotal;
	let selectedCedear;
	let unidades;

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
			if (
				JSON.parse(localStorage.getItem('cartera')) !== null &&
				JSON.parse(localStorage.getItem('cartera')).length > 0
			) {
				cartera = JSON.parse(localStorage.getItem('cartera'));
			}
			loading = false;
		})
		.catch(function (error) {
			console.log(error);
		});

	function newItem(e) {
		let newAddition = {
			symbol: e.detail.symbol,
			unidades: e.detail.unidades
		};
		cartera = cartera.filter((item) => item.symbol !== e.detail.symbol);
		cartera = [...cartera, newAddition];
		localStorage.setItem('cartera', JSON.stringify(cartera));
		selectedCedear = '';
		unidades = '';
	}

	$: {
		if (cartera.length > 0) {
			let withoutPercent = [];
			cartera.forEach((item) => {
				let nuevoObjeto = {};
				nuevoObjeto.symbol = item.symbol;
				nuevoObjeto.unidades = item.unidades;
				nuevoObjeto.price = parseFloat(
					data
						.find((element) => element.symbol === item.symbol)
						.price.substring(1)
						.replace(',', '')
				);
				nuevoObjeto.totalValue = nuevoObjeto.unidades * nuevoObjeto.price;
				nuevoObjeto.name = data.find((element) => element.symbol === item.symbol).name;
				nuevoObjeto.change = data.find((element) => element.symbol === item.symbol).change;
				nuevoObjeto.image = data.find((element) => element.symbol === item.symbol).image;
				withoutPercent.push(nuevoObjeto);
			});
			let valorPortfolio = withoutPercent.reduce((acc, item) => acc + item.totalValue, 0);
			valorTotal = valorPortfolio;
			let withPercent = [];
			withoutPercent.forEach((item) => {
				let nuevoObjeto = item;
				nuevoObjeto.percent = (item.totalValue / valorPortfolio) * 100;
				withPercent.push(nuevoObjeto);
			});
			carteraEnriquecida = withPercent;
			console.log(withPercent);
		}
	}

	function deleteItem(event) {
		let symbol = event.detail.symbol;
		cartera = cartera.filter((item) => item.symbol !== symbol);
		localStorage.setItem('cartera', JSON.stringify(cartera));
	}

	function editItem(event) {
		selectedCedear = event.detail.symbol;
		unidades = event.detail.unidades;
		console.log(event.detail.unidades);
		adding = true;
		localStorage.setItem('cartera', JSON.stringify(cartera));
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Tu Cartera</title>
	<meta name="title" content="Tu cartera de CEDEARs" />
	<meta name="description" content="Tu cartera de inversion en CEDEARs" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cedears.ar/" />
	<meta property="og:title" content="Tu cartera de CEDEARs" />
	<meta property="og:description" content="Tu cartera de inversion en CEDEARs" />
	<meta property="og:image" content="https://cedears.ar/assets/meta_image.jpg" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@ferminrp" />
	<meta name="twitter:creator" content="@ferminrp" />
	<meta property="twitter:url" content="https://cedears.ar/" />
	<meta property="twitter:title" content="Tu cartera de CEDEARs" />
	<meta property="twitter:description" content="Tu cartera de inversion en CEDEARs" />
	<meta property="twitter:image" content="https://cedears.ar/assets/meta_image.jpg" />
</svelte:head>

<main>
	{#if loading}
		<div class="loader">
			<BarLoader />
		</div>
	{/if}
	{#if adding}
		<NuevaInversion
			on:new={(event) => newItem(event)}
			on:cancelar={() => (adding = false)}
			{selectedCedear}
			{unidades}
			{watchlist}
			{cartera}
			{data}
		/>
	{:else if !adding && !loading && cartera.length > 0}
		<h1>Tu cartera</h1>
		<CarteraUsuario
			on:editItem={(event) => editItem(event)}
			on:deleteItem={(event) => deleteItem(event)}
			{carteraEnriquecida}
		/>
		<ValorTotal
			>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
				valorTotal
			)}</ValorTotal
		>
		<Button on:click={() => (adding = true)}>Añadir Inversion</Button>
	{/if}
	{#if cartera.length == 0 && !adding && !loading}
		<CarteraEmpty on:click={() => (adding = true)} />
	{/if}
</main>

<Cafecito />

<Nav page="cartera" />

<style>
	main {
		width: 800px;
		margin: 2rem auto 5rem auto;
		max-width: 90vw;
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

		* {
			-webkit-text-size-adjust: none;
			text-size-adjust: none;
		}

	}
</style>
