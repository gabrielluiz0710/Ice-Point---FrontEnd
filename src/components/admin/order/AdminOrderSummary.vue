<script setup lang="ts">
import { computed } from 'vue'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { DBProduct } from '@/stores/adminCart'

const props = defineProps<{
    cartItems: DBProduct[]
    total: number
}>()

const emit = defineEmits(['empty-cart', 'checkout'])

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

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

</script>

<template>
    <div class="admin-summary-card">
        <div class="header">
            <h3>Resumo do Pedido</h3>
            <button v-if="cartItems.length > 0" @click="$emit('empty-cart')" class="btn-clean">
                <FontAwesomeIcon :icon="faTrash" /> Limpar
            </button>
        </div>

        <div class="content custom-scrollbar">
            <div v-if="cartItems.length === 0" class="empty-msg">
                Nenhum item selecionado.
            </div>

            <div v-else class="grouped-list">
                <div v-for="group in groupedItems" :key="group.name" class="category-group">

                    <div class="category-header">
                        <span class="cat-title">{{ group.name }}</span>
                        <span class="cat-total-badge">{{ group.quantity }}</span>
                    </div>

                    <ul class="item-list">
                        <li v-for="item in group.items" :key="item.id" class="item-row">
                            <div class="item-desc">
                                <span class="qty">{{ item.quantity }}x</span>
                                <span class="name">{{ item.nome }}</span>
                            </div>
                            <span class="price">{{ formatCurrency(item.preco_unitario * item.quantity) }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="qty-row">
                <span>Total de Picolés</span>
                <span class="qty-value">{{ totalQuantity }}</span>
            </div>
            <div class="total-row">
                <span>Total Estimado</span>
                <span class="total-value">{{ formatCurrency(total) }}</span>
            </div>

            <button class="btn-advance" :disabled="cartItems.length === 0" @click="$emit('checkout')">
                Avançar
            </button>
        </div>
    </div>
</template>

<style scoped>
.admin-summary-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: calc(100vh - 100px);
    position: sticky;
    top: 1rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
    flex-shrink: 0;
    padding-right: 1.5rem;
}

.header h3 {
    font-size: 1.1rem;
    color: var(--c-azul);
    margin: 0;
    font-weight: 700;
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

.content {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
    min-height: 50px;
}

.empty-msg {
    color: #999;
    font-style: italic;
    text-align: center;
    margin-top: 1rem;
    padding-right: 1.5rem;
}

.item-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.item-row {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0;
    border-bottom: 1px solid #f9f9f9;
    font-size: 0.95rem;
}

.item-desc {
    display: flex;
    gap: 0.5rem;
}

.qty {
    font-weight: 700;
    color: var(--c-azul);
    min-width: 30px;
}

.name {
    color: #444;
}

.price {
    font-weight: 600;
    color: #666;
}

.footer {
    border-top: 2px solid #f0f0f0;
    padding-top: 1rem;
    flex-shrink: 0;
    padding-right: 1.5rem;
}

.qty-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #888;
}

.qty-value {
    font-weight: 700;
    color: #555;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 4px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.total-value {
    font-weight: 800;
    color: var(--c-azul);
    font-size: 1.3rem;
}

.btn-advance {
    width: 100%;
    padding: 1rem;
    background: var(--c-azul);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    font-family: var(--font-title);
}

.btn-advance:hover:not(:disabled) {
    background: var(--c-azul-dark-footer);
}

.btn-advance:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #bbb;
}

.grouped-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 1rem;
    padding-right: 1.5rem;
}

.category-group {
    display: flex;
    flex-direction: column;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    margin-bottom: 0.2rem;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: 10;
    backdrop-filter: blur(2px);
}

.cat-title {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.5px;
}

.cat-total-badge {
    background: #f0f0f0;
    color: #666;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
}

.item-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.item-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px dashed #f5f5f5;
    font-size: 0.95rem;
}

.item-row:last-child {
    border-bottom: none;
}
</style>