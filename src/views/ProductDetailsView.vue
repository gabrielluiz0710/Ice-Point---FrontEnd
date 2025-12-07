<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearchPlus, faPlus, faMinus, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const route = useRoute();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

const product = ref<any>(null);
const isLoading = ref(true);
const imagemPrincipal = ref('');

const abaAtiva = ref('nutricional');
const lightboxVisivel = ref(false);
const zoomLevel = ref(1);
const imagePos = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startDragPos = ref({ x: 0, y: 0 });

const fetchProductDetails = async (id: string) => {
    isLoading.value = true;
    product.value = null;

    try {
        const response = await fetch(`${API_URL}/products/${id}`);

        if (response.ok) {
            const data = await response.json();

            product.value = {
                id: data.id,
                name: data.nome,
                description: data.descricao,
                category: data.categoria?.nome || 'Geral',
                ingredients: data.ingredientes ? data.ingredientes.split(',').map((i: string) => i.trim()) : [],
                allergens: data.alergicos ? data.alergicos.split(',').map((i: string) => i.trim()) : [],
                nutrition: data.informacaoNutricional || {},
                images: data.imagens
                    ? data.imagens.sort((a: any, b: any) => a.ordem - b.ordem).map((i: any) => i.url)
                    : []
            };

            if (product.value.images.length > 0) {
                imagemPrincipal.value = product.value.images[0];
            } else if (data.imagemCapa) {
                product.value.images = [data.imagemCapa];
                imagemPrincipal.value = data.imagemCapa;
            }

            atualizarUrlAmigavel();
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
    } finally {
        isLoading.value = false;
    }
};

const criarSlug = (texto: string) => {
    return texto.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

const atualizarUrlAmigavel = () => {
    if (!product.value) return;
    const slug = criarSlug(`${product.value.category}-${product.value.name}`);
    const paramsAtuais = route.params;

    if (paramsAtuais.slug === slug) return;

    const novaUrl = `/produtos/${product.value.id}/${slug}`;
    window.history.replaceState({ ...window.history.state, current: novaUrl }, '', novaUrl);
}

onMounted(() => {
    window.scrollTo(0, 0);
    const productId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    if (productId) fetchProductDetails(productId);
});

watch(() => route.params.id, (newId) => {
    if (newId) {
        const idString = Array.isArray(newId) ? newId[0] : newId;
        window.scrollTo(0, 0);
        fetchProductDetails(idString);
    }
});

const hasNutritionData = computed(() => {
    if (!product.value?.nutrition) return false;
    const values = Object.values(product.value.nutrition);
    return values.some((val: any) => val && val.toString().trim() !== '');
});

function trocarImagemPrincipal(novaImagem: string) {
    imagemPrincipal.value = novaImagem;
}

function abrirLightbox() {
    if (!imagemPrincipal.value) return;
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
    if (zoomLevel.value === 1) imagePos.value = { x: 0, y: 0 };
}

function handleZoom(event: WheelEvent) {
    if (!lightboxVisivel.value) return;
    event.deltaY > 0 ? zoomOut() : zoomIn();
}

function startPan(event: MouseEvent) {
    if (zoomLevel.value <= 1) return;
    isDragging.value = true;
    startDragPos.value = { x: event.clientX - imagePos.value.x, y: event.clientY - imagePos.value.y };
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
        <div v-if="isLoading" class="container skeleton-container">
            <div class="skeleton-breadcrumb"></div>
            <div class="produto-layout">
                <div class="coluna-imagem">
                    <div class="skeleton-image-main"></div>
                    <div class="skeleton-thumbnails">
                        <div v-for="i in 3" :key="i" class="skeleton-thumb"></div>
                    </div>
                </div>
                <div class="coluna-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-subtitle"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-tabs"></div>
                </div>
            </div>
        </div>

        <div v-else-if="product" class="container">
            <nav class="breadcrumb-nav">
                <router-link to="/produtos">Produtos</router-link>
                <span>/</span>
                <p v-if="isLoading">Carregando...</p>
                <p v-else>{{ product.category }}</p>
                <p>-</p>
                <p>{{ product.name }}</p>
            </nav>

            <div class="produto-layout">
                <div class="coluna-imagem">
                    <div class="imagem-principal-wrapper fixed-aspect-ratio" @click="abrirLightbox">
                        <img v-if="imagemPrincipal" :src="imagemPrincipal" :alt="product.name" class="contain-image" />
                        <div v-else class="image-placeholder">
                            <font-awesome-icon :icon="faQuestionCircle" />
                            <span>Sem imagem</span>
                        </div>
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
                    <p v-if="isLoading">Carregando...</p>
                    <p v-else class="subtitulo">{{ product.category }}</p>
                    <p v-if="product.description" class="descricao">{{ product.description }}</p>
                    <div v-else class="empty-state-text">
                        <p>Uma delícia sem palavras para descrever! 😋</p>
                    </div>

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
                                        <div v-if="hasNutritionData" class="info-nutricional">
                                            <ul>
                                                <li v-for="(value, key) in product.nutrition" :key="key">
                                                    <strong>{{ key }}:</strong> {{ value }}
                                                </li>
                                            </ul>
                                        </div>
                                        <div v-else class="empty-tab-state">
                                            <font-awesome-icon :icon="faQuestionCircle" class="empty-icon" />
                                            <p>Tabela nutricional em atualização.</p>
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
                                        <p v-if="product.ingredients.length > 0">{{ product.ingredients.join(', ') }}.
                                        </p>
                                        <div v-else class="empty-tab-state">
                                            <font-awesome-icon :icon="faQuestionCircle" class="empty-icon" />
                                            <p>Lista de ingredientes indisponível no momento.</p>
                                        </div>
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
                                        <p v-if="product.allergens.length > 0">{{ product.allergens.join(' ') }}</p>
                                        <div v-else class="empty-tab-state">
                                            <font-awesome-icon :icon="faQuestionCircle" class="empty-icon" />
                                            <p>Consulte a embalagem ou nossa equipe para informações de alérgenos.</p>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="container not-found">
            <div class="not-found-content">
                <font-awesome-icon :icon="faQuestionCircle" class="not-found-icon" />
                <h1>Oops! Sabor esgotado.</h1>
                <p>Não encontramos o produto que você procurava.</p>
                <router-link to="/produtos" class="cta-button">Ver outros sabores</router-link>
            </div>
        </div>

        <div v-if="lightboxVisivel" class="lightbox-overlay" @click="fecharLightbox" @wheel.prevent="handleZoom">
            <img :src="imagemPrincipal" class="lightbox-imagem" @click.stop :class="{ 'is-dragging': isDragging }"
                :style="{ transform: `scale(${zoomLevel}) translate(${imagePos.x}px, ${imagePos.y}px)` }"
                @mousedown.prevent="startPan" @mousemove.prevent="panImage" @mouseup="endPan" @mouseleave="endPan" />
            <button class="fechar-lightbox" @click="fecharLightbox">&times;</button>
            <div class="zoom-controls" @click.stop>
                <button @click="zoomOut"><font-awesome-icon :icon="faMinus" /></button>
                <button @click="zoomIn"><font-awesome-icon :icon="faPlus" /></button>
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

.imagem-principal-wrapper.fixed-aspect-ratio {
    width: 100%;
    aspect-ratio: 4 / 4;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
}

.contain-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 250px);
    padding: 40px 0;
}

.not-found-content {
    background-color: var(--c-branco);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 40px;
    text-align: center;
    max-width: 550px;
    width: 100%;
    animation: fadeInSlideUp 0.5s ease-out forwards;
}

.not-found-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
    color: var(--c-rosa);
}

.not-found h1 {
    font-family: var(--font-title);
    font-size: 2.2rem;
    color: var(--c-azul-dark);
    margin-bottom: 16px;
}

.not-found p {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
    margin: 0 auto 32px auto;
    max-width: 450px;
}

.not-found .cta-button {
    display: inline-block;
    padding: 12px 30px;
    border-radius: 50px;
    background-color: var(--c-rosa);
    color: var(--c-branco);
    text-decoration: none;
    font-weight: 500;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.not-found .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(239, 121, 141, 0.4);
}

@keyframes fadeInSlideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    color: var(--c-text-dark);
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
    color: var(--c-text-dark);
}

.info-nutricional li {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
    color: var(--c-text-dark);
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

.skeleton-breadcrumb {
    height: 20px;
    width: 300px;
    background: #e0e0e0;
    margin-bottom: 40px;
    border-radius: 4px;
}

.skeleton-image-main {
    width: 100%;
    aspect-ratio: 4 / 4;
    background: #e0e0e0;
    border-radius: 20px;
    margin-bottom: 20px;
}

.skeleton-thumbnails {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.skeleton-thumb {
    width: 80px;
    height: 80px;
    background: #e0e0e0;
    border-radius: 10px;
}

.skeleton-title {
    height: 40px;
    width: 60%;
    background: #e0e0e0;
    margin-bottom: 20px;
    border-radius: 8px;
}

.skeleton-subtitle {
    height: 24px;
    width: 30%;
    background: #e0e0e0;
    margin-bottom: 30px;
    border-radius: 6px;
}

.skeleton-text {
    height: 16px;
    width: 100%;
    background: #e0e0e0;
    margin-bottom: 12px;
    border-radius: 4px;
}

.skeleton-tabs {
    margin-top: 40px;
    height: 50px;
    width: 100%;
    background: #e0e0e0;
    border-radius: 8px;
}

.skeleton-breadcrumb,
.skeleton-image-main,
.skeleton-thumb,
.skeleton-title,
.skeleton-subtitle,
.skeleton-text,
.skeleton-tabs {
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

.empty-state-text {
    font-style: italic;
    color: #888;
    margin-bottom: 30px;
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid var(--c-azul);
}

.empty-tab-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: #999;
    text-align: center;
    gap: 10px;
}

.empty-icon {
    font-size: 1.5rem;
    opacity: 0.5;
    margin-bottom: 5px;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    color: #9ca3af;
    gap: 16px;
    border-radius: 20px;
    transition: all 0.3s ease;
    padding: 20px;
}

.image-placeholder svg {
    width: 80px;
    height: 80px;
    object-fit: contain;
    padding: 80px 80px 0 80px;
}

.image-placeholder span {
    font-size: 1.1rem;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    color: #6b7280;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: center;
    padding-bottom: 80px;
}

.imagem-principal-wrapper:hover .image-placeholder {
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    color: var(--c-azul);
}

.imagem-principal-wrapper:hover .image-placeholder span {
    color: var(--c-azul);
}

@media (max-width: 768px) {
    .imagem-principal-wrapper.fixed-aspect-ratio {
        aspect-ratio: 4 / 3;
        border-radius: 16px;
    }

    .image-placeholder svg {
        width: 60px;
        height: 60px;
    }

    .image-placeholder {
        border-radius: 16px;
        gap: 10px;
    }

    .image-placeholder span {
        font-size: 0.9rem;
    }
}
</style>