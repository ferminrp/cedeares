<script>
	export let page = 'home';
</script>

<nav>
	<a class={page == 'home' ? 'orange' : ''} href="/">
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M5.75 19.2502H18.25C18.8023 19.2502 19.25 18.8025 19.25 18.2502V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H5.75C5.19772 4.75 4.75 5.19772 4.75 5.75V18.2502C4.75 18.8025 5.19772 19.2502 5.75 19.2502Z"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M19.25 9.25L5.25 9.25"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M19.25 14.75L5.25 14.75"
			/>
		</svg>
		<p>Listado</p>
	</a>
	<a class={page == 'listados' ? 'orange' : ''} href="/listados">
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M18.25 7.75H5.75V16.75L4.75 19.25H19.25L18.25 16.75V7.75Z"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M18.25 7.75L16.25 4.75H7.75L5.75 7.75"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M9.75 10.75V11.75C9.75 12.9926 10.7574 14 12 14V14C13.2426 14 14.25 12.9926 14.25 11.75V10.75"
			/>
		</svg>
		<p>Packs</p>
	</a>
</nav>

<style>
	nav {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		background-color: white;
		height: 4rem;
		z-index: 1;
		border-top: 1px solid #e5e5e5;
		box-shadow: 0px -3px 14px 0px rgba(141, 141, 141, 0.49);
		-webkit-box-shadow: 0px -3px 14px 0px rgba(141, 141, 141, 0.49);
		-moz-box-shadow: 0px -3px 14px 0px rgba(141, 141, 141, 0.49);
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		font-family: 'Nunito', sans-serif;
	}

	a {
		text-decoration: none;
		color: black;
		display: flex;
		align-items: center;
	}

	svg {
		margin-right: 1rem;
	}

	.orange {
		color: #eb5425;
	}
</style>
