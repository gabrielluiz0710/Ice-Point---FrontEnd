<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import Card from './Card.vue';
import CardSkeleton from './CardSkeleton.vue';
import { usePointerSwipe, type UseSwipeDirection } from '@vueuse/core';

interface ProductHighlight {
    id: number;
    nome: string;
    descricao: string;
    preco_unitario: string;
    imagemCapa: string;
    destaque: boolean;
}

interface CardItem {
    id: number;
    image: string;
    title: string;
    description: string;
    link: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const items = ref<CardItem[]>([]);
const isLoading = ref(true);

const viewportRef = ref<HTMLElement | null>(null);
const slidesPerView = ref(0);
const currentIndex = ref(0);
const isTransitioning = ref(true);

const fetchHighlights = async () => {
    isLoading.value = true;
    try {
        const response = await fetch(`${API_URL}/products/highlights`);
        if (response.ok) {
            const data: ProductHighlight[] = await response.json();

            items.value = data.map(product => {
                const priceFormatted = Number(product.preco_unitario).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                return {
                    id: product.id,
                    image: product.imagemCapa || '',
                    title: product.nome,
                    description: product.descricao,
                    link: `/produtos/${product.id}`
                };
            });

            updateLayout();
        }
    } catch (error) {
        console.error("Erro ao buscar destaques:", error);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
            updateLayout();
        }, 500);
    }
};

const updateLayout = () => {
    nextTick(() => {
        if (!viewportRef.value) return;

        const slideWidth = 280;
        const gap = 20;
        const totalSlideWidth = slideWidth + gap;

        const viewportWidth = viewportRef.value.clientWidth || window.innerWidth;
        const newSlidesPerView = Math.max(1, Math.floor((viewportWidth + gap) / totalSlideWidth));

        if (newSlidesPerView !== slidesPerView.value) {
            slidesPerView.value = newSlidesPerView;
            if (!isLoading.value) resetToFirstPage();
        }
    });
};

const resetToFirstPage = () => {
    if (items.value.length === 0) return;
    isTransitioning.value = false;
    currentIndex.value = slidesPerView.value;
    nextTick(() => {
        setTimeout(() => { isTransitioning.value = true; }, 50);
    });
}

const extendedItems = computed(() => {
    if (items.value.length === 0 || slidesPerView.value === 0) return [];

    const clonesCount = slidesPerView.value;
    const safeClonesCount = Math.min(clonesCount, items.value.length);

    const endClones = items.value.slice(0, safeClonesCount);
    const startClones = items.value.slice(-safeClonesCount);
    return [...startClones, ...items.value, ...endClones];
});

const totalPages = computed(() => {
    if (slidesPerView.value === 0 || items.value.length === 0) return 1;
    return Math.ceil(items.value.length / slidesPerView.value);
});

const currentPage = computed(() => {
    const realIndex = (currentIndex.value - slidesPerView.value);
    if (totalPages.value <= 1) return 0;
    let page = Math.round(realIndex / slidesPerView.value) % totalPages.value;
    if (page < 0) page += totalPages.value;
    return page;
});

const showNavigation = computed(() => items.value.length > slidesPerView.value);

const trackStyle = computed(() => {
    const slideWidth = 280;
    const gap = 20;

    if (isLoading.value) return {};

    const offset = currentIndex.value * (slideWidth + gap);

    return {
        transform: `translateX(-${offset}px)`,
        transition: isTransitioning.value ? 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
    };
});

const scrollNext = () => {
    if (!isTransitioning.value) return;
    currentIndex.value++;
};

const scrollPrev = () => {
    if (!isTransitioning.value) return;
    currentIndex.value--;
};

const goToPage = (pageIndex: number) => {
    if (!isTransitioning.value) return;
    currentIndex.value = slidesPerView.value + (pageIndex * slidesPerView.value);
};

watch(currentIndex, (newIndex) => {
    if (isLoading.value || items.value.length === 0) return;

    const totalItems = items.value.length;

    if (newIndex >= totalItems + slidesPerView.value) {
        setTimeout(() => {
            isTransitioning.value = false;
            currentIndex.value = slidesPerView.value;
            setTimeout(() => { isTransitioning.value = true; }, 50);
        }, 600);
    }
    if (newIndex < slidesPerView.value) {
        setTimeout(() => {
            isTransitioning.value = false;
            currentIndex.value = totalItems + slidesPerView.value - 1;
            setTimeout(() => { isTransitioning.value = true; }, 50);
        }, 600);
    }
});

usePointerSwipe(viewportRef, {
    threshold: 50,
    onSwipeEnd: (e: PointerEvent, direction: UseSwipeDirection) => {
        if (direction === 'left') scrollNext();
        else if (direction === 'right') scrollPrev();
    }
});

onMounted(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    fetchHighlights();
});

onUnmounted(() => {
    window.removeEventListener('resize', updateLayout);
});
</script>

<template>
    <div class="carousel-container">
        <div class="carousel-viewport" ref="viewportRef">

            <div v-if="isLoading" class="carousel-track">
                <div class="carousel-slide" v-for="n in (slidesPerView || 4)" :key="`skeleton-${n}`">
                    <CardSkeleton />
                </div>
            </div>

            <div v-else class="carousel-track" :style="trackStyle">
                <div class="carousel-slide" v-for="(item, index) in extendedItems" :key="`slide-${item.id}-${index}`">
                    <Card :item="item" />
                </div>
            </div>

        </div>

        <template v-if="!isLoading && showNavigation && items.length > 0">
            <button @click="scrollPrev" class="carousel-btn prev" aria-label="Anterior">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button @click="scrollNext" class="carousel-btn next" aria-label="Próximo">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
            <div class="carousel-pagination">
                <button v-for="(_, index) in totalPages" :key="index" @click="goToPage(index)"
                    :class="{ active: currentPage === index }" :aria-label="`Ir para a página ${index + 1}`"></button>
            </div>
        </template>

        <div v-if="!isLoading && items.length === 0" class="empty-state">
            <p>Nenhum produto em destaque no momento.</p>
        </div>
    </div>
</template>

<style scoped>
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--c-text-light);
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
}

.carousel-container {
    position: relative;
    width: 100%;
    max-width: 1280px;
    margin: 2rem auto;
    padding: 0 40px;
    box-sizing: border-box;
}

.carousel-viewport {
    width: 100%;
    overflow: hidden;
    cursor: grab;
    padding-bottom: 20px;
}

.carousel-viewport:active {
    cursor: grabbing;
}

.carousel-track {
    display: flex;
    gap: 20px;
    will-change: transform;
}

.carousel-slide {
    flex: 0 0 280px;
    width: 280px;
}

.carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: var(--c-text-light);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    color: var(--c-branco);
    opacity: 0.8;
}

.carousel-btn:hover {
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
    background-color: var(--c-rosa);
}

.carousel-btn.prev {
    left: 0;
}

.carousel-btn.next {
    right: 0;
}

.carousel-pagination {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
}

.carousel-pagination button {
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    background-color: transparent;
    position: relative;
}

.carousel-pagination button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ddd;
    transition: all 0.3s ease;
}

.carousel-pagination button.active::before {
    background-color: var(--c-rosa);
    transform: translate(-50%, -50%) scale(1.4);
}

@media (max-width: 768px) {
    .carousel-container {
        padding: 0 10px;
    }

    .carousel-btn {
        display: none;
    }
}
</style>