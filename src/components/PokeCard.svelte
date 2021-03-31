<script>
    import { push } from "svelte-spa-router";
    import { capitalize } from "../utils/formatter";
    import TypeIcon from "./typeIcon.svelte";
    import { send, receive } from "../animations/crossfade.js";
    import { fly, fade } from "svelte/transition";
    import { quartOut, quartIn } from "svelte/easing";
    import "skeleton-elements/skeleton-elements.css";
    import { SkeletonText } from "skeleton-elements/svelte";
    import { SkeletonBlock } from "skeleton-elements/svelte";

    export let data;
    export let pokemonName;
    export let cardLeft;
    export let cardTop;

    let active = false;
    let activateTimeout = null;

    function startTilt() {
        activateTimeout = setTimeout(() => (active = true), 200);
    }

    function updateTilt(e) {
        const { offsetX, offsetY } = e;

        let widthRatio =
            ((offsetX - this.offsetWidth / 2) * 2) / this.offsetWidth;
        let heightRatio =
            -((offsetY - this.offsetHeight / 2) * 2) / this.offsetHeight;

        this.style.setProperty("--yRotation", widthRatio);
        this.style.setProperty("--xRotation", heightRatio);
    }

    function resetTilt(e) {
        this.style.setProperty("--xRotation", 0);
        this.style.setProperty("--yRotation", 0);
        active = false;
        clearTimeout(activateTimeout);
    }

    function showDetails() {
        if (data == undefined) {
            return;
        }

        push(`/pokemon/${data.pokemon.id}`);
    }

    function getTypes(pokemon) {
        return pokemon.types.map((t) => t.type.name);
    }

    function getNationalId(species) {
        return species.pokedex_numbers
            .find((p) => (p.pokedex.name = "national"))
            .entry_number.toString()
            .padStart(3, "0");
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
</script>

<span
    class="card {data?.species && `bg-${data?.species.color.name}`}"
    class:active
    on:mouseenter={startTilt}
    on:mousemove={updateTilt}
    on:mouseleave={resetTilt}
    on:click={showDetails}
    style="left: {cardLeft}px; top: {cardTop}px;"
    in:fly={{
        y: 50,
        duration: 250,
        easing: quartOut,
        delay: getRandom(0, 250),
    }}
    out:fly={{
        y: -50,
        duration: 250,
        easing: quartIn,
        delay: getRandom(0, 250),
    }}
>
    {#if data != undefined}
        <div class="type-tags">
            {#each getTypes(data.pokemon) as type}
                <span class="type-tag">
                    <TypeIcon {type} />
                </span>
            {/each}
        </div>
        <small class="number"># {getNationalId(data.species)}</small>
        <h4 class="name">{capitalize(data.species.name)}</h4>
        <div class="body">
            <img
                src={data.pokemon.sprites.front_default}
                alt=""
                in:receive|local={{ key: "pokeImg" }}
                out:send|local={{ key: "pokeImg" }}
                height="96"
                width="96"
            />
        </div>
    {:else}
        <div
            class="skeleton-wrapper"
            transition:fade={{ duration: 500, easing: quartOut }}
        >
            <div class="type-tags" />
            <p class="number text-faded">
                <SkeletonText effect="pulse">00000</SkeletonText>
            </p>
            <h3 class="name center-content">
                <SkeletonBlock effect="pulse" width="85%">
                    <SkeletonText tag="h3" effect="pulse">00000</SkeletonText>
                </SkeletonBlock>
            </h3>
            <div class="body">
                <SkeletonBlock width="75%" height="75%" effect="pulse" />
            </div>
        </div>
    {/if}
</span>

<style lang="scss">
    .card {
        $xRotation: 0;
        $yRotation: 0;

        display: inline-flex;
        width: 150px;
        height: 200px;
        flex-direction: column;
        padding: 5px;

        // background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 20px 0 rgba(135, 31, 113, 0.37);
        border-radius: 5px;
        font-weight: bold;
        transition: transform 0.2s ease-out;
        transform-style: preserve-3d;
        transform: perspective(1000px) rotateX(calc(var(--xRotation) * 10deg))
            rotateY(calc(var(--yRotation) * 10deg));

        position: absolute;

        &.active {
            transition: none;
        }

        .type-tags {
            .type-tag {
                $tag-size: 25px;

                width: $tag-size;
                height: $tag-size;
                position: absolute;
                right: calc(#{$tag-size} / -2);
                top: calc(#{$tag-size} / -2);
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                box-shadow: 0 8px 20px 0 rgba(135, 31, 113, 0.37);
                pointer-events: none;

                &:nth-child(2) {
                    top: calc(#{$tag-size} / 2 + 5px);
                }
            }
        }

        .number {
            display: block;
            margin-bottom: 5px;
            pointer-events: none;
        }

        .name {
            text-align: center;
            pointer-events: none;

            white-space: nowrap;
            overflow: hidden;
        }

        .body {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            // flex: 1;
            pointer-events: none;
            perspective: 1000px;
            transform-style: preserve-3d;
            width: 100%;
            height: 140px;

            &::before,
            &::after {
                $margin: 50px;

                content: "";
                width: calc(100% - #{$margin});
                height: calc(100% - #{$margin});
                position: absolute;
                left: #{$margin / 2};
                top: #{$margin / 2};
                // border: 1px solid rgba(0, 0, 0, 0.25);
                border-radius: 50%;
                // background: rgba(255, 255, 255, 0.25);
            }

            &::before {
                background-image: url("../assets/1x/pokeball.png");
                background-position: center;
                background-size: cover;
            }

            &::after {
                box-shadow: 0 0 30px #ffffff85;
                z-index: -1;
            }

            img {
                position: relative;
                max-width: 100%;
                transform: translateY(0) translateZ(0);
                // transition: transform 0.2s ease-in-out;

                @keyframes popBack {
                    0% {
                        transform: translateY(-2.5px) translateZ(20px);
                    }
                    100% {
                        transform: translateY(0) translateZ(0);
                    }
                }

                @keyframes popout {
                    0% {
                        transform: translateY(0) translateZ(0);
                    }
                    100% {
                        transform: translateY(0) translateZ(20px);
                    }
                }

                @keyframes breathe {
                    0% {
                        transform: translateY(0) translateZ(20px);
                    }
                    90% {
                        transform: translateY(-5px) translateZ(20px);
                    }
                    100% {
                        transform: translateY(-5px) translateZ(20px);
                    }
                }

                animation: 0.25s popBack ease-out;
            }
        }

        &:hover {
            img {
                transform: translateZ(20px);

                animation: 0.25s popout ease-out,
                    2s breathe ease-in-out infinite alternate 0.25s;
            }
        }

        .skeleton-wrapper {
            position: absolute;
            display: flex;
            flex-direction: column;
            height: calc(100% - 10px);
            width: calc(100% - 10px);
            left: 5px;
            top: 5px;

            .number {
                margin-bottom: 10px;
            }
        }
    }
</style>
