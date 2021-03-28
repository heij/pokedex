<script>
    import { fade, fly } from "svelte/transition";
    import { quartOut } from "svelte/easing";
    import { setContext } from "svelte";

    export const toggle = () => (visible = !visible);
    export const show = (newData = null) => {
        if (newData) changeData(newData);
        visible = true;
    };
    export const hide = () => (visible = false);
    export const changeData = (newData) => (data = newData);

    let data;
    let visible = false;
    setContext("data", {
        getData: () => data,
    });
</script>

{#if visible}
    <div class="modal-wrapper">
        <div
            class="backdrop bg-dark"
            on:click={hide}
            transition:fade={{ duration: 250, easing: quartOut }}
        />
        <div
            class="modal bg-dark"
            transition:fly={{ x: 200, duration: 250, easing: quartOut }}
        >
            <div class="header">
                <div class="title">
                    <slot name="title" />
                </div>
                <div class="close-button clickable" on:click={hide}>X</div>
            </div>

            <div class="body">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .modal-wrapper {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: 7;
    }

    .modal {
        display: flex;
        flex-direction: column;

        position: absolute;
        height: 100%;
        max-width: 800px;
        width: fit-content;
        color: #fff;
        right: 0;
        bottom: 0;
    }

    .header {
        display: flex;
        align-items: center;
        padding: 10px 0 10px 20px;
        border-bottom: 1px solid #fff;
    }

    .title {
        margin-right: 20px;
    }

    .close-button {
        margin: 0 20px 0 auto;
    }

    .body {
        height: 100%;
        width: 100%;
        padding: 10px 20px 20px 20px;
        color: white;
        right: 0;
        bottom: 0;
        overflow: hidden auto;
    }

    .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.7;
    }
</style>
