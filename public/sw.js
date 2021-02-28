const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/;
const apiRe = /http:\/\/pokeapi\.co\/api\/v2\/.*/
const version = 1;

self.addEventListener('fetch', (event) => {
    if (event.request.url.match(apiRe) || event.request.url.match(imgRe)) {
        event.respondWith(caches.match(event.request).then((response) => {
            if (response) {
                console.log(`Is cached: ${event.request.url}`)
                return response
            }

            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open("pokeapi-" + version).then((cache) => {
                    // The response is opaque, if it fails cache.add() will reject it
                    cache.put(event.request, responseToCache)
                })
                return response;

            }).catch((error) => {
                console.error(error)
            })
        }))
    }
})

// self.addEventListener('install', function (event) {
//     self.skipWaiting();
// })
