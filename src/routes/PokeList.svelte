<script>
    import Pokecard from "../components/pokeCard.svelte";
    let pokemons = Array(42)
        .fill(1)
        .map((a, i) => {
            return {
                id: i,
                name: `name${i}`,
            };
        });
</script>

<div class="grid-list">
    {#each pokemons as pokemon (pokemon.id)}
        <Pokecard {pokemon} />
    {/each}
</div>

<style>
    .grid-list {
        position: relative;
        background: lightcoral;

        display: grid;
        place-items: center;
        grid-gap: 1.5rem;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        padding: 20px;
    }
</style>
