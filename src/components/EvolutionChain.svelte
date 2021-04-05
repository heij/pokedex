<script>
    import { getPokemon } from "../services/pokeapi.js";
    import { parseEvolutionDetails } from "../utils/evolutionDetails.js";
    import { capitalize } from "../utils/formatter.js";
    import { fetchUrl } from "../services/pokeapi.js";
    import { onResize } from "../utils/onResize";

    export let species;
    export let pageElem;

    let evolutionData;
    let evolutionChain = [];

    fetchUrl(species.evolution_chain.url).then((evoData) => {
        evolutionData = evoData;
        evolutionChain = getEvolutionChain(evolutionData.chain);
    });

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
        if (evoDetails?.trigger) {
            evoDetails.trigger = undefined;
        }

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

    function drawEvoArrows() {
        let container = document.querySelector(".evolution-chain");
        let canvas = document.querySelector("canvas.arrows");
        let { width, height } = container.getBoundingClientRect();

        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#292626";
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

    onResize(() => {
        if (!document.querySelector(".evolution-chain")) return;
        drawEvoArrows();
    });
</script>

<div class="evolution-chain">
    {#each evolutionChain as row, i}
        <div class="row">
            <div class="stage-label">
                <p>STAGE</p>
                {#if !evolutionChain[0][0].isBaby}
                    <h3>{i + 1}</h3>
                {:else if i == 0}
                    <h4>BABY</h4>
                {:else}
                    <h3>{i}</h3>
                {/if}
            </div>
            <div class="stage-body">
                {#each row as pokeEvo}
                    <a
                        id="evo-{pokeEvo.name}"
                        class="evo-entry"
                        on:click={() => pageElem.scroll(0, 0)}
                        href="/#/pokemon/{pokeEvo.name}"
                    >
                        <div class="requirements">
                            {#if pokeEvo.evolutionDetails}
                                {#each parseEvolutionDetails(pokeEvo.trigger.name, pokeEvo.evolutionDetails) as requirement, i}
                                    {#if i == 0}
                                        <h4>{requirement}</h4>
                                    {:else}
                                        <p>{requirement}</p>
                                    {/if}
                                {/each}
                            {/if}
                        </div>
                        {#await pokeEvo.pokemonData then data}
                            <img
                                src={data.sprites.front_default}
                                alt=""
                                use:drawEvoArrows
                            />
                        {/await}
                        <h3>{capitalize(pokeEvo.name)}</h3>
                    </a>
                {/each}
            </div>
        </div>
    {/each}
    <canvas class="arrows" />
</div>

<style lang="scss">
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
            text-decoration: none;
            transition: background 0.2s ease-out;

            &:hover {
                background: #151313;
            }
        }

        img {
            margin-top: auto;
            height: 96px;
            width: 96px;
        }

        canvas.arrows {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
        }
    }
</style>
