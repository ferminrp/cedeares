<script>
	import Button from '$lib/UI/Button.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let watchlist;
	export let cartera;
	export let data;

    export let selectedCedear = ''
    export let unidades = 1

	let error;

	$: {
		if (selectedCedear.length > 0 && !filteredDataSymbols.includes(selectedCedear)) {
			error = true;
		} else {
			error = false;
		}
	}


    let symbolsCartera = cartera.map((cedear) => cedear.symbol);

	$: filteredData = data.filter(item => !symbolsCartera.includes(item.symbol));

	$: filteredDataSymbols = filteredData.map(item => item.symbol);
	console.log(filteredDataSymbols);

	function addInversion() {
        dispatch('new',{
            symbol: selectedCedear,
            unidades: unidades
        });
        dispatch('cancelar');
    }

	function cancelar() {
		dispatch('cancelar');
	}
</script>

<div>
	<h3>Vamos a añadir una inversion!</h3>

	<label for="cedear">Que CEDEAR queres sumar?</label>
	<input bind:value={selectedCedear} type="text" id="cedear" name="cedear" list="cedeares" />
	{#if error}
		<p class="error">Ese no es un ticker valido</p>
	{/if}

	<datalist id="cedeares">
		{#each filteredData as cedear, i}
			<option>{cedear.symbol}</option>
		{/each}
	</datalist>

    <label for="unidades">Cuantas unidades?</label>
    <input type="number" bind:value={unidades} />

	<div class="ctas">
		<Button disabled="{error}" on:click={addInversion}>Añadir</Button>
		<p on:click={cancelar}>Cancelar</p>
	</div>
</div>

<style>
	div {
		font-family: 'Nunito', sans-serif;
	}
	.ctas {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.ctas p {
		color: #eb5425;
	}

    input {
        width: 100%;
        padding: 0.8rem;
        box-sizing: border-box;
        margin-top: 1rem;
        margin-bottom: 2rem;
        border-radius: 0.3rem;
        border: 1px solid #ccc;
    }

	.error {
		color: red;
		margin-top: -2rem;
		margin-bottom: 2rem;
	}

</style>
