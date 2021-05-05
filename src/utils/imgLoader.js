function loadImg(src) {
    return new Promise((resolve) => {
        let img = new Image();
        img.onload = resolve;
        img.src = src;
    });
}

module.exports = { loadImg };