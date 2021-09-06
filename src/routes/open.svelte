<script context="module">
	export const prerender = false;
</script>

<script>
	import Cafecito from '$lib/UI/Cafecito.svelte';
	import Nav from '$lib/UI/Nav.svelte';
</script>

<svelte:head>
	<script src="https://scripts.simpleanalyticscdn.com/embed.js"></script>
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

	<h3>Trafico de los ultimos 30 dias</h3>
	<div class="wrapper">
		<iframe
			src="https://simpleanalytics.com/cedears.ar?color=eb5425&embed=true&graph_id=1"
			frameborder="0"
		/>
	</div>
	<p>Comenzó a trackear el 2021-09-05</p>
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

	.wrapper {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 */
		padding-top: 25px;
		height: 0;
	}
	.wrapper iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
