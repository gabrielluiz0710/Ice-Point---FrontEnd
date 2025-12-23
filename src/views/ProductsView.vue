<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLeaf, faBowlRice } from '@fortawesome/free-solid-svg-icons';
import IconeSorvete from '../components/IconeSorvete.vue';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL;

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const isLoading = ref(true);
const searchTerm = ref('');
const selectedCategoryId = ref<string | number>('all');
const showScrollToFiltersBtn = ref(false);

const router = useRouter();

const coresSabor: { [key: string]: string } = {
  // Sorvetes
  abacaxi: "#fce181",
  "abacaxi ao vinho": "#eeb1e6ff",
  prestígio: "#f2d6c4ff",
  ameixa: "#b36f2fff",
  amendoim: "#d2a679",
  banana: "#fff6a2ff",
  "blue ice": "#3498db",
  bombom: "#c48048ff",
  chiclete: "#ff7edb",
  chocolate: "#7b3f00",
  "chocolate branco": "#fcffd2ff",
  chocomenta: "#98d9b6",
  coco: "#dfdfdfff",
  "coco queimado": "#a1724b",
  creme: "#ffd986ff",
  cupuaçu: "#f1eadbff",
  "doce de leite": "#c68642",
  flocos: "#f5f5dc",
  "frutas vermelhas": "#e08393ff",
  "iogurte com maracujá": "#e6d084ff",
  "leite condensado": "#fffacaff",
  "leite ninho": "#fff5e6ff",
  "leite ninho trufado": "#fff5e6ff",
  limão: "#d8e6a2ff",
  maracujá: "#ffc40c",
  "milho verde": "#fbec5d",
  "morango com iogurte": "#fc5a8d",
  "passas ao rum": "#dbcd4fff",
  "romeu e julieta": "#fddde6",
  sensação: "#fe758f",
  "torta alemã": "#eaddca",
  uva: "#6f2da8",
  // Picolés
  abacate: "#8db600",
  cajá: "#ffbf00",
  kiwi: "#8ee53f",
  goiaba: "#f88379",
  "limão suíço": "#c9cc99",
  churros: "#f4a460",
  coalhada: "#fff8dc",
  nata: "#fff5e6",
  queijo: "#fffacd",
  "uva ao leite": "#b19cd9",
  acerola: "#ff0033",
  "cajá-manga": "#ffba61ff",
  groselha: "#ff1cae",
  laranja: "#ffa500",
  "pinta língua": "#2c47dfff",
  tamarindo: "#ff7518",
  // Extras
  brigadeiro: "#5d4037",
  tentação: "#fe758f",
};

const getCasquinhaColor = () => '#dba171';
const getSaborColor = (sabor: string) => {
  return coresSabor[sabor.toLowerCase()] || '#ffc0cb';
};

const determinarEstiloVisual = (categoriaNome: string) => {
  const cat = categoriaNome.toLowerCase();

  if (cat.includes('ituzinho')) return 'ituzinho-icon';
  if (cat.includes('skimo') || cat.includes('skimó')) return 'skimo-icon';
  if (cat.includes('picolé') || cat.includes('picole')) return 'custom-popsicle';
  if (cat.includes('açaí') || cat.includes('acai')) return 'fa-bowl-rice';
  if (cat.includes('zero') || cat.includes('fitness')) return 'fa-leaf';

  return 'ice-cream';
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const resCat = await fetch(`${API_URL}/categories`);
    if (resCat.ok) {
      categories.value = await resCat.json();
    }

    const resProd = await fetch(`${API_URL}/products`);
    if (resProd.ok) {
      const rawProducts = await resProd.json();

      products.value = rawProducts.map((p: any) => {
        const categoryName = p.categoria?.nome || 'Outros';
        const estilo = determinarEstiloVisual(categoryName);

        return {
          id: p.id,
          name: p.nome,
          categoryId: p.categoria?.id,
          categoryName: categoryName,
          type: p.imagemCapa ? 'image' : 'icon',
          src: p.imagemCapa,

          iconStyle: estilo,
          faIcon: estilo === 'fa-leaf' ? faLeaf : (estilo === 'fa-bowl-rice' ? faBowlRice : null)
        };
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    isLoading.value = false;
  }
};

const goToProduct = (productId: number) => {
  router.push(`/produtos/${productId}`);
};

const isGroupedView = computed(() => {
  return selectedCategoryId.value === 'all' && searchTerm.value.trim() === '';
});

const groupedProducts = computed(() => {
  const groups: Record<string, any[]> = {};

  products.value.forEach(p => {
    if (!groups[p.categoryName]) groups[p.categoryName] = [];
    groups[p.categoryName].push(p);
  });

  const sortedCategoryNames = Object.keys(groups).sort();

  return sortedCategoryNames.map(catName => {
    return {
      categoryName: catName,
      items: groups[catName].sort((a, b) => a.name.localeCompare(b.name))
    };
  });
});

const filteredProducts = computed(() => {
  const filtered = products.value.filter(product => {
    const categoryMatch = selectedCategoryId.value === 'all' || product.categoryId === selectedCategoryId.value;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.value.toLowerCase().trim());
    return categoryMatch && searchMatch;
  });

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

const selectCategory = (id: string | number) => {
  selectedCategoryId.value = id;
  searchTerm.value = '';
};

const scrollToFilters = () => {
  const saboresSection = document.querySelector('#sabores');
  saboresSection?.scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
  fetchData();

  window.scrollTo(0, 0);
  const saboresSection = document.querySelector('#sabores') as HTMLElement;
  const hero = document.querySelector(".hero") as HTMLElement;

  const handleScroll = () => {
    if (saboresSection) {
      showScrollToFiltersBtn.value = window.scrollY > saboresSection.offsetTop;
    }
  };

  const handleHeroMouseMove = (e: MouseEvent) => {
    const heroContent = hero?.querySelector(".hero-content") as HTMLElement;
    if (heroContent) {
      const { clientX: x, clientY: y } = e;
      const moveX = (x - window.innerWidth / 2) / 40;
      const moveY = (y - window.innerHeight / 2) / 40;
      heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  };

  window.addEventListener('scroll', handleScroll);
  if (hero) hero.addEventListener("mousemove", handleHeroMouseMove as EventListener);

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    if (hero) hero.removeEventListener("mousemove", handleHeroMouseMove as EventListener);
  });
});
</script>

<template>
  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Felicidade em Forma de Sorvete!</h1>
        <p>
          Picolés cremosos, sorvetes irresistíveis e o melhor açaí da cidade!
          Qual delícia vai alegrar o seu dia hoje?
        </p>
        <a href="#sabores" class="cta-button" @click.prevent="scrollToFilters">Quero Ver os Sabores!</a>
      </div>
      <div class="floating-shape shape-1"></div>
    </section>

    <section id="sabores" class="products-section">
      <div class="container">
        <h2>Nossos Sabores Irresistíveis</h2>

        <div class="tabs">
          <button class="tab-button" @click="selectCategory('all')" :class="{ active: selectedCategoryId === 'all' }">
            Todos
          </button>

          <button v-for="cat in categories" :key="cat.id" class="tab-button" @click="selectCategory(cat.id)"
            :class="{ active: selectedCategoryId === cat.id }">
            {{ cat.nome }}
          </button>
        </div>

        <div class="search-container">
          <input type="text" id="searchInput" v-model="searchTerm" placeholder="Digite o sabor que você procura...">
          <div class="custom-select-wrapper">
            <select id="categorySelect" v-model="selectedCategoryId">
              <option value="all">Todas as Categorias</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="isLoading" class="products-grid">
          <div v-for="i in 8" :key="i" class="product-card skeleton-card">
            <div class="skeleton-visual"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line category"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>

        <div v-else-if="!isGroupedView && filteredProducts.length === 0" id="noResultsMessage"
          style="text-align: center; padding: 20px; width: 100%;">
          <h3>Nenhum resultado encontrado para sua busca.</h3>
        </div>

        <div v-else-if="isGroupedView" class="grouped-container">
          <div v-for="group in groupedProducts" :key="group.categoryName" class="category-group-block">

            <h3 class="category-separator-title">{{ group.categoryName }}</h3>

            <div class="products-grid">
              <div v-for="product in group.items" :key="product.id" class="product-card"
                @click="goToProduct(product.id)">

                <div class="product-visual">
                  <img v-if="product.type === 'image'" :src="product.src" :alt="product.name" />

                  <IconeSorvete v-else-if="product.iconStyle === 'ice-cream'" :cor-sabor="getSaborColor(product.name)"
                    :cor-casquinha="getCasquinhaColor()" :cor-detalhe-casquinha="'#c18c5d'" />

                  <svg v-else-if="product.iconStyle === 'custom-popsicle'" class="custom-popsicle-icon"
                    viewBox="0 0 80 140">
                    <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" :style="{ fill: getSaborColor(product.name) }" />
                    <rect x="33" y="105" width="14" height="35" rx="4" />
                  </svg>

                  <svg v-else-if="product.iconStyle === 'ituzinho-icon'" class="ituzinho-icon" viewBox="0 0 60 160">
                    <rect x="24" y="120" width="12" height="40" rx="4" />
                    <path
                      d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z"
                      :style="{ fill: getSaborColor(product.name) }" />
                  </svg>

                  <svg v-else-if="product.iconStyle === 'skimo-icon'" class="skimo-icon" viewBox="0 0 80 140">
                    <rect class="stick" x="33" y="105" width="14" height="35" rx="4" />
                    <path class="inner-ice-cream" d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z"
                      :style="{ fill: getSaborColor(product.name) }" />
                    <path class="chocolate-shell"
                      d="M10,110 V50 C10,10 70,10 70,50 V40 C50,35 55,70 70,75 V110 H10 Z" />
                  </svg>

                  <font-awesome-icon v-else-if="product.faIcon" :icon="product.faIcon"
                    :style="{ color: getSaborColor(product.name) }" />
                </div>

                <h3>{{ product.name }}</h3>
                <button class="card-cta-button" @click.stop="goToProduct(product.id)">Ver mais</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card"
            @click="goToProduct(product.id)">

            <div class="product-visual">
              <img v-if="product.type === 'image'" :src="product.src" :alt="product.name" />

              <IconeSorvete v-else-if="product.iconStyle === 'ice-cream'" :cor-sabor="getSaborColor(product.name)"
                :cor-casquinha="getCasquinhaColor()" :cor-detalhe-casquinha="'#c18c5d'" />

              <svg v-else-if="product.iconStyle === 'custom-popsicle'" class="custom-popsicle-icon"
                viewBox="0 0 80 140">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" :style="{ fill: getSaborColor(product.name) }" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>

              <svg v-else-if="product.iconStyle === 'ituzinho-icon'" class="ituzinho-icon" viewBox="0 0 60 160">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z"
                  :style="{ fill: getSaborColor(product.name) }" />
              </svg>

              <svg v-else-if="product.iconStyle === 'skimo-icon'" class="skimo-icon" viewBox="0 0 80 140">
                <rect class="stick" x="33" y="105" width="14" height="35" rx="4" />
                <path class="inner-ice-cream" d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z"
                  :style="{ fill: getSaborColor(product.name) }" />
                <path class="chocolate-shell" d="M10,110 V50 C10,10 70,10 70,50 V40 C50,35 55,70 70,75 V110 H10 Z" />
              </svg>

              <font-awesome-icon v-else-if="product.faIcon" :icon="product.faIcon"
                :style="{ color: getSaborColor(product.name) }" />
            </div>

            <h3>{{ product.name }}</h3>

            <p class="product-card-category">
              {{ product.categoryName }}
            </p>

            <button class="card-cta-button" @click.stop="goToProduct(product.id)">
              Ver mais
            </button>
          </div>
        </div>
      </div>
    </section>

    <button @click="scrollToFilters" id="scrollToFiltersBtn" :class="{ show: showScrollToFiltersBtn }"
      title="Voltar aos filtros">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path
          d="M11.9999 10.8284L7.75732 15.071L6.34311 13.6568L11.9999 8L17.6568 13.6568L16.2426 15.071L11.9999 10.8284Z">
        </path>
      </svg>
    </button>
  </main>
</template>

<style scoped>
main {
  padding-top: 0 !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background: white;
  color: var(--c-text-dark);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

header .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero {
  min-height: calc(100vh - 72px);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-size: 400% 400%;
  background-image: linear-gradient(-45deg,
      var(--c-azul),
      hsl(180, 71%, 55%),
      var(--c-azul-dark));
  animation: animated-gradient 8s ease infinite;
}

.cta-button {
  margin-top: 30px;
  background-color: var(--c-branco);
  color: var(--c-azul-dark);
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.3s ease, background-color 0.3s ease;
  border: 2px solid var(--c-azul);
  display: inline-block;
}

@keyframes animated-gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-content h1 {
  animation: bounce-in 1s ease-out forwards;
  color: var(--c-branco);
  font-weight: 900;
  font-size: 60px;
}

.hero-content p {
  animation: bounce-in 1s ease-out 0.2s forwards;
  opacity: 100;
  color: var(--c-branco);
  margin-top: 20px;
  margin-left: 18%;
  margin-right: 18%;
  font-weight: 400;
  font-size: 20px;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }

  60% {
    opacity: 1;
    transform: translateY(10px) scale(1.05);
  }

  80% {
    transform: translateY(-5px) scale(0.95);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cta-button:hover {
  animation: button-pulse 1.5s ease;
}

@keyframes button-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.7);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%);
  }

  50% {
    transform: translate(-50%, -55%);
  }

  100% {
    transform: translate(-50%, -50%);
  }
}

.floating-shape {
  position: absolute;
  display: block;
  z-index: 1;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  opacity: 0;
}

.sprinkle {
  width: 8px;
  height: 25px;
  border-radius: 4px;
}

.triangle {
  width: 0;
  height: 0;
  background-color: transparent !important;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
}

@keyframes tumble-and-float {
  0% {
    transform: translateY(-20vh) translateX(0) rotate(0deg);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateY(120vh) translateX(var(--random-x, 20px)) rotate(var(--random-rot, 720deg));
    opacity: 0;
  }
}

.shape-1 {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--c-branco);
  left: 10%;
  animation: tumble-and-float 8s infinite;
}

.shape-2 {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-azul);
  left: 20%;
  animation: tumble-and-float 12s infinite 2s;
}

.shape-3 {
  background: var(--c-amarelo);
  left: 30%;
  animation: tumble-and-float 7s infinite 1s;
}

.shape-4 {
  border-bottom: 25px solid var(--c-rosa);
  left: 40%;
  animation: tumble-and-float 10s infinite;
}

.shape-5 {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--c-branco);
  left: 50%;
  animation: tumble-and-float 6s infinite 3s;
}

.shape-6 {
  background: var(--c-azul);
  left: 60%;
  animation: tumble-and-float 9s infinite;
}

.shape-7 {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--c-rosa-dark);
  left: 70%;
  animation: tumble-and-float 11s infinite 2s;
}

.shape-8 {
  border-bottom: 25px solid var(--c-amarelo);
  left: 80%;
  animation: tumble-and-float 7s infinite;
}

.shape-9 {
  background: var(--c-branco);
  left: 90%;
  animation: tumble-and-float 13s infinite 1s;
}

.shape-10 {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c-rosa);
  left: 5%;
  animation: tumble-and-float 8s infinite 4s;
}

.shape-11 {
  border-bottom: 20px solid var(--c-azul);
  left: 55%;
  animation: tumble-and-float 10s infinite;
}

.shape-12 {
  background: var(--c-rosa-dark);
  left: 85%;
  animation: tumble-and-float 6s infinite 2s;
}

@keyframes animate-shape {
  0% {
    transform: translateY(110vh) translateX(0) rotate(0deg);
    opacity: 1;
  }

  50% {
    transform: translateY(50vh) translateX(40px) rotate(360deg);
  }

  100% {
    transform: translateY(-10vh) translateX(-40px) rotate(720deg);
    opacity: 0;
  }
}

.products-section {
  padding: 80px 0;
  text-align: center;
}

.products-section h2 {
  font-family: var(--font-title);
  font-size: 2.8rem;
  color: var(--c-text-dark);
  margin-bottom: 40px;
}

.tabs {
  margin-bottom: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.tab-button {
  background: none;
  border: 2px solid var(--c-azul);
  color: var(--c-azul);
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: var(--c-azul);
  color: var(--c-branco);
}

.tab-button.active {
  background-color: var(--c-azul);
  color: var(--c-branco);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  background-color: var(--c-branco);
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  cursor: pointer;
}

.product-card.visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(254, 117, 143, 0.2);
}

.product-visual {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
}

.product-visual i,
.product-visual svg {
  font-size: 3.5rem;
  color: var(--c-rosa);
}

.product-visual img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-card:hover .product-visual {
  transform: scale(1.2) rotate(-15deg);
}

.product-card h3 {
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--c-text-dark);
  font-weight: 600;
}

@media (max-width: 874px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .tabs {
    flex-direction: column;
  }

  .search-container {
    flex-direction: column;
  }
}

.custom-popsicle-icon {
  width: 40px;
  height: 70px;
  fill: var(--c-rosa);
}

.ituzinho-icon {
  width: 30px;
  height: 80px;
  fill: none;
}

.ituzinho-icon rect {
  fill: #d2b48c;
}

.ituzinho-icon path {
  fill: var(--c-rosa);
}

.skimo-icon {
  width: 40px;
  height: 70px;
}

.skimo-icon .stick {
  fill: #d2b48c;
}

.skimo-icon .inner-ice-cream {
  fill: #ffc0cb;
}

.skimo-icon .chocolate-shell {
  fill: #5d4037;
}

.product-visual .fa-stack {
  font-size: 3.5rem;
  line-height: 1;
}

.custom-popsicle-icon rect {
  fill: #d2b48c;
}

.custom-popsicle-icon path {
  fill: var(--c-rosa);
}

.custom-popsicle-icon {
  fill: none;
}

.search-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container input,
.search-container .custom-select-container {
  font-family: var(--font-body);
  font-size: 1rem;
  color: #555;
  border: 2px solid #eee;
  border-radius: 8px;
  background-color: var(--c-branco);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

#searchInput {
  padding: 0.75rem;
  flex-grow: 3;
  min-width: 250px;
}

#searchInput:focus {
  outline: none;
  border-color: var(--c-azul);
  box-shadow: 0 0 0 3px rgba(25, 197, 203, 0.2);
}

.custom-select-wrapper {
  flex-grow: 1;
  min-width: 220px;
}

.custom-select-wrapper select {
  width: 100%;
  padding: 0.75rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: #555;
  border: 2px solid #eee;
  border-radius: 8px;
  background-color: var(--c-branco);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%23888888%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%;
  background-size: .65em auto;
  cursor: pointer;
}

.custom-select-container {
  position: relative;
  cursor: pointer;
}

.custom-select-trigger {
  padding: 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-select-trigger::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #888;
  transition: transform 0.3s ease;
}

.custom-select-container.open .custom-select-trigger::after {
  transform: rotate(180deg);
}

.custom-options {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background-color: var(--c-branco);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
}

.custom-select-container.open .custom-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.custom-option {
  padding: 0.75rem;
  transition: background-color 0.2s ease;
}

.custom-option:hover {
  background-color: rgba(25, 197, 203, 0.1);
}

.custom-option.selected {
  background-color: var(--c-azul);
  color: var(--c-branco);
  font-weight: 600;
}

#scrollToTopBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #ff9b2d;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  z-index: 1000;
  text-decoration: none;
}

#scrollToTopBtn.show {
  opacity: 1;
  visibility: visible;
}

.product-card-category {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 15px;
}

#scrollToFiltersBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff69b4;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
}

#scrollToFiltersBtn.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

#scrollToFiltersBtn:hover {
  background-color: #ff85c1;
}

.card-cta-button {
  background-color: transparent;
  color: var(--c-azul);
  border: 2px solid var(--c-azul);
  padding: 8px 24px;
  border-radius: 20px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.3s ease;
  display: inline-block;
}

.product-card:hover .card-cta-button {
  background-color: var(--c-azul);
  color: var(--c-branco);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(25, 197, 203, 0.3);
}

.card-cta-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 197, 203, 0.3);
}

.skeleton-card {
  cursor: default;
  pointer-events: none;
}

.skeleton-visual {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 15px;
}

.skeleton-line {
  height: 16px;
  border-radius: 4px;
  margin: 0 auto 10px;
}

.skeleton-line.title {
  width: 70%;
  margin-bottom: 8px;
}

.skeleton-line.category {
  width: 50%;
  height: 12px;
  margin-bottom: 20px;
}

.skeleton-button {
  width: 110px;
  height: 36px;
  border-radius: 20px;
  margin: 0 auto;
}

.skeleton-visual,
.skeleton-line,
.skeleton-button {
  background: #f0f0f0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.category-group-block {
  margin-bottom: 3rem;
  width: 100%;
}

.category-separator-title {
  font-family: 'Fredoka', sans-serif;
  color: var(--c-azul, #007bff);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  width: 100%;
  display: block;
}
</style>