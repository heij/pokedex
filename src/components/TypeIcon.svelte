<script>
    export let type;

    import typeColors from "../data/typeColors.json";

    import bug from "../resources/type_icons/bug.svg";
    import dark from "../resources/type_icons/dark.svg";
    import dragon from "../resources/type_icons/dragon.svg";
    import electric from "../resources/type_icons/electric.svg";
    import fairy from "../resources/type_icons/fairy.svg";
    import fighting from "../resources/type_icons/fighting.svg";
    import fire from "../resources/type_icons/fire.svg";
    import flying from "../resources/type_icons/flying.svg";
    import ghost from "../resources/type_icons/ghost.svg";
    import grass from "../resources/type_icons/grass.svg";
    import ground from "../resources/type_icons/ground.svg";
    import ice from "../resources/type_icons/ice.svg";
    import normal from "../resources/type_icons/normal.svg";
    import poison from "../resources/type_icons/poison.svg";
    import rock from "../resources/type_icons/rock.svg";
    import steel from "../resources/type_icons/steel.svg";
    import water from "../resources/type_icons/water.svg";
    import psychic from "../resources/type_icons/psychic.svg";

    let icons = {
        bug,
        dark,
        dragon,
        electric,
        fairy,
        fighting,
        fire,
        flying,
        ghost,
        grass,
        ground,
        ice,
        normal,
        poison,
        rock,
        steel,
        water,
        psychic,
    };
</script>

<span class="icon-wrapper {type}" style="--type-color: {typeColors[type]}">
    {@html icons[type]}
</span>

<style>
    .icon-wrapper {
        --type-color: #fff;

        width: 100%;
        height: 100%;
        fill: var(--type-color);
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
