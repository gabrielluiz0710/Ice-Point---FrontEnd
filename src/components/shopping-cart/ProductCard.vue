<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore, type CartItem, type DBProduct } from '@/stores/cart';
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
            <h3 class="product-name">{{ product.nome }}</h3>
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
    position: relative;
}

.info-control {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
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
}

.product-card:hover .info-control {
    opacity: 1;
    visibility: visible;
}

.info-control:hover {
    background-color: var(--c-azul);
    box-shadow: 0 0 10px var(--c-azul-dark);
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
    font-size: 5rem;
    color: var(--c-rosa);
    opacity: 0.5;
    max-width: 80%;
    max-height: 80%;
}

.product-card:hover .product-icon-fallback {
    transform: scale(1.1);
    transition: transform 0.4s ease;
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
    min-width: 40px;
    max-width: 80px;
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
    transition: width 0.2s ease-in-out;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>