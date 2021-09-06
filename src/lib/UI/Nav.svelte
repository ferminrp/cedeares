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
	<a class={page == 'invertir' ? 'orange' : ''} href="/invertir">
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M4.75 11.25L10.25 5.75"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M5.75 19.2502H6.25C6.80229 19.2502 7.25 18.8025 7.25 18.2502V15.75C7.25 15.1977 6.80229 14.75 6.25 14.75H5.75C5.19772 14.75 4.75 15.1977 4.75 15.75V18.2502C4.75 18.8025 5.19772 19.2502 5.75 19.2502Z"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M11.75 19.2502H12.25C12.8023 19.2502 13.25 18.8025 13.25 18.2502V12.75C13.25 12.1977 12.8023 11.75 12.25 11.75H11.75C11.1977 11.75 10.75 12.1977 10.75 12.75V18.2502C10.75 18.8025 11.1977 19.2502 11.75 19.2502Z"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M17.75 19.2502H18.25C18.8023 19.2502 19.25 18.8025 19.25 18.2502V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H17.75C17.1977 4.75 16.75 5.19772 16.75 5.75V18.2502C16.75 18.8025 17.1977 19.2502 17.75 19.2502Z"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M11.25 8.25V4.75H7.75"
			/>
		</svg>

		<p>Invertir</p>
	</a>
	<a href="/cartera" class={page == 'cartera' ? 'orange' : ''}>
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 9.75C4.75 8.64543 5.64543 7.75 6.75 7.75H17.25C18.3546 7.75 19.25 8.64543 19.25 9.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V9.75Z"></path>
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.75 7.5V6.75C8.75 5.64543 9.64543 4.75 10.75 4.75H13.25C14.3546 4.75 15.25 5.64543 15.25 6.75V7.5"></path>
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13.25H19"></path>
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.75 11.75V14.25"></path>
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 11.75V14.25"></path>
		  </svg>
		  <p>Cartera</p>
	
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
		color: #4E76FE;
	}

	/* CELLPHONE MEDIA QUERY */
	@media (max-width: 767px) {
		svg {
			margin-right: 0.5rem;
		}
	}

	@media (max-width: 400px) {
		a {
			font-size: 0.8rem;
		}
	}
</style>
