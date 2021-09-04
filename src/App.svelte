<script>
  import Tabla from "./UI/Tabla.svelte";
  import { BarLoader } from "svelte-loading-spinners";
  import Callout from "./UI/Callout.svelte";
  import Search from "./UI/Search.svelte";
  import Share from "./UI/Share.svelte";

  let data = [];
  let columns = ["","", "Ticker", "Nombre", "Precio", "Cambio"];
  let searchedValue = "";
  let filteredData = [];
  let watchlist = [];

  $: {
    if (searchedValue === "") {
      filteredData = data;
    } else {
      filteredData = data.filter(
        (cedear) =>
          cedear.symbol.includes(searchedValue.toUpperCase()) ||
          cedear.name.toUpperCase().includes(searchedValue.toUpperCase())
      );
    }
  }

  const cedeares = fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU"
  )
    .then((response) => response.json())
    .then((info) => {
      for (let i = 0; i < info.values.length; i++) {
        let row = {};
        row.symbol = info.values[i][0];
        row.name = info.values[i][1];
        row.price = info.values[i][2];
        row.change = info.values[i][3];
        info.values[i][4] !== undefined
          ? (row.image = info.values[i][4])
          : (row.image = "https://i.imgur.com/ERGz8GO.png");
        data = [...data, row];
      }
      urlReader();
      if (JSON.parse(localStorage.getItem("watchlist")) !== null) {
        watchlist = JSON.parse(localStorage.getItem("watchlist"));
      }
    });

  function search(e) {
    searchedValue = e.detail.searchedValue;
    if (searchedValue === "") {
      window.history.pushState(
        { page: "Listado de Cedears" },
        "Listado de Cedears",
        window.location.origin
      );
    } else {
      window.history.pushState(
        { page: "Listado de Cedears" },
        "Listado de Cedears",
        window.location.origin + "/?search=" + searchedValue
      );
      window.splitbee.track("Search", {
      "searchedValue": searchedValue,
    });
    }
    
  }

  function urlReader() {
    // Read search params in url
    let searchParams = window.location.search;
    let searchQuery = new URLSearchParams(searchParams);
    let searchValue = searchQuery.get("search");
    searchValue !== null ? (searchedValue = searchValue) : (searchedValue = "");
  }

  function watchlisted(event) {
    let symbol = event.detail.symbol;
    // Add symbol to watchlist
    watchlist = [...watchlist, symbol];
    // Save watchlist in localStorage
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    console.log(JSON.parse(localStorage.getItem("watchlist")));

    window.splitbee.track("Watchlisted", {
      "symbol": symbol
    });
  }

  function unwatchlisted(event) {
    let symbol = event.detail.symbol;
    // Add symbol to watchlist
    watchlist = watchlist.filter((cedear) => cedear !== symbol);
    // Save watchlist in localStorage
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    console.log(JSON.parse(localStorage.getItem("watchlist")));

    window.splitbee.track("unwatchlisted", {
      "symbol": symbol
    });
  }
</script>

<main>
  <h1>Listado de CEDEARs</h1>

  <Callout color="#FDD2C1"
    >Bienvenido! Aca vas a poder analizar todos los CEDEARs que actualmente
    cotizan en el mercado.</Callout
  >
  <Search on:search={search} {searchedValue} />
  {#if data.length > 0}
    <Tabla on:unwatchlisted="{(e)=> unwatchlisted(e)}" on:watchlisted="{(e)=> watchlisted(e)}" {watchlist} data={filteredData} {columns} />
  {:else}
    <div class="loader">
      <BarLoader />
    </div>
  {/if}
  {#if searchedValue.length > 0}
    <Share />
  {/if}
</main>

<style>
  main {
    width: 720px;
    margin: auto;
    max-width: 90vw;
  }

  h1 {
    font-family: "Nunito", sans-serif;
    font-weight: 800;
  }

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20rem;
  }
</style>
