const domain = 'https://pokeapi.co/api/v2';

function request(url) {
    return fetch(`${domain}${url}`).then(res => res.json());
}

function getPokemon(nameOrId) {
    return request(`/pokemon/${nameOrId}`);
}

function getSpecies(nameOrId) {
    return request(`/pokemon-species/${nameOrId}`);
}

function getEvolutionChain(nameOrId) {
    return request(`/evolution-chain/${nameOrId}`);
}

function getMove(nameOrId) {
    return request(`/move/${nameOrId}`);
}

function getAbilities(nameOrId) {
    return request(`/ability/${nameOrId}`);
}

function getForms(nameOrId) {
    return request(`/pokemon-form/${nameOrId}`);
}

function getMainColor(nameOrId) {
    return request(`/pokemon-color/${nameOrId}`);
}

function getGames() {
    return request(`/version`);
}

module.exports = {
    getPokemon,
    getSpecies,
    getEvolutionChain,
    getForms,
    getMove,
    getAbilities,
    getMainColor,
    getGames
}