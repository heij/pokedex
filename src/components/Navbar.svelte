<script>
    import { pop, push } from "svelte-spa-router";
    import { fly, scale } from "svelte/transition";
    import { quadInOut, quartIn } from "svelte/easing";
    import { flip } from "svelte/animate";
    export let currentUrl;

    let backArrow = false;
    currentUrl.subscribe((url) => {
        if (url.includes("/pokemon/")) {
            return (backArrow = true);
        }

        backArrow = false;
    });
</script>

<nav>
    <img
        src="../assets/1x/back_arrow.png"
        alt=""
        class="back-arrow"
        on:click={() => push("/")}
        class:visible={backArrow}
    />
    <img src="../assets/1x/icon_128.png" alt="" class="logo" />
    <h2>POKEDEX</h2>
</nav>

<style lang="scss">
    nav {
        padding: 10px 20px;
        background: #292626;
        color: white;
        display: flex;
        align-items: center;
    }

    .logo {
        height: 50px;
        margin: 0 10px 0 20px;
    }

    .back-arrow {
        cursor: pointer;
        height: 25px;
        transform: scale(0) rotateZ(180deg);
        transition: transform 0.3s cubic-bezier(0.5, 0, 0.75, 0),
            opacity 0.5s cubic-bezier(0.5, 0, 0.75, 0);
        opacity: 0;

        &.visible {
            transform: scale(1) rotateZ(0);
            opacity: 1;
        }
    }
</style>
