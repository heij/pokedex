<script>
    export let pokemon;
    export let params = {};

    import victini from "../resources/victini.json";
    import victiniSpecies from "../resources/victiniSpecies.json";
    import {
        capitalize,
        kebabToSpace,
        clearLinebreaks,
    } from "../utils/formatter.js";
    import { getPokemon, getSpecies } from "../services/pokeapi.js";
    import TypeIcon from "../components/typeIcon.svelte";
    import typeColors from "../data/typeColors.json";
    import versionGroupNames from "../data/versionGroupNames.json";

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
        return species.flavor_text_entries.find(
            (s) => s.language.name == "en" && s.version.name == version
        )?.flavor_text;
    }

    function getStats(pokemon) {
        return pokemon.stats.reduce((res, s) => {
            res[s.stat.name] = s.base_stat;

            return res;
        }, {});
    }

    let categories = ["hyper", "high", "medium", "low"];
    function getStatCategory(stat) {
        let index = [150, 120, 90, 0].findIndex((t) => stat >= t);
        return categories[index];
    }

    function getStatProgress(stat) {
        return Math.min(stat / 200, 1);
    }

    function getAbilities(pokemon) {
        return pokemon.abilities.map((a) => {
            return {
                name: a.ability.name,
                hidden: a.is_hidden,
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
        console.log(moves);
        return moves.reduce((res, m) => {
            let method = m.version.move_learn_method.name;
            if (!res.includes(method)) {
                res.push(method);
            }

            return res;
        }, []);
    }

    function sortMovesetByLearnMethod(moves) {
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
    let nationalId;
    let stats;
    let abilities;
    let types;
    let genus;
    let flavors;
    let flavorVersion;
    let flavorText;
    let movesetVersion;
    let movesets;
    let femaleRatio;

    function loadData() {
        return new Promise(async (resolve, reject) => {
            // [pokemon, species] = await Promise.all([
            //     getPokemon(params.id),
            //     getSpecies(params.id),
            // ]);

            pokemon = victini;
            species = victiniSpecies;

            nationalId = getNationalId(species);
            stats = getStats(pokemon);
            abilities = getAbilities(pokemon);
            types = getTypes(pokemon);
            genus = getGenus(species);
            flavors = getFlavorVersions(species);
            flavorVersion = flavors[0].version.name;
            movesetVersion;
            movesets = sortMovesetByVersions(pokemon);
            femaleRatio = getFemaleRatio(species);

            resolve();
        });
    }
</script>

<div class="details">
    {#await loadData()}
        <p>...</p>
    {:then p}
        <div class="panel">
            <div class="header">
                <div class="line" style="margin-bottom: 10px;">
                    <div class="types">
                        {#each types as type}
                            <div class="type-tag {type}">
                                <div class="icon">
                                    <TypeIcon {type} />
                                </div>
                                <h4
                                    class="type-name"
                                    style="color: {typeColors[type]}"
                                >
                                    {type.toUpperCase()}
                                </h4>
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="line">
                    <h2 class="name">{pokemon.name.toUpperCase()}</h2>
                    <p class="id">{nationalId}</p>
                </div>
                <div>
                    <h4 class="genus">{genus}</h4>
                </div>
            </div>

            <div class="img-wrapper">
                <img src="assets/victini_md.png" alt="" />
                <div class="metrics">
                    <div class="center-content metric">
                        {(pokemon.height * 0.1).toFixed(2)}m
                    </div>
                    <div class="center-content metric">
                        {(pokemon.weight * 0.1).toFixed(2)}kg
                    </div>
                </div>
            </div>

            <div class="flavor-text">
                {#if species}
                    <p>
                        {clearLinebreaks(getFlavorText(species, flavorVersion))}
                    </p>
                    <select name="" id="" bind:value={flavorVersion}>
                        {#each getFlavorVersions(species) as { version }}
                            <option value={version.name}>
                                {capitalize(kebabToSpace(version.name))}
                            </option>
                        {/each}
                    </select>
                {/if}
            </div>

            <div
                class="gender"
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

        <div class="panel">
            <div class="abilities">
                <h3>ABILITIES</h3>
                <div class="abilities-body">
                    {#each abilities as ability}
                        <div class="ability">
                            {kebabToSpace(ability.name).toUpperCase()}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="stats">
                <h3>STATS</h3>
                <div class="stats-body">
                    {#each Object.entries(stats) as [stat, value]}
                        <label for={stat}
                            >{kebabToSpace(stat).toUpperCase()}</label
                        >
                        <span
                            class="bar {stat} {getStatCategory(value)}"
                            style="--current: {getStatProgress(value)}"
                        />
                        <p class="value">{value}</p>
                    {/each}
                </div>
            </div>

            <div class="moves">
                <select name="" id="" bind:value={movesetVersion}>
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
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each Object.entries(sortMovesetByLearnMethod(movesets["black-2-white-2"])) as [method, moveset]}
                                <tr>
                                    <td colspan="7" class="learn_method"
                                        >{capitalize(kebabToSpace(method))}</td
                                    >
                                </tr>
                                {#each moveset as { move }}
                                    <tr>
                                        <td
                                            >{capitalize(
                                                kebabToSpace(move.name)
                                            )}</td
                                        >
                                    </tr>
                                {/each}
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="evolution-chain" />
        </div>

        <div class="panel" />
    {/await}
</div>

<style lang="scss">
    .details {
        position: relative;
        min-height: 100%;
        // margin: 25px 200px;
        margin: 20px;

        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-around;
    }

    .panel {
        &:nth-child(1) {
            max-width: 500px;
        }
    }

    .line {
        display: flex;
    }

    .id {
        position: relative;
        display: inline-block;
        color: #676060;
        align-self: flex-end;
    }

    .name {
        position: relative;
        display: inline-block;
        font-weight: bold;
        margin-right: 5px;
    }

    .img-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }

    .genus {
        color: #676060;
    }

    .types {
        $icon-size: 30px;

        // display: inline-flex;
        display: flex;
        flex: 1;
        // margin-left: auto;
        // margin-bottom: 10px;

        .type-tag {
            position: relative;
            display: inline-flex;
            clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
            // padding: 0 10px 0 0;
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
                // padding: 5px 15px 5px calc(2 * #{$icon-size} / 3);
                // margin-left: calc(-2 * #{$icon-size} / 3);
                // border-radius: 0 10px 10px 0;
            }

            &:nth-child(1) {
                // transform: translate(10px, 0);
                padding-right: 15px;
            }

            &:nth-child(2) {
                flex-direction: row-reverse;

                clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);
                padding-left: 15px;
                // padding: 0 0 0 10px;
                // transform: translate(0, 5px);

                .type-name {
                    // padding: 0 0 0 10px;
                    // margin-right: calc(-2 * #{$icon-size} / 3);
                    // margin-left: -10px;
                    // padding: 5px calc(2 * #{$icon-size} / 3) 5px 5px;
                }
            }
        }
    }

    .metrics {
        display: flex;
        flex-direction: column;
        margin: 0 0 0 5px;
        .metric {
            height: 100%;
            color: #fff;
            padding: 5px;
            margin: 0 5px;
            background: #775e5e;
            // clip-path: polygon(10px 0, calc(100% - 10px));
        }
    }

    .flavor-text {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-bottom: 10px;

        select {
            margin-top: 10px;
        }
    }

    .stats {
        margin-top: 10px;
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
                --current: 0;

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
                    transform: scaleX(var(--current));
                    background: #fff;
                }

                &.low {
                    &:before {
                        background: darkred;
                    }
                }

                &.medium {
                    &:before {
                        background: yellow;
                    }
                }

                &.high {
                    &:before {
                        background: green;
                    }
                }

                &.hyper {
                    &:before {
                        background: cyan;
                    }
                }
            }

            .value {
                grid-column: 3;
                font-weight: bold;
            }
        }
    }

    .abilities {
        margin-top: 10px;
        .abilities-body {
            display: flex;
        }

        .ability {
            padding: 5px;
            border: 1px solid #000;
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
                top: calc(1rem + 5px);
                background: #fff;
            }
        }
    }

    .gender {
        --female-ratio: 0;

        --male-tag-color: lightblue;
        --female-tag-color: lightsalmon;

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
        }

        .text-male {
            grid-area: 2 / 1;
            // color: var(--male-tag-color);
        }

        .text-female {
            grid-area: 2 / 3;
            justify-self: end;
            // color: var(--female-tag-color);
        }

        .text-genderless {
            display: none;
            grid-area: 2 / 2;
            justify-self: center;
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

    @media screen and (max-width: 640px) {
        .details {
            margin: 10px;
        }
    }
</style>
