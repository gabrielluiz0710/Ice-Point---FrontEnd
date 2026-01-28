<script setup lang="ts">
import { ref, computed } from 'vue'
import { faChevronUp, faChevronDown, faTrash, faShoppingBag, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { DBProduct } from '@/stores/adminCart'

const props = defineProps<{
    cartItems: DBProduct[]
    total: number
}>()

const emit = defineEmits(['empty-cart', 'checkout'])

const isExpanded = ref(false)

const totalQuantity = computed(() => {
    return props.cartItems.reduce((acc, item) => acc + item.quantity, 0)
})

const groupedItems = computed(() => {
    const groups: Record<string, { name: string; quantity: number; items: DBProduct[] }> = {}

    props.cartItems.forEach(item => {
        const catName = item.categoria?.nome || 'Outros'
        if (!groups[catName]) {
            groups[catName] = { name: catName, quantity: 0, items: [] }
        }
        groups[catName].items.push(item)
        groups[catName].quantity += item.quantity
    })
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
})

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
</script>

<template>
    <div class="backdrop" v-if="isExpanded" @click="isExpanded = false"></div>

    <div class="admin-mobile-bar" :class="{ expanded: isExpanded }">
        <div class="bar-header" @click="isExpanded = !isExpanded">
            <div class="drawer-handle"></div>

            <div class="header-content">
                <div class="cart-icon-wrapper">
                    <div class="badge" v-if="totalQuantity > 0">{{ totalQuantity }}</div>
                    <FontAwesomeIcon :icon="faShoppingBag" class="cart-icon" />
                </div>

                <div class="info">
                    <span class="label">Total do Pedido</span>
                    <span class="value">{{ formatCurrency(total) }}</span>
                </div>

                <div class="toggle-indicator">
                    <FontAwesomeIcon :icon="isExpanded ? faChevronDown : faChevronUp" />
                </div>
            </div>
        </div>

        <transition name="slide-up">
            <div class="bar-body" v-if="isExpanded">
                <div v-if="cartItems.length > 0" class="actions-row">
                    <span class="items-summary">{{ totalQuantity }} itens selecionados</span>
                    <button @click="$emit('empty-cart')" class="btn-clean">
                        <FontAwesomeIcon :icon="faTrash" /> Limpar
                    </button>
                </div>

                <div class="grouped-list custom-scrollbar">
                    <div v-for="group in groupedItems" :key="group.name" class="category-group">

                        <div class="category-header">
                            <span class="cat-title">{{ group.name }}</span>
                            <span class="cat-badge">{{ group.quantity }}</span>
                        </div>

                        <ul class="mini-list">
                            <li v-for="item in group.items" :key="item.id">
                                <div class="item-left">
                                    <span class="item-qty">{{ item.quantity }}x</span>
                                    <span class="item-name">{{ item.nome }}</span>
                                </div>
                                <span class="item-price">{{ formatCurrency(item.quantity * item.preco_unitario)
                                    }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </transition>

        <div class="bar-action">
            <button @click.stop="$emit('checkout')" :disabled="cartItems.length === 0" class="btn-checkout">
                <span>Finalizar Pedido</span>
                <FontAwesomeIcon :icon="faChevronRight" class="cart-icon" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    z-index: 99;
    animation: fade-in 0.3s ease;
}

.admin-mobile-bar {
    /* MUDANÇA: 'Fixed' é mais seguro para garantir que fique visível no mobile */
    /* Sticky as vezes falha com o teclado virtual ou barra de endereço */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    z-index: 999;
    background: #fff;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* MUDANÇA IMPORTANTE: Respeita a área segura do iPhone (Notch/Home Indicator) */
    padding-bottom: env(safe-area-inset-bottom);
}

@media (min-width: 769px) {
    .admin-mobile-bar {
        bottom: -2rem;
        margin-left: -2rem;
        margin-right: -2rem;
        margin-bottom: -2rem;
    }
}

@media (max-width: 768px) {
    .admin-mobile-bar {
        position: fixed;
        /* Força ficar na tela independente do scroll */
        width: 100%;
        margin: 0;
        /* Zera as margens negativas antigas */
        bottom: 0;
        left: 0;
    }
}

@media (min-width: 1101px) {
    .admin-mobile-bar {
        display: none;
    }

    .backdrop {
        display: none;
    }
}

.bar-header {
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    background: white;
    border-radius: 20px 20px 0 0;
    position: relative;
    border-bottom: 1px solid transparent;
    transition: border 0.3s;
}

.expanded .bar-header {
    border-bottom: 1px solid #f0f0f0;
}

.drawer-handle {
    width: 40px;
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
    margin: 0 auto 10px auto;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.cart-icon-wrapper {
    position: relative;
    color: var(--c-azul);
    font-size: 1.2rem;
    margin-right: 1rem;
}

.badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--c-rosa);
    color: white;
    font-size: 0.7rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 2px solid white;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    font-weight: 700;
}

.value {
    font-weight: 800;
    color: #333;
    font-size: 1.1rem;
}

.toggle-indicator {
    color: #ccc;
    font-size: 0.9rem;
    padding: 5px;
}

.bar-body {
    max-height: 50vh;
    overflow-y: auto;
    background: #fafafa;
    overscroll-behavior: contain;
}

.actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
}

.items-summary {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
}

.btn-clean {
    font-family: var(--font-title);
    background: none;
    border: none;
    color: #ff6b6b;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.grouped-list {
    padding: 1rem 1.5rem;
}

.category-group {
    margin-bottom: 1.2rem;
}

.category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.cat-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.5px;
}

.cat-badge {
    background: #e0e0e0;
    color: #555;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
}

.mini-list {
    list-style: none;
    padding: 0;
    margin: 0;
    background: white;
    border-radius: 8px;
    border: 1px solid #eee;
    overflow: hidden;
}

.mini-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem;
    border-bottom: 1px solid #f5f5f5;
    font-size: 0.9rem;
}

.mini-list li:last-child {
    border-bottom: none;
}

.item-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.item-qty {
    background: var(--c-cinza-light);
    color: var(--c-text);
    font-weight: 700;
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
}

.item-name {
    color: #444;
    font-weight: 500;
}

.item-price {
    font-weight: 600;
    color: #333;
}

.bar-action {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    background: #fff;
    border-top: 1px solid #eee;
}

.btn-checkout {
    font-family: var(--font-title);
    width: 100%;
    padding: 1rem;
    background: var(--c-azul);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(var(--c-azul-rgb), 0.3);
    transition: transform 0.2s, background 0.2s;
}

.btn-checkout:active {
    transform: scale(0.98);
}

.btn-checkout:disabled {
    background: #ccc;
    box-shadow: none;
    cursor: not-allowed;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    max-height: 50vh;
    opacity: 1;
}

.slide-up-enter-from,
.slide-up-leave-to {
    max-height: 0;
    opacity: 0;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>