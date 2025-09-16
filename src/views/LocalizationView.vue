<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import icePointLogo from '@/assets/images/logo_full.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const wazeLink = "https://ul.waze.com/ul?place=ChIJtZbKt4HPupQRNvCfvu4DthI&ll=-19.76100750%2C-47.89979100&navigate=yes";
const googleMapsLink = "https://www.google.com/maps/search/?api=1&query=Av.+Padre+Eddie+Bernardes+da+Silva,+965+-+Lourdes,+Uberaba+-+MG";
const locationContentRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver;
const viewportWidth = ref(window.innerWidth);
const locationCoords: L.LatLngExpression = [-19.76100750, -47.89979100];
const mapContainerRef = ref<HTMLElement | null>(null);
const isModalVisible = ref(false);

const animatedIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-pin"></div>`,
    iconSize: [50, 62],
    iconAnchor: [25, 62],
    popupAnchor: [0, -65]
});

const openModal = () => {
    isModalVisible.value = true;
};

const closeModal = () => {
    isModalVisible.value = false;
};

const iframeStyles = {
    border: 0,
};
const isDesktopLayout = computed(() => viewportWidth.value > 1024);

const updateWidth = () => {
    viewportWidth.value = window.innerWidth;
};

onMounted(() => {
    window.scrollTo(0, 0);

    if (mapContainerRef.value) {
        const map = L.map(mapContainerRef.value, {
            scrollWheelZoom: false,
            zoomControl: true,
        }).setView(locationCoords, 17);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        const marker = L.marker(locationCoords, { icon: animatedIcon }).addTo(map);

        marker.bindPopup("<b>Ice Point</b><br>O sorvete mais feliz da cidade! ✨");
        marker.on('click', openModal);

    }


    const options = {
        root: null,
        threshold: 0.2,
    };
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
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
        <div class="background-drip"></div>

        <section class="hero-section">
            <div class="hero-content">
                <img :src="icePointLogo" alt="Logo Ice Point" class="pulsing-logo" />
                <h1 class="hero-title">Acha que a gente desapareceu?</h1>
                <p class="hero-subtitle">Que nada! Nossos sorvetes te esperam em um lugar mágico! 🍦✨</p>
            </div>
        </section>

        <main class="location-content-wrapper" ref="locationContentRef">
            <div class="content-card">
                <div class="info-panel">
                    <h2 class="info-title">Chega Mais para um Abraço Gelado!</h2>
                    <p class="info-description">
                        Onde a felicidade encontra o sorvete! Fácil de achar, impossível de resistir. Venha nos visitar
                        e torne seu dia muito mais doce!
                    </p>

                    <div class="info-item">
                        <div class="info-icon-wrapper">
                            <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                        </div>
                        <div class="info-text">
                            <strong>Nosso Endereço:</strong>
                            <p>Av. Padre Eddie Bernardes da Silva, 965 - Lourdes, Uberaba - MG</p>
                        </div>
                    </div>

                    <div class="info-item">
                        <div class="info-icon-wrapper">
                            <font-awesome-icon :icon="['fas', 'clock']" class="info-icon" />
                        </div>
                        <div class="info-text">
                            <strong>Horário de Funcionamento:</strong>
                            <p>Segunda a Domingo: 11:00 - 20:00</p>
                        </div>
                    </div>

                    <div class="navigation-buttons">
                        <h3 class="navigation-title">Pegue um atalho:</h3>
                        <div class="buttons-container">
                            <a :href="googleMapsLink" target="_blank" class="nav-button maps-button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="nav-icon"
                                    aria-hidden="true">
                                    <path fill="currentColor"
                                        d="M168.3 499.2C116.1 435 0 279.4 0 192C0 85.96 85.96 0 192 0C298 0 384 85.96 384 192C384 279.4 267 435 215.7 499.2C203.4 514.5 180.6 514.5 168.3 499.2H168.3zM192 256C227.3 256 256 227.3 256 192C256 156.7 227.3 128 192 128C156.7 128 128 156.7 128 192C128 227.3 156.7 256 192 256z" />
                                </svg>
                                <span>Google Maps</span>
                            </a>
                            <a :href="wazeLink" target="_blank" class="nav-button waze-button">
                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                    viewBox="0 0 122.71 122.88" style="enable-background: new 0 0 122.71 122.88"
                                    xml:space="preserve" class="nav-icon">
                                    <g>
                                        <path class="st0"
                                            d="M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07 C104.27,17.76,90.77,8.19,72.3,6.22c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44 c-0.09,3.28,0,6.66,0,9.94C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z" />
                                        <path
                                            d="M54.95,110.49c-1.03,4.69-3.56,8.16-7.69,10.31c-5.25,2.72-10.6,2.63-15.57-0.56c-5.16-3.28-7.41-8.25-7.03-14.35 c0.09-1.03-0.19-1.41-1.03-1.88c-9.1-4.78-16.31-11.44-21.28-20.44c-0.94-1.78-1.69-3.66-2.16-5.63c-0.66-2.72,0.38-4.03,3.19-4.31 c3.38-0.38,6.38-1.69,7.88-4.88c0.66-1.41,1.03-3.09,1.03-4.69c0.19-4.03,0-8.06,0.19-12.1c1.03-15.57,7.5-28.5,19.32-38.63 C42.67,3.97,55.42-0.43,69.76,0.03c25.04,0.94,46.51,18.57,51.57,43.23c4.59,22.32-2.34,40.98-20.07,55.51 c-1.03,0.84-2.16,1.69-3.38,2.44c-0.66,0.47-0.84,0.84-0.56,1.59c2.34,7.13-0.94,15-7.5,18.38c-8.91,4.41-19.22-0.09-21.94-9.66 c-0.09-0.38-0.56-0.84-0.84-0.84C63.11,110.4,59.07,110.49,54.95,110.49L54.95,110.49z M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09 c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07C104.27,17.76,90.77,8.19,72.3,6.22 c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44c-0.09,3.28,0,6.66,0,9.94 C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z" />
                                        <path
                                            d="M74.92,79.74c-11.07-0.56-18.38-4.97-23.07-13.78c-1.13-2.16-0.09-4.31,2.06-4.78c1.31-0.28,2.53,0.66,3.47,2.16 c1.22,1.88,2.44,3.75,4.03,5.25c8.81,8.34,23.25,5.72,28.79-5.06c0.66-1.31,1.5-2.34,3.09-2.34c2.34,0.09,3.66,2.44,2.63,4.59 c-2.91,5.91-7.5,10.22-13.69,12.28C79.51,78.99,76.7,79.36,74.92,79.74L74.92,79.74z" />
                                        <path
                                            d="M55.32,48.98c-3.38,0-6.09-2.72-6.09-6.09s2.72-6.09,6.09-6.09s6.09,2.72,6.09,6.09C61.42,46.17,58.7,48.98,55.32,48.98 L55.32,48.98z" />
                                        <path
                                            d="M98.27,42.79c0,3.38-2.72,6.09-6,6.19c-3.38,0-6.09-2.63-6.09-6.09c0-3.38,2.63-6.09,6-6.19 C95.46,36.7,98.17,39.42,98.27,42.79L98.27,42.79z" />
                                    </g>
                                </svg>
                                <span>Waze</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="map-panel">
                    <div ref="mapContainerRef" class="leaflet-map-container"></div>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <div v-if="isModalVisible" class="modal-backdrop" @click="closeModal">
                <div class="modal-content" @click.stop>
                    <button class="modal-close-button" @click="closeModal">&times;</button>
                    <h3 class="modal-title">Como deseja chegar?</h3>
                    <p class="modal-subtitle">Escolha seu app de navegação preferido para traçar a rota.</p>
                    <div class="modal-buttons-container">
                        <a :href="googleMapsLink" target="_blank" class="nav-button maps-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="nav-icon">
                                <path fill="currentColor"
                                    d="M168.3 499.2C116.1 435 0 279.4 0 192C0 85.96 85.96 0 192 0C298 0 384 85.96 384 192C384 279.4 267 435 215.7 499.2C203.4 514.5 180.6 514.5 168.3 499.2H168.3zM192 256C227.3 256 256 227.3 256 192C256 156.7 227.3 128 192 128C156.7 128 128 156.7 128 192C128 227.3 156.7 256 192 256z" />
                            </svg>
                            <span>Google Maps</span>
                        </a>
                        <a :href="wazeLink" target="_blank" class="nav-button waze-button">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.71 122.88"
                                class="nav-icon">
                                <g>
                                    <path class="st0"
                                        d="M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07 C104.27,17.76,90.77,8.19,72.3,6.22c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44 c-0.09,3.28,0,6.66,0,9.94C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z" />
                                    <path
                                        d="M54.95,110.49c-1.03,4.69-3.56,8.16-7.69,10.31c-5.25,2.72-10.6,2.63-15.57-0.56c-5.16-3.28-7.41-8.25-7.03-14.35 c0.09-1.03-0.19-1.41-1.03-1.88c-9.1-4.78-16.31-11.44-21.28-20.44c-0.94-1.78-1.69-3.66-2.16-5.63c-0.66-2.72,0.38-4.03,3.19-4.31 c3.38-0.38,6.38-1.69,7.88-4.88c0.66-1.41,1.03-3.09,1.03-4.69c0.19-4.03,0-8.06,0.19-12.1c1.03-15.57,7.5-28.5,19.32-38.63 C42.67,3.97,55.42-0.43,69.76,0.03c25.04,0.94,46.51,18.57,51.57,43.23c4.59,22.32-2.34,40.98-20.07,55.51 c-1.03,0.84-2.16,1.69-3.38,2.44c-0.66,0.47-0.84,0.84-0.56,1.59c2.34,7.13-0.94,15-7.5,18.38c-8.91,4.41-19.22-0.09-21.94-9.66 c-0.09-0.38-0.56-0.84-0.84-0.84C63.11,110.4,59.07,110.49,54.95,110.49L54.95,110.49z M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09 c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07C104.27,17.76,90.77,8.19,72.3,6.22 c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44c-0.09,3.28,0,6.66,0,9.94 C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z" />
                                    <path
                                        d="M74.92,79.74c-11.07-0.56-18.38-4.97-23.07-13.78c-1.13-2.16-0.09-4.31,2.06-4.78c1.31-0.28,2.53,0.66,3.47,2.16 c1.22,1.88,2.44,3.75,4.03,5.25c8.81,8.34,23.25,5.72,28.79-5.06c0.66-1.31,1.5-2.34,3.09-2.34c2.34,0.09,3.66,2.44,2.63,4.59 c-2.91,5.91-7.5,10.22-13.69,12.28C79.51,78.99,76.7,79.36,74.92,79.74L74.92,79.74z" />
                                    <path
                                        d="M55.32,48.98c-3.38,0-6.09-2.72-6.09-6.09s2.72-6.09,6.09-6.09s6.09,2.72,6.09,6.09C61.42,46.17,58.7,48.98,55.32,48.98 L55.32,48.98z" />
                                    <path
                                        d="M98.27,42.79c0,3.38-2.72,6.09-6,6.19c-3.38,0-6.09-2.63-6.09-6.09c0-3.38,2.63-6.09,6-6.19 C95.46,36.7,98.17,39.42,98.27,42.79L98.27,42.79z" />
                                </g>
                            </svg>
                            <span>Waze</span>
                        </a>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.st0 {
    fill: #ffffff;
}

.map-container iframe {
    display: block;
    width: 100%;
    height: 100%;
}

.location-page {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-branco, #fff);
    overflow-x: hidden;
    position: relative;
}

.background-drip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 300px;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23fdf5e6" fill-opacity="1" d="M0,160L48,170.7C96,181,192,203,288,218.7C384,235,480,245,576,229.3C672,213,768,171,864,138.7C960,107,1056,85,1152,96C1248,107,1344,149,1392,170.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>') no-repeat top center;
    background-size: cover;
    z-index: 0;
}

.hero-section {
    padding-top: 2rem;
    padding-bottom: 4rem;
    text-align: center;
    position: relative;
    z-index: 1;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    animation: fadeInDown 1s ease-out;
}

.pulsing-logo {
    display: block;
    margin: 0 auto 1.5rem;
    width: 150px;
    height: auto;
    animation: pulseAndFloat 6s ease-in-out infinite;
}

.hero-title {
    font-size: 4rem;
    font-weight: 700;
    line-height: 0.9;
    color: var(--c-text-dark);
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
}

.hero-subtitle {
    font-size: 1.4rem;
    color: var(--c-text);
}

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

@keyframes pulseAndFloat {
    0% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(-15px) scale(1.05);
    }

    100% {
        transform: translateY(0) scale(1);
    }
}

.location-content-wrapper {
    padding: 0 2rem 6rem;
    position: relative;
    z-index: 1;
}

.content-card {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    gap: 2rem;
    background-color: var(--c-branco, #fff);
    border-radius: 30px;
    padding: 3rem;
    box-shadow: 0 20px 50px rgba(154, 119, 133, 0.15);
    border: 1px solid var(--c-cinza-light);
}

.info-panel {
    flex: 1;
    min-width: 320px;
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
    line-height: 1.2;
}

.info-description {
    font-size: 1.1rem;
    color: var(--c-text);
    margin-bottom: 2.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    background-color: var(--c-cinza-light);
    padding: 1.2rem;
    border-radius: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(154, 119, 133, 0.1);
}

.info-icon-wrapper {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin-right: 1rem;
    background-color: var(--c-rosa-light);
}

.info-icon {
    font-size: 1.5rem;
    color: var(--c-rosa);
}

.info-text strong {
    font-weight: 600;
    color: var(--c-text-dark);
    display: block;
    margin-bottom: 0.2rem;
}

.info-text p {
    color: var(--c-text);
    line-height: 1.5;
}

.navigation-buttons {
    margin-top: 3rem;
}

.navigation-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text-dark);
    margin-bottom: 1rem;
    text-align: center;
}

.buttons-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 15px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.nav-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.nav-icon {
    width: 24px;
    height: 24px;
}

.maps-button {
    background-color: #E8F0FE;
    color: #1A73E8;
}

.maps-button:hover {
    background-color: #1A73E8;
    color: white;
}

.waze-button {
    background-color: #E6F8FF;
    color: #33CCFF;
}

.waze-button:hover {
    background-color: #33CCFF;
    color: white;
}

.map-panel {
    flex: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s;
}

.location-content-wrapper.is-visible .map-panel {
    opacity: 1;
    transform: scale(1);
}

.map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.map-container iframe {
    width: 100%;
    height: 100%;
}

.leaflet-map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 1;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.modal-content {
    background-color: white;
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    position: relative;
    text-align: center;
}

.modal-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 0.5rem;
}

.modal-subtitle {
    font-size: 1.1rem;
    color: var(--c-text);
    margin-bottom: 2rem;
}

.modal-buttons-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal-close-button {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 2.8rem;
    color: var(--c-cinza-dark);
    cursor: pointer;
    line-height: 1;
    padding: 5px 10px;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
    z-index: 10;
}

.modal-close-button:hover {
    color: var(--c-rosa);
    background-color: var(--c-cinza-light);
    transform: rotate(90deg) scale(1.1);
}

.modal-close-button:active {
    transform: rotate(180deg) scale(0.9);
    background-color: var(--c-cinza);
}


.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 1024px) {
    .content-card {
        flex-direction: column;
        padding: 2rem;
        gap: 3rem;
    }

    .leaflet-map-container {
        min-height: 450px;
    }
}

@media (max-width: 768px) {
    .pulsing-logo {
        width: 120px;
    }

    .hero-title {
        font-size: 3rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .location-content-wrapper {
        padding: 0 1.5rem 4rem;
    }

    .info-title {
        font-size: 2.2rem;
    }

    .info-panel {
        transform: translateY(50px);
    }

    .location-content-wrapper.is-visible .info-panel {
        transform: translateY(0);
    }

    .buttons-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .info-panel {
        min-width: auto;
        transform: translateY(50px);
    }

    .location-content-wrapper.is-visible .info-panel {
        transform: translateY(0);
    }

    .map-container {
        min-height: 300px;
    }

    .hero-section {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    .pulsing-logo {
        width: 100px;
        margin-bottom: 1rem;
    }

    .hero-title {
        font-size: 2rem;
        line-height: 1.2;
        word-break: break-word;
    }

    .hero-subtitle {
        font-size: 1rem;
        padding: 0 0.5rem;
    }

    .location-content-wrapper {
        padding: 0 0.75rem 4rem;
    }

    .content-card {
        padding: 1.5rem;
        gap: 2rem;
    }

    .info-title {
        font-size: 1.8rem;
        word-break: break-word;
    }

    .info-description {
        font-size: 1rem;
        margin-bottom: 2rem;
    }

    .info-item {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }

    .info-icon-wrapper {
        margin-right: 0;
        margin-bottom: 0.75rem;
    }

    .modal-content {
        padding: 2rem 1.5rem;
    }

    .modal-title {
        font-size: 1.5rem;
    }

    .modal-subtitle {
        font-size: 1rem;
    }
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
    background-color: var(--c-azul) !important;
    color: white !important;
    border-radius: 12px !important;
    border: 2px solid var(--c-branco) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    width: 36px !important;
    height: 36px !important;
    line-height: 32px !important;
    font-size: 1.8rem !important;
    font-weight: bold !important;
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
    background-color: var(--c-azul-dark) !important;
}

:deep(.leaflet-control-zoom) {
    border: none !important;
}

:deep(.custom-div-icon) {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.custom-div-icon .marker-pin) {
    width: 60px;
    height: 60px;
    border-radius: 50% 50% 50% 0;
    background: var(--c-azul);
    position: absolute;
    transform: rotate(-45deg);
    left: 50%;
    top: 50%;
    margin-left: -30px;
    margin-top: -30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite ease-out;
}

:deep(.custom-div-icon img) {
    position: relative;
    z-index: 1;
    width: 40px;
    height: 40px;
    transform: translateY(-4px);
}

@keyframes pulse {
    0% {
        transform: rotate(-45deg) scale(0.8);
        box-shadow: 0 0 0 0 var(--c-azul);
    }

    70% {
        transform: rotate(-45deg) scale(1);
        box-shadow: 0 0 0 20px rgba(239, 98, 159, 0);
    }

    100% {
        transform: rotate(-45deg) scale(0.8);
        box-shadow: 0 0 0 0 rgba(239, 98, 159, 0);
    }
}
</style>
