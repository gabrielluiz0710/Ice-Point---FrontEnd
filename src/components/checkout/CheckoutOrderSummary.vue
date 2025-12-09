<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { faReceipt, faTag } from '@fortawesome/free-solid-svg-icons'

const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
</script>

<template>
    <div v-if="cartStore.cartItems && cartStore.cartItems.length > 0" class="summary-card">
        <div class="summary-header">
            <h3>
                <font-awesome-icon :icon="faReceipt" />
                Resumo do Pedido
            </h3>
        </div>

        <TransitionGroup name="list" tag="ul" class="summary-items">
            <li v-for="(item, index) in cartStore.cartItems" :key="item.id"
                :style="{ transitionDelay: `${index * 50}ms` }">
                <div class="item-info">
                    <span class="item-quantity">{{ item.quantity }}x</span>
                    <div class="text-container">
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-category" v-if="item.category">{{ item.category }}</span>
                    </div>
                </div>
                <span class="item-price">R$ {{ (item.price * item.quantity).toFixed(2).replace('.', ',') }}</span>
            </li>
        </TransitionGroup>

        <div class="summary-costs">
            <div class="summary-line">
                <span>Subtotal</span>
                <span>R$ {{ cartStore.totalCartPrice.toFixed(2).replace('.', ',') }}</span>
            </div>
            <div class="summary-line">
                <span>Frete</span>
                <span>R$ {{ checkoutStore.deliveryFee.toFixed(2).replace('.', ',') }}</span>
            </div>
            <Transition name="fade">
                <div v-if="checkoutStore.discount > 0" class="summary-line discount">
                    <span>
                        <font-awesome-icon :icon="faTag" /> Desconto
                    </span>
                    <span>- R$ {{ checkoutStore.discount.toFixed(2).replace('.', ',') }}</span>
                </div>
            </Transition>
        </div>

        <div class="summary-total">
            <span>Total</span>
            <Transition name="pop" mode="out-in">
                <span :key="checkoutStore.grandTotal" class="total-price">
                    R$ {{ checkoutStore.grandTotal.toFixed(2).replace('.', ',') }}
                </span>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
@keyframes card-enter {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.summary-card {
    background: var(--c-branco);
    border-radius: 24px;
    padding: 2rem;
    font-family: 'Fredoka', sans-serif;
    border: 1px solid var(--color-border);
    box-shadow: 0 8px 30px rgba(25, 197, 203, 0.1);
    animation: card-enter 0.5s ease-out forwards;
}

.summary-header {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--c-azul);
}

.summary-header h3 {
    font-size: 1.4rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.summary-items {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 1.5rem;
}

.summary-items li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    font-size: 0.95rem;
    border-bottom: 1px dashed var(--color-border);
}

.summary-items li:last-child {
    border-bottom: none;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.item-quantity {
    color: var(--c-rosa);
    font-weight: 500;
    font-size: 0.8rem;
    border-radius: 6px;
    padding: 0.2rem 0.5rem;
    min-width: 28px;
    text-align: center;
}

.text-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
}

.item-category {
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-top: 2px;
}

.item-name {
    color: var(--c-text);
}

.item-price {
    font-weight: 500;
    color: var(--c-text);
}

.summary-costs {
    padding: 1.5rem 0;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: var(--c-text-light);
}

.summary-line span:last-child {
    font-weight: 500;
    color: var(--c-text);
}

.summary-line.discount {
    color: #28a745;
}

.summary-line.discount span:first-child {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.summary-line.discount span:last-child {
    font-weight: 600;
    color: #28a745;
}

.summary-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 1.5rem;
    margin-top: 1rem;
    padding: 1.5rem;
    border-radius: 16px;
    color: var(--c-azul);
}

.total-price {
    font-weight: 700;
}

/* Animações da lista de itens */
.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

/* Animação para o valor total quando ele muda */
.pop-enter-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-enter-from {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
}

/* Animação para a linha de desconto aparecer/sumir */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>