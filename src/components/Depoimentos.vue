<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/service/api';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, EffectCoverflow, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

const GOOGLE_PLACE_ID = "ChIJtZbKt4HPupQRNvCfvu4DthI";
const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
const GOOGLE_MAPS_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;

interface Review {
    author_name: string;
    author_url?: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
}

const reviews = ref<Review[]>([]);
const siteRating = ref(0);
const totalReviews = ref(0);
const isLoading = ref(true);
const modules = [Autoplay, Pagination, EffectCoverflow, Navigation];

const openSpecificReview = (url?: string) => {
    const target = url || GOOGLE_MAPS_URL;
    window.open(target, '_blank');
};

const handleImageError = (event: Event, authorName: string) => {
    const img = event.target as HTMLImageElement;
    const fallbackUrl = `https://ui-avatars.com/api/?name=${authorName}&background=random&color=fff&size=128`;
    if (img.src !== fallbackUrl) img.src = fallbackUrl;
};

const swiperOptions = {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto' as 'auto',
    loop: true,
    speed: 800,
    spaceBetween: 40,
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    navigation: {
        nextEl: '.custom-next',
        prevEl: '.custom-prev',
    },
    pagination: {
        clickable: true,
        dynamicBullets: true
    }
};

onMounted(async () => {
    try {
        const response = await api.get('/reviews');
        reviews.value = response.data.reviews || [];
        siteRating.value = response.data.rating || 5;
        totalReviews.value = response.data.total_reviews || 100;
    } catch (error) {
        console.error("Erro reviews:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <section class="reviews-section">
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap"
            rel="stylesheet">

        <div class="container">

            <div class="header-content fade-in-up">
                <div class="badge-google">
                    <svg class="google-icon-header" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                    </svg>
                    <span>Excelência Comprovada</span>
                </div>
                <h2 class="section-title">Nossos Clientes <span class="highlight">Amam!</span></h2>

                <div class="stats-container">
                    <div class="rating-box">
                        <span class="score">{{ siteRating }}</span>
                        <div class="stars-static">★★★★★</div>
                    </div>
                    <span class="review-count">{{ totalReviews }}+ avaliações reais</span>
                </div>
                <div class="cta-container">
                    <a :href="GOOGLE_WRITE_REVIEW_URL" target="_blank" class="cta-button">
                        Avaliar Experiência
                    </a>
                </div>
            </div>

            <div v-if="isLoading" class="loading-state">
                <div class="loader-ice">🍦</div>
            </div>

            <div v-else-if="reviews.length > 0" class="swiper-container-wrapper fade-in-up delay-100">

                <div class="fade-mask left"></div>
                <div class="fade-mask right"></div>

                <button class="nav-btn custom-prev">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="nav-btn custom-next">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>

                <Swiper v-bind="swiperOptions" :modules="modules" class="mySwiper">
                    <SwiperSlide v-for="(review, index) in reviews" :key="index" class="review-slide">
                        <div class="review-card">

                            <div class="card-header">
                                <div class="profile-stack">
                                    <img :src="review.profile_photo_url"
                                        @error="handleImageError($event, review.author_name)" loading="lazy"
                                        class="avatar" />
                                    <div class="google-badge-mini">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                            <path fill="currentColor"
                                                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="meta-info">
                                    <h3 class="author">{{ review.author_name }}</h3>
                                    <div class="stars">
                                        <span v-for="n in 5" :key="n" :class="{ filled: n <= review.rating }">★</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-content">
                                <p>"{{ review.text }}"</p>
                            </div>

                            <div class="card-footer">
                                <span class="date">{{ review.relative_time_description }}</span>
                                <button class="btn-view-google" @click.stop="openSpecificReview(review.author_url)">
                                    Ver no Google <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>

        </div>
    </section>
</template>

<style scoped>
.reviews-section {
    --font-title: 'Fredoka', sans-serif;
    --c-primary: #FF758F;
    --c-secondary: #4CC9F0;
    --c-bg-card: #ffffff;
    --card-width: 360px;
    font-family: var(--font-title);
    padding: 5rem 1rem;
    background: linear-gradient(to bottom, #ffffff, #fcfcfc);
    overflow: hidden;
}

.container {
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.header-content {
    text-align: center;
    margin-bottom: 3rem;
}

.badge-google {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 8px 20px;
    border-radius: 100px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.03);
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 1.5rem;
}

.google-icon-header {
    width: 18px;
    height: 18px;
    fill: #4285F4;
    filter: drop-shadow(0 2px 4px rgba(66, 133, 244, 0.25));
    transform: translateY(-1px);
}

.section-title {
    font-size: 3rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.1;
}

.highlight {
    color: var(--c-primary);
    position: relative;
    display: inline-block;
}

.highlight::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 100%;
    height: 8px;
    background: rgba(255, 117, 143, 0.2);
    z-index: -1;
    border-radius: 4px;
}

.stats-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;
}

.rating-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff9fa;
    padding: 5px 15px;
    border-radius: 20px;
}

.score {
    font-weight: 600;
    font-size: 1.4rem;
    color: #333;
}

.stars-static {
    color: #FFC107;
    letter-spacing: 2px;
    font-size: 1.1rem;
}

.review-count {
    color: #888;
    font-size: 0.95rem;
    font-weight: 400;
}

.swiper-container-wrapper {
    width: 100%;
    position: relative;
    padding: 40px 0;
    display: flex;
    justify-content: center;
}

.fade-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20%;
    z-index: 10;
    pointer-events: none;
}

.fade-mask.left {
    left: 0;
    background: linear-gradient(to right, #ffffff 0%, transparent 100%);
}

.fade-mask.right {
    right: 0;
    background: linear-gradient(to left, #ffffff 0%, transparent 100%);
}

.swiper {
    width: 100%;
    padding-bottom: 60px !important;
    overflow: visible !important;
}

.swiper-slide {
    width: var(--card-width);
    height: auto;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    opacity: 0 !important;
    pointer-events: none;
    transform: scale(0.85) translateY(20px);
}

.swiper-slide-active {
    opacity: 1 !important;
    transform: scale(1) translateY(0);
    z-index: 20;
    pointer-events: auto;
}

.swiper-slide-prev,
.swiper-slide-next {
    opacity: 0.5 !important;
    transform: scale(0.9) translateY(0);
    z-index: 10;
    pointer-events: auto;
    filter: blur(2px);
    cursor: pointer;
}

.swiper-slide-prev:hover,
.swiper-slide-next:hover {
    opacity: 0.8 !important;
    filter: blur(0px);
}

.review-card {
    background: #ffffff;
    border-radius: 32px;
    padding: 2.2rem;
    height: 100%;
    min-height: 340px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid rgba(0, 0, 0, 0.03);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.swiper-slide-active .review-card {
    box-shadow: 0 20px 60px rgba(255, 117, 143, 0.15);
    border-color: rgba(255, 117, 143, 0.2);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 1.5rem;
}

.profile-stack {
    position: relative;
}

.avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.google-badge-mini {
    position: absolute;
    bottom: -2px;
    right: -6px;
    width: 26px;
    height: 26px;
    background: #ffffff;
    border-radius: 50%;
    padding: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 0 0 2px #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.google-badge-mini svg {
    width: 100%;
    height: 100%;
    fill: #4285F4;
    transition: transform 0.2s ease;
}

.review-card:hover .google-badge-mini svg {
    transform: scale(1.1);
}

.google-icon-header {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.meta-info {
    display: flex;
    flex-direction: column;
}

.author {
    font-size: 1.1rem;
    font-weight: 600;
    color: #222;
    margin: 0;
    line-height: 1.2;
}

.stars {
    display: flex;
    gap: 3px;
    font-size: 0.9rem;
    margin-top: 4px;
}

.stars span {
    color: #eee;
}

.stars span.filled {
    color: #FFC107;
    text-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
}

.card-content p {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #555;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    margin-top: 2rem;
    padding-top: 1.2rem;
    border-top: 1px dashed #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.date {
    font-size: 0.8rem;
    color: #aaa;
    font-weight: 500;
}

.btn-view-google {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-title);
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--c-secondary);
    padding: 6px 12px;
    border-radius: 12px;
    transition: all 0.2s;
}

.btn-view-google:hover {
    background: rgba(76, 201, 240, 0.1);
    transform: translateX(3px);
}

.btn-view-google svg {
    width: 14px;
    height: 14px;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-primary);
    cursor: pointer;
    z-index: 30;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-btn:hover {
    background: #fff;
    color: var(--c-primary);
    transform: translateY(-50%) scale(1.15);
    box-shadow: 0 15px 40px rgba(255, 117, 143, 0.3);
}

.custom-prev {
    left: 5%;
}

.custom-next {
    right: 5%;
}

.cta-container {
    margin-top: 2rem;
}

.cta-button {
    background: var(--c-primary);
    color: white;
    padding: 16px 36px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 10px 25px rgba(255, 117, 143, 0.4);
    transition: all 0.3s ease;
    display: inline-block;
}

.cta-button:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(255, 117, 143, 0.5);
}

@media (max-width: 1024px) {
    .reviews-section {
        --card-width: 320px;
    }
}

@media (max-width: 768px) {
    .reviews-section {
        padding: 3rem 1rem;
        --card-width: 300px;
    }

    .section-title {
        font-size: 2rem;
    }

    .nav-btn,
    .fade-mask {
        display: none;
    }

    .swiper-slide {
        opacity: 1 !important;
        transform: scale(0.95);
    }

    .swiper-slide-active {
        transform: scale(1);
    }

    .swiper-slide-prev,
    .swiper-slide-next {
        opacity: 0.6 !important;
        filter: none;
    }
}
</style>