<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore, type DBProduct } from '@/stores/cart';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faInfoCircle, faIceCream } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'vue-router';

const props = defineProps<{
    product: DBProduct
}>()

const MAX_INDIVIDUAL_QUANTITY = 2000;
const MAX_GLOBAL_QUANTITY = 2000;

const cartStore = useCartStore();
const router = useRouter();

const emit = defineEmits(['update:quantity', 'limit-exceeded'])

const inputWidth = computed(() => {
    const charCount = String(props.product.quantity).length || 1;
    return `${charCount + 1.5}ch`;
});

function goToDetails() {
    router.push(`/produtos/${props.product.id}`);
}

function increment() {
    if (props.product.quantity >= MAX_INDIVIDUAL_QUANTITY || cartStore.totalCartQuantity >= MAX_GLOBAL_QUANTITY) {
        emit('limit-exceeded');
        return;
    }
    const newQuantity = props.product.quantity + 1;
    emit('update:quantity', { productId: props.product.id, newQuantity });
}

function decrement() {
    const newQuantity = Math.max(0, props.product.quantity - 1);
    emit('update:quantity', { productId: props.product.id, newQuantity });
}

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const sanitizedValue = target.value.replace(/\D/g, '');
    let numericValue = sanitizedValue === '' ? 0 : parseInt(sanitizedValue, 10);

    const potentialTotal = (cartStore.totalCartQuantity - props.product.quantity) + numericValue;

    if (numericValue > MAX_INDIVIDUAL_QUANTITY || potentialTotal > MAX_GLOBAL_QUANTITY) {
        emit('limit-exceeded');
        const maxAllowedToAdd = MAX_GLOBAL_QUANTITY - (cartStore.totalCartQuantity - props.product.quantity);
        numericValue = Math.min(numericValue, MAX_INDIVIDUAL_QUANTITY, maxAllowedToAdd);
    }

    target.value = String(numericValue);
    emit('update:quantity', { productId: props.product.id, newQuantity: numericValue });
}

const displayPrice = computed(() => Number(props.product.preco_unitario));

const displayImage = computed(() => props.product.imagemCapa || 'URL_DO_SEU_PLACEHOLDER_DE_ICONE');
</script>

<template>
    <div class="product-card" :class="{ 'in-cart': product.quantity > 0 }">
        <div class="card-image-container">
            <div v-if="displayImage === 'URL_DO_SEU_PLACEHOLDER_DE_ICONE'" class="product-icon-fallback">
                <font-awesome-icon :icon="faIceCream" class="fallback-icon" />
            </div>

            <img v-else :src="displayImage" :alt="product.nome" class="product-image" loading="lazy" />

            <div class="info-control" @click.stop="goToDetails" title="Ver detalhes e informações nutricionais">
                <font-awesome-icon :icon="faInfoCircle" />
            </div>
        </div>
        <div class="card-content">
            <div class="header-group">
                <h3 class="product-name">{{ product.nome }}</h3>
                <span class="product-category-label">{{ product.categoria?.nome }}</span>
            </div>

            <p class="product-description">{{ product.descricao }}</p>

            <div class="card-footer">
                <span class="product-price">R$ {{ displayPrice.toFixed(2) }}</span>
                <div class="quantity-control">
                    <button @click="decrement" class="quantity-btn" aria-label="Diminuir quantidade">-</button>
                    <input type="text" class="quantity-input" :value="product.quantity" @input="handleInput" min="0"
                        inputmode="numeric" pattern="[0-9]*" :style="{ width: inputWidth }" />
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
    height: 100%;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.product-card.in-cart {
    border: 2px solid;
    border-color: var(--c-rosa);
    box-shadow: 0 6px 14px rgba(254, 117, 143, 0.2);
}

.card-image-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;
}

.info-control {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.product-card:hover .info-control {
    opacity: 1;
    visibility: visible;
}

.info-control:hover {
    background-color: var(--c-azul);
}

.product-icon-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
}

.product-icon-fallback .fallback-icon {
    font-size: 4rem;
    color: var(--c-rosa);
    opacity: 0.5;
}

.product-card:hover .product-icon-fallback {
    transform: scale(1.05);
    transition: transform 0.4s ease;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.header-group {
    margin-bottom: 0.5rem;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 0.1rem;
    line-height: 1.2;
}

.product-category-label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: block;
}

.product-description {
    font-size: 0.85rem;
    color: var(--c-text);
    line-height: 1.4;
    margin-bottom: 0.8rem;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.product-price {
    font-size: 1.1rem;
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
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background-color 0.2s ease, transform 0.2s ease;
    padding-bottom: 3px;
}

.quantity-btn:hover {
    background-color: var(--c-rosa-dark);
    transform: scale(1.1);
}

.quantity-input {
    min-width: 30px;
    max-width: 60px;
    text-align: center;
    border: none;
    background: transparent;
    font-size: 1rem;
    font-weight: 700;
    color: var(--c-text-dark);
    -moz-appearance: textfield;
    appearance: textfield;
    background-color: rgb(240, 240, 240);
    border-radius: 5px;
    padding: 6px 6px;
    margin-left: 4px;
    margin-right: 4px;
    font-family: 'Fredoka', sans-serif;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

@media (max-width: 768px) {
    .card-image-container {
        height: 150px;
    }

    .card-content {
        padding: 0.8rem;
    }

    .product-name {
        font-size: 1.1rem;
    }

    .product-category-label {
        font-size: 0.7rem;
    }

    .product-description {
        font-size: 0.8rem;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        margin-bottom: 0.7rem;
    }

    .product-price {
        font-size: 1.3rem;
    }

    .quantity-btn {
        width: 30px;
        height: 30px;
        font-size: 1rem;
    }

    .quantity-input {
        font-size: 1.1rem;
        padding: 8px 6px;
    }
}
</style>