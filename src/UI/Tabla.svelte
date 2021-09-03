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
        <td>
          <img src="{row.image}" loading="lazy" alt="{row.name}">
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
    padding: 0.8rem 1rem;
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

  tr:hover {
    background-color: #eff2f5;
  }
</style>
