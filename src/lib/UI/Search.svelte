<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();


    export let searchedValue = '';

    function search() {
        dispatch('search', {
            searchedValue
        })
    }
</script>

<input on:keyup="{search}" bind:value="{searchedValue}" type="text" placeholder="AAPL">

<style>
    input {
        border-radius: 5px;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        border: 1px solid #ff3e0080;
        font-family: "Nunito", sans-serif;
        font-weight: 300;
    }

    input:focus-visible {
        outline: none;
        border: 2px solid #FF3E00;
    }

</style>