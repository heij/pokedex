<script>
    export let pokemon;
    export let params = {};

    import {
        capitalize,
        kebabToSpace,
        clearLinebreaks,
    } from "../utils/formatter.js";
    import { getPokemon, getSpecies } from "../services/pokeapi.js";
    import TypeIcon from "../components/typeIcon.svelte";
    import typeColors from "../data/typeColors.json";
    import versionGroupNames from "../data/versionGroupNames.json";
    import statLabels from "../data/statLabels.json";
    import { tweened } from "svelte/motion";
    import { expoOut } from "svelte/easing";

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

    let statCategories = ["hyper", "high", "medium", "low"];
    function getStatCategory(stat) {
        let index = [150, 120, 90, 0].findIndex((t) => stat >= t);
        return statCategories[index];
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

    function getMovesetLearnMethods(moves) {
        return moves.reduce((res, m) => {
            let method = m.version.move_learn_method.name;
            if (!res.includes(method)) {
                res.push(method);
            }

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

    pokemon = null;
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
            duration: 1000,
            easing: expoOut,
        }
    );

    let abilities = [];
    let types = [];
    let genus = "";
    let flavorsTexts = [];
    let currentFlavorVersion = "";
    let currentFlavorText = "";
    let movesetVersions = [];
    let currentMovesetVersion = "";
    let currentMoveset = "";
    let movesets = {};
    let femaleRatio = -1;
    let sprite = "";

    $: currentFlavorText = getFlavorText(species, currentFlavorVersion);
    $: currentMoveset = Object.entries(
        sortMovesetByLearnMethod(movesets[currentMovesetVersion])
    );

    function loadData() {
        return new Promise(async (resolve, reject) => {
            [pokemon, species] = await Promise.all([
                getPokemon(params.id),
                getSpecies(params.id),
            ]);

            nationalId = getNationalId(species);
            abilities = getAbilities(pokemon);
            types = getTypes(pokemon);
            genus = getGenus(species);
            flavorsTexts = getFlavorVersions(species);
            currentFlavorVersion = flavorsTexts[0].version.name;
            movesets = sortMovesetByVersions(pokemon);
            movesetVersions = getMovesetVersions(pokemon);
            currentMovesetVersion = movesetVersions[0];
            femaleRatio = getFemaleRatio(species);
            sprite = pokemon.sprites.other["official-artwork"].front_default;
            stats.set(getStats(pokemon));

            resolve();
        });
    }
</script>

<div class="details">
    {#await loadData()}
        <p>...</p>
    {:then p}
        <div class="panel">
            <div class="id section">
                <p class="national-id">{nationalId}</p>
                <h2 class="name">{pokemon.name.toUpperCase()}</h2>
                <h4 class="genus">{genus}</h4>
            </div>

            <div class="img-wrapper section">
                <img src={sprite} alt="" />
            </div>

            <div
                class="types section"
                class:single={types.length == 1}
                class:double={types.length == 2}
            >
                {#each types as type}
                    <div class="type-tag {type}">
                        <div class="icon">
                            <TypeIcon {type} />
                        </div>
                        <h4 class="type-name" style="color: {typeColors[type]}">
                            {type.toUpperCase()}
                        </h4>
                    </div>
                {/each}
            </div>

            <div class="metrics section">
                <div class="center-content metric height">
                    <h4>{(pokemon.height * 0.1).toFixed(2)}m</h4>
                </div>
                <div class="center-content metric weight">
                    <h4>{(pokemon.weight * 0.1).toFixed(2)}kg</h4>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="abilities section">
                <h3 class="title">ABILITIES</h3>
                <div class="abilities-body">
                    {#each abilities as ability}
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
                    {#each Object.entries(statLabels) as [stat, { sm, md }]}
                        <label for={stat}>
                            {kebabToSpace(md).toUpperCase()}
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
                    class:genderless={femaleRatio < 0}
                    class:female-only={femaleRatio === 1}
                    class:male-only={femaleRatio === 0}
                    style="--female-ratio: {femaleRatio}"
                >
                    <span class="bar" />
                    <p class="gender-tag text-male">
                        {(1 - femaleRatio) * 100}% MALE
                    </p>
                    <p class="gender-tag text-genderless">GENDERLESS</p>
                    <p class="gender-tag text-female">
                        {femaleRatio * 100}% FEMALE
                    </p>
                </div>
            </div>
        </div>

        <div class="panel-lg">
            <div class="moves section">
                <h3 class="title">MOVES</h3>
                <select name="" id="" bind:value={currentMovesetVersion}>
                    {#each getMovesetVersions(pokemon) as version}
                        <option value={version}>
                            {versionGroupNames[version]}
                        </option>
                    {/each}
                </select>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Power</th>
                                <th>PP</th>
                                <th>Accuracy</th>
                                <th class="description">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each currentMoveset as [method, moveset]}
                                <tr>
                                    <td colspan="7" class="learn_method">
                                        {capitalize(kebabToSpace(method))}
                                    </td>
                                </tr>
                                {#each moveset as { move }}
                                    <tr>
                                        <td
                                            >{capitalize(
                                                kebabToSpace(move.name)
                                            )}</td
                                        >
                                        <td>1</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td class="description">1</td>
                                    </tr>
                                {/each}
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="evolution-chain section" />
        </div>
    {:catch err}
        <p>There was an error loading this pokemon</p>
    {/await}
</div>

<style lang="scss">
    .details {
        position: relative;
        max-width: 100%;
        min-height: 100%;
        margin: 20px;
        // margin: 25px 200px;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-around;
    }

    .panel {
        // max-width: unquote("min(100%, 500px)");
        width: 100%;
        margin-bottom: 20px;
        padding: 0 20px;

        @media (min-width: 500px) {
            // max-width: 500px;
            max-width: 50%;
        }
    }

    .panel-lg {
        width: 100%;
        margin-bottom: 20px;
        padding: 0 20px;
    }

    .section {
        &:not(:first-child) {
            margin-top: 20px;
        }
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
        color: #676060;
        align-self: flex-end;
    }

    .name {
        position: relative;
        // display: inline-block;
        font-weight: bold;
        margin-right: 5px;
    }

    .img-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;

        img {
            max-width: 500px;
            width: 100%;
        }
    }

    .genus {
        color: #676060;
    }

    .types {
        $icon-size: 30px;

        display: flex;
        min-height: 1rem;

        .type-tag {
            position: relative;
            display: inline-flex;
            clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
            background: rgba(16, 16, 16, 0.5);
            flex: 1;
            justify-content: flex-end;

            .icon {
                position: relative;
                width: $icon-size;
                height: 100%;
                left: 0;
                top: 0;
                fill: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5px;
                z-index: 2;
            }

            .type-name {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                font-weight: bold;
                color: white;
                z-index: 1;
            }

            &:nth-child(1) {
                padding-right: 15px;
            }

            &:nth-child(2) {
                flex-direction: row-reverse;

                clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);
                padding-left: 15px;
            }
        }

        &.single {
            .type-tag {
                &:nth-child(1) {
                    // clip-path: polygon(
                    //     0 0,
                    //     100% 0,
                    //     calc(100% - 10px) 100%,
                    //     10px 100%
                    // );
                    clip-path: none;
                    justify-content: center;
                    padding-right: 0;
                }
            }
        }
    }

    .metrics {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // margin: 0 0 0 5px;
        height: 100px;

        .metric {
            height: 100%;
            width: 100px;
            color: #fff;
            padding: 5px;
            margin: 0 5px;
            background: #775e5e;
            // clip-path: polygon(10px 0, calc(100% - 10px));
        }

        .weight {
            background: url("../assets/1x/weight.png");
            background-position: center bottom;
            background-repeat: no-repeat;
            background-size: contain;

            h4 {
                align-self: flex-end;
                transform: translateY(-0.5rem);
            }
        }

        .height {
            background: url("../assets/1x/height3.png");
            background-position: center bottom;
            background-repeat: no-repeat;
            background-size: contain;

            h4 {
                align-self: flex-end;
                transform: translateY(-0.5rem);
            }
        }
    }

    .flavor-text {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        p {
            border: 1px solid rgba(0, 0, 0, 0.25);
            padding: 20px;
        }

        select {
            margin-top: 10px;
        }
    }

    .stats {
        .stats-body {
            display: grid;
            grid-template-rows: repeat(6, 1fr);
            grid-auto-columns: max-content 1fr;
            grid-auto-flow: row;
            grid-gap: 0.25rem 0.5rem;

            label {
                justify-self: end;
                grid-column: 1;
                font-weight: bold;
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
                    // adjust-color(
                    //     $color: hsl(0, 90%, 60%),
                    //     $hue: 0,
                    //     $saturation: 0%,
                    //     $lightness: 0%,
                    //     $alpha: 1
                    // );
                }

                // &.low {
                //     &:before {
                //         background: darkred;
                //     }
                // }

                // &.medium {
                //     &:before {
                //         background: yellow;
                //     }
                // }

                // &.high {
                //     &:before {
                //         background: green;
                //     }
                // }

                // &.hyper {
                //     &:before {
                //         background: cyan;
                //     }
                // }
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
            grid-column-gap: 10px;
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

            th {
                position: sticky;
                top: 0;
                height: 1rem;
                background: #fff;
            }

            .learn_method {
                text-align: center;
                font-weight: bold;
                position: sticky;
                top: calc(1.4rem + 0.25vw);
                background: #fff;
            }
        }
    }

    .gender-bar {
        --female-ratio: 0;

        --male-tag-color: #62b4fb;
        --female-tag-color: #ff4343;

        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        grid-row-gap: 0.5rem;

        .bar {
            position: relative;
            width: 100%;
            height: 25px;
            border: 1px solid rgb(102, 97, 97);
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

            &.text-male {
                grid-area: 2 / 1;
                // background: var(--male-tag-color);
                padding-left: 5px;
            }
            &.text-female {
                grid-area: 2 / 3;
                justify-self: end;
                // background: var(--female-tag-color);
                padding-right: 5px;
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
                    background: grey;
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
</style>
