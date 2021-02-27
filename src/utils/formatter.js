function capitalize(text) {
    return text.split(' ').map(t => t[0].toUpperCase() + t.slice(1)).join(' ');
}

function kebabToSpace(text) {
    return text.replace('-', ' ');
}


module.exports = { capitalize, kebabToSpace };