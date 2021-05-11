<script>
	import Router from "svelte-spa-router";
	import { location } from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";

	import PokeList from "./routes/PokeList.svelte";
	import Details from "./routes/Details.svelte";
	import About from "./routes/About.svelte";
	import Navbar from "./components/Navbar.svelte";

	const routes = {
		"/": PokeList,
		"/pokemon/:id": wrap({
			component: Details,
			props: {},
		}),
		"/about": About,
	};
</script>

<main>
	<Navbar currentUrl={location} />
	<div class="page-wrapper">
		<Router {routes} />
	</div>
</main>

<style type="text/scss">
	main {
		position: relative;
		width: 100vw;
		height: 100vh;
		background: var(--main-color);
		overflow: hidden;

		display: flex;
		flex-direction: column;
	}

	.page-wrapper {
		position: relative;
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
