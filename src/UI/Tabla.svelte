<script>
  export let data;
  export let columns;

  console.log(data.slice(0, 10));
</script>

<div style="overflow-x:auto;">
  <table>
    <tr>
      {#each columns as column, index}
        <th>{column}</th>
      {/each}
    </tr>
    {#each data as row, index}
      <tr>
        {#if row.image !== undefined}
        <td>
          <img src="{row.image}" alt="">
        </td>
        {/if}
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
  table {
    font-family: "Nunito", sans-serif;
    border:none;
    border-collapse: collapse;
  }

  th {
    background-color: black;
    color: white;
    box-sizing: border-box;
    padding: 1rem;
  }

  td {
    border-bottom: 1px solid #eff2f5;
    padding-bottom: 0.8rem;
    padding-top: 0.8rem;
    font-weight: 600;
  }

  td:nth-child(5) {
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
</style>
