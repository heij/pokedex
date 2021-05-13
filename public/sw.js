const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/;
const dataRe = /https:\/\/pokeapi\.co\/api\/v2\/.*/;
const gamesRe = /https:\/\/pokeapi\.co\/api\/v2\/version/;
const version = 1;

const pokeApiDataCache = `pokeapi-data`;
const pokeApiImgCache = `pokeapi-imgs`;
const dexAssets = `dex-assets`;

const staticAssets = [
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
];

self.addEventListener('fetch', (event) => {
    if (event.request.url.indexOf('http') !== 0) {
        return false;
    }
    
    if (event.request.url.match(gamesRe)) {
        return false;
    }

    let dataReq = event.request.url.match(dataRe);
    let imgReq = event.request.url.match(imgRe);

    let cacheName;
    if (dataReq) { cacheName = pokeApiDataCache }
    else if (imgReq) { cacheName = pokeApiImgCache }
    else { cacheName = dexAssets }

    respondAndCache(event, cacheName);
})

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());

    console.log('install');
})

self.addEventListener('activate', (event) => {
    console.log('activate');

    event.waitUntil(Promise.all([
        self.clients.claim(),
        checkAPICacheValidity(),
        caches.delete(dexAssets)
            .then(() => 
                caches.open(dexAssets)
                    .then((cache) => cache.addAll(staticAssets))
            ),
    ]));
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

function checkAPICacheValidity() {
    let versionUrl = 'https://pokeapi.co/api/v2/version';

    return fetch(versionUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error();
            }

            let clone = res.clone();

            return clone.json().then(parsedRes => 
                caches.open(pokeApiDataCache).then(cache => 
                    cache.match(versionUrl).then(async cachedRes => {
                        if (cachedRes) {
                            let cachedJson = await cachedRes.json();
                            if (parsedRes.count != cachedJson.count) {
                                await caches.delete(pokeApiDataCache);
                            }
                        }

                        return cache.put(versionUrl, res);
                    })
                )

            );

        });
}