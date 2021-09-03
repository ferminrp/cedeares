<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();


    let searchedValue = '';

    function search() {
        dispatch('search', {
            searchedValue
        })
    }
</script>

<input on:keyup="{search}" bind:value="{searchedValue}" type="text" placeholder="AAPL">

<style>
    input {
        border-radius: 3px;
    }

    input:focus-visible {
        outline: none;
        border: 2px solid #FF3E00;
    }
</style>