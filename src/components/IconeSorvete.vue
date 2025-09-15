<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" class="icone-sorvete-custom">
        <defs>
            <clipPath id="cone-clip">
                <path d="M50,116.5L13.9,52.5h72.2L50,116.5z" />
            </clipPath>
        </defs>

        <g>
            <path :fill="corCasquinha" d="M50,116.5L13.9,52.5h72.2L50,116.5z" />
            <g clip-path="url(#cone-clip)">
                <path d="M10,62 L55,117" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M30,52 L75,107" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M50,52 L95,107" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M70,52 L115,107" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M90,62 L45,117" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M70,52 L25,107" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M50,52 L5,107" stroke="#b88658" stroke-width="3.5" fill="none" />
                <path d="M30,52 L-15,107" stroke="#b88658" stroke-width="3.5" fill="none" />
            </g>
        </g>

        <path :fill="corSabor" d="M 90, 52.5 C 90, 25, 75, 4, 50, 4 S 10, 25, 10, 52.5 C 25, 65, 75, 65, 90, 52.5 z" />

        <path fill="#FFFFFF" opacity="0.4"
            d="M35,17 C40,13,48,13,55,18 C65,28,62,40,56,46 C52,42,45,35,40,29 C35,23,35,17,35,17z" />

    </svg>
</template>

<script setup lang="ts">
defineProps({
    corSabor: {
        type: String,
        default: '#ffc0cb'
    },
    corCasquinha: {
        type: String,
        default: '#dba171'
    }
});
</script>

<style scoped>
.icone-sorvete-custom {
    width: 3.5rem;
    height: 3.5rem;
}
</style>