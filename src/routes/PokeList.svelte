<script>
    import Pokecard from "../components/pokeCard.svelte";
    import {
        fetchUrl,
        getAllSpecies,
        getPokemon,
    } from "../services/pokeapi.js";
    import throttle from "just-throttle";
    import { onMount } from "svelte";

    let speciesReference = [];
    let visible = [];

    let visibleStartIndex = 0;
    let visibleEndIndex = 0;

    let grid;
    let gridHeight;
    let gridWidth;
    let scrollTop;
    let cardsInRow;
    let rows;

    let gridGap = 10;
    let gridPadding = 20;
    let cardHeight = 200;
    let cardWidth = 150;
    let rowBuffer = 1;

    let onResize = throttle((e) => {
        setGrid();
        updateGrid();
    }, 200);

    let onScroll = throttle((e) => {
        updateGrid();
    }, 200);

    onMount(async () => {
        speciesReference = (await getAllSpecies()).map((s, i) => ({
            ...s,
            index: i,
        }));

        setGrid();
        updateGrid();
    });

    function setGrid() {
        gridWidth = grid.getBoundingClientRect().width;

        let usableWidth = gridWidth - gridPadding * 2;
        let rowFitRatio = (usableWidth + gridGap) / (cardWidth + gridGap);

        cardsInRow = Math.floor(rowFitRatio);
        rows = Math.ceil(speciesReference.length / cardsInRow);

        let gridLeftMargin = gridPadding + ((rowFitRatio % 1) * cardWidth) / 2;
        gridHeight = gridPadding * 2 + rows * cardHeight + gridGap * (rows - 1);

        let colLeftValues = Array(cardsInRow)
            .fill(1)
            .map((x, i) => gridLeftMargin + cardWidth * i + gridGap * i);
        let rowTopValues = Array(rows)
            .fill(1)
            .map((x, i) => gridLeftMargin + cardHeight * i + gridGap * i);

        speciesReference = speciesReference.map((s, i) => {
            let row = Math.floor(i / cardsInRow);
            let col = i % cardsInRow;

            s.row = row;
            s.col = col;
            s.top = rowTopValues[row];
            s.left = colLeftValues[col];

            return s;
        });
    }

    function updateGrid() {
        let startRow = Math.floor(
            (scrollY + gridPadding) / (cardHeight + gridGap)
        );

        let endRow = Math.ceil(
            (scrollY + gridPadding + window.innerHeight) /
                (cardHeight + gridGap)
        );

        let startIndex = Math.max(startRow - rowBuffer, 0) * cardsInRow;
        let endIndex = Math.min(endRow + rowBuffer, rows) * cardsInRow;

        if (visibleStartIndex != startIndex || visibleEndIndex != endIndex) {
            visibleStartIndex = startIndex;
            visibleEndIndex = endIndex;

            visible = speciesReference.slice(startIndex, endIndex);
        }
    }
</script>

<svelte:window
    on:scroll={onScroll}
    on:resize={onResize}
    bind:scrollY={scrollTop}
/>

<div class="grid-list" bind:this={grid} style="height: {gridHeight}px;">
    {#each visible as pokemon}
        <Pokecard {pokemon} cardLeft={pokemon.left} cardTop={pokemon.top} />
    {/each}
</div>

<style lang="scss">
    .grid-list {
        position: relative;
        background: lightcoral;
    }
</style>
