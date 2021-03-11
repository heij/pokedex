<script>
    export let style;
</script>

<div class="skeleton" />

<style lang="scss">
    .skeleton {
        position: relative;
        width: 100%;
        height: 100%;
        background: #a9a9a9;
        overflow: hidden;

        &:before {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;

            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.3) 5%,
                rgba(169, 169, 169, 0.3) 10%,
                rgba(255, 255, 255, 0.3) 15%,
                rgba(169, 169, 169, 0.3) 20%,
                rgba(255, 255, 255, 0.3) 75%,
                rgba(169, 169, 16, 0.3) 100%
            );
            transform: translateX(-100%);

            @keyframes wave {
                0% {
                    transform: translateX(-100%);
                }

                100% {
                    transform: translateX(0);
                }
            }

            animation: wave 1.5s ease-out infinite;
        }
    }
</style>
