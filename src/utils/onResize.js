import { onDestroy } from 'svelte';

export function onResize(cb) {
    window.addEventListener('resize', cb);

    onDestroy(() => window.removeEventListener('resize', cb));
}