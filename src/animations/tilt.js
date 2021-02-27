import { fade } from 'svelte/transition';
import { elasticOut } from 'svelte/easing';

function tilt(node, { duration }) {
    return {
        duration,
        css: t => {
            const eased = elasticOut(t);

            return `
                transform: scale(${eased}) rotate(${eased * 1080}deg);
                color: hsl(
                    ${~~(t * 360)},
                    ${Math.min(100, 1000 - 1000 * t)}%,
                    ${Math.min(50, 500 - 500 * t)}%
                );`
        }
    };
}

module.exports = tilt;