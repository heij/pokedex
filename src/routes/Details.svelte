<script>
    export let params = {};

    import {
        capitalize,
        kebabToSpace,
        clearLinebreaks,
        formatText,
    } from "../utils/formatter.js";
    import { getPokemon, getSpecies, fetchUrl } from "../services/pokeapi.js";
    import TypeIcon from "../components/TypeIcon.svelte";
    import AbilityModal from "../components/AbilityModal.svelte";
    import MoveModal from "../components/MoveModal.svelte";
    import Modal from "../components/Modal.svelte";
    import typeColors from "../data/typeColors.json";
    import statLabels from "../data/statLabels.json";
    import { tweened } from "svelte/motion";
    import { expoOut, expoIn, quartIn, quartOut } from "svelte/easing";
    import { fly, fade } from "svelte/transition";
    import MoveTable from "../components/MoveTable.svelte";
    import EvolutionChain from "../components/EvolutionChain.svelte";
    import SpriteViewer from "../components/SpriteViewer.svelte";

    import "skeleton-elements/skeleton-elements.css";
    import { SkeletonText } from "skeleton-elements/svelte";
    import { SkeletonBlock } from "skeleton-elements/svelte";

    let statIcons = [
        "../assets/stat_icons/light/hp_light.png",
        "../assets/stat_icons/light/atk_light.png",
        "../assets/stat_icons/light/def_light.png",
        "../assets/stat_icons/light/sp_atk_light.png",
        "../assets/stat_icons/light/sp_def_light.png",
        "../assets/stat_icons/light/spe_light.png",
    ];

    function getNationalId(species) {
        let id = species.pokedex_numbers
            .find((p) => (p.pokedex.name = "national"))
            .entry_number.toString()
            .padStart(3, "0");

        return `#${id}`;
    }

    function getGenus(species) {
        return species.genera.find((g) => g.language.name == "en").genus;
    }

    function getTypes(pokemon) {
        return pokemon.types.map((t) => t.type.name);
    }

    function getFlavorText(species, version) {
        if (!version || !species) return "";

        return clearLinebreaks(
            species.flavor_text_entries.find(
                (s) => s.language.name == "en" && s.version.name == version
            )?.flavor_text
        );
    }

    function getStats(pokemon) {
        return pokemon.stats.reduce((res, s) => {
            res[s.stat.name] = s.base_stat;

            return res;
        }, {});
    }

    function getStatProgress(stat) {
        let maximumValue = 512;
        return Math.min(stat / maximumValue, 1);
    }

    function getStatBarProgress(stat) {
        let maximumValue = 200;
        return Math.min(stat / maximumValue, 1);
    }

    function getAbilities(pokemon) {
        return pokemon.abilities.map((a) => {
            return {
                name: a.ability.name,
                is_hidden: a.is_hidden,
                url: a.ability.url,
            };
        });
    }

    function getFemaleRatio(species) {
        return species.gender_rate / 8;
    }

    function getFlavorVersions(species) {
        return species.flavor_text_entries.filter(
            (s) => s.language.name == "en"
        );
    }

    let pageElem;
    let windowX;

    let data;
    let pokemon;
    let species;

    let nationalId = 0;
    let stats = tweened(
        {
            hp: 0,
            attack: 0,
            defense: 0,
            "special-attack": 0,
            "special-defense": 0,
            speed: 0,
        },
        {
            duration: 750,
            easing: expoOut,
        }
    );

    let abilities = [];
    let types = [];
    let genus = "";
    let flavorsTexts = [];
    let currentFlavorVersion = "";
    let currentFlavorText = "";
    let currentForm = "";
    let mainSprite = "";
    let femaleRatio = tweened(-1, { duration: 750, easing: expoOut });
    let abilityModal;
    let moveModal;

    let card;

    $: currentFlavorText = getFlavorText(species, currentFlavorVersion);
    $: currentForm;
    // Workaround to bug:
    // When changing pokemons (params), the card binding inside the await
    // is lost for some reason (?)
    $: pokemon, (card = document.querySelector("#pokemon-card"));

    function loadData(pokemonId = params.id) {
        return new Promise(async (resolve) => {
            [pokemon, species] = await Promise.all([
                getPokemon(pokemonId),
                getSpecies(params.id),
            ]);

            nationalId = getNationalId(species);
            abilities = getAbilities(pokemon);
            types = getTypes(pokemon);
            genus = getGenus(species);
            flavorsTexts = getFlavorVersions(species);
            currentFlavorVersion = flavorsTexts[0].version.name;
            mainSprite =
                pokemon.sprites.other["official-artwork"].front_default;
            femaleRatio.set(getFemaleRatio(species));
            stats.set(getStats(pokemon));

            resolve();
        });
    }

    // https://github.com/ItalyPaleAle/svelte-spa-router/issues/14#issuecomment-544532053
    $: if (params.id) {
        data = loadData();
    }

    let rotationStartTime = 0;

    function rotateCard() {
        rotationStartTime = +new Date();
        card.classList.add("rotate");

        setTimeout(() => {
            card.classList.remove("rotate");
        }, 1500);
    }

    function stopCardRotation() {
        let tDelta = +new Date() - rotationStartTime;

        if (tDelta <= 750) {
            setTimeout(() => {
                card.classList.remove("rotate");
            }, 750 - tDelta);
        } else card.classList.remove("rotate");
    }
</script>

<svelte:window bind:innerWidth={windowX} />

<div
    class="page"
    transition:fly|local={{
        x: window.innerWidth,
        duration: 500,
        easing: expoIn,
    }}
    bind:this={pageElem}
>
    <div class="details {species && `bg-${species.color.name}`}">
        {#await data}
            <div
                class="skeleton-wrapper"
                transition:fade={{ duration: 500, easing: expoOut }}
            >
                <div class="panel">
                    <div class="id section">
                        <div class="national-id">
                            <SkeletonText tag="h2" effect="pulse"
                                >00000</SkeletonText
                            >
                            <!-- <SkeletonBlock tag="p" effect="pulse" /> -->
                        </div>
                        <div class="name">
                            <SkeletonBlock tag="h2" effect="pulse" />
                        </div>
                        <div class="genus">
                            <SkeletonBlock tag="h4" effect="pulse" />
                        </div>
                    </div>

                    <div class="img-wrapper center-content section">
                        <SkeletonBlock
                            width="80%"
                            height="100%"
                            effect="pulse"
                        />
                    </div>

                    <div class="pokemon-details section">
                        <div class="metrics center-content">
                            <SkeletonBlock
                                width="80%"
                                height="50px"
                                effect="pulse"
                            />
                        </div>
                        <div class="flavor-text-wrapper">
                            <h2 class="text-crop">“</h2>
                            <p>
                                <SkeletonBlock
                                    width="100%"
                                    height="100px"
                                    effect="pulse"
                                />
                            </p>
                            <h2 class="text-crop" style="text-align: end;">
                                ”
                            </h2>
                        </div>
                        <div class="flavor-select-wrapper">
                            <span>VERSION</span>

                            <SkeletonText tag="div" effect="pulse"
                                >POKEMON</SkeletonText
                            >
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <div class="abilities section">
                        <h3 class="title">ABILITIES</h3>
                        <SkeletonBlock
                            width="100%"
                            height="100px"
                            effect="pulse"
                        />
                    </div>

                    <div class="stats section">
                        <h3 class="title">STATS</h3>
                        <SkeletonBlock
                            width="100%"
                            height="100px"
                            effect="pulse"
                        />
                    </div>

                    <div class="gender section">
                        <h3 class="title">GENDER RATIO</h3>
                        <SkeletonBlock
                            width="100%"
                            height="100px"
                            effect="pulse"
                        />
                    </div>

                    <div class="egg section">
                        <h3 class="title">EGG GROUPS</h3>
                        <SkeletonBlock
                            width="100%"
                            height="100px"
                            effect="pulse"
                        />
                    </div>
                </div>

                <div class="panel-lg">
                    <div class="moves section">
                        <h3 class="title">MOVES</h3>
                        <SkeletonBlock
                            width="100%"
                            height="500px"
                            effect="pulse"
                        />
                    </div>
                </div>

                <div class="panel-lg">
                    <div class="moves section">
                        <h3 class="title">EVOLUTION CHAIN</h3>
                        <SkeletonBlock
                            width="100%"
                            height="500px"
                            effect="pulse"
                        />
                    </div>
                </div>

                <div class="panel-lg">
                    <div class="section">
                        <h3 class="title">SPRITES</h3>
                        <SkeletonBlock
                            width="100%"
                            height="500px"
                            effect="pulse"
                        />
                    </div>
                </div>
            </div>
        {:then}
            <div
                class="panel bg-grad-{species.color.name}-dark"
                id="pokemon-card"
                bind:this={card}
            >
                <div class="front">
                    <div class="id section">
                        <p class="national-id">{nationalId}</p>
                        <h2 class="name text-wrap-any">
                            {species.varieties.length > 1
                                ? formatText(pokemon.name).toUpperCase()
                                : species.name.toUpperCase()}
                        </h2>
                        <h4 class="genus">{genus}</h4>
                    </div>

                    <div
                        class="img-wrapper section"
                        style={types
                            .map(
                                (type, i) =>
                                    `--type-color-${i + 1}: ${
                                        typeColors[type]
                                    };`
                            )
                            .join("") + `species-color: ${species.color.name}`}
                    >
                        <img
                            class="bg"
                            src="../assets/1x/pokeball_md.png"
                            alt=""
                        />

                        {#each [mainSprite] as sprite (sprite)}
                            {#if sprite}
                                <img
                                    class="main-sprite"
                                    src={sprite}
                                    alt=""
                                    in:fade|local={{
                                        duration: 100,
                                        easing: quartOut,
                                        delay: 250,
                                    }}
                                    out:fade|local={{
                                        duration: 100,
                                        easing: quartIn,
                                        delay: 250,
                                    }}
                                    on:load={() => {
                                        stopCardRotation();
                                    }}
                                />
                            {:else}
                                <div class="no-img">NO IMAGE AVAILABLE</div>
                            {/if}
                            <img
                                class="shadow"
                                src={mainSprite}
                                alt=""
                                style="--species-color: {species.color.name}"
                                in:fade|local={{
                                    duration: 100,
                                    easing: quartOut,
                                    delay: 250,
                                }}
                                out:fade|local={{
                                    duration: 100,
                                    easing: quartIn,
                                    delay: 250,
                                }}
                            />
                        {/each}
                    </div>

                    {#if species.varieties.length > 1}
                        <div class="form-wrapper">
                            <label for="form-select text-bold">
                                <h3>Form</h3>
                            </label>
                            <!-- svelte-ignore a11y-no-onchange -->
                            <select
                                id="form-select"
                                bind:value={currentForm}
                                on:change={() => {
                                    rotateCard();
                                    loadData(currentForm);
                                }}
                            >
                                {#each species.varieties as variety}
                                    <option
                                        value={variety.pokemon.name}
                                        selected={variety.is_default}
                                        >{formatText(
                                            variety.pokemon.name
                                        )}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    {/if}

                    <div class="pokemon-details section">
                        <div class="metrics">
                            <div class="body">
                                <div class="metric height">
                                    <h4>HEIGHT</h4>
                                    <h4>
                                        {(pokemon.height * 0.1).toFixed(2)}m
                                    </h4>
                                </div>
                                <div class="metric weight">
                                    <h4>WEIGHT</h4>
                                    <h4>
                                        {(pokemon.weight * 0.1).toFixed(2)}kg
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div
                            class="types"
                            class:single={types.length == 1}
                            class:double={types.length == 2}
                        >
                            {#each types as type, i}
                                <div
                                    class="type-tag {type}"
                                    style="--type-color: {typeColors[type]}"
                                >
                                    <div class="icon">
                                        <TypeIcon {type} iconStyle="dark" />
                                    </div>
                                    <p class="type-name text-crop">
                                        {type.toUpperCase()}
                                    </p>
                                </div>
                            {/each}
                        </div>

                        <div class="flavor-text-wrapper">
                            <h2 class="text-crop">“</h2>
                            {#each [currentFlavorText] as flavor (flavor)}
                                <p
                                    in:fade={{
                                        duration: 150,
                                        easing: expoIn,
                                        delay: 150,
                                    }}
                                    out:fade={{
                                        duration: 150,
                                        easing: expoIn,
                                    }}
                                >
                                    {clearLinebreaks(flavor)}
                                </p>
                            {/each}
                            <h2 class="text-crop" style="text-align: end;">
                                ”
                            </h2>
                        </div>

                        <div class="flavor-select-wrapper">
                            <span>VERSION</span>

                            <select
                                name=""
                                id=""
                                bind:value={currentFlavorVersion}
                            >
                                {#each getFlavorVersions(species) as { version }}
                                    <option value={version.name}>
                                        {capitalize(kebabToSpace(version.name))}
                                    </option>
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="abilities section">
                    <h3 class="title">ABILITIES</h3>
                    <div class="abilities-body">
                        {#each abilities as ability}
                            <div
                                class="center-content"
                                class:hidden-tag={ability.is_hidden}
                            >
                                <small
                                    >{ability.is_hidden ? "HIDDEN" : ""}</small
                                >
                            </div>
                            <div
                                class="ability center-content clickable"
                                class:hidden={ability.is_hidden}
                                on:click={() => abilityModal.show(ability)}
                            >
                                {kebabToSpace(ability.name).toUpperCase()}
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="stats section">
                    <h3 class="title">STATS</h3>
                    <div class="stats-body">
                        {#each Object.entries(statLabels) as [stat, { sm, md }], i}
                            <label for={stat}>
                                <span class="stat-name">
                                    {windowX > 600
                                        ? kebabToSpace(md).toUpperCase()
                                        : kebabToSpace(sm).toUpperCase()}
                                </span>
                                <img
                                    class="stat-icon"
                                    src={statIcons[i]}
                                    alt=""
                                />
                            </label>
                            <span
                                class="bar {stat}"
                                style="--color-progress: {getStatProgress(
                                    $stats[stat].toFixed(0)
                                )}; 
                            --bar-progress: {getStatBarProgress(
                                    $stats[stat].toFixed(0)
                                )}"
                            />
                            <p class="value">{$stats[stat].toFixed(0)}</p>
                        {/each}
                    </div>
                </div>

                <div class="gender section">
                    <h3 class="title">GENDER RATIO</h3>
                    <div
                        class="gender-bar"
                        class:genderless={$femaleRatio < 0}
                        class:female-only={$femaleRatio === 1}
                        class:male-only={$femaleRatio === 0}
                        style="--female-ratio: {$femaleRatio}"
                    >
                        <span class="bar" />
                        <p class="gender-tag text-male">
                            {((1 - $femaleRatio) * 100).toFixed(2)}% MALE
                        </p>
                        <p class="gender-tag text-genderless">GENDERLESS</p>
                        <p class="gender-tag text-female">
                            {($femaleRatio * 100).toFixed(2)}% FEMALE
                        </p>
                    </div>
                </div>

                <div class="egg section">
                    <h3 class="title">EGG GROUPS</h3>

                    <div class="egg-groups">
                        {#each species.egg_groups as eggGroup}
                            <div class="group">{formatText(eggGroup.name)}</div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="panel-lg">
                <div class="moves section">
                    <h3 class="title">MOVES</h3>
                    <MoveTable {pokemon} {moveModal} />
                </div>
            </div>

            <div class="panel-lg">
                <h3 class="title">EVOLUTION CHAIN</h3>
                <EvolutionChain {species} {pageElem} />
            </div>

            <div class="panel-lg">
                <h3 class="title">SPRITES</h3>
                <SpriteViewer {pokemon} femaleRatio={getFemaleRatio(species)} />
            </div>
        {:catch err}
            <p>There was an error loading this pokemon</p>
        {/await}
    </div>
</div>

<Modal bind:this={abilityModal}>
    <h2 slot="title">ABILITY DETAILS</h2>
    <AbilityModal />
</Modal>

<Modal bind:this={moveModal}>
    <h2 slot="title">MOVE DETAILS</h2>
    <MoveModal />
</Modal>

<style lang="scss">
    .details {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        min-height: 100%;
        padding: 20px;
        // margin: 25px 200px;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-around;
        // background: #868686;
    }

    .panel {
        // max-width: unquote("min(100%, 500px)");
        position: relative;
        width: 100%;
        margin-bottom: 20px;
        padding: 0 20px;

        @media (min-width: 600px) {
            // max-width: 50%;
            max-width: 500px;
        }

        &:nth-child(1) {
            box-shadow: 5px 5px 10px #000;
            border-radius: 10px;
            color: #fff;
            padding: 0;
            -webkit-transform-style: preserve-3d;
            transform-style: preserve-3d;
            -webkit-font-smoothing: subpixel-antialiased;

            &.rotate {
                transition: 0.75s transform var(--in-out-expo);
                transform: rotateY(360deg) translateZ(0);

                &::after {
                    transition: opacity 0.1s ease-out;
                    opacity: 1;
                }
            }

            &:before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #292626;
                transform: rotateY(180deg);
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                border-radius: 10px;
            }

            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #292626;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease-out;
            }
        }

        &:nth-child(2) {
            background: #292626;
            color: white;
            padding: 20px;
            border-radius: 10px;
            /* height: fit-content; */

            .title {
                margin-bottom: 10px;
            }
        }

        .front {
            transform: rotateY(0deg);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
    }

    .panel-lg {
        width: 100%;
        margin-bottom: 20px;
        // padding: 0 20px;
    }

    .section {
        position: relative;
        z-index: 2;
        &:not(:first-child) {
            margin-top: 20px;
        }
    }

    .title {
        background: #130f0f;
        color: #fff;
        padding: 10px;
        // margin-bottom: 10px;
    }

    .line {
        display: flex;
    }

    .national-id {
        position: relative;
        display: inline-block;
        align-self: flex-end;
        padding: 10px 20px;
        color: #fff;
        margin: 10px 0 10px 0;
        font-weight: bold;
        background: #292626;
        box-shadow: -2px 2px 3px #000;
    }

    .name {
        position: relative;
        font-weight: bold;
        padding: 5px 15px;
        margin: 0 0 0 10px;
        background: #292626;
        color: #fff;
        box-shadow: 3px 3px 5px #000;
    }

    .genus {
        padding: 5px 0 0 15px;
    }

    .img-wrapper {
        --type-color-1: transparent;
        --type-color-2: transparent;

        width: 100%;
        z-index: 1;
        overflow: hidden;
        transition: 0.5s opacity;

        &::before {
            content: "";
            display: block;
            padding-bottom: 100%;
        }

        .main-sprite {
            // max-width: 300px;
            width: 100%;
            z-index: 2;
            filter: drop-shadow(2px 2px 5px #000);
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);

            @media (min-width: 500px) {
                // max-width: 300px;
            }
        }

        .shadow {
            --species-color: #000;

            position: absolute;
            width: 100%;
            left: calc(50% + 20px);
            top: calc(50% - 20px);
            transform: translate(-50%, -50%);
            z-index: -1;
            filter: brightness(0) opacity(0.7)
                drop-shadow(0px 0px 0px var(--species-color))
                drop-shadow(0px 0px 0px var(--species-color)) blur(2px);
            opacity: 0.8;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotateZ(0deg) rotateX(0deg);
            // animation: rotate 60s linear infinite;
            object-fit: contain;
            z-index: 1;
            pointer-events: none;

            @keyframes rotate {
                0% {
                    transform: translate(-50%, -50%) rotateX(0deg) rotateZ(0deg);
                }
                100% {
                    transform: translate(-50%, -50%) rotateX(0deg)
                        rotateZ(359deg);
                }
            }
        }

        .no-img {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .form-wrapper {
        label {
            padding-left: 10px;
        }
    }

    .types {
        $icon-size: 80px;

        display: flex;
        flex-wrap: wrap;
        min-height: 1rem;

        .type-tag {
            --type-color: #fff;

            position: relative;
            display: inline-flex;
            flex: 1;

            .icon {
                position: relative;
                width: $icon-size;
                height: 100%;
                fill: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                // padding: 5px;
                z-index: 2;
                background: var(--type-color);

                &::before {
                    content: "";
                    top: 0;
                    position: absolute;
                    width: 10px;
                    background: var(--type-color);
                    height: 100%;
                    clip-path: polygon(0 0, 100% 50%, 0 100%);
                }
            }

            .type-name {
                position: relative;
                display: inline-flex;
                align-items: center;
                font-weight: bold;
                z-index: 1;
                background: #060101b8;
                padding: 0 20px;
                flex: 1;

                &::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: var(--type-color);
                    opacity: 0.5;
                    pointer-events: none;
                    z-index: -1;
                }

                // border: 3px solid var(--type-color);
                // border-bottom: 0;
            }

            &:nth-child(1) {
                flex-direction: row-reverse;

                .icon {
                    &::before {
                        transform: rotateZ(180deg);
                        right: 100%;
                    }
                }

                .type-name {
                    justify-content: flex-end;
                    padding: 0 20px 0 0;
                }
            }

            &:nth-child(2) {
                justify-content: flex-start;

                .icon {
                    &::before {
                        left: 100%;
                    }
                }

                .type-name {
                    padding: 0 0 0 20px;
                }
            }

            &:first-child:last-child {
                flex-direction: row;

                .icon {
                    &::before {
                        transform: none;
                        left: 100%;
                    }
                }

                .type-name {
                    justify-content: flex-start;
                    padding: 0 0 0 20px;
                }
            }
        }
    }

    .metrics {
        padding: 10px 0 10px 0;
        background: #292626;

        .body {
            display: flex;
            justify-content: space-around;
        }

        .metric {
            color: #fff;
            text-align: end;
            // background-position: center bottom;
            // background-repeat: no-repeat;
            // background-size: contain;
            // text-shadow: 0 0 5px #000;
            // clip-path: polygon(10px 0, calc(100% - 10px));

            h3 {
                margin-bottom: 5px;
            }

            h4 {
                align-self: flex-end;
                transform: translateY(-0.5rem);
            }
        }
    }

    .pokemon-details {
        display: flex;
        flex-direction: column;
        color: #d6d6d6;

        .flavor-text-wrapper {
            padding: 10px 10px;
            background: #292626;
            font-style: italic;
        }

        .flavor-select-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            background: #292626;

            span {
                margin-right: 10px;
                font-weight: bold;
            }
        }

        p {
            padding: 0 1.5rem;
        }
    }

    .stats {
        .stats-body {
            display: grid;
            grid-template-rows: repeat(6, 1fr);
            grid-auto-columns: max-content 1fr;
            grid-auto-flow: row;
            grid-gap: 0.5rem 0.5rem;

            label {
                justify-self: end;
                grid-column: 1;
                font-weight: bold;
                display: flex;
                align-items: center;

                .stat-icon {
                    width: 30px;
                    height: 30px;
                    margin-left: 10px;
                }
            }

            .bar {
                $current: 0;
                $bar-progress: 0;

                position: relative;
                width: 100%;
                height: 100%;
                border: 1px solid rgb(102, 97, 97);
                grid-column: 2;

                &:before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    transform-origin: left;
                    transition: transform 0.2s ease-out;
                    transform: scaleX(var(--bar-progress));
                    background: hsl(
                        calc(var(--color-progress) * 330),
                        90%,
                        60%
                    );
                }
            }

            .value {
                grid-column: 3;
                font-weight: bold;
            }
        }
    }

    .abilities {
        .abilities-body {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: auto auto;
            grid-column-gap: 10px;
            grid-auto-flow: column;
        }

        .hidden-tag {
            background: #fff;
            font-weight: bold;
            color: #130f0f;
        }

        .ability {
            padding: 5px;
            text-align: center;
            background: #423e3e;
            transition: background 0.2s ease-out;
            font-weight: bold;

            &.hidden {
                background: none;
                border: 1px solid #8e8e8e;
            }

            &:hover {
                background: #ffffff;
                color: #000;
            }
        }
    }

    .gender-bar {
        --female-ratio: 0;

        --male-tag-color: #7a8bf9;
        --female-tag-color: #f97c7a;
        --genderless-tag-color: #f9f57a;

        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        grid-row-gap: 0.5rem;

        .bar {
            position: relative;
            width: 100%;
            height: 25px;
            height: 100%;
            grid-area: 1 / 1 / 2 / 4;

            &:before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                transform-origin: left;
                transition: transform 0.2s ease-out;
                transform: scaleX(calc(1 - var(--female-ratio)));
                background: var(--male-tag-color);
            }

            &:after {
                content: "";
                position: absolute;
                right: 0;
                top: 0;
                width: 100%;
                height: 100%;
                transform-origin: right;
                transition: transform 0.2s ease-out;
                transform: scaleX(var(--female-ratio));
                background: var(--female-tag-color);
            }
        }

        .gender-tag {
            white-space: nowrap;
            font-weight: bold;
            // text-shadow: 0 0 5px #000;

            &.text-male {
                grid-area: 2 / 1;
                color: var(--male-tag-color);
            }
            &.text-female {
                grid-area: 2 / 3;
                justify-self: end;
                color: var(--female-tag-color);
            }

            &.text-genderless {
                display: none;
                grid-area: 2 / 2;
                justify-self: center;
            }
        }

        &.genderless {
            .bar {
                &:before {
                    transform-origin: center;
                    background: var(--genderless-tag-color);
                    transform: scaleX(1);
                }

                &:after {
                    display: none;
                }
            }

            .text-male,
            .text-female {
                display: none;
            }

            .text-genderless {
                display: block;
            }
        }

        &.female-only {
            .text-male {
                display: none;
            }
        }

        &.male-only {
            .text-female {
                display: none;
            }
        }
    }

    .egg-groups {
        display: flex;
        justify-content: space-around;
        .group {
            flex: 1;
            padding: 5px;
            font-weight: bold;
            background: #130f0f;
            text-align: center;
            margin: 0 5px;
        }
    }

    .skeleton-wrapper {
        position: absolute;
        left: 20px;
        top: 20px;
        width: calc(100% - 40px);
        min-height: 100%;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-around;
        z-index: 3;

        .panel {
            background: #292626;
        }

        .img-wrapper {
            width: 100%;
            height: 300px;
            filter: none;

            &::before {
                display: none;
            }
        }

        .national-id {
            padding: 0;
        }

        .name {
            padding: 0;
            margin: 0 10px 0 10px;
        }

        .genus {
            padding: 10px 10px 10px 10px;
        }
    }

    .text-crop {
        @mixin text-crop(
            $line-height: 1.3,
            $top-adjustment: 0px,
            $bottom-adjustment: 0px
        ) {
            // Configured in Step 1
            $top-crop: 0;
            $bottom-crop: 6;
            $crop-font-size: 31;
            $crop-line-height: 1.2;

            // Apply values to calculate em-based margins that work with any font size
            $dynamic-top-crop: max(
                    (
                        $top-crop + ($line-height - $crop-line-height) *
                            ($crop-font-size / 2)
                    ),
                    0
                ) / $crop-font-size;
            $dynamic-bottom-crop: max(
                    (
                        $bottom-crop + ($line-height - $crop-line-height) *
                            ($crop-font-size / 2)
                    ),
                    0
                ) / $crop-font-size;

            // Mixin output
            line-height: $line-height;

            &::before,
            &::after {
                content: "";
                display: block;
                height: 0;
                width: 0;
            }

            &::before {
                margin-bottom: calc(
                    -#{$dynamic-top-crop}em + #{$top-adjustment}
                );
            }

            &::after {
                margin-top: calc(
                    -#{$dynamic-bottom-crop}em + #{$bottom-adjustment}
                );
            }
        }

        @include text-crop();
    }
</style>
