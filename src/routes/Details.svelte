<script>
    export let pokemon;
    export let params = {};
    import victini from "../resources/victini.json";
    import victiniSpecies from "../resources/victiniSpecies.json";
    import { capitalize, kebabToSpace } from "../utils/formatter.js";
    import TypeIcon from "../components/typeIcon.svelte";
    import typeColors from "../data/typeColors.json";

    function getPokemon() {
        let pokemonId = params.id;
    }

    function getNationalId(species) {
        let genus = species.pokedex_numbers.find(
            (p) => (p.pokedex.name = "national")
        ).entry_number;
        return `#${genus}`;
    }

    function getGenus(species) {
        return species.genera.find((g) => g.language.name == "en").genus;
    }

    function getTypes(pokemon) {
        return pokemon.types.map((t) => t.type.name);
    }

    function getFlavorText(species, version) {
        return species.flavor_text_entries.find(
            (s) => s.language.name == "en" && s.version.name == "y"
        ).flavor_text;
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

    pokemon = victini;
    let species = victiniSpecies;

    let nationalId = getNationalId(species);
    let stats = getStats(pokemon);
    let abilities = getAbilities(pokemon);
    let types = getTypes(pokemon);
    let genus = getGenus(species);
    let flavorVersion;
    let flavorText;
    let movesetVersion;
    let moveset;
    let femaleRatio = getFemaleRatio(species);
</script>

<div class="details">
    <div class="header">
        <div class="line">
            <h2 class="name">{pokemon.name.toUpperCase()}</h2>
            <p class="id">{nationalId}</p>
            <div class="types">
                {#each types as type}
                    <div class="type-tag {type}">
                        <div class="icon">
                            <TypeIcon {type} />
                        </div>
                        <p class="type-name">{type.toUpperCase()}</p>
                    </div>
                {/each}
            </div>
        </div>
        <div>
            <h4 class="genus">{genus}</h4>
        </div>
    </div>

    <div class="img-wrapper">
        <img src="assets/victini_md.png" alt="" />
    </div>

    <div class="flavor-text">
        {getFlavorText(species)}
    </div>

    <div class="line">
        <p class="metric">{pokemon.height * 0.1}m</p>
        <p class="metric">{pokemon.weight * 0.1}kg</p>
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

    <div class="stats">
        <h3>STATS</h3>
        <div class="stats-body">
            {#each Object.entries(stats) as [stat, value]}
                <label for={stat}>{kebabToSpace(stat).toUpperCase()}</label>
                <span
                    class="bar {stat} {getStatCategory(value)}"
                    style="--current: {getStatProgress(value)}"
                />
                <p class="value">{value}</p>
            {/each}
        </div>
    </div>

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

    <div class="moves" />
</div>

<style lang="scss">
    .details {
        position: relative;
        min-height: 100%;
        margin: 25px 200px;
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
        $icon-height: 30px;
        display: inline-flex;
        margin-left: auto;

        .type-tag {
            position: relative;
            display: inline-flex;

            &.psychic {
                .icon {
                    background: rgb(255, 32, 162);
                }
                .type-name {
                    background: rgb(255, 32, 162);
                }
            }

            &.fire {
                .icon {
                    background: darkred;
                }
                .type-name {
                    background: darkred;
                }
            }

            .icon {
                position: relative;
                width: $icon-height;
                height: $icon-height;
                left: 0;
                top: 0;
                fill: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5px;
                z-index: 2;

                &.psychic {
                    background: rgb(255, 32, 162);
                }

                &.fire {
                    background: darkred;
                }
            }

            .type-name {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                font-weight: bold;
                padding: 5px 15px 5px calc(2 * #{$icon-height} / 3);
                color: white;
                margin-left: calc(-2 * #{$icon-height} / 3);
                z-index: 1;
                border-radius: 0 10px 10px 0;
            }

            &:nth-child(2) {
                flex-direction: row-reverse;

                .type-name {
                    margin-right: calc(-2 * #{$icon-height} / 3);
                    margin-left: -10px;
                    padding: 5px calc(2 * #{$icon-height} / 3) 5px 5px;
                }
            }
        }
    }

    // .type :global(svg) {
    //     width: 75%;
    //     height: 75%;
    // }

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
