<script>
    import { fetchUrl } from "../services/pokeapi.js";
    import { kebabToSpace } from "../utils/formatter.js";
    import { getContext } from "svelte";

    import "skeleton-elements/skeleton-elements.css";
    import { SkeletonText } from "skeleton-elements/svelte";
    import { SkeletonBlock } from "skeleton-elements/svelte";

    let { getData } = getContext("data");
    $: ability = getData();

    function getEffect(ability) {
        return ability?.effect_entries?.find((e) => e.language.name == "en")
            ?.effect;
    }
</script>

{#await fetchUrl(ability.url)}
    <div class="header">
        <SkeletonBlock />
    </div>
    <div class="body">
        <SkeletonBlock />
        <SkeletonBlock />
    </div>
{:then ability}
    <div class="header">
        <h3>{kebabToSpace(ability.name).toUpperCase()}</h3>
    </div>
    <div class="body">
        <p>{getEffect(ability) || "Data unavailable"}</p>
    </div>
{/await}

<style lang="scss">
    .header {
        padding: 0 0 10px 0;
    }
</style>
