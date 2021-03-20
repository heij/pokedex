// import { capitalize } from "./formatter.js";
function capitalize(text) {
    return text.split(' ').map(t => t[0].toUpperCase() + t.slice(1)).join(' ');
}

function kebabToSpace(text) {
    return text.replaceAll('-', ' ');
}

function formatText(text) {
    return capitalize(kebabToSpace(text));
}

let genderRef = ['Female', 'male', 'genderless'];

let triggerTextRef = {
    "level-up": () => 'Level up',
    "trade": () => 'Trade'
}

let requirementRef = {
    "gender": (id) => `If ${genderRef[id - 1]}`,
    "held_item": ({ name }) => `Holding ${formatText(name)}`,
    "known_move": ({ name }) => `Knowing ${formatText(name)},`,
    "known_move_type": ({ name }) => `Knowing ${name}-type move`,
    "location": ({ name }) => `At ${formatText(name)}`,
    "min_affection": (x) => `Affection ${x}+`,
    "min_beauty": (x) => `Heauty ${x}+`,
    "min_happiness": (x) => `Happiness ${x}+`,
    "min_level": (level) => `Level ${level}+`,
    "needs_overworld_rain": () => `While raining`,
    "party_species": ({ name }) => `${capitalize(name)} in party,`,
    "party_type": ({ name }) => `${capitalize(name)}-type pokemon in party,`,
    "relative_physical_stats": (ratio) => {
        if (ratio == 1) {
            return 'Attack > Defense'
        }
        if (ratio == 0) {
            return 'Attack = Defense'
        }
        if (ratio == -1) {
            return 'Defense > Attack'
        }
    },
    "time_of_day": (time) => `During ${time}`,
    "trade_species": (pokemon) => `For ${capitalize(pokemon)}`,
    "turn_upside_down": () => `With console upside down`,
}

function parseEvolutionDetails(trigger, requirements) {
    if (trigger == 'other') {
        return ['?'];
    }

    if (trigger == 'shed') {
        return ['Evolve Nincada', 'Empty space in party', 'Pokeball in bag'];
    }

    let result = [];
    if (trigger == 'use-item') {
        result.push(`Use ${formatText(requirements.item.name)}`);
        delete requirements.item;
    }

    if (trigger in triggerTextRef) {
        result.push(triggerTextRef[trigger](requirements.item));
    }

    Object.entries(requirements).forEach(([type, value]) => {
        let req = requirementRef[type](value);
        result.push(req);
    });

    return result;
}

module.exports = { parseEvolutionDetails };