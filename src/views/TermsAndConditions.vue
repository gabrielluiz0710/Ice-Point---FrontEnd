<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import {
    faFileContract,
    faUserCheck,
    faHandHoldingHeart,
    faClock,
    faExclamationTriangle,
    faMapMarkerAlt,
    faSnowflake
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const icons = {
    contract: shallowRef(faFileContract),
    userCheck: shallowRef(faUserCheck),
    hand: shallowRef(faHandHoldingHeart),
    clock: shallowRef(faClock),
    warning: shallowRef(faExclamationTriangle),
    map: shallowRef(faMapMarkerAlt),
    snow: shallowRef(faSnowflake)
};

const isVisible = ref(false);

onMounted(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
        setTimeout(() => {
            isVisible.value = true;
        }, 50);
    });
});
</script>

<template>
    <div class="page-background">
        <div class="blobs-container">
            <div class="blob blob-1 gpu-accelerated"></div>
            <div class="blob blob-2 gpu-accelerated"></div>
            <div class="blob blob-3 gpu-accelerated"></div>
        </div>

        <div class="content-container">
            <header class="page-header" :class="{ 'animate-in': isVisible }">
                <div class="icon-badge">
                    <font-awesome-icon :icon="icons.contract.value" />
                </div>
                <h1>Termos de Uso</h1>
                <p class="subtitle">
                    Regras e condições para o empréstimo de carrinhos de picolé da Ice Point.
                </p>
            </header>

            <main class="content-grid">
                <section class="info-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.1s;">
                    <div class="card-header">
                        <h2>Condições do Empréstimo</h2>
                    </div>

                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-icon azul">
                                <font-awesome-icon :icon="icons.userCheck.value" />
                            </div>
                            <div class="step-content">
                                <h3>1. Elegibilidade</h3>
                                <p>
                                    É necessário ser <strong>maior de 18 anos</strong> e fornecer dados verdadeiros no
                                    ato do cadastro.
                                </p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-icon rosa">
                                <font-awesome-icon :icon="icons.hand.value" />
                            </div>
                            <div class="step-content">
                                <h3>2. Responsabilidade</h3>
                                <p>
                                    O cliente compromete-se a zelar pela segurança e integridade do carrinho durante
                                    todo o período do evento.
                                </p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-icon roxo">
                                <font-awesome-icon :icon="icons.snow.value" />
                            </div>
                            <div class="step-content">
                                <h3>3. Itens Inclusos</h3>
                                <p>
                                    O empréstimo acompanha o carrinho e <strong>05 placas de gelo em gel</strong>, que
                                    devem ser devolvidos junto com o equipamento.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="info-card small-card" :class="{ 'animate-in': isVisible }"
                    style="transition-delay: 0.2s;">
                    <div class="card-header">
                        <div class="card-icon-small ciano">
                            <font-awesome-icon :icon="icons.clock.value" />
                        </div>
                        <h2>Prazos e Devolução</h2>
                    </div>

                    <div class="timeline-details">
                        <div class="detail-row">
                            <div class="icon-col rosa">
                                <font-awesome-icon :icon="icons.map.value" />
                            </div>
                            <div class="text-col">
                                <span class="label">Local:</span>
                                <span class="value">Av. Padre Eddie Bernardes, 965, Lourdes - Uberaba-MG.</span>
                            </div>
                        </div>

                        <div class="detail-row">
                            <div class="icon-col rosa">
                                <font-awesome-icon :icon="icons.clock.value" />
                            </div>
                            <div class="text-col">
                                <span class="label">Prazo:</span>
                                <span class="value">
                                    A devolução ou sinalização de busca deve ocorrer em até <strong>24h</strong> após a
                                    data do evento/entrega.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="warning-box-styled">
                        <div class="warning-icon">
                            <font-awesome-icon :icon="icons.warning.value" />
                        </div>
                        <p>
                            <strong>Atenção:</strong> A não devolução na data marcada resulta em multa de <strong>R$
                                20,00 por dia</strong> de atraso.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<style scoped>
.page-background {
    min-height: calc(100vh - 70px);
    width: 100%;
    background-color: #f8fafc;
    position: relative;
    padding: 4rem 1.5rem;
    font-family: 'Fredoka', sans-serif;
    box-sizing: border-box;
    contain: content;
}

.content-container {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
}

.blobs-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
}

.blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);
    opacity: 0.6;
    animation: float 10s infinite ease-in-out;
}

.gpu-accelerated {
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
}

.blob-1 {
    top: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: var(--c-azul-light, #bfdbfe);
    animation-delay: 0s;
}

.blob-2 {
    bottom: -10%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: var(--c-rosa-light, #fbcfe8);
    animation-delay: -2s;
}

.blob-3 {
    top: 40%;
    left: 30%;
    width: 300px;
    height: 300px;
    background: rgba(225, 213, 255, 0.6);
    animation-delay: -4s;
}

@keyframes float {

    0%,
    100% {
        transform: translate3d(0, 0, 0) scale(1);
    }

    33% {
        transform: translate3d(30px, -50px, 0) scale(1.1);
    }

    66% {
        transform: translate3d(-20px, 20px, 0) scale(0.9);
    }
}

.page-header {
    text-align: center;
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(30px);
    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease;
}

.icon-badge {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--c-azul, #3b82f6), #1d4ed8);
    color: white;
    font-size: 2rem;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    transform: rotate(-5deg);
}

.page-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--c-text-dark, #1e293b);
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1.1rem;
    color: var(--c-text-light, #64748b);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.content-grid {
    display: grid;
    gap: 2rem;
}

.info-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    opacity: 0;
    transform: translateY(40px);
    transition: transform 0.4s ease, box-shadow 0.4s ease, opacity 0.6s ease;
}

.info-card:hover {
    transform: translate3d(0, -5px, 0);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.card-header h2 {
    font-size: 1.5rem;
    color: var(--c-text-dark, #1e293b);
    margin: 0;
}

.card-icon-small.ciano {
    color: #06b6d4;
    font-size: 1.4rem;
}

.steps-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 1.2rem;
    background: #f8fafc;
    padding: 1.2rem;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: background-color 0.3s;
}

.step-item:hover {
    background: #f1f5f9;
}

.step-icon {
    min-width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.step-icon.azul {
    background: #eff6ff;
    color: var(--c-azul, #3b82f6);
}

.step-icon.rosa {
    background: #fdf2f8;
    color: var(--c-rosa, #ec4899);
}

.step-icon.roxo {
    background: #f5f3ff;
    color: #8b5cf6;
}

.step-content h3 {
    font-size: 1.1rem;
    margin: 0 0 0.3rem 0;
    color: var(--c-text-dark, #334155);
}

.step-content p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--c-text-light, #64748b);
    line-height: 1.5;
}

.timeline-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.detail-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.icon-col {
    color: var(--c-rosa, #ec4899);
    font-size: 1.1rem;
    margin-top: 2px;
    min-width: 24px;
    display: flex;
    justify-content: center;
}

.text-col {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.text-col .label {
    font-size: 0.9rem;
    color: #94a3b8;
    font-weight: 500;
}

.text-col .value {
    font-size: 1rem;
    color: #475569;
    line-height: 1.5;
}

.warning-box-styled {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 16px;
    padding: 1.2rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.warning-icon {
    color: #be123c;
    font-size: 1.2rem;
    margin-top: 2px;
}

.warning-box-styled p {
    margin: 0;
    font-size: 0.95rem;
    color: #be123c;
    line-height: 1.5;
}

.animate-in {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
}

@media (max-width: 600px) {
    .step-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .page-header h1 {
        font-size: 2rem;
    }

    .detail-row {
        gap: 0.8rem;
    }
}
</style>