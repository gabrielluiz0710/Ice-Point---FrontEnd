<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
    faWhatsapp,
    faFacebookF,
    faInstagram,
    faTwitter,
    faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import icePointLogo from '@/assets/images/logo_full.png';

const contactInfo = ref([
    {
        type: 'Telefone',
        icon: faPhone,
        text: '(34) 99965-8035',
        link: 'tel:+5534999658035',
        color: '#34D399'
    },
    {
        type: 'WhatsApp',
        icon: faWhatsapp,
        text: '(34) 99965-8035',
        link: '',
        color: '#25D366'
    },
    {
        type: 'Email',
        icon: faEnvelope,
        text: 'icepointuberaba@gmail.com',
        link: '',
        color: '#FBBC05'
    },
]);

const socialMedia = ref([
    { icon: faFacebookF, name: 'Facebook', link: 'https://facebook.com/IcePointUberaba', color: '#1877F2' },
    { icon: faInstagram, name: 'Instagram', link: 'https://instagram.com/icepointuberaba', color: '#E4405F' },
    { icon: faTwitter, name: 'Twitter', link: 'https://twitter.com/IcePointUberaba', color: '#1DA1F2' },
    { icon: faLinkedinIn, name: 'LinkedIn', link: 'https://linkedin.com/company/icepointuberaba', color: '#0A66C2' },
]);

const introMessage = "Olá! Gostaria de entrar em contato com a sorveteria Ice Point.";

const whatsappLink = computed(() => {
    const encodedText = encodeURIComponent(introMessage);
    return `https://wa.me/5534999658035?text=${encodedText}`;
});

const emailLink = computed(() => {
    const subject = encodeURIComponent("Contato pelo Site - Ice Point");
    const body = encodeURIComponent(introMessage);
    return `mailto:icepointuberaba@gmail.com?subject=${subject}&body=${body}`;
});

contactInfo.value.find(c => c.type === 'WhatsApp')!.link = whatsappLink.value;
contactInfo.value.find(c => c.type === 'Email')!.link = emailLink.value;


const contactPageRef = ref<HTMLElement | null>(null);

onMounted(() => {
    const options = {
        root: null,
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, options);

    if (contactPageRef.value) {
        const animatedElements = contactPageRef.value.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    }
});

</script>

<template>
    <div class="contact-page" ref="contactPageRef">
        <div class="background-drip"></div>

        <header class="hero-section">
            <div class="hero-content">
                <img :src="icePointLogo" alt="Logo Ice Point" class="pulsing-logo" />
                <h1 class="hero-title animate-on-scroll">Fale com a gente! 🍦</h1>
                <p class="hero-subtitle animate-on-scroll">
                    Adoramos ouvir você! Seja para um oi, uma dúvida ou um pedido especial, aqui estão os caminhos para
                    nos encontrar.
                </p>
            </div>
        </header>

        <main class="contact-content-wrapper">
            <section class="contact-section animate-on-scroll">
                <h2 class="section-title">Canais Diretos</h2>
                <div class="contact-cards-container">
                    <a v-for="(contact, index) in contactInfo" :key="contact.type" :href="contact.link" target="_blank"
                        class="contact-card"
                        :style="{ '--card-color': contact.color, transitionDelay: `${index * 100}ms` }">

                        <div class="card-inner">
                            <div class="card-face card-front">
                                <font-awesome-icon :icon="contact.icon" class="front-icon" />
                                <span class="front-type">{{ contact.type }}</span>
                            </div>
                            <div class="card-face card-back">
                                <font-awesome-icon :icon="contact.icon" class="back-icon" />
                                <div class="back-text">
                                    <p>{{ contact.text }}</p>
                                    <span>Toque para iniciar</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </section>

            <section class="social-section animate-on-scroll">
                <h2 class="section-title">Siga nossas redes:</h2>
                <div class="social-icons-container">
                    <a v-for="social in socialMedia" :key="social.name" :href="social.link" target="_blank"
                        class="social-icon-link" :style="{ '--social-color': social.color }"
                        :aria-label="`Siga-nos no ${social.name}`">
                        <font-awesome-icon :icon="social.icon" />
                    </a>
                </div>
            </section>
        </main>
    </div>
</template>


<style scoped>
.contact-page {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-branco, #fff);
    overflow-x: hidden;
    position: relative;
    min-height: 100vh;
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
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.pulsing-logo {
    width: 120px;
    height: auto;
    margin: 0 auto 1.5rem;
    animation: pulseAndFloat 6s ease-in-out infinite;
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

.hero-title {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 700;
    color: var(--c-text-dark);
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: clamp(1rem, 4vw, 1.25rem);
    color: var(--c-text);
    max-width: 600px;
    margin: 0 auto;
}

.contact-content-wrapper {
    padding: 2rem 1rem 6rem;
    position: relative;
    z-index: 1;
}

.contact-section,
.social-section {
    max-width: 1200px;
    margin: 0 auto 5rem;
    padding: 2rem;
    padding-bottom: 3rem;
    border-radius: 30px;
    box-shadow: 0 20px 50px rgba(154, 119, 133, 0.15);
    border: 1px solid var(--c-cinza-light, #eee);
}

.section-title {
    font-size: clamp(2rem, 6vw, 2.8rem);
    font-weight: 700;
    color: var(--c-rosa, #EF629F);
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
}

.section-title::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background-color: var(--c-azul, #3B82F6);
    border-radius: 2px;
    margin: 0.5rem auto 0;
}


.contact-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.contact-card {
    perspective: 1000px;
    height: 220px;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    position: relative;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    will-change: transform;
}

.contact-card:hover .card-inner {
    transform: rotateY(180deg);
}

.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
}

.card-front {
    background-color: var(--c-branco, #fff);
    border: 2px solid var(--card-color);
}

.card-back {
    background-color: var(--card-color);
    color: white;
    transform: rotateY(180deg);
    text-align: center;
}

.back-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.back-text p {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    word-break: break-all;
}

.back-text span {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.5rem;
    display: block;
    font-weight: 400;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-top: 0.5rem;
}

.front-icon {
    font-size: 3rem;
    color: var(--card-color);
    margin-bottom: 1rem;
}

.front-type {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--c-text-dark);
}

.social-icons-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;
}

.social-icon-link {
    position: relative;
    z-index: 1;
    font-size: 2.5rem;
    color: var(--c-text, #555);
    background-color: var(--c-cinza-light, #f0f0f0);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, background-color 0.3s;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    will-change: transform;
}

.social-icon-link::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--social-color);
    box-shadow: 0 15px 30px -5px var(--social-color);
    opacity: 0;
    transition: opacity 0.3s ease-out;
}

.social-icon-link:hover {
    color: white;
    background-color: var(--social-color);
    transform: translateY(-15px) scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.social-icon-link:hover::before {
    opacity: 1;
}


.animate-on-scroll {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.animate-on-scroll.in-view {
    opacity: 1;
    transform: translateY(0);
}

.hero-subtitle.animate-on-scroll {
    transition-delay: 200ms;
}

.contact-section.animate-on-scroll {
    transition-delay: 300ms;
}

.social-section.animate-on-scroll {
    transition-delay: 400ms;
}


@media (max-width: 768px) {
    .hero-section {
        padding: 3rem 1rem;
    }

    .contact-content-wrapper {
        padding: 1rem 0.5rem 4rem;
    }

    .contact-section,
    .social-section {
        padding: 1.5rem;
        padding-bottom: 2rem;
    }

    .contact-cards-container {
        grid-template-columns: 1fr;
    }

    .social-icon-link {
        width: 60px;
        height: 60px;
        font-size: 1.8rem;
    }
}
</style>