<script>
    export let type;
    export let color = null;
    export let width = null;
    export let height = null;
    export let iconStyle = "normal";

    import typeColors from "../data/typeColors.json";

    let iconDir =
        iconStyle == "circle"
            ? `../assets/type_icons/circle/1x/`
            : iconStyle == "dark"
            ? `../assets/type_icons/dark/1x/`
            : `../assets/type_icons/normal/1x/`;
</script>

<span
    class="icon-wrapper {type}"
    style="--type-color: {color || typeColors[type]}"
>
    <img
        src={iconDir + `${type}.png`}
        alt=""
        class="icon-wrapper"
        style="
            width: {width
            ? `${width}px`
            : '100%'};
            height: {height
            ? `${height}px`
            : '100%'};
        "
    />
</span>

<style>
    .icon-wrapper {
        --type-color: #060101b8;

        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
