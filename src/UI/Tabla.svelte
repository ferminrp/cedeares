<script>
  export let data;
  export let columns;
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
  }

  td:nth-child(4) {
    text-align: right;
  } 

  .red {
    color: red;
  }

  .green {
    color: green;
  }
</style>
