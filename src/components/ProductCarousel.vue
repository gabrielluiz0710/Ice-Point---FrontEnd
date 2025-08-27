<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import type { CardItem } from '@/types/CardItem';
import Card from './Card.vue';
import { usePointerSwipe, type UseSwipeDirection } from '@vueuse/core';

const props = defineProps<{
    items: CardItem[];
}>();

const viewportRef = ref<HTMLElement | null>(null);
const slidesPerView = ref(0);
const currentIndex = ref(0);
const isTransitioning = ref(true);

const updateLayout = () => {
    nextTick(() => {
        if (!viewportRef.value || props.items.length === 0) return;

        const slideWidth = 280;
        const gap = 20;
        const totalSlideWidth = slideWidth + gap;

        const viewportWidth = viewportRef.value.clientWidth;
        const newSlidesPerView = Math.max(1, Math.floor((viewportWidth + gap) / totalSlideWidth));

        if (newSlidesPerView !== slidesPerView.value) {
            slidesPerView.value = newSlidesPerView;
            resetToFirstPage();
        }
    });
};

const resetToFirstPage = () => {
    isTransitioning.value = false;
    currentIndex.value = slidesPerView.value;
    nextTick(() => {
        isTransitioning.value = true;
    });
}

const extendedItems = computed(() => {
    if (props.items.length === 0 || slidesPerView.value === 0) return [];
    const clonesCount = slidesPerView.value;
    const endClones = props.items.slice(0, clonesCount);
    const startClones = props.items.slice(-clonesCount);
    return [...startClones, ...props.items, ...endClones];
});

const totalPages = computed(() => {
    if (slidesPerView.value === 0 || props.items.length === 0) return 1;
    return Math.ceil(props.items.length / slidesPerView.value);
});

const currentPage = computed(() => {
    const realIndex = (currentIndex.value - slidesPerView.value);
    return Math.round(realIndex / slidesPerView.value) % totalPages.value;
});

const showNavigation = computed(() => props.items.length > slidesPerView.value);

const trackStyle = computed(() => {
    const slideWidth = 280;
    const gap = 20;
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
    if (newIndex >= props.items.length + slidesPerView.value) {
        setTimeout(() => {
            isTransitioning.value = false;
            currentIndex.value = slidesPerView.value;
            setTimeout(() => { isTransitioning.value = true; }, 50);
        }, 600);
    }
    if (newIndex < slidesPerView.value) {
        setTimeout(() => {
            isTransitioning.value = false;
            currentIndex.value = props.items.length + slidesPerView.value - 1;
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
});

onUnmounted(() => {
    window.removeEventListener('resize', updateLayout);
});
</script>

<template>
    <div class="carousel-container">
        <div class="carousel-viewport" ref="viewportRef">
            <div class="carousel-track" :style="trackStyle">
                <div class="carousel-slide" v-for="(item, index) in extendedItems" :key="`slide-${item.id}-${index}`">
                    <Card :item="item" />
                </div>
            </div>
        </div>

        <template v-if="showNavigation">
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
    </div>
</template>

<style scoped>
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
}

.carousel-viewport:active {
    cursor: grabbing;
}


.carousel-track {
    display: flex;
    gap: 20px;
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
}

.carousel-btn:hover {
    transform: translateY(-50%) scale(1.1);
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
    gap: 12px;
}

.carousel-pagination button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background-color: #ddd;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.carousel-pagination button.active {
    background-color: var(--c-rosa);
    transform: scale(1.2);
}

@media (max-width: 768px) {
    .carousel-container {
        padding: 0 20px;
    }
}
</style>