<script>
  export let data;
  export let columns;

 console.log(parseFloat(data[0]["change"]));
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
        <td class="{parseFloat(row.change) < 0 ? 'red' : 'green'}" >{row.change}</td>
      </tr>
    {/each}
  </table>
</div>

<style>

  th {
	  background-color: black;
	  color: white;
	  box-sizing: border-box;
	  padding: 1rem;
  }

  .red {
	  color:red;
  }

  .green {
	  color: green;
  }

</style>
