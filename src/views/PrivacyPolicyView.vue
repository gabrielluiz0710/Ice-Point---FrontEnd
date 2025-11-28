<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import {
    faShieldHalved,
    faUserLock,
    faServer,
    faShareNodes,
    faCookieBite,
    faFingerprint
} from '@fortawesome/free-solid-svg-icons';

const icons = {
    shield: shallowRef(faShieldHalved),
    lock: shallowRef(faUserLock),
    server: shallowRef(faServer),
    share: shallowRef(faShareNodes),
    cookie: shallowRef(faCookieBite),
    fingerprint: shallowRef(faFingerprint)
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
            <header class="policy-header" :class="{ 'animate-in': isVisible }">
                <div class="icon-badge">
                    <font-awesome-icon :icon="icons.shield.value" />
                </div>
                <h1>Política de Privacidade</h1>
                <p class="subtitle">Sua confiança é o nosso ingrediente principal.</p>
                <span class="last-updated">Última atualização: Novembro de 2025</span>
            </header>

            <main class="policy-grid">
                <section class="policy-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.1s;">
                    <div class="card-header">
                        <div class="card-icon azul">
                            <font-awesome-icon :icon="icons.fingerprint.value" />
                        </div>
                        <h2>1. Coleta de Dados</h2>
                    </div>
                    <p>
                        Para garantir que seu sorvete chegue perfeito, coletamos apenas o essencial.
                        Utilizamos seu <strong>Login Social</strong> (Facebook/Google) para identificação rápida e
                        segura.
                    </p>
                    <div class="tags-container">
                        <span class="tag">Nome & Email</span>
                        <span class="tag">Telefone</span>
                        <span class="tag">CPF</span>
                        <span class="tag">Endereço</span>
                    </div>
                </section>

                <section class="policy-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.2s;">
                    <div class="card-header">
                        <div class="card-icon rosa">
                            <font-awesome-icon :icon="icons.server.value" />
                        </div>
                        <h2>2. Uso dos Dados</h2>
                    </div>
                    <p>Seus dados trabalham exclusivamente para melhorar sua experiência:</p>
                    <ul class="feature-list">
                        <li>
                            <font-awesome-icon :icon="icons.lock.value" class="li-icon" />
                            <span>Identificação segura no sistema.</span>
                        </li>
                        <li>
                            <font-awesome-icon :icon="icons.cookie.value" class="li-icon" />
                            <span>Processamento ágil das suas encomendas.</span>
                        </li>
                        <li>
                            <font-awesome-icon :icon="icons.share.value" class="li-icon" />
                            <span>Comunicação sobre o status da entrega.</span>
                        </li>
                    </ul>
                </section>

                <section class="policy-card full-width" :class="{ 'animate-in': isVisible }"
                    style="transition-delay: 0.3s;">
                    <div class="card-header">
                        <div class="card-icon roxo">
                            <font-awesome-icon :icon="icons.share.value" />
                        </div>
                        <h2>3. Compartilhamento e Segurança</h2>
                    </div>
                    <p>
                        A <strong>Ice Point</strong> trata seus dados com sigilo absoluto. Não vendemos nem
                        compartilhamos suas informações com terceiros para fins publicitários.
                    </p>
                    <p class="highlight-text">
                        O compartilhamento ocorre estritamente quando necessário para a operação logística (ex:
                        entregadores parceiros) ou quando exigido por lei.
                    </p>
                </section>
            </main>

            <footer class="policy-footer" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.4s;">
                <p>Tem dúvidas sobre seus dados? Entre em contato conosco.</p>
            </footer>
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

.content-container {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
}

.policy-header {
    text-align: center;
    margin-bottom: 4rem;
    opacity: 0;
    transform: translateY(30px);
    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease;
    will-change: transform, opacity;
}

.icon-badge {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-dark, #2563eb));
    color: white;
    font-size: 1.8rem;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    transform: rotate(-10deg);
}

.policy-header h1 {
    font-size: 3rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 0.5rem;
    letter-spacing: -1px;
}

.policy-header .subtitle {
    font-size: 1.2rem;
    color: var(--c-text-light, #64748b);
    margin-bottom: 1rem;
}

.last-updated {
    display: inline-block;
    background: #ffffff;
    padding: 0.4rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    color: var(--c-text-light, #64748b);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.policy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.policy-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: transform 0.4s ease, box-shadow 0.4s ease, opacity 0.6s ease;
    opacity: 0;
    transform: translateY(40px);
    will-change: transform, opacity;
}

.policy-card:hover {
    transform: translate3d(0, -8px, 0);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #cbd5e1;
}

.full-width {
    grid-column: 1 / -1;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.card-icon {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.card-icon.azul {
    background: #eff6ff;
    color: var(--c-azul);
}

.card-icon.rosa {
    background: #fdf2f8;
    color: var(--c-rosa);
}

.card-icon.roxo {
    background: #f5f3ff;
    color: #8b5cf6;
}

.policy-card h2 {
    font-size: 1.4rem;
    color: var(--c-text-dark, #1e293b);
    margin: 0;
}

.policy-card p {
    color: var(--c-text-light, #475569);
    line-height: 1.7;
    margin-bottom: 1.5rem;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.tag {
    background: #f1f5f9;
    padding: 0.4rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--c-azul);
    font-weight: 600;
    border: 1px solid #e2e8f0;
}

.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.feature-list li {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 500;
    color: var(--c-text-dark, #334155);
}

.li-icon {
    color: var(--c-rosa);
    font-size: 1rem;
}

.highlight-text {
    background: #fdf2f8;
    padding: 1rem;
    border-radius: 12px;
    border-left: 4px solid var(--c-rosa);
    font-size: 0.95rem;
    margin-bottom: 0 !important;
}

.policy-footer {
    text-align: center;
    margin-top: 4rem;
    opacity: 0;
    transform: translateY(20px);
    transition: transform 0.8s ease 0.4s, opacity 0.8s ease 0.4s;
    color: var(--c-text-light);
    font-weight: 500;
}

.animate-in {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
}

@media (max-width: 768px) {
    .policy-header h1 {
        font-size: 2.2rem;
    }

    .policy-card {
        padding: 1.5rem;
    }

    .page-background {
        padding: 2rem 1rem;
    }
}
</style>