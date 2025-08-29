<script setup lang="ts">
import { TransitionGroup } from 'vue'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
}

defineProps<{
    cartItems: CartItem[]
    total: number
}>()
</script>

<template>
    <div class="order-summary">
        <h3 class="summary-title">Resumo do Pedido</h3>

        <div v-if="cartItems.length === 0" class="empty-cart">
            <font-awesome-icon :icon="faShoppingCart" class="empty-cart-icon" />
            <p class="empty-cart-title">Seu carrinho está vazio</p>
            <span class="empty-cart-subtitle">Adicione produtos para vê-los aqui!</span>
        </div>

        <div v-else class="summary-content">
            <TransitionGroup name="list" tag="ul" class="summary-list">
                <li v-for="item in cartItems" :key="item.id" class="summary-item">
                    <div class="item-info">
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-details">{{ item.quantity }} x R$ {{ item.price.toFixed(2) }}</span>
                    </div>
                    <span class="item-total">R$ {{ (item.quantity * item.price).toFixed(2) }}</span>
                </li>
            </TransitionGroup>

            <div class="summary-total">
                <span>Total</span>
                <span>R$ {{ total.toFixed(2) }}</span>
            </div>

            <button class="checkout-button" :disabled="cartItems.length === 0">
                Finalizar Compra
            </button>
        </div>
    </div>
</template>

<style scoped>
.order-summary {
    background-color: var(--color-background-soft);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    border: 1px solid var(--color-border);
}

.summary-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
    padding-bottom: 0.75rem;
}

/* Linha decorativa abaixo do título */
.summary-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background-color: var(--c-rosa);
    border-radius: 2px;
}

/* Estilos para o carrinho vazio */
.empty-cart {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--c-text-light);
}

.empty-cart-icon {
    font-size: 3rem;
    color: var(--c-rosa-light);
    margin-bottom: 1rem;
}

.empty-cart-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--c-text-dark);
    margin-bottom: 0.25rem;
}

.empty-cart-subtitle {
    font-size: 0.9rem;
}

.summary-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
}

/* NOVO: Layout com Flexbox para os itens */
.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
}

.summary-item:last-child {
    border-bottom: none;
}

.item-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.item-name {
    font-weight: 500;
    color: var(--c-text-dark);
    font-size: 1rem;
}

.item-details {
    color: var(--c-text-light);
    font-size: 0.85rem;
}

.item-total {
    font-weight: 700;
    color: var(--c-azul);
    font-size: 1rem;
    white-space: nowrap;
}

.summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--c-azul);
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 2px solid var(--c-rosa-light);
}

.checkout-button {
    width: 100%;
    background: linear-gradient(45deg, var(--c-rosa), var(--c-rosa-dark));
    color: var(--c-branco);
    border: none;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    border-radius: 12px;
    cursor: pointer;
    margin-top: 2rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(218, 96, 118, 0.3);
}

.checkout-button:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(218, 96, 118, 0.4);
}

/* NOVO: Estilo para botão desabilitado */
.checkout-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none;
}

/* Animação da lista */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>