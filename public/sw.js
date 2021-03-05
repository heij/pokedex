const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/;
const apiRe = /https:\/\/pokeapi\.co\/api\/v2\/.*/;
const gamesRe = /https:\/\/pokeapi\.co\/api\/v2\/version/;
const version = 2;

const pokeApiCache = "pokeapi-" + version;

self.addEventListener('fetch', (event) => {
    if (event.request.url.match(gamesRe)) {
        return false;
    }

    let apiReq = event.request.url.match(apiRe);
    let imgReq = event.request.url.match(imgRe);

    if (apiReq || imgReq) {
        event.respondWith(caches.match(event.request).then((response) => {
            if (response) {
                // console.log(`Is cached: ${event.request.url}`);
                return response;
            }

            return fetch(event.request).then((response) => {
                caches.open(pokeApiCache).then((cache) => {
                    cache.add(event.request.url);
                });
                return response;

            }).catch((error) => {
                console.error(error);
            });
        }));
    }
})

self.addEventListener('install', (event) => {
    let versionUrl = 'https://pokeapi.co/api/v2/version';
    fetch(versionUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error();
            }

            let clone = res.clone();

            clone.json().then(parsedRes => {

                caches.open(pokeApiCache).then((cache) => {
                    cache.match(versionUrl).then(cachedRes => {
                        if (cachedRes && parsedRes.count != cachedRes.count) {
                            caches.delete(pokeApiCache);
                        }

                        cache.put(versionUrl, res);
                    });
                });

            });

        });

    console.log('install');
})
