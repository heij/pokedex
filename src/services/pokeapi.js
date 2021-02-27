const domain = 'https://pokeapi.co/api/v2';

function getPokemon(name) {
    return fetch(`${domain}/pokemon/${name}`);
}