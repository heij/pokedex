<script>
	import Router from "svelte-spa-router";
	import { link } from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";

	import PokeList from "./routes/pokeList.svelte";
	import Details from "./routes/details.svelte";

	const routes = {
		"/": PokeList,
		"/pokemon/:id": wrap({
			component: Details,
			props: {},
		}),
	};
</script>

<main>
	<Router {routes} />
</main>

<style type="text/scss">
	main {
		position: relative;
		min-height: 100vh;
		width: 100%;
		// overflow: hidden;
		background: #868686;

		// height: 100vh;
		// display: flex;
		// flex-direction: column;
	}

	.page-wrapper {
		flex: 1;
		overflow-x: hidden;
		overflow-y: auto;
	}
</style>
