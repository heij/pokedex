const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/;
const dataRe = /https:\/\/pokeapi\.co\/api\/v2\/.*/;
const gamesRe = /https:\/\/pokeapi\.co\/api\/v2\/version/;
const version = 3;

const pokeApiDataCache = `pokeapi-data-${version}`;
const pokeApiImgCache = `pokeapi-imgs-${version}`;
const dexIcons = `dex-assets`;

self.addEventListener('fetch', (event) => {
    if (event.request.url.match(gamesRe)) {
        return false;
    }

    let dataReq = event.request.url.match(dataRe);
    let imgReq = event.request.url.match(imgRe);
    if (!dataReq && !imgReq) {
        return false;
    }

    let cacheName;
    if (dataReq) { cacheName = pokeApiDataCache }
    if (imgReq) { cacheName = pokeApiImgCache }

    respondAndCache(event, cacheName);
})

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());

    console.log('install');
})

self.addEventListener('activate', (event) => {
    event.waitUntil(Promise.all([
        self.clients.claim(),
        checkCacheValidity(),
        caches.open(dexIcons)
            .then((cache) => {
                return cache.addAll([
                    '/assets/1x/back_arrow.png',
                    '/assets/1x/pokeball_md.png',
                    '/assets/1x/pokeball.png',
                    '/assets/stat_icons/light/atk_light.png',
                    '/assets/stat_icons/light/def_light.png',
                    '/assets/stat_icons/light/hp_light.png',
                    '/assets/stat_icons/light/sp_atk_light.png',
                    '/assets/stat_icons/light/sp_def_light.png',
                    '/assets/stat_icons/light/spe_light.png',
                    '/assets/type_icons/circle/1x/bug.png',
                    '/assets/type_icons/circle/1x/dark.png',
                    '/assets/type_icons/circle/1x/dragon.png',
                    '/assets/type_icons/circle/1x/electric.png',
                    '/assets/type_icons/circle/1x/fairy.png',
                    '/assets/type_icons/circle/1x/fighting.png',
                    '/assets/type_icons/circle/1x/fire.png',
                    '/assets/type_icons/circle/1x/flying.png',
                    '/assets/type_icons/circle/1x/ghost.png',
                    '/assets/type_icons/circle/1x/grass.png',
                    '/assets/type_icons/circle/1x/ground.png',
                    '/assets/type_icons/circle/1x/ice.png',
                    '/assets/type_icons/circle/1x/normal.png',
                    '/assets/type_icons/circle/1x/poison.png',
                    '/assets/type_icons/circle/1x/psychic.png',
                    '/assets/type_icons/circle/1x/rock.png',
                    '/assets/type_icons/circle/1x/steel.png',
                    '/assets/type_icons/circle/1x/water.png',
                    '/index.html',
                    'build/bundle.css',
                    'build/bundle.js',
                ]);
            })
    ]))

    console.log('activate');
});

function respondAndCache(event, cacheName) {
    return event.respondWith(caches.open(cacheName).then(cache => {
        return cache.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(res => {
                cache.add(event.request.url);
                return res;
            }).catch((error) => {
                console.error(error);
            });
        });
    }));
}

function checkCacheValidity() {
    let versionUrl = 'https://pokeapi.co/api/v2/version';

    fetch(versionUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error();
            }

            let clone = res.clone();

            clone.json().then(parsedRes => {

                caches.open(pokeApiDataCache).then((cache) => {
                    cache.match(versionUrl).then(cachedRes => {
                        if (cachedRes && parsedRes.count != cachedRes.count) {
                            caches.delete(pokeApiDataCache);
                        }

                        cache.put(versionUrl, res);
                    });
                });

            });

        });

}