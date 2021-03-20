let re = /\$\w+/g;

function parseMove(move) {
    move.effect_entries.map(entry => {
        let effMatch = [...entry.effect.matchAll(re)];
        effMatch.forEach(([e]) => {
            let param = e.slice(1);
            entry.effect = entry.effect.replace(e, move[param]);
        });

        let sEffMatch = [...entry.short_effect.matchAll(re)];
        sEffMatch.forEach(([e]) => {
            let param = e.slice(1);
            entry.short_effect = entry.short_effect.replace(e, move[param]);
        });
    });

    return move;
}

module.exports = { parseMove };