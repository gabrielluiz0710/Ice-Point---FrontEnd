<script setup lang="ts">
import { ref } from 'vue'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import { faChevronUp, faChevronDown, faFileInvoiceDollar, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AdminCheckoutSummary from './AdminCheckoutSummary.vue'

defineProps<{
    disabled?: boolean
}>()

const emit = defineEmits(['checkout'])
const checkoutStore = useAdminCheckoutStore()
const isOpen = ref(false)

const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
</script>

<template>
    <div class="admin-mobile-checkout">
        <button class="summary-toggle" @click="isOpen = !isOpen" :class="{ open: isOpen }">
            <div class="toggle-left">
                <FontAwesomeIcon :icon="faFileInvoiceDollar" />
                <span>{{ isOpen ? 'Ocultar Resumo' : 'Ver Resumo' }}</span>
            </div>
            <div class="toggle-right">
                <span class="total-preview">{{ formatMoney(checkoutStore.grandTotal) }}</span>
                <FontAwesomeIcon :icon="isOpen ? faChevronDown : faChevronUp" />
            </div>
        </button>

        <Transition name="expand">
            <div v-if="isOpen" class="summary-content">
                <AdminCheckoutSummary />
            </div>
        </Transition>

        <div class="action-area">
            <button class="btn-action" @click="$emit('checkout')" :disabled="disabled">
                Continuar
            </button>
        </div>
    </div>
</template>

<style scoped>
.admin-mobile-checkout {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

@media (min-width: 1025px) {
    .admin-mobile-checkout {
        display: none;
    }
}

.summary-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: #f8f9fa;
    border: none;
    border-bottom: 1px solid #eee;
    width: 100%;
    cursor: pointer;
    font-family: 'Fredoka', sans-serif;
    color: var(--c-azul);
    font-weight: 600;
    font-size: 0.95rem;
}

.toggle-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggle-right {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.total-preview {
    color: var(--c-text-dark);
    font-weight: 800;
}

.summary-content {
    max-height: 60vh;
    overflow-y: auto;
    background: #fff;
}

.summary-content :deep(.admin-summary-card) {
    border: none;
    box-shadow: none;
    height: auto;
    position: static;
    padding: 1rem;
}

.action-area {
    padding: 1rem;
    background: #fff;
    border-top: 1px solid #f0f0f0;
}

.btn-action {
    width: 100%;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-dark));
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: var(--font-title);
}

.btn-action:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.expand-enter-active,
.expand-leave-active {
    transition: max-height 0.3s ease-out, opacity 0.3s ease;
    max-height: 60vh;
    opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>