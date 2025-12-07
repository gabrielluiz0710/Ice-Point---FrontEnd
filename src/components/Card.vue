<script setup lang="ts">

interface CardItem {
    id: number;
    image: string;
    title: string;
    description: string;
    link: string;
}

defineProps<{
    item: CardItem;
}>();
</script>

<template>
    <article class="card-article">
        <div class="card-image-wrapper">
            <img :src="item.image" :alt="item.title" class="card-img" />
        </div>

        <div class="card-data">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-description">{{ item.description }}</p>
            <router-link :to="`/produtos/${item.id}`" class="card-button">Ver mais</router-link>
        </div>
    </article>
</template>

<style scoped>
.card-article {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 420px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    border-radius: 16px;
}

.card-article:hover {
    transform: translateY(-5px);
}

.card-article::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.card-article:hover::after {
    opacity: 1;
}

.card-image-wrapper {
    height: 55%;
    overflow: hidden;
}

.card-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.5s ease;
}

.card-article:hover .card-img {
    transform: scale(1.1);
}

.card-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    padding: 1rem 1.5rem;
    text-align: center;
    color: var(--c-branco);
    z-index: 2;
    border-radius: 16px;
    background-color: var(--c-rosa);
}

.card-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.card-description {
    font-family: 'Fredoka', sans-serif;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.4;
    flex-grow: 1;
}

.card-button {
    display: inline-block;
    background-color: var(--c-branco);
    color: var(--c-rosa);
    padding: 0.6rem 1.5rem;
    border-radius: 50px;
    border: 2px solid var(--c-rosa);
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    text-decoration: none;
    transition: background-color 0.3s, color 0.3s, transform 0.3s;
    align-self: center;
}

.card-button:hover {
    border-color: var(--c-branco);
    transform: scale(1.05);
}
</style>