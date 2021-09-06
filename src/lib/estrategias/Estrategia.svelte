<script>
	import Tabla from '$lib/UI/Tabla.svelte';
    import { BarLoader } from 'svelte-loading-spinners';
    import Share from '$lib/UI/Share.svelte';
	export let data;
	export let nombre;
	export let descripcion;
    export let columns;
    export let watchlist;
    export let cedears;
</script>

<h3>{nombre}</h3>
<p>{descripcion}</p>

{#if data.length > 0}
	  <Tabla
		on:unwatchlisted
		on:watchlisted
		{watchlist}
		data={data.filter(item => cedears.includes(item.symbol))}
		{columns}
	  />
	{:else}
	  <div class="loader">
		<BarLoader color="#4e76fe" />
	  </div>
	{/if}



<style>
	h3 {
		font-family: 'Nunito', sans-serif;
		font-weight: 800;
	}
	p {
		font-family: 'Nunito', sans-serif;
		font-weight: 400;
	}
    .loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 20rem;
	}
</style>
