import App from './App.svelte';

async function installServiceWorkerAsync() {
	if ("serviceWorker" in navigator) {
		try {
			let serviceWorker = await navigator.serviceWorker.register(
				"sw.js",
				{ scope: "/" }
			);
		} catch (err) {
			console.error(`Failed to register service worker: ${err}`);
		}
	}
}

async function checkCacheValidity() {

}

const app = new App({
	target: document.body,
	props: {}
});

installServiceWorkerAsync();

export default app;