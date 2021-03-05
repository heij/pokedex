const domain = 'https://pokeapi.co/api/v2';

function fetchUrl(url) {
    return fetch(url).then(res => res.json());
}

function request(endpoint, path, params) {
    let url = buildUrl(endpoint, path, params);

    return fetchUrl(url);
}

function buildUrl(endpoint, resource, query) {
    let url = domain + endpoint;

    if (resource) url += `/${resource}`;
    if (query) {
        url += `?${new URLSearchParams(query)}`;
    }

    return url;
}

function getPokemon(nameOrId, query) {
    return request(`/pokemon`, nameOrId, query);
}

function getSpecies(nameOrId, query) {
    return request(`/pokemon-species`, nameOrId, query);
}

function getEvolutionChain(nameOrId, query) {
    return request(`/evolution-chain`, nameOrId, query);
}

function getMove(nameOrId, query) {
    return request(`/move`, nameOrId, query);
}

function getAbilities(nameOrId, query) {
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

function getAllSpecies() {
    return getSpecies()
        .then(({ count }) => getSpecies(null, { limit: count }))
        .then(({ results }) => results)
    // let { count } = await getSpecies();
    // let species = (await getSpecies(null, { limit: count })).results;
    // console.log(species)

    // return species;
}

module.exports = {
    fetchUrl,
    getPokemon,
    getSpecies,
    getEvolutionChain,
    getForms,
    getMove,
    getAbilities,
    getMainColor,
    getGames,
    getAllSpecies
}