<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { RouterLink } from 'vue-router';
import { faHouse, faIceCream } from '@fortawesome/free-solid-svg-icons';

const isVisible = ref(false);
const icons = {
    home: shallowRef(faHouse),
    iceCream: shallowRef(faIceCream)
};

onMounted(() => {
    // requestAnimationFrame: Garante que o navegador está pronto para pintar
    requestAnimationFrame(() => {
        isVisible.value = true;
    });
});
</script>

<template>
    <div class="not-found-wrapper">

        <div class="bg-base"></div>

        <div class="blobs-layer">
            <div class="gpu-blob blob-1"></div>
            <div class="gpu-blob blob-2"></div>
            <div class="gpu-blob blob-3"></div>
        </div>

        <div class="content-layer">
            <div class="glass-card" :class="{ 'enter-active': isVisible }">

                <div class="floating-icon">
                    <font-awesome-icon :icon="icons.iceCream.value" />
                </div>

                <h1 class="error-code">404</h1>
                <h2 class="error-title">Ops! Derreteu...</h2>

                <p class="error-message">
                    Essa página não existe ou evaporou.<br>
                    Volte para um lugar mais fresco.
                </p>

                <RouterLink to="/" class="btn-home">
                    <font-awesome-icon :icon="icons.home.value" />
                    <span>Início</span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* --- OTIMIZAÇÃO DE RENDERIZAÇÃO --- */

.not-found-wrapper {
    /* Isola o layout: O navegador não recalcula o resto da página */
    contain: strict;
    position: relative;
    width: 100%;
    /* Altura fixa baseada na viewport para evitar repaint */
    height: calc(100vh - 70px);
    overflow: hidden;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fredoka', sans-serif;
}

/* --- CAMADA DE FUNDO (Gradientes Leves) --- */

.blobs-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* Evita que o navegador tente rasterizar fora da tela */
    overflow: hidden;
}

.gpu-blob {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
    /* O SEGREDO: Em vez de filter: blur(), usamos radial-gradient. 
       Isso é renderizado matematicamente, custo zero para GPU. */
    background: radial-gradient(circle, var(--blob-color) 0%, transparent 70%);

    /* Hardware Acceleration */
    will-change: transform;
    transform: translateZ(0);
    /* Força nova camada na GPU */
    animation: float 10s infinite ease-in-out;
}

.blob-1 {
    --blob-color: #bfdbfe;
    /* Azul */
    width: 80vh;
    height: 80vh;
    top: -20%;
    left: -20%;
    animation-delay: 0s;
}

.blob-2 {
    --blob-color: #fbcfe8;
    /* Rosa */
    width: 70vh;
    height: 70vh;
    bottom: -20%;
    right: -20%;
    animation-delay: -3s;
}

.blob-3 {
    --blob-color: #e9d5ff;
    /* Roxo */
    width: 50vh;
    height: 50vh;
    top: 40%;
    left: 30%;
    animation-delay: -5s;
}

/* Animação simplificada usando translate3d (GPU nativo) */
@keyframes float {

    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
    }

    50% {
        transform: translate3d(20px, -20px, 0) scale(1.05);
    }
}

/* --- CARD CENTRAL (Vidro Otimizado) --- */

.content-layer {
    position: relative;
    z-index: 10;
    padding: 1rem;
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
}

.glass-card {
    background: rgba(255, 255, 255, 0.7);
    /* Blur reduzido levemente para performance, mas mantendo a estética */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow:
        0 10px 30px -10px rgba(0, 0, 0, 0.1),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);

    /* Estado inicial da animação */
    opacity: 0;
    transform: translate3d(0, 20px, 0);
    transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    will-change: transform, opacity;
}

.glass-card.enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
}

/* --- TIPOGRAFIA E ELEMENTOS --- */

.error-code {
    font-size: 7rem;
    line-height: 1;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, var(--c-azul), var(--c-rosa));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    /* Fallback otimizado */
    letter-spacing: -2px;
}

.error-title {
    font-size: 1.8rem;
    color: var(--c-text-dark);
    margin: 0.5rem 0 1rem;
    font-weight: 700;
}

.error-message {
    font-size: 1.1rem;
    color: var(--c-text-light);
    margin-bottom: 2rem;
    line-height: 1.5;
}

.floating-icon {
    font-size: 3.5rem;
    color: var(--c-rosa);
    opacity: 0.2;
    position: absolute;
    top: 2rem;
    right: 2rem;
    transform: rotate(15deg);
    /* Removemos animação complexa do ícone para focar performance */
}

/* --- BOTÃO (Hardware Accelerated) --- */

.btn-home {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    background: linear-gradient(90deg, var(--c-azul), var(--c-azul-dark));
    color: white;
    text-decoration: none;
    padding: 0.9rem 2.5rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    will-change: transform;
}

.btn-home:active {
    transform: scale(0.95);
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 576px) {
    .error-code {
        font-size: 5.5rem;
    }

    .error-title {
        font-size: 1.5rem;
    }

    .glass-card {
        padding: 2.5rem 1.5rem;
    }

    /* No mobile, removemos o blur do vidro para garantir 60fps */
    .glass-card {
        backdrop-filter: none;
        background: rgba(255, 255, 255, 0.92);
    }
}
</style>