<script setup lang="ts">
import { ref, watch, TransitionGroup, Transition } from 'vue'
import { faChevronUp, faIceCream, faTrashCan } from '@fortawesome/free-solid-svg-icons'
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

const isExpanded = ref(false)

const emit = defineEmits(['empty-cart', 'checkout'])
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
    <div class="mobile-cart-bar" :class="{ 'expanded': isExpanded }">
        <button class="central-toggle-button" aria-label="Ver carrinho" @click="isExpanded = !isExpanded">
            <font-awesome-icon :icon="faChevronUp" class="arrow-icon" />
        </button>

        <div class="bar-content">
            <div class="collapsed-view" @click="isExpanded = !isExpanded">
                <div class="total-info">
                    <div class="price-details">
                        <span class="item-count">{{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'itens'
                            }}</span>
                        <span class="total-price">R$ {{ total.toFixed(2) }}</span>
                    </div>
                    <button class="toggle-button" aria-label="Ver carrinho" @click.stop> Ver Carrinho
                        <font-awesome-icon :icon="faChevronUp" class="arrow-icon" />
                    </button>
                </div>

                <div class="collapsed-actions">
                    <Transition name="fade-button">
                        <button v-if="!isExpanded" class="action-button" aria-label="Finalizar Compra"
                            :disabled="cartItems.length === 0"
                            @click.stop="$emit('checkout'); console.log('Mobile (recolhido): Finalizar Compra clicado!')">
                            Finalizar Compra
                        </button>
                    </Transition>
                </div>
            </div>

            <div class="expanded-view">
                <div class="expanded-header">
                    <h4 class="expanded-title">Seu Pedido</h4>
                    <button v-if="cartItems.length > 0" class="empty-cart-button" @click="showConfirmation = true">
                        <font-awesome-icon :icon="faTrashCan" />
                        Esvaziar
                    </button>
                </div>

                <template v-if="cartItems.length > 0">
                    <TransitionGroup name="list" tag="ul" class="summary-list">
                        <li v-for="item in cartItems" :key="item.id" class="summary-item">
                            <div class="item-info-left">
                                <span class="item-name">{{ item.name }}</span>
                                <span class="item-details">{{ item.quantity }} x R$ {{ item.price.toFixed(2) }}</span>
                            </div>
                            <span class="item-total">R$ {{ (item.quantity * item.price).toFixed(2) }}</span>
                        </li>
                    </TransitionGroup>
                </template>
                <div v-else class="empty-cart-message">
                    <font-awesome-icon :icon="faIceCream" class="empty-cart-icon" />
                    <p class="empty-cart-title">Seu carrinho está vazio</p>
                    <p class="empty-cart-subtitle">Adicione seus sabores favoritos para vê-los aqui!</p>
                </div>

                <button class="checkout-button" :disabled="cartItems.length === 0"
                    @click="$emit('checkout'); console.log('Mobile (expandido): Finalizar Compra clicado!')">
                    Finalizar Compra
                </button>
            </div>
        </div>
        <Teleport to=" body">
            <Transition name="fade">
                <div v-if="showConfirmation" class="confirmation-modal">
                    <div class="confirmation-box">
                        <h4>Esvaziar carrinho?</h4>
                        <p>Todos os itens serão removidos.</p>
                        <div class="confirmation-actions">
                            <button class="btn-cancel" @click="showConfirmation = false">Cancelar</button>
                            <button class="btn-confirm" @click="confirmEmptyCart">Sim</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
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
    z-index: 200;
    display: none;

}

@media (max-width: 1024px) {
    .mobile-cart-bar {
        display: block;
    }
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

.total-info {
    display: flex;
    align-items: center;
    gap: 1rem;
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
    padding: 0.8rem 1.2rem;
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

.action-button:disabled,
.checkout-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

.central-toggle-button {
    display: none;
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
    transition: transform 0.3s ease;
    font-size: 1em;
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

.expanded-view {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-in-out, margin-top 0.5s ease-in-out;
    display: flex;
    flex-direction: column;
}

.mobile-cart-bar.expanded .expanded-view {
    max-height: 50vh;
    margin-top: 1.5rem;
}

.expanded-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-bottom: 1rem;
}

.expanded-title {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--c-text-dark);
}

.empty-cart-button {
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: none;
    color: var(--c-text-light);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-family: 'Fredoka', sans-serif;
}

.empty-cart-button:hover {
    color: #e53e3e;
    background-color: rgba(229, 62, 62, 0.1);
}

.empty-cart-message {
    padding: 2rem 1rem;
    text-align: center;
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
    margin: 0;
    margin-bottom: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.summary-list::-webkit-scrollbar {
    width: 8px;
}

.summary-list::-webkit-scrollbar-track {
    background: var(--c-branco);
    border-radius: 4px;
}

.summary-list::-webkit-scrollbar-thumb {
    background-color: var(--c-rosa-light);
    border-radius: 4px;
    border: 2px solid var(--c-branco);
}

.summary-list::-webkit-scrollbar-thumb:hover {
    background-color: var(--c-rosa);
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--c-bege);
    margin-right: 5px;
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
    transition: all 0.2s ease;
    font-family: 'Fredoka', sans-serif;

}

.checkout-button:hover:not(:disabled) {
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

@media (max-width: 820px) {
    .toggle-button {
        display: none;
    }

    .central-toggle-button {
        display: flex;
    }

    .collapsed-view {
        justify-content: space-between;
        margin-top: 10px;
    }

    .price-details {
        text-align: left;
    }
}

.confirmation-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.confirmation-box {
    background: var(--c-branco);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    text-align: center;
    width: 80%;
    max-width: 300px;
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