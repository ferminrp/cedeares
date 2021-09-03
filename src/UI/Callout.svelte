<script>
    import Close from "svelte-material-icons/Close.svelte";
    export let color = 'red';

    let display = true;
</script>

{#if display}
<article style="background-color: {color}">
<slot></slot>
<div on:click="{() => display=false}">
    <Close></Close>
</div>
</article>
{/if}

<style>
    article {
        padding: 1.5rem;
        margin: 2rem 0;
        box-sizing: border-box;
        border-radius: 0.5rem;
        position: relative;
    }

    div {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }
</style>