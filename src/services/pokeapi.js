const domain = 'https://pokeapi.co/api/v2';

function fetchUrl(url) {
    return fetch(url).then(res => res.json());
}

function request(endpoint, path = '', params = null) {
    let url = buildUrl(endpoint, path, params);

    return fetchUrl(url);
}

function buildUrl(endpoint, resource, params) {
    let url = domain + endpoint;

    if (resource) url += `/${resource}`;
    if (params) {
        url += `?${new URLSearchParams(params)}`;
    }

    return url;
}

function getAllFrom(baseUrl) {
    return request(baseUrl)
        .then(({ count }) => request(baseUrl, '', { limit: count }))
        .then(({ results }) => results);
}

function getPokemon(nameOrId, query) {
    return request(`/pokemon`, nameOrId, query);
}

function getSpecies(nameOrId, query) {
    return request(`/pokemon-species`, nameOrId, query);
}

function getAllSpecies() {
    return getAllFrom('/pokemon-species');
}

function getEvolutionChain(nameOrId, query) {
    return request(`/evolution-chain`, nameOrId, query);
}

function getMove(nameOrId, query) {
    return request(`/move`, nameOrId, query);
}

function getAbility(nameOrId, query) {
    return request(`/ability`, nameOrId, query);
}

function getForms(nameOrId, query) {
    return request(`/pokemon-form`, nameOrId, query);
}

function getMainColor(nameOrId, query) {
    return request(`/pokemon-color/`, nameOrId, query);
}

function getGames() {
    return request(`/version`);
}

module.exports = {
    request,
    fetchUrl,
    getAllFrom,
    getPokemon,
    getSpecies,
    getEvolutionChain,
    getForms,
    getMove,
    getAbility,
    getMainColor,
    getGames,
    getAllSpecies
}