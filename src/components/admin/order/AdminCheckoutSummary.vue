<script setup lang="ts">
import { useAdminCartStore } from '@/stores/adminCart'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import { faReceipt, faTag, faTruck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const cartStore = useAdminCartStore()
const checkoutStore = useAdminCheckoutStore()

const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
</script>

<template>
    <div class="admin-summary-card">
        <div class="summary-header">
            <h3>
                <FontAwesomeIcon :icon="faReceipt" />
                Resumo Financeiro
            </h3>
        </div>

        <div class="items-scroll custom-scrollbar">
            <ul class="summary-items">
                <li v-for="item in cartStore.cartItems" :key="item.id">
                    <div class="item-info">
                        <span class="qty">{{ item.quantity }}x</span>
                        <div class="name-box">
                            <span class="name">{{ item.nome }}</span>
                            <small class="cat">{{ item.categoria?.nome }}</small>
                        </div>
                    </div>
                    <span class="price">{{ formatMoney(item.preco_unitario * item.quantity) }}</span>
                </li>
            </ul>
        </div>

        <div class="summary-costs">
            <div class="cost-line">
                <span>Subtotal</span>
                <span>{{ formatMoney(cartStore.totalCartPrice) }}</span>
            </div>

            <div class="cost-line">
                <span>
                    <FontAwesomeIcon :icon="faTruck" class="icon-sm" /> Frete
                </span>
                <span :class="{ 'free': checkoutStore.shippingFee === 0 }">
                    {{ checkoutStore.shippingFee > 0 ? formatMoney(checkoutStore.shippingFee) : 'A calcular' }}
                </span>
            </div>

            <div class="cost-line discount" v-if="checkoutStore.discount > 0">
                <span>
                    <FontAwesomeIcon :icon="faTag" class="icon-sm" /> Desconto
                </span>
                <span>- {{ formatMoney(checkoutStore.discount) }}</span>
            </div>
        </div>

        <div class="summary-total">
            <span>Total Final</span>
            <span class="total-value">{{ formatMoney(checkoutStore.grandTotal) }}</span>
        </div>
    </div>
</template>

<style scoped>
.admin-summary-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    /* Ajuste conforme altura do header */
    position: sticky;
    top: 1rem;
}

.summary-header {
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.summary-header h3 {
    font-size: 1.1rem;
    color: var(--c-azul);
    margin: 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.items-scroll {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding-right: 0.5rem;
}

.summary-items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.summary-items li {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.8rem 0;
    border-bottom: 1px dashed #eee;
    font-size: 0.9rem;
}

.item-info {
    display: flex;
    gap: 0.6rem;
}

.qty {
    background: #f0f7ff;
    color: var(--c-azul);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.8rem;
    height: fit-content;
}

.name-box {
    display: flex;
    flex-direction: column;
}

.name {
    color: var(--c-text-dark);
    font-weight: 500;
    line-height: 1.2;
}

.cat {
    font-size: 0.75rem;
    color: #999;
}

.price {
    font-weight: 600;
    color: #555;
    white-space: nowrap;
}

.summary-costs {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.cost-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: #666;
}

.cost-line.discount {
    color: #16a34a;
    font-weight: 600;
}

.free {
    color: #999;
    font-style: italic;
    font-size: 0.85rem;
}

.icon-sm {
    font-size: 0.85rem;
    opacity: 0.7;
}

.summary-total {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--c-azul);
    padding-top: 1rem;
    border-top: 2px solid #f0f0f0;
}
</style>