<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Invertir</title>
	<meta name="title" content="Donde invertir en CEDEARs" />
	<meta name="description" content="Listado de brokers para invertir en CEDEARs" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://cedears.ar/" />
	<meta property="og:title" content="Donde invertir en CEDEARs" />
	<meta property="og:description" content="Listado de brokers para invertir en CEDEARs" />
	<meta property="og:image" content="https://cedears.ar/assets/meta_image.jpg" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@ferminrp" />
	<meta name="twitter:creator" content="@ferminrp" />
	<meta property="twitter:url" content="https://cedears.ar/" />
	<meta property="twitter:title" content="Donde invertir en CEDEARs" />
	<meta property="twitter:description" content="Listado de brokers para invertir en CEDEARs" />
	<meta property="twitter:image" content="https://cedears.ar/assets/meta_image.jpg" />
</svelte:head>


<script context="module">
	export const prerender = true;
</script>

<script>
	import Nav from '$lib/UI/Nav.svelte';
	import Sponsored from '$lib/brokers/Sponsored.svelte';
	import Broker from '$lib/brokers/Broker.svelte';
    import Cafecito from '$lib/UI/Cafecito.svelte';

	let brokers = [
		{
			nombre: 'Balanz',
			logo: 'https://www.balanz.com/assets/favicon-link.png',
			url: 'https://www.balanz.com/cedears.html?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
		},
		{
			nombre: 'Invertir Online',
			logo: 'https://i.imgur.com/DScN2mo.jpg?1',
			url: 'https://www.invertironline.com/productos/cedears?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
		},
		{
			nombre: 'Portfolio Personal',
			logo: 'https://pbs.twimg.com/profile_images/1046600951094812674/shinD2WC_400x400.jpg',
			url: 'https://www.portfoliopersonal.com/Inversiones/cedears?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
		},
        {
            nombre: 'Front',
            logo: 'https://i.imgur.com/pxhayBh.jpg',
            url: 'https://www.front.com.ar?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
        },
        {
            nombre: 'Banza',
            logo: 'https://play-lh.googleusercontent.com/YEoZgszntAKgLZYRGSzOm0jz4yHPf5EMDh-yWKfvpPrajtDRHxpzxAV25Kvr29yCxTE',
            url: 'https://banza.com.ar/cedears?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
        },
		{
			nombre: 'Cocos Capital',
			logo: 'https://i.imgur.com/oYTGgnt.png',
			url: 'https://cocos.com.ar/?utm_source=cedears.ar&utm_medium=cedears.ar&utm_campaign=cedears.ar&utm_id=cedears.ar&utm_term=cedears.ar&utm_content=cedears.ar'
		}

	];


    /* Mezclo los brokers para que aparezcan siempre en distintas posiciones */
	function shuffle(array) {
		var currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	let brokersShuffled = shuffle(brokers);

</script>

<main>
	<h1>Brokers Recomendados</h1>
	<Sponsored />
	{#each brokersShuffled as broker, i}
		<Broker on:click="{() => sa_event(broker.nombre)}" id="{i}" nombre={broker.nombre} logo={broker.logo} url={broker.url} />
	{/each}
</main>

<Nav page="invertir" />

<Cafecito />

<style>
	main {
		width: 720px;
		margin: 2rem auto 5rem auto;
		max-width: 90vw;
		padding-bottom: 8rem;
	}
	h1 {
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
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
