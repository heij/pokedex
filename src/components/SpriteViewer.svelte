<script>
    import { formatText } from "../utils/formatter";
    import { fly, fade } from "svelte/transition";
    import { quartOut } from "svelte/easing";
    import versionGroupNames from "../data/versionGroupNames.json";

    export let pokemon;
    export let femaleRatio;

    let side;
    let shiny;
    let gender;

    let rotateEnabled = false;
    let shinyEnabled = false;
    let genderEnabled = false;

    let spriteRef;
    let selectedVersion;
    let transitionType = null;

    $: spriteRef = getSprites(pokemon);
    $: selectedVersion, setCheckboxes(spriteRef[selectedVersion]);
    $: currentSprite = spriteRef[selectedVersion]
        ? spriteRef[selectedVersion][getSpriteKey(side, shiny, gender)]
        : "";

    function formatSprites(sprites) {
        return {
            ...(sprites.back_default && {
                back_normal_default: sprites.back_default,
            }),
            ...(sprites.back_female && {
                back_normal_female: sprites.back_female,
            }),
            ...(sprites.back_shiny && {
                back_shiny_default: sprites.back_shiny,
            }),
            ...(sprites.back_shiny_female && {
                back_shiny_female: sprites.back_shiny_female,
            }),
            ...(sprites.front_default && {
                front_normal_default: sprites.front_default,
            }),
            ...(sprites.front_female && {
                front_normal_female: sprites.front_female,
            }),
            ...(sprites.front_shiny && {
                front_shiny_default: sprites.front_shiny,
            }),
            ...(sprites.front_shiny_female && {
                front_shiny_female: sprites.front_shiny_female,
            }),
        };
    }

    function getSprites(pokemon) {
        let sprites = pokemon.sprites;

        return {
            default: formatSprites(sprites),
            ...Object.entries(pokemon.sprites.versions).reduce(
                (res, [gen, versions]) => {
                    Object.entries(versions).forEach(([v, value]) => {
                        if (!Object.values(value).some((x) => x)) {
                            return;
                        }

                        res[v] = formatSprites(value);
                    });

                    return res;
                },
                {}
            ),
        };
    }

    function getSpriteKey(side, shiny, gender) {
        let spriteKey = [];

        spriteKey.push(side ? "back" : "front");
        spriteKey.push(shiny ? "shiny" : "normal");
        spriteKey.push(gender ? "female" : "default");

        return spriteKey.join("_");
    }

    function setCheckboxes(sprites) {
        if (!sprites) return;

        let spriteKeys = Object.keys(sprites);

        rotateEnabled =
            spriteKeys.some((k) => k.includes("front")) &&
            spriteKeys.some((k) => k.includes("back"));
        shinyEnabled =
            spriteKeys.some((k) => k.includes("normal")) &&
            spriteKeys.some((k) => k.includes("shiny"));
        genderEnabled =
            spriteKeys.some((k) => k.includes("default")) &&
            spriteKeys.some((k) => k.includes("female"));

        if (!rotateEnabled) side = false;
        if (!shinyEnabled) shiny = false;
        if (!genderEnabled) gender = false;
    }

    function rotateIn(node, { duration, easing }) {
        return {
            duration,
            easing,
            css: (t) => {
                const eased = easing(t);

                return `
                    opacity: ${eased};
					transform: translateX(-50%) rotateY(${eased * 180 - 180}deg);`;
            },
        };
    }

    function rotateOut(node, { duration, easing }) {
        return {
            duration,
            easing,
            css: (t) => {
                const eased = easing(t);

                return `
                    opacity: ${eased - 1};
					transform: translateX(-50%) rotateY(${eased * 180}deg);`;
            },
        };
    }
</script>

<div class="sprite-wrapper center-content">
    {#each [currentSprite] as sprite (sprite)}
        <img
            src={sprite}
            alt=""
            in:rotateIn={{
                duration: 500,
                easing: quartOut,
                delay: 500,
            }}
            out:rotateOut={{
                duration: 500,
                easing: quartOut,
            }}
        />
    {/each}
</div>

<div class="checkbox-wrapper">
    <label for="">
        <span>ROTATE</span>
        <input
            type="checkbox"
            bind:checked={side}
            disabled={!rotateEnabled}
            on:change={() => (transition) => "rotate"}
        />
    </label>
    <label for="">
        <span>SHINY</span>
        <input type="checkbox" bind:checked={shiny} disabled={!shinyEnabled} />
    </label>
    <label for="">
        <span>GENDER</span>
        <input
            type="checkbox"
            bind:checked={gender}
            disabled={!genderEnabled || femaleRatio < 0}
        />
    </label>
</div>

<div class="select-wrapper center-content">
    <select name="" id="" bind:value={selectedVersion}>
        {#each Object.keys(spriteRef) as version}
            <option value={version}
                >{versionGroupNames[version] || formatText(version)}</option
            >
        {/each}
    </select>
</div>

<style lang="scss">
    .sprite-wrapper {
        margin: 30px 0 0 0;
        img {
            width: 200px;
            height: 200px;
            border: 5px solid;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.5);
            filter: drop-shadow(0px 0px 5px #000);
            transform: rotateY(0);
        }
    }

    .checkbox-wrapper {
        display: flex;
        justify-content: center;
        margin: 10px 0;

        label {
            margin: 0 10px;
        }
    }
</style>
