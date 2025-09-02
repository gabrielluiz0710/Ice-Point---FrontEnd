<script setup lang="ts">
import Carousel from '@/components/Carousel.vue';
import banner1_big from '@/assets/images/carousel1-big.jpg';
import banner1_medium from '@/assets/images/carousel1-medium.jpg';
import banner1_small from '@/assets/images/carousel1-small.jpg';
import banner2_big from '@/assets/images/carousel2-big.jpg';
import banner2_medium from '@/assets/images/carousel2-medium.jpg';
import banner2_small from '@/assets/images/carousel2-small.jpg';
import ProductCarousel from '@/components/ProductCarousel.vue';
import type { CardItem } from '@/types/CardItem';
import brigadeiroImg from '@/assets/images/cards/brigadeiro.png';
import tentacaoImg from '@/assets/images/cards/tentacao.png';
import ituLeiteCondensadoImg from '@/assets/images/cards/ituleitecondensado.png';
import abacaxiImg from '@/assets/images/cards/abacaxi.png';
import ituMaracujaImg from '@/assets/images/cards/itumaracuja.png';
import morangoLeiteImg from '@/assets/images/cards/morangoleite.png';
import limaoSuicoImg from '@/assets/images/cards/limaosuico.png';
import carrinhoImg from '@/assets/images/carrinho.png';
import flavorGirlImg from '@/assets/images/caracter2.png';
import Depoimentos from '@/components/Depoimentos.vue';

const slideData = [
  {
    small: banner1_small,
    medium: banner1_medium,
    big: banner1_big,
    alt: 'Descrição do banner 1'
  },
  {
    small: banner2_small,
    medium: banner2_medium,
    big: banner2_big,
    alt: 'Descrição do banner 2'
  },
];

const cardData: CardItem[] = [
  {
    id: 1,
    image: brigadeiroImg,
    title: 'Brigadeiro',
    description: 'Picolé de chocolate com casquinha de chocolate meio amargo e granulado.',
    link: '#brigadeiro'
  },
  {
    id: 2,
    image: tentacaoImg,
    title: 'Tentação',
    description: 'Picolé de morango ao leite com casquinha de chocolate meio amargo.',
    link: '#tentacao'
  },
  {
    id: 3,
    image: ituLeiteCondensadoImg,
    title: 'Leite Condensado',
    description: 'Picolé de leite condensado com um delicioso recheio de morango.',
    link: '#leitecondensado1'
  },
  {
    id: 4,
    image: limaoSuicoImg,
    title: 'Limão Suíço',
    description: 'Picolé de limão suíço',
    link: '#leitecondensado2'
  },
  {
    id: 5,
    image: abacaxiImg,
    title: 'Abacaxi',
    description: 'Picolé de abacaxi',
    link: '#leitecondensado3'
  },
  {
    id: 6,
    image: morangoLeiteImg,
    title: 'Morango ao Leite',
    description: 'Picolé de morango ao leite',
    link: '#leitecondensado4'
  },
  {
    id: 7,
    image: ituMaracujaImg,
    title: 'Leite Condensado',
    description: 'Picolé de ituzinho de maracujá com recheio de maracujá',
    link: '#leitecondensado5'
  },
];

const featuresData = [
  {
    icon: 'heart',
    title: 'Mais Amada da Região',
    description: 'Quem prova, comprova: a melhor sorveteria para toda a família.'
  },
  {
    icon: 'ice-cream',
    title: 'Variedade que Encanta',
    description: 'Temos tudo que você procura: açaí, sorvete, picolés e muito mais!'
  },
  {
    icon: 'face-grin-hearts',
    title: '+50 Sabores Diferentes',
    description: 'Mais de 50 opções irresistíveis de sabores únicos!'
  },
  {
    icon: 'sack-dollar',
    title: 'Tudo com Preço de Fábrica',
    description: 'Todos nossos produtos com preço de fábrica para você!'
  }
]
</script>

<template>
  <Carousel :items="slideData" />
  <main>
    <h1>Destaques do momento</h1>
    <h2>Experimente nossos produtos e novidades!</h2>
    <ProductCarousel :items="cardData" />

    <section class="cta-section">
      <div class="cta-container">
        <div class="cta-image-wrapper">
          <img :src="carrinhoImg" alt="Carrinho de picolés Ice Point" class="cta-image" />
        </div>
        <div class="cta-content">
          <p class="cta-subtitle">🥳 Encomende nosso carrinho de picolés para sua festa!</p>
          <h2 class="cta-title">Encomende seu Carrinho!</h2>
          <p class="cta-description">
            Escolha seus picolés favoritos e faça sua festa ainda mais especial levando para seus convidados os sabores
            da Ice Point!
          </p>
          <a href="/carrinho" class="cta-button">Montar Carrinho</a>
        </div>
      </div>
    </section>
    <section class="flavor-explosion-section">
      <div class="flavor-explosion-container">
        <div class="flavor-explosion-content">
          <p class="flavor-explosion-subtitle">😋 Venha descobrir o delicioso mundo da Ice Point!</p>
          <h2 class="flavor-explosion-title">Explosão de Sabores Te Espera</h2>
          <p class="flavor-explosion-description">
            Experimente cada pedacinho da felicidade: Nossos produtos são feitos com carinho para trazer sorrisos em
            cada mordida.
          </p>
          <a href="#" class="flavor-explosion-button">Ver Produtos</a>
        </div>
        <div class="flavor-explosion-image-wrapper">
          <img :src="flavorGirlImg" alt="Menina segurando um sorvete Ice Point" class="flavor-explosion-image" />
        </div>
      </div>
    </section>
    <section class="features-section">
      <div class="features-container">
        <div v-for="(feature, index) in featuresData" :key="index" class="feature-item">
          <font-awesome-icon :icon="['fas', feature.icon]" class="feature-icon-fa" />
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>
    <Depoimentos />
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  text-align: center;
}

h1 {
  margin-top: 40px;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #343434;
}

h2 {
  font-family: 'Fredoka', sans-serif;
  font-weight: 400;
  font-size: 1.2rem;
  color: #777;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  main {
    padding: 10px;
  }
}

.cta-section {
  padding-block-end: 3rem;
  padding-block-start: 6rem;
  position: relative;
}

.cta-container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 2rem;
  display: flex;
  align-items: center;
  gap: 4rem;
}

.cta-image-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cta-image {
  position: relative;
  max-width: 100%;
  object-fit: contain;
}

.cta-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.cta-subtitle {
  font-family: 'Fredoka', sans-serif;
  color: #ef4b81;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.cta-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #343434;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.cta-description {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
  max-width: 500px;
}

.cta-button {
  display: inline-block;
  background-color: #00bcd4;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.4);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 188, 212, 0.5);
}

@media (max-width: 750px) {
  .cta-container {
    flex-direction: column;
    text-align: center;
  }

  .cta-content {
    align-items: center;
    text-align: center;
  }

  .cta-image {
    margin-bottom: 2rem;
    max-height: 300px;

  }

  .cta-title {
    font-size: 2.5rem;
  }

  .cta-container {
    gap: 0;
  }
}

@media (max-width: 1024px) {
  .cta-container {
    padding-inline: 0;
  }
}

.flavor-explosion-section {
  padding-block: 3rem;
}

.flavor-explosion-container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}

.flavor-explosion-content {
  flex: 1;
  text-align: left;
}

.flavor-explosion-subtitle {
  font-family: 'Fredoka', sans-serif;
  color: var(--c-rosa);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.flavor-explosion-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--c-text-dark);
  margin-bottom: 1rem;
  line-height: 1.1;
}

.flavor-explosion-description {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  color: var(--c-text);
  margin-bottom: 2rem;
  max-width: 500px;
}

.flavor-explosion-button {
  display: inline-block;
  background-color: var(--c-rosa);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: 0 4px 10px var(--c-rosa-dark);
}

.flavor-explosion-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px var(--c-rosa-dark);
}

.flavor-explosion-image-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.flavor-explosion-image {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

@media (max-width: 750px) {
  .flavor-explosion-container {
    flex-direction: column;
    text-align: center;
    gap: 0;
    padding-inline: 0;
  }

  .flavor-explosion-content {
    align-items: center;
  }

  .flavor-explosion-image-wrapper {
    justify-content: center;
  }

  .flavor-explosion-image {
    max-height: 300px;
    margin-top: 2rem;
  }

  .flavor-explosion-title {
    font-size: 2.5rem;
  }

  .flavor-explosion-content {
    flex: 1;
    text-align: center;
  }
}

.features-section {
  color: white;
  padding: 4rem 2rem;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  align-items: stretch;
  background-color: #00bcd4;
  padding: 4rem 2rem;
  border-radius: 30px;
}

.feature-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.feature-icon {
  margin-bottom: 1.5rem;
}

.feature-icon :deep(svg) {
  stroke: white;
  stroke-width: 1.5;
}

.feature-title {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-description {
  font-family: 'Fredoka', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.9;
  max-width: 250px;
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .features-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }

  .features-section {
    padding: 3rem 1.5rem;
    margin: 1.5rem;
  }
}

@media (max-width: 576px) {
  .features-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .features-section {
    padding: 2.5rem 1rem;
    margin: 1rem;
  }

  .feature-title {
    font-size: 1.3rem;
  }

  .feature-description {
    font-size: 0.95rem;
  }
}

.feature-icon-fa {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
}
</style>