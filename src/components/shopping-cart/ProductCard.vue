<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    product: {
        id: number
        name: string
        description: string
        price: number
        image: string
        quantity: number
    }
}>()

const emit = defineEmits(['update:quantity'])

function increment() {
    const newQuantity = props.product.quantity + 1;
    emit('update:quantity', { productId: props.product.id, newQuantity });
}

function decrement() {
    const newQuantity = Math.max(0, props.product.quantity - 1);
    emit('update:quantity', { productId: props.product.id, newQuantity });
}

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10) || 0;
    emit('update:quantity', { productId: props.product.id, newQuantity });
}

</script>

<template>
    <div class="product-card" :class="{ 'in-cart': product.quantity > 0 }">
        <div class="card-image-container">
            <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" />
        </div>
        <div class="card-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="card-footer">
                <span class="product-price">R$ {{ product.price.toFixed(2) }}</span>
                <div class="quantity-control">
                    <button @click="decrement" class="quantity-btn" aria-label="Diminuir quantidade">-</button>
                    <input type="number" class="quantity-input" :value="product.quantity" @input="handleInput" min="0"
                        inputmode="numeric" pattern="[0-9]*" />
                    <button @click="increment" class="quantity-btn" aria-label="Aumentar quantidade">+</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    background-color: var(--c-branco);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 2px solid transparent;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.product-card.in-cart {
    border: 3px solid;
    border-color: var(--c-rosa);
    box-shadow: 0 8px 16px rgba(254, 117, 143, 0.2);
}

.card-image-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.product-card:hover .product-image {
    transform: scale(1.1);
}

.card-content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.product-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 0.5rem;
}

.product-description {
    font-size: 0.9rem;
    color: var(--c-text);
    line-height: 1.5;
    margin-bottom: 1rem;
    flex-grow: 1;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.product-price {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--c-azul);
}

.quantity-control {
    display: flex;
    align-items: center;
    border-radius: 50px;
}

.quantity-btn {
    background-color: var(--c-rosa);
    color: var(--c-branco);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.quantity-btn:hover {
    background-color: var(--c-rosa-dark);
    transform: scale(1.1);
}

.quantity-input {
    width: 40px;
    text-align: center;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-text-dark);
    -moz-appearance: textfield;
    appearance: textfield;
    background-color: rgb(237, 237, 237);
    border-radius: 5px;
    padding: 5px;
    margin-left: 5px;
    margin-right: 5px;
    font-family: 'Fredoka', sans-serif;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>