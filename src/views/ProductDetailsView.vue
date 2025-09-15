<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { products } from '@/stores/sabores';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearchPlus, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const route = useRoute();
const router = useRouter();

const product = computed(() => {
    const productIdParam = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    return products.value.find(p => p.id === parseInt(productIdParam || '0'));
});

const categoryDisplayNames: { [key: string]: string } = {
    'sorvetes': 'Sorvetes',
    'picole-leite': 'Picolé ao Leite',
    'picole-fruta': 'Picolé de Fruta',
    'ituzinho': 'Ituzinho',
    'skimo': 'Skimó',
    'zero': 'Zero Açúcar',
    'acai': 'Açaí'
};

const imagemPrincipal = ref('');

const abaAtiva = ref('nutricional');

const lightboxVisivel = ref(false);
const zoomLevel = ref(1);
const imagePos = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startDragPos = ref({ x: 0, y: 0 });

onMounted(() => {
    window.scrollTo(0, 0);

    if (product.value && product.value.images && product.value.images.length > 0) {
        imagemPrincipal.value = product.value.images[0];
    }
});

watch(() => route.params.id, () => {
    if (product.value && product.value.images && product.value.images.length > 0) {
        imagemPrincipal.value = product.value.images[0];
        window.scrollTo(0, 0);
    }
});

function trocarImagemPrincipal(novaImagem: string) {
    imagemPrincipal.value = novaImagem;
}

function abrirLightbox() {
    lightboxVisivel.value = true;
}

function fecharLightbox() {
    lightboxVisivel.value = false;
    zoomLevel.value = 1;
    imagePos.value = { x: 0, y: 0 };
    isDragging.value = false;
}

const scaleAmount = 0.5;
const maxZoom = 3;

function zoomIn() {
    zoomLevel.value = Math.min(maxZoom, zoomLevel.value + scaleAmount);
}

function zoomOut() {
    zoomLevel.value = Math.max(1, zoomLevel.value - scaleAmount);
    if (zoomLevel.value === 1) {
        imagePos.value = { x: 0, y: 0 };
    }
}

function handleZoom(event: WheelEvent) {
    if (!lightboxVisivel.value) return;

    if (event.deltaY > 0) {
        zoomOut();
    } else {
        zoomIn();
    }
}

function startPan(event: MouseEvent) {
    if (zoomLevel.value <= 1) return;
    isDragging.value = true;
    startDragPos.value = {
        x: event.clientX - imagePos.value.x,
        y: event.clientY - imagePos.value.y,
    };
}

function panImage(event: MouseEvent) {
    if (!isDragging.value) return;
    event.preventDefault();

    const newX = event.clientX - startDragPos.value.x;
    const newY = event.clientY - startDragPos.value.y;

    const maxPan = (zoomLevel.value - 1) * 200;
    imagePos.value.x = Math.max(-maxPan, Math.min(maxPan, newX));
    imagePos.value.y = Math.max(-maxPan, Math.min(maxPan, newY));
}

function endPan() {
    isDragging.value = false;
}
</script>

<template>
    <main class="pagina-produto">
        <div v-if="product" class="container">
            <nav class="breadcrumb-nav">
                <router-link to="/produtos">Produtos</router-link>
                <span>/</span>
                <p>{{ categoryDisplayNames[product.category] || product.category }}</p>
                <p>-</p>
                <p>{{ product.name }}</p>
            </nav>

            <div class="produto-layout">
                <div class="coluna-imagem">
                    <div class="imagem-principal-wrapper" @click="abrirLightbox">
                        <img :src="imagemPrincipal" :alt="`Imagem principal de ${product.name}`" />
                        <div class="zoom-icon">
                            <font-awesome-icon :icon="faSearchPlus" size="lg" />
                        </div>
                    </div>
                    <div class="imagens-miniatura">
                        <img v-for="(img, index) in product.images" :key="index" :src="img"
                            :alt="`Miniatura ${index + 1}`" :class="{ active: img === imagemPrincipal }"
                            @click="trocarImagemPrincipal(img)" />
                    </div>
                </div>

                <div class="coluna-info">
                    <h1>{{ product.name }}</h1>
                    <p class="subtitulo">{{ categoryDisplayNames[product.category] || product.category }}</p>
                    <p class="descricao">{{ product.description }}</p>

                    <div class="secao-abas">
                        <div class="abas-botoes">
                            <button @click="abaAtiva = 'nutricional'" :class="{ active: abaAtiva === 'nutricional' }">
                                Informações Nutricionais
                            </button>
                            <button @click="abaAtiva = 'ingredientes'" :class="{ active: abaAtiva === 'ingredientes' }">
                                Ingredientes
                            </button>
                            <button @click="abaAtiva = 'alergicos'" :class="{ active: abaAtiva === 'alergicos' }">
                                Alérgicos
                            </button>
                        </div>

                        <div class="abas-conteudo-container">
                            <div class="aba-item">
                                <button class="aba-titulo-mobile"
                                    @click="abaAtiva = abaAtiva === 'nutricional' ? '' : 'nutricional'">
                                    Informações Nutricionais
                                    <span class="aba-icone"></span>
                                </button>
                                <Transition name="slide-fade">
                                    <div v-show="abaAtiva === 'nutricional'" class="aba-conteudo">
                                        <div class="info-nutricional">
                                            <ul>
                                                <li v-for="(value, key) in product.nutrition" :key="key">
                                                    <strong>{{ key }}:</strong> {{ value }}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </Transition>
                            </div>

                            <div class="aba-item">
                                <button class="aba-titulo-mobile"
                                    @click="abaAtiva = abaAtiva === 'ingredientes' ? '' : 'ingredientes'">
                                    Ingredientes
                                    <span class="aba-icone"></span>
                                </button>
                                <Transition name="slide-fade">
                                    <div v-show="abaAtiva === 'ingredientes'" class="aba-conteudo">
                                        <p>{{ product.ingredients.join(', ') }}.</p>
                                    </div>
                                </Transition>
                            </div>

                            <div class="aba-item">
                                <button class="aba-titulo-mobile"
                                    @click="abaAtiva = abaAtiva === 'alergicos' ? '' : 'alergicos'">
                                    Alérgicos
                                    <span class="aba-icone"></span>
                                </button>
                                <Transition name="slide-fade">
                                    <div v-show="abaAtiva === 'alergicos'" class="aba-conteudo">
                                        <p>{{ product.allergens.join(' ') }}</p>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="container not-found">
            <h1>Oops!</h1>
            <p>Produto não encontrado. Que tal voltar e escolher outra delícia?</p>
            <router-link to="/produtos" class="cta-button">Voltar para Produtos</router-link>
        </div>

        <div v-if="lightboxVisivel" class="lightbox-overlay" @click="fecharLightbox" @wheel.prevent="handleZoom">
            <img :src="imagemPrincipal" class="lightbox-imagem" @click.stop :class="{ 'is-dragging': isDragging }"
                :style="{ transform: `scale(${zoomLevel}) translate(${imagePos.x}px, ${imagePos.y}px)` }"
                @mousedown.prevent="startPan" @mousemove.prevent="panImage" @mouseup="endPan" @mouseleave="endPan" />

            <button class="fechar-lightbox" @click="fecharLightbox">&times;</button>

            <div class="zoom-controls" @click.stop>
                <button @click="zoomOut" title="Diminuir zoom">
                    <font-awesome-icon :icon="faMinus" />
                </button>
                <button @click="zoomIn" title="Aumentar zoom">
                    <font-awesome-icon :icon="faPlus" />
                </button>
            </div>
        </div>
    </main>
</template>

<style scoped>
*,
*::before,
*::after {
    box-sizing: border-box;
}

.produto-layout>.coluna-imagem,
.produto-layout>.coluna-info {
    min-width: 0;
}

.imagem-principal-wrapper,
.imagem-principal-wrapper img,
.imagens-miniatura img {
    max-width: 100%;
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
}

.imagens-miniatura {
    flex-wrap: wrap;
    justify-content: center;
}

.pagina-produto {
    padding: 40px 0 80px 0;
    background-color: #f9f9f9;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
}

.not-found {
    text-align: center;
    padding: 80px 0;
}

.not-found h1 {
    font-size: 3rem;
    color: var(--c-azul-dark);
}

.not-found p {
    font-size: 1.2rem;
    margin: 20px 0 40px 0;
}

.breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 40px;
    font-size: 0.9rem;
    color: #888;
}

.breadcrumb-nav a {
    color: var(--c-azul);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}

.breadcrumb-nav a:hover {
    color: var(--c-rosa);
}

.produto-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 60px;
    align-items: flex-start;
}

.coluna-imagem {
    position: sticky;
    top: 40px;
}

.imagem-principal-wrapper {
    background-color: #e4e4e4;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    overflow: hidden;
    cursor: pointer;
    position: relative;
}

.imagem-principal-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.4s ease;
}

.imagem-principal-wrapper:hover img {
    transform: scale(1.05);
}

.zoom-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-azul-dark);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.imagem-principal-wrapper:hover .zoom-icon {
    opacity: 1;
}

.imagens-miniatura {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.imagens-miniatura img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 10px;
    cursor: pointer;
    border: 3px solid transparent;
    transition: border-color 0.3s ease, transform 0.3s ease;
}

.imagens-miniatura img:hover {
    transform: scale(1.1);
}

.imagens-miniatura img.active {
    border-color: var(--c-azul);
}

.coluna-info h1 {
    font-family: var(--font-title);
    font-size: 2.8rem;
    color: var(--c-text-dark);
    margin-bottom: 10px;
    word-break: break-word;
    font-weight: 600;
}

.subtitulo {
    font-size: 1.2rem;
    color: var(--c-rosa);
    font-weight: 500;
    margin-bottom: 25px;
}

.descricao {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin-bottom: 40px;
    overflow-wrap: break-word;
}

.secao-abas {
    margin-top: 40px;
    font-family: 'Fredoka', sans-serif;
}

.abas-botoes {
    display: flex;
    border-bottom: 1px solid #ddd;
}

.abas-botoes button {
    background: none;
    border: none;
    padding: 15px 25px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: #888;
    position: relative;
    transition: color 0.3s ease;
    font-family: 'Fredoka', sans-serif;
}

.abas-botoes button:hover {
    color: var(--c-text-dark);
}

.abas-botoes button.active {
    color: var(--c-azul);
}

.abas-botoes button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--c-azul);
}

.abas-conteudo-wrapper {
    padding: 25px 25px;
    background-color: var(--c-branco) !important;
    border-radius: 0 0 10px 10px;
    min-height: 120px;
    color: #444;
    line-height: 1.7;
    overflow-wrap: break-word;
}

.info-nutricional ul {
    list-style: none;
    padding: 0;
}

.info-nutricional li {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
}

.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
}

.lightbox-imagem {
    max-width: 90%;
    max-height: 90%;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    transition: transform 0.2s ease-out;
    transform-origin: center center;
    cursor: grab;
}

.lightbox-imagem.is-dragging {
    cursor: grabbing;
    transition: none;
}

.fechar-lightbox {
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 3rem;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 2002;
}

.abas-conteudo-wrapper {
    padding-top: 15px;
}

.zoom-controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 30px;
    padding: 8px;
    display: flex;
    gap: 12px;
    z-index: 2001;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.zoom-controls button {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.zoom-controls button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.zoom-controls button:active {
    transform: scale(0.9);
}

.aba-titulo-mobile {
    display: none;
}

@media (max-width: 992px) {
    .produto-layout {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .coluna-imagem {
        position: static;
        max-width: 500px;
        margin: 0 auto;
    }

    .coluna-info h1 {
        font-size: 2.4rem;
    }
}

@media (max-width: 768px) {
    .pagina-produto {
        padding: 20px 0 60px 0;
    }

    .container {
        padding: 0 15px;
    }

    .breadcrumb-nav {
        flex-wrap: wrap;
        margin-bottom: 25px;
    }

    .coluna-info h1 {
        font-size: 2rem;
    }

    .subtitulo {
        font-size: 1.1rem;
    }

    .abas-botoes {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 5px;
    }

    .abas-botoes::-webkit-scrollbar {
        height: 4px;
    }

    .abas-botoes::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }

    .abas-botoes button {
        padding: 12px 18px;
        font-size: 0.95rem;
        white-space: nowrap;
    }

    .abas-conteudo-wrapper {
        padding: 20px 15px;
    }

    .imagens-miniatura {
        gap: 10px;
        justify-content: center;
    }

    .imagens-miniatura img {
        width: 65px;
        height: 65px;
    }

    .fechar-lightbox {
        top: 10px;
        right: 15px;
        font-size: 2.5rem;
    }
}

@media (min-width: 471px) {
    .abas-conteudo-container .aba-item {
        border: none;
        margin: 0;
        background-color: transparent;
    }

    .abas-conteudo-container {
        padding: 25px;
        background-color: var(--c-branco);
        border-radius: 0 0 10px 10px;
        min-height: 120px;
    }
}


@media (max-width: 470px) {
    .coluna-info h1 {
        font-size: 1.8rem;
        line-height: 1.2;
    }

    .descricao {
        font-size: 0.95rem;
    }

    .produto-layout {
        gap: 20px;
    }

    .imagens-miniatura img {
        width: 50px;
        height: 50px;
    }

    .not-found h1 {
        font-size: 2.5rem;
    }

    .not-found p {
        font-size: 1rem;
    }

    .secao-abas {
        margin-top: 30px;
        border: none;
        border-radius: 0;
        overflow: visible;
        background-color: transparent;
    }

    .abas-botoes {
        display: none;
    }

    .aba-titulo-mobile {
        display: flex;
        background: var(--c-azul);
        border: none;
        width: 100%;
        padding: 15px;
        font-size: 1rem;
        font-weight: 500;
        font-family: 'Fredoka', sans-serif;
        color: var(--c-branco);
        text-align: left;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease;
    }

    .aba-titulo-mobile:hover {
        background-color: var(--c-azul-dark);
    }

    .aba-item {
        border: 1px solid #eee;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 10px;
        background-color: var(--c-branco);
    }

    .aba-item:last-child {
        margin-bottom: 0;
    }

    .aba-icone {
        position: relative;
        width: 16px;
        height: 16px;
        transition: transform 0.3s ease;
        color: var(--c-branco);
    }

    .aba-icone::before,
    .aba-icone::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 2px;
        background-color: var(--c-branco);
        transform: translate(-50%, -50%);
    }

    .aba-icone::after {
        transform: translate(-50%, -50%) rotate(90deg);
    }

    .aba-item button.active+.aba-conteudo .aba-icone,
    .aba-titulo-mobile:has(+ div[style*="display: block"]) .aba-icone {
        transform: rotate(45deg);
    }

    .aba-conteudo {
        padding: 0px 15px 15px 15px;
        line-height: 1.6;
        font-size: 0.95rem;
        background-color: var(--c-branco);
    }

    .aba-conteudo p,
    .info-nutricional ul {
        padding-top: 15px;
    }

    .info-nutricional li {
        flex-direction: row;
        align-items: center;
        gap: 0;
    }

    abas-botoes+.abas-conteudo-container {
        display: block;
    }

    .abas-conteudo-container .aba-conteudo {
        padding: 0px 15px 15px 15px;
    }
}

html,
body {
    max-width: 100%;
    overflow-x: hidden;
}

.lightbox-imagem {
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
    object-fit: contain;
}

@media (max-width: 470px) {
    .container {
        padding-left: 12px;
        padding-right: 12px;
    }
}

.slide-fade-enter-active {
    transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}


.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>