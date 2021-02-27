<script>
    import { push } from "svelte-spa-router";
    import victini from "../resources/victini.json";
    import TypeIcon from "./typeIcon.svelte";

    export let pokemon;
    let active = false;
    let rotation = 10;

    let activateTimeout = null;

    pokemon = victini;

    function startTilt() {
        activateTimeout = setTimeout(() => (active = true), 200);
    }

    function updateTilt(e) {
        const { offsetX, offsetY } = e;

        let widthRatio =
            ((offsetX - this.offsetWidth / 2) * 2) / this.offsetWidth;
        let heightRatio =
            -((offsetY - this.offsetHeight / 2) * 2) / this.offsetHeight;

        this.style.setProperty("--yRotation", widthRatio);
        this.style.setProperty("--xRotation", heightRatio);
    }

    function resetTilt(e) {
        this.style.setProperty("--xRotation", 0);
        this.style.setProperty("--yRotation", 0);
        active = false;
        clearTimeout(activateTimeout);
    }

    function showDetails() {
        push(`/pokemon/${pokemon.id}`);
    }

    function getTypes(pokemon) {
        return pokemon.types.map((t) => t.type.name);
    }
</script>

<span
    class="card"
    class:active
    on:mouseenter={startTilt}
    on:mousemove={updateTilt}
    on:mouseleave={resetTilt}
    on:click={showDetails}
>
    <div class="type-tags">
        {#each getTypes(pokemon) as type}
            <span class="type-tag">
                <TypeIcon {type} />
            </span>
        {/each}
    </div>
    <div class="number"># 001</div>
    <h4 class="name">{pokemon.name}</h4>
    <div class="body">
        <img src="assets/victini_md.png" alt="" />
    </div>
</span>

<style lang="scss">
    .card {
        $xRotation: 0;
        $yRotation: 0;

        position: relative;
        display: inline-flex;
        width: 150px;
        height: 200px;
        flex-direction: column;
        padding: 5px;

        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 20px 0 rgba(135, 31, 113, 0.37);
        border-radius: 5px;
        font-weight: bold;
        transition: transform 0.2s ease-out;
        transform-style: preserve-3d;
        transform: perspective(1000px) rotateX(calc(var(--xRotation) * 10deg))
            rotateY(calc(var(--yRotation) * 10deg));

        &.active {
            transition: none;
        }

        &:hover {
            img {
                transform: translateZ(20px);
            }
        }

        .type-tags {
            .type-tag {
                $tag-size: 25px;

                width: $tag-size;
                height: $tag-size;
                position: absolute;
                right: calc(#{$tag-size} / -2);
                top: calc(#{$tag-size} / -2);
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                box-shadow: 0 8px 20px 0 rgba(135, 31, 113, 0.37);
                pointer-events: none;

                &:nth-child(2) {
                    top: calc(#{$tag-size} / 2 + 5px);
                }
            }
        }

        .number {
            margin-bottom: 5px;
            pointer-events: none;
        }

        .name {
            text-align: center;
            pointer-events: none;
        }

        .body {
            position: relative;
            display: flex;
            align-items: center;
            flex: 1;
            pointer-events: none;
            perspective: 1000px;
            transform-style: preserve-3d;

            &::before {
                $margin: 25px;

                content: "";
                width: calc(100% - #{$margin});
                height: calc(100% - #{$margin});
                position: absolute;
                left: #{$margin / 2};
                top: #{$margin / 2};
                border: 1px solid rgba(0, 0, 0, 0.25);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.25);
            }

            img {
                position: relative;
                max-width: 100%;
                transition: transform 0.2s ease-in-out;
            }
        }
    }
</style>
