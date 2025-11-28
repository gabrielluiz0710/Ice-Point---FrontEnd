<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import {
    faFileContract, faGavel, faBan, faHandshake, faIceCream
} from '@fortawesome/free-solid-svg-icons';

const icons = {
    contract: shallowRef(faFileContract),
    handshake: shallowRef(faHandshake),
    iceCream: shallowRef(faIceCream),
    ban: shallowRef(faBan),
    gavel: shallowRef(faGavel)
};

const isVisible = ref(false);

onMounted(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
        setTimeout(() => { isVisible.value = true; }, 50);
    });
});
</script>

<template>
    <div class="page-wrapper">

        <div class="background-decorations">
            <div class="blob blob-1 gpu-accelerated"></div>
            <div class="blob blob-2 gpu-accelerated"></div>
            <div class="blob blob-3 gpu-accelerated"></div>
        </div>

        <div class="content-container">
            <header class="policy-header" :class="{ 'animate-in': isVisible }">
                <div class="icon-badge">
                    <font-awesome-icon :icon="icons.contract.value" />
                </div>
                <h1>Termos de Serviço</h1>
                <p class="subtitle">As regras da casa para uma experiência doce.</p>
                <span class="last-updated">Última atualização: Novembro 2025</span>
            </header>

            <main class="policy-grid">
                <section class="policy-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.1s;">
                    <div class="card-header">
                        <div class="card-icon azul"><font-awesome-icon :icon="icons.handshake.value" /></div>
                        <h2>1. Aceitação</h2>
                    </div>
                    <p>Ao acessar o site da <strong>Ice Point</strong> e fazer login, você concorda automaticamente com
                        estes termos. Se não concordar, infelizmente não poderemos processar seus pedidos online.</p>
                </section>

                <section class="policy-card" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.2s;">
                    <div class="card-header">
                        <div class="card-icon rosa"><font-awesome-icon :icon="icons.iceCream.value" /></div>
                        <h2>2. Uso do Serviço</h2>
                    </div>
                    <p>Nosso serviço é destinado exclusivamente a encomendas de sorvetes e produtos relacionados:</p>
                    <ul class="feature-list">
                        <li>Você garante que as informações de entrega são verdadeiras.</li>
                        <li>Pedidos identificados como "trote" resultarão no bloqueio da conta.</li>
                        <li>O pagamento deve ser realizado no ato da entrega ou online.</li>
                    </ul>
                </section>

                <section class="policy-card full-width" :class="{ 'animate-in': isVisible }"
                    style="transition-delay: 0.3s;">
                    <div class="card-header">
                        <div class="card-icon roxo"><font-awesome-icon :icon="icons.ban.value" /></div>
                        <h2>3. Cancelamento e Imprevistos</h2>
                    </div>
                    <p>A Ice Point se reserva no direito de cancelar pedidos em casos excepcionais, como falta de
                        estoque de insumos ou impossibilidade de entrega devido a condições climáticas severas.</p>
                    <p class="highlight-text">Nesses casos, entraremos em contato imediatamente pelo telefone cadastrado
                        para propor uma solução ou estorno.</p>
                </section>

                <section class="policy-card full-width" :class="{ 'animate-in': isVisible }"
                    style="transition-delay: 0.4s;">
                    <div class="card-header">
                        <div class="card-icon azul"><font-awesome-icon :icon="icons.gavel.value" /></div>
                        <h2>4. Legislação</h2>
                    </div>
                    <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa que não
                        puder ser resolvida amigavelmente será tratada no foro da comarca de Uberaba/MG.</p>
                </section>
            </main>

            <footer class="policy-footer" :class="{ 'animate-in': isVisible }" style="transition-delay: 0.5s;">
                <p>Ice Point Sorveteria - Uberaba/MG</p>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.page-wrapper {
    width: 100%;
    min-height: calc(100vh - 70px);
    position: relative;
    padding: 4rem 1.5rem;
    font-family: 'Fredoka', sans-serif;
    box-sizing: border-box;
    background-color: #f8fafc;
    overflow: hidden;
}

.background-decorations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}

.blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(50px);
    opacity: 0.6;
    animation: float 10s infinite ease-in-out;
}

.blob-1 {
    top: -5%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: var(--c-azul-light, #bfdbfe);
    animation-delay: 0s;
}

.blob-2 {
    top: 40%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: var(--c-rosa-light, #fbcfe8);
    animation-delay: -2s;
}

.blob-3 {
    bottom: 5%;
    left: 20%;
    width: 300px;
    height: 300px;
    background: rgba(225, 213, 255, 0.6);
    animation-delay: -4s;
}

.gpu-accelerated {
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
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

/* GRID E CARDS */
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
    opacity: 0;
    transform: translateY(40px);
    transition: transform 0.4s ease, box-shadow 0.4s ease, opacity 0.6s ease;
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
    align-items: flex-start;
    gap: 1rem;
    font-weight: 500;
    color: var(--c-text-dark, #334155);
}

.feature-list li::before {
    content: "•";
    color: var(--c-azul);
    font-size: 1.5rem;
    line-height: 1rem;
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

    .page-wrapper {
        padding: 2rem 1rem;
    }
}
</style>