<script>
    import {
        kebabToSpace,
        formatText,
        capitalize,
        clearLinebreaks,
    } from "../utils/formatter.js";
    import { getContext } from "svelte";
    import TypeIcon from "../components/TypeIcon.svelte";

    let { getData } = getContext("data");
    $: move = getData();
</script>

<div class="header">
    <h2>{kebabToSpace(move.name).toUpperCase()}</h2>
</div>

<div class="body">
    <div class="content">
        <p>{move.effect_entries[0].effect}</p>
    </div>
    <h3>TYPE</h3>
    <div class="content icon-wrapper">
        <TypeIcon type={move.type.name} />
    </div>
    <h3>CATEGORY</h3>
    <div class="content">{formatText(move.damage_class.name)}</div>
    <h3>POWER</h3>
    <div class="content">{move.power || 0}</div>
    <h3>ACCURACY</h3>
    <div class="content">{move.accuracy || "-"}</div>
    <h3>PP</h3>
    <div class="content">{move.pp}</div>
</div>

<style lang="scss">
    .header {
        padding: 0 0 10px 0;
    }

    .icon-wrapper {
        width: 40px;
        margin-top: 5px;
    }

    .content {
        white-space: pre-wrap;
        margin-bottom: 10px;
    }
</style>
