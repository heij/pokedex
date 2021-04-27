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
    let currentSprite;
    let sparkleTransitionRunning = false;

    $: spriteRef = getSprites(pokemon);
    $: selectedVersion,
        setCheckboxes(spriteRef[selectedVersion]),
        selectSprite();
    $: side, selectSprite(), (transitionType = "side");
    $: shiny, selectSprite(), (transitionType = "shiny");
    $: gender, selectSprite(), (transitionType = "gender");

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

    function selectSprite() {
        currentSprite = spriteRef?.[selectedVersion]
            ? spriteRef[selectedVersion][getSpriteKey(side, shiny, gender)]
            : "";
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

    function imageIn(node, { duration, easing, delay }) {
        return {
            duration,
            easing,
            delay,
            css: (t) => {
                const eased = easing(t);
                let rotate =
                    transitionType == "side"
                        ? `rotateY(${eased * 180 - 180}deg)`
                        : "";
                let shiny =
                    transitionType == "shiny"
                        ? `filter: brightness(${1 - eased});`
                        : "";
                let gender =
                    transitionType == "gender"
                        ? `rotateY(${eased * 180 - 180}deg)`
                        : "";

                return `
                    opacity: ${eased};
					transform: translate(-50%, -50%) ${rotate};
                    ${shiny}
                `;
            },
        };
    }

    function imageOut(node, { duration, easing, delay }) {
        return {
            duration,
            easing,
            delay,
            css: (t) => {
                const eased = easing(t);
                let rotate =
                    transitionType == "rotate"
                        ? `rotateY(${eased * 180}deg)`
                        : "";
                let shiny =
                    transitionType == "shiny"
                        ? `filter: brightness(${eased});`
                        : "";
                let gender =
                    transitionType == "gender"
                        ? `rotateX(${eased * 180 - 180}deg);`
                        : "";

                return `
                    opacity: ${eased - 1};
					transform: translate(-50%, -50%) ${rotate};
                    ${gender}
                    ${shiny}`;
            },
        };
    }

    function sparkle(node, { duration, easing, delay }) {
        return {
            duration,
            easing,
            delay,
            css: (t) => {
                const eased = easing(t);

                let e = eased <= 0.5 ? eased * 2 : 1 - (eased - 0.5) * 2;
                let shiny = transitionType == "shiny" ? `opacity: ${e}` : "";

                return `
                    filter: brightness(${1 - eased});
                    ${shiny}
                `;
            },
        };
    }
</script>

<div class="sprite-wrapper center-content">
    {#each [currentSprite] as sprite (sprite)}
        <img
            src={sprite}
            alt=""
            in:imageIn={{
                duration: 250,
                easing: quartOut,
            }}
            out:imageOut={{
                duration: 250,
                easing: quartOut,
            }}
        />
        <div class="sparkle-wrapper">
            <span
                class="star"
                transition:sparkle={{
                    duration: 250,
                    easing: quartOut,
                    delay: 100,
                }}>✦</span
            >
            <span
                class="star"
                transition:sparkle={{
                    duration: 250,
                    easing: quartOut,
                    delay: 50,
                }}>✦</span
            >
            <span
                class="star"
                transition:sparkle={{
                    duration: 250,
                    easing: quartOut,
                    delay: 0,
                }}>✦</span
            >
        </div>
    {/each}
</div>

<div class="checkbox-wrapper">
    <label for="">
        <span>ROTATE</span>
        <input
            type="checkbox"
            bind:checked={side}
            disabled={!rotateEnabled}
            on:change={() => (transitionType = "rotate")}
        />
    </label>
    <label for="">
        <span>SHINY</span>
        <input
            type="checkbox"
            bind:checked={shiny}
            disabled={!shinyEnabled}
            on:change={() => (transitionType = "shiny")}
        />
    </label>
    <label for="">
        <span>GENDER</span>
        <input
            type="checkbox"
            bind:checked={gender}
            disabled={!genderEnabled || femaleRatio < 0}
            on:change={() => (transitionType = "gender")}
        />
    </label>
</div>

<div class="select-wrapper center-content">
    <!-- svelte-ignore a11y-no-onchange -->
    <select
        name=""
        id=""
        bind:value={selectedVersion}
        on:change={() => (transitionType = "rotate")}
    >
        {#each Object.keys(spriteRef) as version}
            <option value={version}
                >{versionGroupNames[version] || formatText(version)}</option
            >
        {/each}
    </select>
</div>

<style lang="scss">
    .sprite-wrapper {
        position: relative;
        height: 200px;
        margin: 30px 0 0 0;
        img {
            width: 200px;
            height: 200px;
            border: 5px solid;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.5);
            filter: drop-shadow(0px 0px 5px #000);

            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotateY(0);
        }
    }

    .checkbox-wrapper {
        display: flex;
        justify-content: center;
        margin: 10px 0;

        label {
            margin: 0 10px;
            font-weight: bold;
        }
    }

    .sparkle-wrapper {
        position: absolute;
        z-index: 2;
        color: #fff;
        width: 200px;
        height: 200px;
        pointer-events: none;
        @keyframes sparkle {
            0% {
                opacity: 0;
            }

            70% {
                opacity: 1;
            }

            100% {
                opacity: 0;
            }
        }

        .star {
            position: absolute;
            opacity: 0;

            &:nth-child(1) {
                font-size: 100px;
                top: 0;
                left: 0;
            }
            &:nth-child(2) {
                font-size: 75px;
                top: 15px;
                right: 0;
            }
            &:nth-child(3) {
                font-size: 40px;
                bottom: 15px;
                right: 40px;
            }
        }

        // &.sparkle {
        //     &:nth-child(1) {
        //         animation: 0.3s sparkle ease-out 0s;
        //     }
        //     &:nth-child(2) {
        //         animation: 0.3s sparkle ease-out 0.2s;
        //     }
        //     &:nth-child(3) {
        //         animation: 0.3s sparkle ease-out 0.4s;
        //     }
        // }
    }
</style>
