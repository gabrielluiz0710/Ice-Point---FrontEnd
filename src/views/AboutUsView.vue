<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import garageImg from '@/assets/images/garagem.jpeg';
import constructionImg from '@/assets/images/construcao.jpeg';
import newStoreImg from '@/assets/images/loja.jpeg';

const timelineEvents = ref([
    {
        date: 'Outubro de 2020',
        title: 'O Sonho Ganha Forma',
        description: 'Em um período de desafios, um sonho antigo floresceu. Compramos nossas primeiras máquinas, sem saber nada do ramo, mas com um desejo enorme de aprender e criar algo especial.',
        icon: 'lightbulb',
        image: null,
    },
    {
        date: 'Final de 2020',
        title: 'Nossa Primeira Casa: A Garagem!',
        description: 'Com muito carinho, transformamos nossa garagem na primeira Ice Point. O começo foi um desafio, mas aos poucos, o bairro todo começou a fazer fila para provar nossas delícias.',
        icon: 'warehouse',
        image: garageImg,
    },
    {
        date: '2021: A Grande Virada',
        title: 'Mão na Massa, Literalmente!',
        description: 'Enquanto a sorveteria na garagem crescia, nossa família trabalhava dia e noite na reforma do nosso galpão. Cada parede erguida e cada azulejo colocado tem um pouco do nosso suor e da nossa união.',
        icon: 'screwdriver-wrench',
        image: constructionImg,
    },
    {
        date: 'Final de 2021',
        title: 'A Inauguração do Sonho',
        description: 'Deixamos a garagem para trás e abrimos as portas da nova Ice Point! Um espaço maior, com mais sabores, mais produtos e o mesmo amor de sempre em cada detalhe.',
        icon: 'store',
        image: newStoreImg,
    },
    {
        date: 'Hoje',
        title: 'Uma Família Cada Vez Maior',
        description: 'Continuamos crescendo, com mais máquinas, novos colaboradores e o mais importante: a alegria de vocês, nossos clientes, que fazem parte desta doce jornada.',
        icon: 'trophy',
        image: null,
    }
]);

const timelineRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver;

onMounted(() => {
    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
        }
    );

    const timelineItems = timelineRef.value?.querySelectorAll('.timeline-item');
    if (timelineItems) {
        timelineItems.forEach((item) => observer.observe(item));
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});

</script>

<template>
    <div class="about-us-page">
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Nossa Doce Jornada</h1>
                <p class="hero-subtitle">De um sonho na garagem ao sabor que conquistou a cidade. Conheça a história da
                    Ice Point.</p>
            </div>
        </section>

        <section class="timeline-section" ref="timelineRef">
            <div class="timeline-container">
                <div class="timeline-line"></div>
                <div v-for="(event, index) in timelineEvents" :key="index" class="timeline-item">
                    <div class="timeline-dot">
                        <font-awesome-icon :icon="['fas', event.icon]" class="timeline-icon" />
                    </div>
                    <div class="timeline-content">
                        <p class="timeline-date">{{ event.date }}</p>
                        <h3 class="timeline-title">{{ event.title }}</h3>
                        <p class="timeline-description">{{ event.description }}</p>
                        <img v-if="event.image" :src="event.image" :alt="event.title" class="timeline-image" />
                    </div>
                </div>
            </div>
        </section>

        <section class="cta-final-section">
            <div class="cta-final-content">
                <h2 class="cta-final-title">Venha fazer parte da nossa história!</h2>
                <p class="cta-final-description">
                    Cada sorvete que servimos é um pedaço do nosso sonho. Adoraríamos compartilhar essa alegria com
                    você.
                </p>
                <a href="/cardapio" class="cta-final-button">Conheça Nossos Sabores</a>
            </div>
        </section>

    </div>
</template>

<style scoped>
.about-us-page {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-bege, #fdf5e6);
    overflow-x: hidden;
}

.hero-section {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8rem 2rem;
    background: linear-gradient(var(--c-azul), var(--c-azul-dark)), no-repeat center center;
    background-size: cover;
    color: var(--c-branco, #fff);
}

.hero-content {
    max-width: 800px;
    animation: fadeInDown 1s ease-out;
}

.hero-title {
    font-size: 4.5rem;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
}

.hero-subtitle {
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.9;
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

.timeline-section {
    padding: 6rem 2rem 0;
    position: relative;
    display: flex;
    flex-direction: column;
}

.timeline-container {
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
}

.timeline-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: calc(100% + 5rem);
    background-color: var(--c-rosa-light, #fbb9c5);
}

.timeline-item {
    position: relative;
    width: 50%;
    padding: 1rem 3rem;
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.timeline-item.is-visible {
    opacity: 1;
    transform: translateY(0);
}

.timeline-item:nth-child(odd) {
    left: 0;
    padding-right: 4rem;
    text-align: right;
}

.timeline-item:nth-child(even) {
    left: 50%;
    padding-left: 4rem;
    text-align: left;
}

.timeline-dot {
    position: absolute;
    top: 15px;
    width: 50px;
    height: 50px;
    background-color: var(--c-rosa, #fe758f);
    border: 4px solid var(--c-bege, #fdf5e6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: transform 0.3s ease;
}

.timeline-item:hover .timeline-dot {
    transform: scale(1.1);
}

.timeline-item:nth-child(odd) .timeline-dot {
    right: -25px;
}

.timeline-item:nth-child(even) .timeline-dot {
    left: -25px;
}

.timeline-icon {
    color: var(--c-branco, #fff);
    font-size: 1.5rem;
}

.timeline-content {
    background-color: var(--c-branco, #fff);
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
}

.timeline-date {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--c-rosa, #fe758f);
    margin-bottom: 0.5rem;
}

.timeline-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--c-text-dark, #343434);
    margin-bottom: 0.8rem;
}

.timeline-description {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--c-text, #555);
}

.timeline-image {
    width: 100%;
    margin-top: 1rem;
    border-radius: 10px;
    object-fit: cover;
}

.cta-final-section {
    background-color: var(--c-rosa);
    padding: 5rem 2rem;
    text-align: center;
    color: var(--c-branco, #fff);
    position: relative;
    z-index: 1;
}

.cta-final-content {
    max-width: 700px;
    margin: 0 auto;
}

.cta-final-title {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.cta-final-description {
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
}

.cta-final-button {
    display: inline-block;
    background-color: var(--c-branco);
    color: var(--c-rosa-dark);
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta-final-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

@media (max-width: 992px) {
    .hero-title {
        font-size: 3.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }
}

@media (max-width: 768px) {

    .timeline-line {
        left: 25px;
    }

    .timeline-item {
        width: 100%;
        left: 0 !important;
        padding-left: 4rem;
        padding-right: 0.5rem;
        text-align: left !important;
    }

    .timeline-item:nth-child(odd),
    .timeline-item:nth-child(even) {
        padding-left: 5rem;
        padding-right: 1rem;
        text-align: left !important;
    }

    .timeline-dot,
    .timeline-item:nth-child(odd) .timeline-dot,
    .timeline-item:nth-child(even) .timeline-dot {
        left: 0;
    }

    .hero-title {
        font-size: 2.8rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .cta-final-title {
        font-size: 2.2rem;
    }
}

@media (max-width: 425px) {
    .timeline-line {
        width: 3px;
        left: 20px;
    }

    .timeline-dot {
        width: 40px;
        height: 40px;
    }

    .timeline-item:nth-child(odd) .timeline-dot,
    .timeline-item:nth-child(even) .timeline-dot {
        left: 0px;
    }

    .timeline-item {
        padding-left: 3.5rem;
    }

    .timeline-content {
        padding: 1.5rem;
    }

    .timeline-title {
        font-size: 1.5rem;
    }
}
</style>