<script>
    export let data;
	export let columns;
    /*https://gridjs.io/docs/hello-world*/
    import Grid from "gridjs-svelte";

    let grid

	$: if (grid) {
		// add plugin
		grid.updateConfig(
			{search: {
    			enabled: true
			},
			sort: {
				enabled: true
			},
			fixedHeader: {
				enabled: true
			}
		});
		
		// we need to force rendering so the plugin can show up
		grid.forceRender()
	}
</script>

<Grid bind:instance={grid} {data} {columns} />

<style global>
	@import "https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css";
  </style>