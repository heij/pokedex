<script>
	import Router from "svelte-spa-router";
	import { link } from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";

	import PokeList from "./routes/pokeList.svelte";
	import Details from "./routes/details.svelte";

	// async function installServiceWorkerAsync() {
	// 	if ("serviceWorker" in navigator) {
	// 		try {
	// 			let serviceWorker = await navigator.serviceWorker.register(
	// 				"./sw.js"
	// 			);
	// 			console.log(serviceWorker);
	// 		} catch (err) {
	// 			console.error(`Failed to register service worker: ${err}`);
	// 		}
	// 	}
	// }

	const routes = {
		"/": PokeList,
		"/pokemon/:id": wrap({
			component: Details,
			props: {},
		}),
	};

	// installServiceWorkerAsync();
</script>

<main>
	<Router {routes} />
</main>

<style type="text/scss">
	main {
		position: relative;
		min-height: 100vh;
		height: 100%;
		width: 100%;
		overflow-x: hidden;
		background: rgb(223, 172, 172);
	}

	@media (min-width: 640px) {
	}
</style>
