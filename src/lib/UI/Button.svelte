<script>
    export let disabled = false;
</script>

{#if disabled}
    <button disabled><slot><!-- optional fallback --></slot></button>
{:else}
    <button on:click><slot><!-- optional fallback --></slot></button>
{/if}


<style>
    button {
        border: none;
        border-radius: 0.5rem;
        background-color: #4E76FE;
        color: white;
        font-family: "Nunito", sans-serif;
        padding: 1rem 0;
        width: 100%;
        font-weight: bold;
        margin-top: 2rem;
        cursor: pointer;
    }

    button:disabled {
        background-color: gray;
    }
</style>