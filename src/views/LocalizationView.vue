<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import icePointLogo from '../../public/icon.svg'; // Ajuste o caminho para o seu logo SVG
// Links fornecidos para os mapas
const wazeLink = "https://ul.waze.com/ul?place=ChIJtZbKt4HPupQRNvCfvu4DthI&ll=-19.76100750%2C-47.89979100&navigate=yes";
const googleMapsLink = "https://maps.app.goo.gl/VHp2XhcStdR96uBV6";

// Lógica para as animações de scroll
const locationContentRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver;

onMounted(() => {
    const options = {
        root: null, // observa em relação ao viewport
        threshold: 0.2, // A animação começa quando 20% do item estiver visível
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animação ocorre apenas uma vez
            }
        });
    }, options);

    if (locationContentRef.value) {
        observer.observe(locationContentRef.value);
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>

<template>
    <div class="location-page">
        <!-- Formas decorativas animadas no fundo -->
        <img :src="icePointLogo" alt="Logo Ice Point" class="floating-logo shape-1" />
        <div class="shape shape-2"></div>

        <!-- Seção de Herói (Topo da Página) -->
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Acha que a gente desapareceu?</h1>
                <p class="hero-subtitle">Que nada! Nossos sorvetes te esperam em um lugar mágico! 🍦✨</p>
            </div>
        </section>

        <!-- Conteúdo Principal (Painel de Info + Mapa) -->
        <main class="location-content-wrapper" ref="locationContentRef">
            <!-- Painel Esquerdo com Informações -->
            <div class="info-panel">
                <h2 class="info-title">Chega Mais para um Abraço Gelado!</h2>
                <p class="info-description">
                    Onde a felicidade encontra o sorvete! Fácil de achar, impossível de resistir. Venha nos visitar e
                    torne seu dia muito mais doce!
                </p>

                <div class="info-item">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                    <div class="info-text">
                        <strong>Endereço:</strong>
                        <p>Av. Padre Eddie Bernardes da Silva, 965 - Lourdes, Uberaba - MG, 38035-230</p>
                    </div>
                </div>

                <div class="info-item">
                    <font-awesome-icon :icon="['fas', 'clock']" class="info-icon" />
                    <div class="info-text">
                        <strong>Horário de Funcionamento:</strong>
                        <p>Segunda a Domingo: 10:00 - 22:00</p>
                    </div>
                </div>

                <div class="navigation-buttons">
                    <h3 class="navigation-title">Planeje sua rota:</h3>
                    <div class="buttons-container">
                        <a :href="googleMapsLink" target="_blank" class="nav-button maps-button">
                            <font-awesome-icon :icon="['fab', 'google']" />
                            <span>Abrir no Google Maps</span>
                        </a>
                        <a :href="wazeLink" target="_blank" class="nav-button waze-button">
                            <font-awesome-icon :icon="['fab', 'waze']" />
                            <span>Abrir no Waze</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Painel Direito com o Mapa -->
            <div class="map-panel">
                <div class="map-container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3758.828551105157!2d-47.9023659247738!3d-19.76100257076633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bad00810d2979d%3A0x6b09335607b38c4c!2sIce%20Point%20Sorveteria!5e0!3m2!1spt-BR!2sbr!4v1693863486321!5m2!1spt-BR!2sbr"
                        width="600" height="450" style="border:0;" allowfullscreen loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* Estilos Gerais da Página e Formas de Fundo Animadas */
.location-page {
    font-family: 'Fredoka', sans-serif;
    /* Alterado: Fundo branco para toda a página */
    background-color: var(--c-branco, #fff);
    overflow-x: hidden;
    position: relative;
}

.floating-logo {
    position: absolute;
    width: 200px;
    /* Tamanho da logo flutuante */
    height: auto;
    top: 10%;
    left: 5%;
    z-index: 0;
    animation: float 8s ease-in-out infinite;
    /* Mantém a animação de flutuação */
}

.shape-2 {
    /* Mantém a segunda bolha decorativa */
    position: absolute;
    border-radius: 50%;
    background: var(--c-azul);
    opacity: 0.5;
    z-index: 0;
    width: 100px;
    height: 100px;
    top: 70%;
    right: 10%;
    animation: float 8s ease-in-out infinite;
    /* Adicione a animação de float também aqui */
    animation-delay: 2s;
    /* Adicione um atraso para a animação da bolha */
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-20px);
    }

    100% {
        transform: translateY(0px);
    }
}

/* Estilo da Seção Herói */
.hero-section {
    padding: 6rem 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
    text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
    /* Um pouco mais divertido */

}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    animation: fadeInDown 1s ease-out;
}

.hero-title {
    font-size: 4rem;
    font-weight: 700;
    color: var(--c-text-dark);
}

.hero-subtitle {
    font-size: 1.4rem;
    color: var(--c-text);
}

/* Wrapper do Conteúdo Principal */
.location-content-wrapper {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 2rem 6rem;
    gap: 3rem;
    position: relative;
    z-index: 1;
}

/* Painel de Informações (Esquerda) */
.info-panel {
    flex: 1;
    min-width: 320px;
    /* Animação de entrada */
    opacity: 0;
    transform: translateX(-50px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.location-content-wrapper.is-visible .info-panel {
    opacity: 1;
    transform: translateX(0);
}

.info-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--c-rosa);
    margin-bottom: 1rem;
}

.info-description {
    font-size: 1.1rem;
    color: var(--c-text);
    margin-bottom: 2.5rem;
}

.info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.info-icon {
    font-size: 1.5rem;
    color: var(--c-azul);
    margin-right: 1rem;
    margin-top: 5px;
}

.info-text strong {
    font-weight: 600;
    color: var(--c-text-dark);
}

.info-text p {
    color: var(--c-text);
    line-height: 1.5;
}

/* Botões de Navegação */
.navigation-buttons {
    margin-top: 3rem;
}

.navigation-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text-dark);
    margin-bottom: 1rem;
}

.buttons-container {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.nav-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.nav-button:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    /* Sombra mais pronunciada no hover */
}

.maps-button {
    background-color: var(--c-branco);
    /* Fundo branco */
    color: #4285F4;
    /* Cor do Google */
    border: 2px solid #4285F4;
    /* Borda da cor do Google */
}

.maps-button:hover {
    background-color: #4285F4;
    /* Fundo colorido no hover */
    color: white;
    /* Texto branco no hover */
}

.waze-button {
    background-color: var(--c-branco);
    /* Fundo branco */
    color: #33ccff;
    /* Cor do Waze */
    border: 2px solid #33ccff;
    /* Borda da cor do Waze */
}

.waze-button:hover {
    background-color: #33ccff;
    /* Fundo colorido no hover */
    color: white;
    /* Texto branco no hover */
}

/* Painel do Mapa (Direita) */
.map-panel {
    flex: 1.2;
    /* Dando um pouco mais de espaço para o mapa */
    display: flex;
    align-items: center;
    justify-content: center;
    /* Animação de entrada */
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s;
    /* Atraso de 0.2s */
}

.location-content-wrapper.is-visible .map-panel {
    opacity: 1;
    transform: scale(1);
}

.map-container {
    width: 100%;
    height: 100%;
    min-height: 450px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.map-container iframe {
    width: 100%;
    height: 100%;
}

/* Animações Keyframes */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsividade */
@media (max-width: 992px) {
    .location-content-wrapper {
        flex-direction: column;
        gap: 4rem;
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 3rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .location-content-wrapper {
        padding: 2rem 1.5rem 4rem;
    }

    .info-title {
        font-size: 2.2rem;
    }

    /* Resetar animações de translate para o layout vertical */
    .info-panel {
        transform: translateY(50px);
    }

    .location-content-wrapper.is-visible .info-panel {
        transform: translateY(0);
    }
}

@media (max-width: 480px) {
    .hero-section {
        padding: 4rem 1.5rem;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .buttons-container {
        flex-direction: column;
        align-items: stretch;
        /* Botões ocupam a largura toda */
    }

    .nav-button {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .floating-logo {
        width: 150px;
        /* Reduz o tamanho da logo em telas menores */
        top: 5%;
        /* Ajusta a posição */
        left: 2%;
        /* Ajusta a posição */
    }
}

@media (max-width: 480px) {
    .floating-logo {
        width: 100px;
        /* Reduz ainda mais para telas muito pequenas */
        top: 3%;
        left: 1%;
    }

    .shape-2 {
        width: 70px;
        height: 70px;
        top: 80%;
        right: 5%;
    }
}
</style>