<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let carteraEnriquecida;
  $: carteraOrdenada = carteraEnriquecida.sort((a, b) => a.percent < b.percent ? 1 : -1);
	console.log(carteraEnriquecida);
	let columns = [
		'',
		'Ticker',
		'Nombre',
		'Precio',
		'Cantidad',
		'Total',
		'Alocación',
		'Cambio',
		'',
		''
	];

	function deleteItem(symbol) {
		console.log('deleting ' + symbol);
		dispatch('deleteItem', {
			symbol: symbol
		});
	}

  function editItem(symbol, unidades) {
		console.log('editing ' + symbol);
		dispatch('editItem', {
			symbol: symbol,
      unidades: unidades
		});
	}
</script>

<div style="overflow-x:auto;">
	<table>
		<tr>
			{#each columns as column, index}
				<th>{column}</th>
			{/each}
		</tr>
		{#each carteraOrdenada as row, index (row.symbol)}
			<tr>
				<td>
					<img src={row.image} loading="lazy" alt={row.name} />
				</td>
				<td>{row.symbol}</td>
				<td>{row.name}</td>
				<td
					>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
						row.price
					)}</td
				>
				<td>{row.unidades}</td>
				<td
					>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
						row.totalValue
					)}</td
				>
				<td>{row.percent.toFixed(2) + '%'}</td>
				<td class={parseFloat(row.change) < 0 ? 'red' : 'green'}>{row.change}</td>
				<td class="clickable" on:click={editItem(row.symbol, row.unidades)}
					><svg width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M4.75 19.25L9 18.25L18.2929 8.95711C18.6834 8.56658 18.6834 7.93342 18.2929 7.54289L16.4571 5.70711C16.0666 5.31658 15.4334 5.31658 15.0429 5.70711L5.75 15L4.75 19.25Z"
						/>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M19.25 19.25H13.75"
						/>
					</svg>
				</td>
				<td class="clickable" on:click={deleteItem(row.symbol)}>
					<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M6.75 7.75L7.59115 17.4233C7.68102 18.4568 8.54622 19.25 9.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75"
						/>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9.75 7.5V6.75C9.75 5.64543 10.6454 4.75 11.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.5"
						/>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M5 7.75H19"
						/>
					</svg>
				</td>
			</tr>
		{/each}
	</table>
</div>

<style>
	div {
		border-radius: 5px;
		margin-bottom: 3rem;
	}
	table {
		font-family: 'Nunito', sans-serif;
		border: none;
		border-collapse: collapse;
		min-width: 100%;
	}

	th {
		background-color: black;
		color: white;
		box-sizing: border-box;
		padding: 1rem;
		text-align: left;
	}

	td {
		border-bottom: 1px solid #eff2f5;
		padding: 0.8rem 0.3rem;
		font-weight: 600;
		font-size: 0.8rem;
	}

	td:nth-child(7) {
		text-align: right;
	}

	td:nth-child(8) {
		text-align: right;
	}

	.red {
		color: red;
	}

	.green {
		color: green;
	}

	img {
		border-radius: 50%;
		max-height: 1.5rem;
	}

	tr:hover {
		background-color: #eff2f5;
	}

	.clickable {
		cursor: pointer;
	}
</style>
