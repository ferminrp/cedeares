<script>
  import StarOutline from "svelte-material-icons/StarOutline.svelte";
  import Star from "svelte-material-icons/Star.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let data;
  export let columns;
  export let watchlist;

  $: priorityData = data.filter((row) => watchlist.includes(row.symbol));
  $: lowPriorityData = data.filter((row) => !watchlist.includes(row.symbol));


  function watchlisted(symbol) {
    console.log("Watchlisted " + symbol);
    dispatch("watchlisted", {
      symbol,
    });
  }

  
  function unwatchlist(symbol) {
    console.log("unWatchlisted " + symbol);
    dispatch("unwatchlisted", {
      symbol,
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
    {#each priorityData as row, index}
    <tr>
      {#if watchlist.includes(row.symbol)}
        <td on:click="{unwatchlist(row.symbol)}"><Star color="#EA5525" size="1.3rem" /></td>
      {:else}
        <td on:click={watchlisted(row.symbol)}
          ><StarOutline size="1.3rem" /></td
        >
      {/if}
      <td>
        <img src={row.image} loading="lazy" alt={row.name} />
      </td>
      <td>{row.symbol}</td>
      <td>{row.name}</td>
      <td>{row.price}</td>
      <td class={parseFloat(row.change) < 0 ? "red" : "green"}
        >{row.change}</td
      >
    </tr>
  {/each}
    {#each lowPriorityData as row, index}
      <tr>
        {#if watchlist.includes(row.symbol)}
          <td><Star color="#EA5525" size="1.3rem" /></td>
        {:else}
          <td on:click={watchlisted(row.symbol)}
            ><StarOutline size="1.3rem" /></td
          >
        {/if}
        <td>
          <img src={row.image} loading="lazy" alt={row.name} />
        </td>
        <td>{row.symbol}</td>
        <td>{row.name}</td>
        <td>{row.price}</td>
        <td class={parseFloat(row.change) < 0 ? "red" : "green"}
          >{row.change}</td
        >
      </tr>
    {/each}
  </table>
</div>

<style>
  div {
    border-radius: 5px;
  }
  table {
    font-family: "Nunito", sans-serif;
    border: none;
    border-collapse: collapse;
    min-width: 100%;
  }

  th {
    background-color: black;
    color: white;
    box-sizing: border-box;
    padding: 1rem;
  }

  td {
    border-bottom: 1px solid #eff2f5;
    padding: 0.8rem 1rem;
    font-weight: 600;
  }

  td:nth-child(6) {
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
</style>
