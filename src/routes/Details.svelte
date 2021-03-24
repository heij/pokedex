<script>
    export let pokemon;
    export let params = {};

    import {
        capitalize,
        kebabToSpace,
        formatText,
        clearLinebreaks,
    } from "../utils/formatter.js";
    import { parseEvolutionDetails } from "../utils/evolutionDetails.js";
    import { parseMove } from "../utils/moveParser.js";
    import {
        getPokemon,
        getSpecies,
        getMove,
        fetchUrl,
    } from "../services/pokeapi.js";
    import TypeIcon from "../components/typeIcon.svelte";
    import typeColors from "../data/typeColors.json";
    import versionGroupNames from "../data/versionGroupNames.json";
    import statLabels from "../data/statLabels.json";
    import { tweened } from "svelte/motion";
    import { expoOut, elasticOut, expoIn, quartOut } from "svelte/easing";
    import { send, receive } from "../animations/crossfade.js";
    import { onResize } from "../utils/onResize";

    import { fly, slide, fade } from "svelte/transition";

    import "skeleton-elements/skeleton-elements.css";
    import { SkeletonText } from "skeleton-elements/svelte";
    import { SkeletonBlock } from "skeleton-elements/svelte";

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

    function sortMovesetByVersions(pokemon) {
        return pokemon.moves.reduce((res, m) => {
            m.version_group_details.forEach((v) => {
                if (!(v.version_group.name in res)) {
                    res[v.version_group.name] = [];
                }

                let move = { ...m };
                delete move.version_group_details;
                move.version = v;

                res[v.version_group.name].push(move);
            });

            return res;
        }, {});
    }

    function getMovesetVersions(pokemon) {
        return pokemon.moves.reduce((res, m) => {
            let versions = m.version_group_details.map(
                (v) => v.version_group.name
            );

            versions.forEach((v) => {
                if (!res.includes(v)) {
                    res.push(v);
                }
            });

            return res;
        }, []);
    }

    function sortMovesetByLearnMethod(moves) {
        if (!moves) return {};

        return moves.reduce((res, m) => {
            let method = m.version.move_learn_method.name;

            if (!(method in res)) {
                res[method] = [];
            }

            res[method].push(m);

            return res;
        }, {});
    }

    function getMoveData(moves) {
        return moves.map((m) => getMove(m.url));
    }

    function getEvolutionChain(
        chain,
        currentLevel = 0,
        evolvesFrom = null,
        result = []
    ) {
        if (!chain.evolves_to) {
            return result;
        }

        let selfReference = {
            name: chain.species.name,
            url: chain.species.url,
        };

        if (!result[currentLevel]) {
            result[currentLevel] = [];
        }

        let evoDetails = chain.evolution_details[0];
        let trigger = evoDetails?.trigger;
        delete evoDetails?.trigger;

        if (evoDetails) {
            evoDetails = Object.entries(evoDetails).reduce((res, [k, v]) => {
                if (v || v === 0) {
                    res[k] = v;
                }
                return res;
            }, {});
        }

        result[currentLevel].push({
            ...selfReference,
            evolvesFrom: evolvesFrom,
            evolutionDetails: evoDetails,
            trigger: trigger,
            pokemonData: getPokemon(selfReference.name),
            isBaby: chain.is_baby,
        });

        chain.evolves_to.forEach((c) => {
            getEvolutionChain(c, currentLevel + 1, selfReference, result);
        });

        return result;
    }

    pokemon = null;
    let species;
    let evolutionData;

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

    let windowX;
    let abilities = [];
    let types = [];
    let evolutionChain = [];
    let evoBaby = false;
    let genus = "";
    let flavorsTexts = [];
    let currentFlavorVersion = "";
    let currentFlavorText = "";
    let movesetVersions = [];
    let currentMovesetVersion = "";
    let currentMoveset = [];
    let movesets = {};
    let femaleRatio = tweened(-1, { duration: 750, easing: expoOut });
    let sprite = "";
    let statIcons = [
        "../assets/1x/hp.png",
        "../assets/1x/atk.png",
        "../assets/1x/def.png",
        "../assets/1x/sp_atk.png",
        "../assets/1x/sp_def.png",
        "../assets/1x/spe.png",
    ];

    $: currentFlavorText = getFlavorText(species, currentFlavorVersion);
    $: currentMoveset = movesets[currentMovesetVersion];

    function loadData() {
        return new Promise(async (resolve, reject) => {
            [pokemon, species] = await Promise.all([
                getPokemon(params.id),
                getSpecies(params.id),
            ]);

            evolutionData = await fetchUrl(species.evolution_chain.url);
            evolutionChain = getEvolutionChain(evolutionData.chain);

            if (evolutionChain[0][0].isBaby == true) {
                evoBaby = true;
            }

            nationalId = getNationalId(species);
            abilities = getAbilities(pokemon);
            types = getTypes(pokemon);
            genus = getGenus(species);
            flavorsTexts = getFlavorVersions(species);
            currentFlavorVersion = flavorsTexts[0].version.name;
            movesets = sortMovesetByVersions(pokemon);
            movesetVersions = getMovesetVersions(pokemon);
            currentMovesetVersion = movesetVersions[0];
            sprite = pokemon.sprites.other["official-artwork"].front_default;
            femaleRatio.set(getFemaleRatio(species));
            stats.set(getStats(pokemon));

            resolve();

            // setTimeout(() => {
            //     drawEvoArrows();
            // }, 2000);
        });
    }

    function drawEvoArrows() {
        let container = document.querySelector(".evolution-chain");
        let canvas = document.querySelector("canvas.arrows");
        let { width, height } = container.getBoundingClientRect();

        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#000";
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        let rows = [...document.querySelectorAll(".evolution-chain .row")];

        evolutionChain.forEach((tier, ti) => {
            let rowH = rows[ti].offsetTop;

            tier.forEach((pokemon) => {
                if (!pokemon.evolvesFrom) return;
                let curr = document.querySelector(`#evo-${pokemon.name}`);
                let prev = document.querySelector(
                    `#evo-${pokemon.evolvesFrom.name}`
                );

                let currBr = curr.getBoundingClientRect();
                let prevBr = prev.getBoundingClientRect();

                ctx.beginPath();
                ctx.moveTo(
                    prev.offsetLeft + prevBr.width / 2,
                    prev.offsetTop + prevBr.height
                );
                ctx.lineTo(
                    prev.offsetLeft + prevBr.width / 2,
                    prev.offsetTop + prevBr.height + 20
                );
                ctx.lineTo(
                    curr.offsetLeft + currBr.width / 2,
                    prev.offsetTop + prevBr.height + 20
                );
                ctx.lineTo(
                    curr.offsetLeft + currBr.width / 2,
                    curr.offsetTop + rowH
                );
                ctx.stroke();
            });
        });
    }

    let data;
    // https://github.com/ItalyPaleAle/svelte-spa-router/issues/14#issuecomment-544532053
    $: if (params.id) {
        data = loadData();
    }

    onResize(() => {
        if (!document.querySelector(".evolution-chain")) return;
        drawEvoArrows();
    });
</script>

<svelte:window bind:innerWidth={windowX} />

<div class="page">
    <div
        class="details {species && `bg-${species.color.name}`}"
        transition:fly|local={{
            x: window.innerWidth,
            duration: 500,
            easing: expoIn,
        }}
    >
        {#await data}
            <div
                class="skeleton-wrapper"
                transition:fade={{ duration: 500, easing: expoOut }}
            >
                <div class="panel">
                    <div class="id section">
                        <SkeletonText tag="div" effect="pulse"
                            >0000</SkeletonText
                        >
                        <h2 class="name">
                            <SkeletonText tag="div" effect="pulse"
                                >POKEMON</SkeletonText
                            >
                        </h2>
                        <h4 class="genus">
                            <SkeletonText tag="div" effect="pulse"
                                >POKEMON</SkeletonText
                            >
                        </h4>
                    </div>

                    <div class="img-wrapper section">
                        <SkeletonBlock
                            width="100%"
                            height="100%"
                            effect="pulse"
                        />
                    </div>

                    <div class="types section">
                        <SkeletonBlock
                            width="100%"
                            height="50px"
                            effect="pulse"
                        />
                    </div>

                    <div class="flavor-text section">
                        <SkeletonBlock
                            width="100%"
                            height="100px"
                            effect="pulse"
                        />
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
                            height="150px"
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

                    <div class="metrics section">
                        <h3 class="title">MEASUREMENTS</h3>
                        <SkeletonBlock
                            width="100%"
                            height="150px"
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
            </div>
        {:then}
            <div class="panel bg-{species.color.name}-dark">
                <div class="id section">
                    <p class="national-id">{nationalId}</p>
                    <h2 class="name">{species.name.toUpperCase()}</h2>
                    <h4 class="genus">{genus}</h4>
                </div>

                <div
                    class="img-wrapper section"
                    style={types
                        .map(
                            (type, i) =>
                                `--type-color-${i + 1}: ${typeColors[type]};`
                        )
                        .join("") + `species-color: ${species.color.name}`}
                >
                    <img class="bg" src="../assets/1x/pokeball_md.png" alt="" />
                    <img class="sprite" src={sprite} alt="" />
                    <img
                        class="shadow"
                        src={sprite}
                        alt=""
                        style="--species-color: {species.color.name}"
                    />
                </div>

                <div class="pokemon-details section">
                    <div class="metrics">
                        <div class="body">
                            <div class="metric height">
                                <h4>HEIGHT</h4>
                                <h4>{(pokemon.height * 0.1).toFixed(2)}m</h4>
                            </div>
                            <div class="metric weight">
                                <h4>WEIGHT</h4>
                                <h4>{(pokemon.weight * 0.1).toFixed(2)}kg</h4>
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
                                    <TypeIcon {type} color="#000" />
                                </div>
                                <p class="type-name text-crop">
                                    {type.toUpperCase()}
                                </p>
                            </div>
                        {/each}
                    </div>
                    <div class="flavor-text-wrapper">
                        <h2 class="text-crop">“</h2>
                        <p>
                            {clearLinebreaks(currentFlavorText)}
                        </p>
                        <h2 class="text-crop" style="text-align: end;">”</h2>
                    </div>
                    <div class="flavor-select-wrapper">
                        <span>VERSION: </span>

                        <select name="" id="" bind:value={currentFlavorVersion}>
                            {#each getFlavorVersions(species) as { version }}
                                <option value={version.name}>
                                    {capitalize(kebabToSpace(version.name))}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="abilities section">
                    <h3 class="title">ABILITIES</h3>
                    <div class="abilities-body">
                        {#each abilities as ability}
                            <div class="hidden-tag center-content">
                                <small
                                    >{ability.is_hidden ? "HIDDEN" : ""}</small
                                >
                            </div>
                            <div
                                class="ability center-content"
                                class:hidden={ability.is_hidden}
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
            </div>

            <div class="panel-lg">
                <div class="moves section">
                    <h3 class="title">MOVES</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th class="col-md">Category</th>
                                    <th class="col-md">Power</th>
                                    <th class="col-md">Accuracy</th>
                                    <th class="col-md">PP</th>
                                    <th class="description">Description</th>
                                    <th>Learn Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each currentMoveset as { move, version }}
                                    {#await fetchUrl(move.url) then rawData}
                                        {#each [parseMove(rawData)] as moveData}
                                            <tr>
                                                <td
                                                    >{capitalize(
                                                        kebabToSpace(move.name)
                                                    )}</td
                                                >
                                                <td>
                                                    <TypeIcon
                                                        type={moveData.type
                                                            .name}
                                                    />
                                                </td>
                                                <td class="col-md"
                                                    >{formatText(
                                                        moveData.damage_class
                                                            .name
                                                    )}</td
                                                >
                                                <td class="col-md"
                                                    >{moveData.power || 0}</td
                                                >
                                                <td class="col-md"
                                                    >{moveData.accuracy ||
                                                        "-"}</td
                                                >
                                                <td class="col-md"
                                                    >{moveData.pp}</td
                                                >
                                                <td class="description"
                                                    >{moveData.effect_entries[0]
                                                        .short_effect}</td
                                                >
                                                <td>
                                                    {capitalize(
                                                        kebabToSpace(
                                                            version
                                                                .move_learn_method
                                                                .name
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        {/each}
                                    {/await}
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <div class="moveset-select-wrapper">
                        <span>VERSION: </span>
                        <select
                            name=""
                            id=""
                            bind:value={currentMovesetVersion}
                        >
                            {#each getMovesetVersions(pokemon) as version}
                                <option value={version}>
                                    {versionGroupNames[version]}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>

            <div class="panel-lg">
                <h3 class="title">EVOLUTION CHAIN</h3>
                <div class="evolution-chain">
                    {#each evolutionChain as row, i}
                        <div class="row">
                            <div class="stage-label">
                                <p>STAGE</p>
                                {#if !evoBaby}
                                    <h3>{i + 1}</h3>
                                {:else if i == 0}
                                    <h4>BABY</h4>
                                {:else}
                                    <h3>{i}</h3>
                                {/if}
                            </div>
                            <div class="stage-body">
                                {#each row as pokemon}
                                    <div
                                        id="evo-{pokemon.name}"
                                        class="evo-entry"
                                    >
                                        <div class="requirements">
                                            {#if pokemon.evolutionDetails}
                                                {#each parseEvolutionDetails(pokemon.trigger.name, pokemon.evolutionDetails) as requirement, i}
                                                    {#if i == 0}
                                                        <h4>{requirement}</h4>
                                                    {:else}
                                                        <p>{requirement}</p>
                                                    {/if}
                                                {/each}
                                            {/if}
                                        </div>
                                        {#await pokemon.pokemonData then data}
                                            <img
                                                src={data.sprites.front_default}
                                                alt=""
                                                use:drawEvoArrows
                                            />
                                        {/await}
                                        <h3>{capitalize(pokemon.name)}</h3>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                    <canvas class="arrows" />
                </div>
            </div>
        {:catch err}
            <p>There was an error loading this pokemon</p>
        {/await}
    </div>
</div>

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
        width: 100%;
        margin-bottom: 20px;
        padding: 0 20px;
        overflow-x: hidden;

        @media (min-width: 600px) {
            // max-width: 50%;
            max-width: 500px;
        }

        &:nth-child(1) {
            box-shadow: 5px 5px 10px #000;
            border-radius: 10px;
            color: white;
            padding: 0;
        }

        &:nth-child(2) {
            background: #292626;
            color: white;
            padding: 20px;
            border-radius: 10px;
            /* height: fit-content; */
        }
    }

    .panel-lg {
        width: 100%;
        margin-bottom: 20px;
        padding: 0 20px;
    }

    .section {
        position: relative;
        z-index: 2;
        &:not(:first-child) {
            margin-top: 20px;
        }
    }

    select {
        background: #130f0f;
        border: 0;
        outline: none;
        color: #d6d6d6;
    }

    .id {
    }

    .title {
        margin-bottom: 10px;
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
        display: flex;
        justify-content: center;
        z-index: 1;
        padding: 0 20px;

        .sprite {
            // max-width: 300px;
            width: 100%;
            z-index: 2;
            filter: drop-shadow(2px 2px 5px #000);

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
            filter: brightness(0) opacity(0.4)
                drop-shadow(0px 0px 0px var(--species-color))
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
    }

    .types {
        $icon-size: 40px;

        display: flex;
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
                padding: 5px;
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
                    opacity: 0.2;
                    pointer-events: none;
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

        .weight {
            // background-image: url("../assets/1x/weight.png");
        }

        .height {
            // background-image: url("../assets/1x/height3.png");
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
                margin-right: 5px;
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

        .ability {
            padding: 5px;
            border: 1px solid #000;
            text-align: center;

            &.hidden {
                border: 1px solid #777777;
            }
        }
    }

    .moves {
        .table-wrapper {
            height: 500px;
            overflow: auto;
        }

        table {
            position: relative;
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0.5rem;
            color: #fff;

            th {
                position: sticky;
                top: 0;
                height: 1rem;
                background: #130f0f;
                color: #fff;
                padding: 1rem;
                text-align: left;
            }

            td {
                padding: 1rem;
                background: #292626;
            }

            .col-md {
                display: none;
                @media (min-width: 600px) {
                    display: table-cell;
                }
            }
        }

        .moveset-select-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            background: #292626;
            color: white;

            span {
                margin-right: 5px;
                font-weight: bold;
            }
        }
    }

    .evolution-chain {
        position: relative;
        width: 100%;
        // display: flex;
        // flex-direction: column;

        .row {
            position: relative;
            display: flex;
            flex-direction: row;
            width: 100%;
            flex-wrap: wrap;
            z-index: 2;

            &:not(:first-child) {
                margin-top: 50px;
            }
        }

        .stage-label {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            flex-direction: column;
            padding: 0 0px 0 10px;
            margin-right: 20px;
            border-left: 1px solid black;
            border-bottom: 1px solid black;
            border-top: 1px solid black;
        }

        .stage-body {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            grid-column-gap: 1rem;
            grid-row-gap: 1rem;
        }

        .evo-entry {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            flex: 1;
            background: #292626;
            color: #fff;
            box-shadow: 0 0 5px #000;
            padding: 10px;
        }

        img {
            margin-top: auto;
            height: 96px;
            width: 96px;
        }

        .requirements {
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

    canvas.arrows {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
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
        background: lightcoral;

        &.panel {
            width: 50%;
        }

        .img-wrapper {
            width: 100%;
            height: 300px;
            filter: none;
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
