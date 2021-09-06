<script>
    export let nombre;
    export let url;
    export let logo;
</script>


<a href="{url}" data-splitbee-event="{nombre}" target="_blank">
    <article>
        <img src="{logo}" alt="">
        <h3>{nombre}</h3>
    </article>
</a>

<style>
    a {
        text-decoration: none;
        color: #000;
        font-family: 'Nunito', sans-serif;
    }

    article {
        width: 100%;
        height: 100%;
        background-color:transparent;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.5rem;
        padding: 2rem 0;
        margin-top: 2rem;
        box-sizing: border-box;
    }

    img {
        max-width: 50px;
        border-radius: 50%;
        margin-right: 1rem;
    }
</style>

