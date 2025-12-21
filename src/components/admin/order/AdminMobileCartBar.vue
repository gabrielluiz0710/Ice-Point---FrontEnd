<script setup lang="ts">
import { ref } from 'vue'
import { faChevronUp, faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { DBProduct } from '@/stores/adminCart'

defineProps<{
    cartItems: DBProduct[]
    total: number
}>()

const emit = defineEmits(['empty-cart', 'checkout'])

const isExpanded = ref(false)

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
</script>

<template>
    <div class="admin-mobile-bar" :class="{ expanded: isExpanded }">
        <div class="bar-header" @click="isExpanded = !isExpanded">
            <div class="info">
                <span class="label">Total:</span>
                <span class="value">{{ formatCurrency(total) }}</span>
                <span class="count">({{ cartItems.length }} itens)</span>

            </div>

            <div class="controls">
                <button class="toggle-btn">
                    <FontAwesomeIcon :icon="isExpanded ? faChevronDown : faChevronUp" />
                </button>
            </div>
        </div>

        <div class="bar-body" v-if="isExpanded">
            <div v-if="cartItems.length > 0" class="header">
                <button @click="$emit('empty-cart')" class="btn-clean">
                    <FontAwesomeIcon :icon="faTrash" /> Limpar
                </button>
            </div>
            <ul v-if="cartItems.length > 0" class="mini-list custom-scrollbar">
                <li v-for="item in cartItems" :key="item.id">
                    <span>{{ item.quantity }}x {{ item.nome }}</span>
                    <span>{{ formatCurrency(item.quantity * item.preco_unitario) }}</span>
                </li>
            </ul>
        </div>

        <div class="bar-action">
            <button @click.stop="$emit('checkout')" :disabled="cartItems.length === 0" class="btn-checkout">
                Avançar
            </button>
        </div>
    </div>
</template>

<style scoped>
.admin-mobile-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #ccc;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: flex;
    flex-direction: column;
}

@media (min-width: 1025px) {
    .admin-mobile-bar {
        display: none;
    }
}

.bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    background: #f8f9fa;
    cursor: pointer;
}

.info {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.value {
    font-weight: 800;
    color: var(--c-azul);
    font-size: 1.2rem;
}

.count {
    font-size: 0.8rem;
    color: #777;
}

.toggle-btn {
    background: none;
    border: none;
    color: #777;
}

.bar-body {
    max-height: 40vh;
    overflow-y: auto;
    background: #fff;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
}

.mini-list {
    list-style: none;
    padding: 1rem;
    margin: 0;
}

.mini-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
}

.bar-action {
    padding: 1rem;
    background: #fff;
}

.btn-checkout {
    font-family: var(--font-title);
    width: 100%;
    padding: 0.8rem;
    background: var(--c-azul);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 700;
    font-size: 1rem;
}

.btn-checkout:disabled {
    background: #ccc;
}


.header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
    padding: 1rem;
}

.btn-clean {
    font-family: var(--font-title);
    background: none;
    border: none;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.btn-clean:hover {
    text-decoration: underline;
}
</style>