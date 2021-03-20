function capitalize(text) {
    return text.split(' ').map(t => t[0].toUpperCase() + t.slice(1)).join(' ');
}

function kebabToSpace(text) {
    return text.replaceAll('-', ' ');
}

function formatText(text) {
    return capitalize(kebabToSpace(text));
}

function clearLinebreaks(text) {
    return text.replace(/\r?\n|\r|\f/g, ' ');
}

module.exports = { capitalize, kebabToSpace, formatText, clearLinebreaks };