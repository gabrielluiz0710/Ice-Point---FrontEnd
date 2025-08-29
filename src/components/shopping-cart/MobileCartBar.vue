<script setup lang="ts">
import { ref, TransitionGroup, Transition } from 'vue'

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

const isExpanded = ref(false)
</script>

<template>
    <div class="mobile-cart-bar" :class="{ 'visible': cartItems.length > 0, 'expanded': isExpanded }">
        <button class="central-toggle-button" aria-label="Ver carrinho" @click="isExpanded = !isExpanded">
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
        </button>

        <div class="bar-content">
            <div class="collapsed-view">
                <div class="total-info">
                    <div class="price-details">
                        <span class="item-count">{{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'itens'
                            }}</span>
                        <span class="total-price">R$ {{ total.toFixed(2) }}</span>
                    </div>
                    <button class="toggle-button" aria-label="Ver carrinho" @click="isExpanded = !isExpanded">
                        Ver Carrinho
                        <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24">
                            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        </svg>
                    </button>
                </div>

                <div class="collapsed-actions">
                    <Transition name="fade-button">
                        <button v-if="!isExpanded" class="action-button" aria-label="Finalizar Compra">
                            Finalizar Compra
                        </button>
                    </Transition>
                </div>
            </div>

            <div class="expanded-view">
                <h4 class="expanded-title">Seu Pedido</h4>
                <TransitionGroup name="list" tag="ul" class="summary-list">
                    <li v-for="item in cartItems" :key="item.id" class="summary-item">
                        <div class="item-info-left">
                            <span class="item-name">{{ item.name }}</span>
                            <span class="item-details">{{ item.quantity }}x</span>
                        </div>
                        <span class="item-total">R$ {{ (item.quantity * item.price).toFixed(2) }}</span>
                    </li>
                </TransitionGroup>
                <button class="checkout-button">Finalizar Compra</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mobile-cart-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--c-branco);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: none;
}

@media (max-width: 1024px) {
    .mobile-cart-bar {
        display: block;
    }
}

.mobile-cart-bar.visible {
    transform: translateY(0);
}

.bar-content {
    padding: 1rem 1.5rem;
    position: relative;
}

.collapsed-view {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

/* AJUSTE: Container para o botão e as informações de preço */
.total-info {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.price-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.item-count {
    font-size: 0.85rem;
    color: var(--c-text-light);
    line-height: 1;
}

.total-price {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--c-azul);
    line-height: 1.2;
}

.collapsed-actions {
    display: flex;
}

.toggle-button {
    background: var(--c-azul);
    color: var(--c-branco);
    border: none;
    padding: 0.8rem 1.2rem;
    border-radius: 50px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.toggle-button:hover {
    background-color: var(--c-azul-dark-footer);
}

.action-button {
    background: var(--c-rosa);
    color: var(--c-branco);
    border: none;
    padding: 1.1rem 1.2rem;
    border-radius: 50px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.3s ease;
}

.action-button:hover {
    background-color: var(--c-rosa-dark);
}

/* NOVO: Botão centralizado para telas pequenas */
.central-toggle-button {
    display: none;
    /* Escondido por padrão */
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 38px;
    height: 38px;
    background-color: var(--c-azul);
    color: var(--c-branco);
    border-radius: 50%;
    border: 4px solid var(--c-branco);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.central-toggle-button:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background-color: var(--c-azul-dark-footer);
}

.arrow-icon {
    fill: currentColor;
    transition: transform 0.3s ease;
}

.mobile-cart-bar.expanded .arrow-icon {
    transform: rotate(180deg);
}

.fade-button-enter-active,
.fade-button-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-button-enter-from,
.fade-button-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* Visão expandida (sem alterações) */
.expanded-view {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-in-out, margin-top 0.5s ease-in-out;
}

.mobile-cart-bar.expanded .expanded-view {
    max-height: 50vh;
    margin-top: 1.5rem;
}

.expanded-title {
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 1rem;
    font-weight: 500;
}

.summary-list {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 1.5rem;
    max-height: 35vh;
    overflow-y: auto;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--c-bege);
}

.item-info-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.item-name {
    font-weight: 500;
    color: var(--c-text-dark);
}

.item-details {
    color: var(--c-text-light);
    font-size: 0.9rem;
}

.item-total {
    font-weight: 700;
    color: var(--c-azul);
    white-space: nowrap;
}

.checkout-button {
    width: 100%;
    background: linear-gradient(45deg, var(--c-rosa), var(--c-rosa-dark));
    color: var(--c-branco);
    border: none;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 12px;
    cursor: pointer;
    margin-top: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.checkout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* NOVO: Media Query para telas bem pequenas */
@media (max-width: 480px) {
    .toggle-button {
        display: none;
        /* Esconde o botão "Ver Carrinho" original */
    }

    .central-toggle-button {
        display: flex;
        /* Mostra o botão central */
    }

    .collapsed-view {
        justify-content: space-between;
        margin-top: 10px;
        /* Mantém o espaçamento para o que sobrar */
    }

    .price-details {
        text-align: left;
        /* Garante alinhamento caso o layout mude */
    }
}
</style>