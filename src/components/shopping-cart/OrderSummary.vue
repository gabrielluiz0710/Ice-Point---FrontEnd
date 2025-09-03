<script setup lang="ts">
import { ref, watch, Transition, TransitionGroup } from 'vue'
import { faShoppingCart, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'

const router = useRouter()

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

const emit = defineEmits(['empty-cart'])
const showConfirmation = ref(false)

watch(showConfirmation, (isShowing) => {
    if (isShowing) {
        document.body.classList.add('modal-open')
    } else {
        document.body.classList.remove('modal-open')
    }
})

function confirmEmptyCart() {
    emit('empty-cart')
    showConfirmation.value = false
}

function goToCheckout() {
    router.push('/checkout')
}
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
            <button class="empty-cart-button" @click="showConfirmation = true">
                <font-awesome-icon :icon="faTrashCan" />
                Esvaziar carrinho
            </button>
            <div class="summary-body">
                <TransitionGroup name="list" tag="ul" class="summary-list">
                    <li v-for="item in cartItems" :key="item.id" class="summary-item">
                        <div class="item-info">
                            <span class="item-name">{{ item.name }}</span>
                            <span class="item-details">{{ item.quantity }} x R$ {{ item.price.toFixed(2) }}</span>
                        </div>
                        <span class="item-total">R$ {{ (item.quantity * item.price).toFixed(2) }}</span>
                    </li>
                </TransitionGroup>
            </div>

            <div class="summary-total">
                <span>Total</span>
                <span>R$ {{ total.toFixed(2) }}</span>
            </div>

            <div class="summary-footer">
                <button class="checkout-button" :disabled="cartItems.length === 0" @click="goToCheckout">
                    Finalizar Compra
                </button>
            </div>
        </div>
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="showConfirmation" class="confirmation-modal">
                    <div class="confirmation-box">
                        <h4>Tem certeza?</h4>
                        <p>Todos os itens do seu carrinho serão removidos.</p>
                        <div class="confirmation-actions">
                            <button class="btn-cancel" @click="showConfirmation = false">Cancelar</button>
                            <button class="btn-confirm" @click="confirmEmptyCart">Sim, esvaziar</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.order-summary {
    display: flex;
    flex-direction: column;
    background-color: var(--c-branco);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
    border: 1px solid var(--color-border);
    position: relative;

    max-height: calc(100vh - 4rem);
    overflow: hidden;
    box-sizing: border-box;
}

.summary-body {
    overflow: auto;
    flex: 1 1 auto;
    min-height: 0;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
}

.summary-body {
    scrollbar-width: thin;
    scrollbar-color: var(--c-rosa) rgba(0, 0, 0, 0.04);
}

.summary-body::-webkit-scrollbar {
    width: 3px;
    =height: 3px;
}

.summary-body::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 999px;
    margin: 4px 0;
}

.summary-body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--c-rosa), var(--c-rosa-dark));
    border-radius: 999px;
    min-height: 24px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: filter .15s ease, transform .12s ease;
}

.summary-body::-webkit-scrollbar-thumb:hover {
    filter: brightness(0.92);
    transform: scaleX(1.02);
}

.summary-body::-webkit-scrollbar-corner {
    background: transparent;
}

.summary-footer {
    flex: 0 0 auto;
    margin-top: 1rem;
    background: transparent;
    z-index: 1;
}


.summary-footer .checkout-button {
    width: 100%;
}

.summary-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}


.summary-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 1rem;
    text-align: center;
    position: relative;
    padding-bottom: 0.75rem;
}

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

.empty-cart {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--c-text-light);
}

.empty-cart-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--c-text-light);
    font-family: 'Fredoka', sans-serif;
    font-size: 0.85rem;
    cursor: pointer;
    margin: 0 auto 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.empty-cart-button:hover {
    color: #e53e3e;
    background-color: rgba(229, 62, 62, 0.1);
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

.checkout-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.confirmation-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: 'Fredoka', sans-serif;
}

.confirmation-box {
    background: var(--c-branco);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    text-align: center;
    width: 90%;
    max-width: 350px;
}

.confirmation-box h4 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-bottom: 0.5rem;
}

.confirmation-box p {
    font-size: 0.9rem;
    color: var(--c-text);
    margin-bottom: 1.5rem;
}

.confirmation-actions {
    display: flex;
    gap: 0.75rem;
}

.confirmation-actions button {
    flex: 1;
    padding: 0.75rem;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel {
    background-color: #eee;
    color: var(--c-text);
}

.btn-cancel:hover {
    background-color: #ddd;
}

.btn-confirm {
    background-color: #e53e3e;
    color: var(--c-branco);
}

.btn-confirm:hover {
    background-color: #c53030;
    transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>