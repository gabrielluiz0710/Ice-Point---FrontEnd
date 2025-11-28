<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import {
    faUserSlash,
    faEnvelope,
    faPen,
    faIdCard,
    faClock,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const icons = {
    userSlash: shallowRef(faUserSlash),
    envelope: shallowRef(faEnvelope),
    pen: shallowRef(faPen),
    idCard: shallowRef(faIdCard),
    clock: shallowRef(faClock),
    check: shallowRef(faCheckCircle)
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
                    <font-awesome-icon :icon="icons.userSlash.value" />
                </div>
                <h1>Exclusão de Dados</h1>
                <p class="subtitle">
                    Respeitamos sua privacidade. Veja como solicitar a remoção dos seus dados conforme a LGPD.
                </p>
            </header>

            <main class="content-grid">
                <section class="info-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.1s;">
                    <div class="card-header">
                        <h2>Como solicitar a exclusão</h2>
                    </div>

                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-icon azul">
                                <font-awesome-icon :icon="icons.envelope.value" />
                            </div>
                            <div class="step-content">
                                <h3>Envie um e-mail</h3>
                                <p>Escreva para <a href="mailto:icepointuberaba@gmail.com"
                                        class="link-email">icepointuberaba@gmail.com</a></p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-icon rosa">
                                <font-awesome-icon :icon="icons.pen.value" />
                            </div>
                            <div class="step-content">
                                <h3>Defina o Assunto</h3>
                                <p>No título do e-mail, coloque exatamente: <br><strong>"Solicitação de Exclusão de
                                        Dados"</strong>.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-icon roxo">
                                <font-awesome-icon :icon="icons.idCard.value" />
                            </div>
                            <div class="step-content">
                                <h3>Identifique-se</h3>
                                <p>Informe no corpo da mensagem qual e-mail você utilizou para se cadastrar em nossa
                                    plataforma.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="info-card small-card" :class="{ 'animate-in': isVisible }"
                    style="transition-delay: 0.2s;">
                    <div class="card-header">
                        <div class="card-icon-small">
                            <font-awesome-icon :icon="icons.clock.value" />
                        </div>
                        <h2>Prazo e Confirmação</h2>
                    </div>
                    <p>
                        Nossa equipe processará sua solicitação e removerá todos os seus dados do sistema em até
                        <strong>7 dias úteis</strong>.
                    </p>
                    <div class="confirmation-box">
                        <font-awesome-icon :icon="icons.check.value" />
                        <span>Você receberá um e-mail confirmando a exclusão.</span>
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
    will-change: transform, opacity;
}

.icon-badge {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: white;
    font-size: 2rem;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
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
    will-change: transform, opacity;
    transition: transform 0.4s ease, box-shadow 0.4s ease, opacity 0.6s ease;
}

.info-card:hover {
    transform: translate3d(0, -5px, 0);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
}

.card-header h2 {
    font-size: 1.5rem;
    color: var(--c-text-dark, #1e293b);
    margin: 0;
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

.link-email {
    color: var(--c-azul, #3b82f6);
    font-weight: 600;
    text-decoration: none;
    word-break: break-all;
}

.link-email:hover {
    text-decoration: underline;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.card-icon-small {
    color: var(--c-azul, #3b82f6);
    font-size: 1.2rem;
}

.confirmation-box {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: #ecfdf5;
    padding: 1rem;
    border-radius: 12px;
    color: #059669;
    font-weight: 600;
    font-size: 0.9rem;
    border: 1px solid #d1fae5;
}

.info-card p {
    color: var(--c-text-light, #475569);
    line-height: 1.6;
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
        gap: 0.8rem;
    }

    .page-header h1 {
        font-size: 2rem;
    }

    .page-background {
        padding: 2rem 1rem;
    }
}
</style>