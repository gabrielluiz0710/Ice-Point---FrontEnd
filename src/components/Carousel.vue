<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface SlideItem {
    small: string;
    medium: string;
    big: string;
    alt: string;
}

const props = defineProps<{
    items: SlideItem[];
}>();

const breakpoints = {
    small: 768,
    medium: 1440,
};

const totalSlides = computed(() => props.items.length);
const currentSlide = ref(1);
const windowWidth = ref(window.innerWidth);
let slideInterval: number | undefined = undefined;

const dynamicSlides = computed(() => {
    const width = windowWidth.value;
    return props.items.map(slide => {
        if (width > breakpoints.medium) {
            return { src: slide.big, alt: slide.alt };
        }
        if (width > breakpoints.small) {
            return { src: slide.medium, alt: slide.alt };
        }
        return { src: slide.small, alt: slide.alt };
    });
});

const sliderContentStyle = computed(() => ({
    width: `${totalSlides.value * 100}%`,
    transform: `translateX(-${(currentSlide.value - 1) * (100 / totalSlides.value)}%)`,
}));

const slideBoxStyle = computed(() => ({
    width: `${100 / totalSlides.value}%`,
}));

const resetInterval = () => {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(advance, 5000);
};

const advance = () => {
    if (totalSlides.value > 1) {
        currentSlide.value = currentSlide.value === totalSlides.value ? 1 : currentSlide.value + 1;
    }
};

const next = () => {
    advance();
    resetInterval();
};

const prev = () => {
    if (totalSlides.value > 1) {
        currentSlide.value = currentSlide.value === 1 ? totalSlides.value : currentSlide.value - 1;
    }
    resetInterval();
};

const goToSlide = (slideNumber: number) => {
    currentSlide.value = slideNumber;
    resetInterval();
};

const handleResize = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    if (totalSlides.value > 1) {
        slideInterval = setInterval(advance, 5000);
    }
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    clearInterval(slideInterval);
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <section class="slider" v-if="items.length > 0">
        <div class="slider-content" :style="sliderContentStyle">
            <div v-for="(slide, index) in dynamicSlides" :key="index" class="slide-box" :style="slideBoxStyle">
                <img :src="slide.src" :alt="slide.alt" draggable="false" />
            </div>
        </div>

        <template v-if="totalSlides > 1">
            <button @click="prev" class="slider-arrow left" aria-label="Slide anterior">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>
            <button @click="next" class="slider-arrow right" aria-label="Próximo slide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
            </button>

            <div class="dots-navigation">
                <button v-for="(_, index) in totalSlides" :key="`dot-${index}`" class="dot"
                    :class="{ 'active': currentSlide === index + 1 }" @click="goToSlide(index + 1)"
                    :aria-label="`Ir para o slide ${index + 1}`"></button>
            </div>
        </template>
    </section>
</template>

<style scoped>
.slider {
    position: relative;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.slider-content {
    display: flex;
    transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-box {
    flex-shrink: 0;
}

.slide-box img {
    width: 100%;
    height: auto;
    display: block;
}

.slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--controls-bg);
    border: none;
    cursor: pointer;
    color: var(--controls-icon-color);
    transition: background-color 0.3s ease, transform 0.2s ease;
    backdrop-filter: blur(4px);
}

.slider-arrow:hover {
    background: var(--controls-bg-hover);
    transform: translateY(-50%) scale(1.1);
}

.slider-arrow.left {
    left: 16px;
}

.slider-arrow.right {
    right: 16px;
}

.slider-arrow svg {
    width: 28px;
    height: 28px;
}

.dots-navigation {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    gap: 12px;
    padding: 8px 16px;
    background: var(--controls-bg);
    border-radius: 20px;
    backdrop-filter: blur(4px);
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--dot-inactive-color);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}

.dot:hover {
    background: var(--controls-icon-color);
}

.dot.active {
    background: var(--primary-color);
    transform: scale(1.4);
}

@media screen and (max-width: 768px) {
    .slider-arrow {
        width: 25px;
        height: 25px;
    }

    .slider-arrow.left {
        left: 5px;
    }

    .slider-arrow.right {
        right: 5px;
    }

    .dot {
        width: 8px;
        height: 8px;
    }

    .dot.active {
        background: var(--primary-color);
        transform: scale(1.4);
    }

    .dots-navigation {
        bottom: 5px;
        gap: 8px;
        padding: 6px 12px;
    }
}
</style>