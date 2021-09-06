<button on:click><slot><!-- optional fallback --></slot></button>

<style>
    button {
        border: none;
        border-radius: 0.5rem;
        background-color: #eb5425;
        color: white;
        font-family: "Nunito", sans-serif;
        padding: 1rem 0;
        width: 80%;
        font-weight: bold;
        margin-top: 2rem;
        cursor: pointer;
    }
</style>