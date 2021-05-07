<script>
    import { push } from "svelte-spa-router";
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
    <a href="https://heij.github.io" class="about" target="_blank">
        <h4 class="text">by</h4>
        <h3 class="link text">HEIJI</h3>
    </a>
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

    .about {
        margin-left: auto;
        color: white;

        .text {
            display: inline;
        }

        .link {
            display: inline-block;
            background: var(--secondary-color);
            transition: 0.2s background ease-out;
            padding: 10px;
            &:hover {
                background: #633030;
            }
        }
    }
</style>
