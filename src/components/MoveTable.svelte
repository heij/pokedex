<script>
    import { fetchUrl } from "../services/pokeapi.js";
    import { parseMove } from "../utils/moveParser.js";
    import {
        capitalize,
        kebabToSpace,
        formatText,
    } from "../utils/formatter.js";
    import TypeIcon from "../components/TypeIcon.svelte";
    import versionGroupNames from "../data/versionGroupNames.json";

    export let pokemon;
    export let moveModal;

    let currentMovesetVersion;
    let movesets;
    let movesetOptions;

    $: (movesets = sortMovesetByVersions(pokemon)),
        (currentMovesetVersion = Object.keys(movesets)[0]);
    $: currentMovesetVersion;
    $: currentMoveset = movesets[currentMovesetVersion] || [];
    $: movesetOptions = getMovesetVersions(pokemon);

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
</script>

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
                <th class="col-md">Learn Method</th>
            </tr>
        </thead>
        <tbody>
            {#if currentMoveset.length}
                {#each currentMoveset as { move, version }}
                    {#await fetchUrl(move.url) then rawData}
                        {#each [parseMove(rawData)] as moveData}
                            <tr
                                class="clickable"
                                on:click={() => moveModal.show(moveData)}
                            >
                                <td>{capitalize(kebabToSpace(move.name))}</td>
                                <td class="move-type">
                                    <TypeIcon
                                        type={moveData.type.name}
                                        width="50"
                                        height="50"
                                        iconStyle="normal"
                                    />
                                </td>
                                <td class="col-md"
                                    >{formatText(
                                        moveData.damage_class.name
                                    )}</td
                                >
                                <td class="col-md">{moveData.power || 0}</td>
                                <td class="col-md"
                                    >{moveData.accuracy || "-"}</td
                                >
                                <td class="col-md">{moveData.pp}</td>
                                <td class="description"
                                    >{moveData.effect_entries[0]
                                        .short_effect}</td
                                >
                                <td class="col-md">
                                    {capitalize(
                                        kebabToSpace(
                                            version.move_learn_method.name
                                        )
                                    )}
                                </td>
                            </tr>
                        {/each}
                    {/await}
                {/each}
            {:else}
                <tr>
                    <td colspan="8">
                        <div class="moves-unavailable center-content text-bold">
                            No data available for this pokemon
                        </div>
                    </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>
{#if movesetOptions.length}
    <div class="moveset-select-wrapper">
        <span>VERSION</span>
        <select name="" id="" bind:value={currentMovesetVersion}>
            {#each movesetOptions as version}
                <option value={version}>
                    {versionGroupNames[version]}
                </option>
            {/each}
        </select>
    </div>
{/if}

<style lang="scss">
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
        height: 100%;

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

        tr:hover td {
            background: #130f0f;
        }

        .col-md {
            display: none;
            @media (min-width: 600px) {
                display: table-cell;
            }
        }

        .move-type {
            width: 50px;
            height: 50px;
        }
    }

    .moves-unavailable {
        width: 100%;
        height: 100%;
        background: #0f0d0d;
    }

    .moveset-select-wrapper {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        background: #292626;
        color: white;
        flex-wrap: wrap;
        padding: 10px 0 0 0;

        span {
            margin-right: 10px;
            font-weight: bold;
        }
    }
</style>
