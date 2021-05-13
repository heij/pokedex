<script>
    import { fly, fade } from "svelte/transition";
    import { expoIn } from "svelte/easing";
</script>

<div
    class="page"
    transition:fly|local={{
        x: window.innerWidth,
        duration: 500,
        easing: expoIn,
    }}
>
    <h2 class="title">About</h2>

    <div class="content">
        <p>
            A Pokedex app featuring data about Pokemons, such as type, moves,
            abilities, evolutions, stats and more!
        </p>
        <br />

        <p>
            Data and images are cached and available offline after being viewed
            for the first time.
        </p>
        <br />

        <p>
            Content is up to date with gen VII (Sun/Moon); gen VIII and onwards
            should be available whenever PokeAPI gets access to new data, with
            the app (hopefully) updating automatically with each new game (as
            long as we get no new types, otherwise I'll need to add more icons).
        </p>
        <br />

        <p>
            PWA built with <a href="https://svelte.dev" target="_blank"
                >Svelte</a
            >, with Pokemon data and assets provided by
            <a href="https://pokeapi.co" target="_blank">PokeAPI</a>.
        </p>

        <p>
            Icons, app design and development by
            <a href="https://heij.github.io" target="_blank">HEIJI</a> (me!).
        </p>
    </div>
</div>

<style lang="scss">
    .page {
        padding: 20px;
        color: hsl(0deg, 0%, 90%);
    }

    .title {
        background: #130f0f;
        color: #fff;
        padding: 10px;
    }

    .content {
        padding: 20px;
    }

    a {
        display: inline-block;
        padding: 0 5px;
        background: var(--secondary-color);
        transition: 0.2s background, 0.2s color;
        border: 1px solid transparent;

        &:hover {
            border: 1px solid var(--secondary-color);
            color: var(--secondary-color);
            background: #ffe7e7;
        }
    }
</style>
