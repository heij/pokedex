<script>
    import Pokecard from "../components/PokeCard.svelte";
    import { fetchUrl, request, getAllSpecies } from "../services/pokeapi.js";
    import throttle from "just-throttle";
    import debounce from "just-debounce-it";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { expoIn, expoOut } from "svelte/easing";
    import { capitalize } from "../utils/formatter.js";
    import typeColors from "../data/typeColors.json";
    import { tick } from "svelte";

    let speciesReference = [];
    let filtered = [];
    let visible = [];
    let pokemonData = [];

    let visibleStartIndex = 0;
    let visibleEndIndex = 0;

    let viewHeight = 0;
    let gridWrapper;
    let grid;
    let gridHeight;
    let gridWidth;
    let gridLeftMargin;
    let scrollY = 0;
    let cardsInRow;
    let rows;
    let searchQuery = "";
    let typeQueries = ["", ""];

    let gridGap = 20;
    let gridPadding = 20;
    let cardHeight = 200;
    let cardWidth = 150;
    let rowBuffer = 0;

    let onResize = throttle((e) => {
        speciesReference = filtered = setGrid(speciesReference);
        updateGrid();
    }, 200);

    let onScroll = throttle((e) => {
        scrollY = e.target.scrollTop;
        updateGrid();

        localStorage.setItem("pokeListScroll", scrollY);
    }, 200);

    onMount(async () => {
        speciesReference = (await getAllSpecies()).map((s, i) => ({
            ...s,
            index: i,
        }));

        pokemonData = Array(speciesReference.length).fill();

        speciesReference = filtered = setGrid(speciesReference);
        updateGrid();

        let oldScroll = localStorage.getItem("pokeListScroll");
        await tick;
        gridWrapper.scroll(0, oldScroll);
    });

    function setGrid(pokemonList) {
        gridWidth = grid.getBoundingClientRect().width;

        let usableWidth = gridWidth - gridPadding * 2;
        let rowFitRatio = (usableWidth + gridGap) / (cardWidth + gridGap);

        cardsInRow = Math.floor(rowFitRatio);
        rows = Math.ceil(pokemonList.length / cardsInRow);

        gridLeftMargin = gridPadding + ((rowFitRatio % 1) * cardWidth) / 2;
        gridHeight =
            gridLeftMargin * 2 + rows * cardHeight + gridGap * (rows - 1);

        let colLeftValues = Array(cardsInRow)
            .fill(1)
            .map((x, i) => gridLeftMargin + cardWidth * i + gridGap * i);
        let rowTopValues = Array(rows)
            .fill(1)
            .map((x, i) => gridLeftMargin + cardHeight * i + gridGap * i);

        return pokemonList.map((s, i) => {
            let row = Math.floor(i / cardsInRow);
            let col = i % cardsInRow;

            s.row = row;
            s.col = col;
            s.top = rowTopValues[row];
            s.left = colLeftValues[col];

            return s;
        });
    }

    function updateGrid(forceUpdate = false) {
        let startRow = Math.floor(
            (scrollY + gridPadding) / (cardHeight + gridGap)
        );

        let endRow = Math.ceil(
            (scrollY + gridPadding + viewHeight) / (cardHeight + gridGap)
        );

        let startIndex = Math.max(startRow - rowBuffer, 0) * cardsInRow;
        let endIndex = Math.min(endRow + rowBuffer, rows) * cardsInRow;

        if (
            forceUpdate ||
            visibleStartIndex != startIndex ||
            visibleEndIndex != endIndex
        ) {
            visibleStartIndex = startIndex;
            visibleEndIndex = endIndex;

            visible = filtered.slice(startIndex, endIndex);
            visible.forEach(async (v) => {
                if (pokemonData[v.index]) {
                    return;
                }

                let species = await fetchUrl(v.url);
                let pokemonUrl = species.varieties.find((v) => v.is_default)
                    .pokemon.url;
                let pokemon = await fetchUrl(pokemonUrl);

                pokemonData[v.index] = {
                    species,
                    pokemon,
                };
            });
        }
    }

    function getPokemonOfType(type) {
        return request("/type", type).then((res) =>
            res.pokemon.map((p) => p.pokemon.name)
        );
    }

    let filterList = debounce(async () => {
        let filteredSpecies = speciesReference;

        if (searchQuery) {
            let q = searchQuery.trim();
            filteredSpecies = speciesReference.filter(
                (s, i) =>
                    s.name.toLowerCase().includes(q.toLowerCase()) ||
                    (i + 1).toString().padStart(3, 0).includes(q)
            );
        }

        for (let type of typeQueries) {
            if (type) {
                let typePokemons = await getPokemonOfType(type);

                filteredSpecies = filteredSpecies.filter((s) =>
                    typePokemons.includes(s.name)
                );
            }
        }

        filtered = setGrid(filteredSpecies);
        updateGrid(true);
    }, 400);

    function chunk(array, size) {
        // This prevents infinite loops
        if (size < 1) throw new Error("Size must be positive");

        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }
</script>

<div
    class="search-wrapper"
    in:fly={{
        y: -500,
        duration: 500,
        easing: expoOut,
    }}
    out:fly={{
        y: -500,
        duration: 500,
        easing: expoIn,
    }}
>
    <div class="query-container">
        <h4 class="title">Search</h4>
        <input
            type="text"
            id="search-bar"
            placeholder="Name or ID..."
            bind:value={searchQuery}
            on:keyup={filterList}
        />
    </div>
    <div>
        <h4 class="title">Types</h4>
        {#each typeQueries as typeQuery, i}
            <!-- svelte-ignore a11y-no-onchange -->
            <select
                name=""
                id="type_{i + 1}"
                bind:value={typeQuery}
                on:change={filterList}
            >
                <option value="" selected>Any</option>
                {#each Object.keys(typeColors) as type}
                    <option
                        value={type}
                        style="background: {typeColors[
                            type
                        ]}; font-weight: bold;">{capitalize(type)}</option
                    >
                {/each}
            </select>
        {/each}
    </div>
</div>

<svelte:window on:resize={onResize} />

<div
    on:scroll={onScroll}
    bind:clientHeight={viewHeight}
    bind:this={gridWrapper}
    class="virtual-wrapper"
>
    <div
        bind:this={grid}
        class="grid-list"
        style="height: {gridHeight}px;"
        transition:fly|local={{
            x: -window.innerWidth,
            duration: 500,
            easing: expoIn,
        }}
    >
        {#each visible as pokemon (pokemon.index)}
            <Pokecard
                data={pokemonData[pokemon.index]}
                cardLeft={pokemon.left}
                cardTop={pokemon.top}
            />
        {/each}
    </div>
</div>

<style lang="scss">
    .virtual-wrapper {
        overflow: auto;
        will-change: transform;
        flex: 1;
    }
    .grid-list {
        position: relative;
        background: #868686;
    }

    .search-wrapper {
        background: #212020;
        padding: 10px 20px 20px 20px;
        color: white;
        display: flex;
        flex-wrap: wrap;
        .title {
            padding: 5px 0;
        }
    }

    .query-container {
        margin-right: 10px;
    }

    select {
        margin-right: 10px;
    }
</style>
