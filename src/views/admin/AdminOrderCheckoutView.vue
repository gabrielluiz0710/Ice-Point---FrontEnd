<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { useAdminCartStore } from '@/stores/adminCart'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'

import AdminClientForm from '@/components/admin/order/AdminClientForm.vue'
import AdminCheckoutSummary from '@/components/admin/order/AdminCheckoutSummary.vue'
import AdminMobileCheckoutBar from '@/components/admin/order/AdminMobileCheckoutBar.vue'

const router = useRouter()
const adminCart = useAdminCartStore()
const adminCheckout = useAdminCheckoutStore()

onMounted(() => {
    window.scrollTo(0, 0);
    if (adminCart.totalCartQuantity === 0) {
        router.replace({ name: 'admin-criar-encomenda' })
    }
})

const handleNextStep = () => {
    if (adminCheckout.isCustomerDataValid()) {
        router.push({ name: 'admin-order-address-payment' })
    } else {
        alert('Por favor, preencha o Nome e o Telefone do cliente.')
    }
}
</script>

<template>
    <div class="admin-client-view">
        <header class="page-header">
            <button class="btn-back" @click="$router.go(-1)">
                <FontAwesomeIcon :icon="faArrowLeft" /> Voltar
            </button>
            <h1 class="title">Identificação</h1>
            <span class="subtitle">Informe os dados do cliente para prosseguir</span>
        </header>

        <div class="layout-grid">
            <div class="main-content">
                <AdminClientForm @submit="handleNextStep" />

                <div class="actions-row">
                    <button class="btn-continue" @click="handleNextStep"
                        :disabled="!adminCheckout.isCustomerDataValid()">
                        Continuar
                        <FontAwesomeIcon :icon="faArrowRight" />
                    </button>
                </div>
            </div>

            <aside class="sidebar">
                <AdminCheckoutSummary />
            </aside>
        </div>

        <AdminMobileCheckoutBar @checkout="handleNextStep" :disabled="!adminCheckout.isCustomerDataValid()" />
    </div>
</template>

<style scoped>
.admin-client-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    padding-bottom: 6rem;
    font-family: 'Fredoka', sans-serif;
    color: var(--c-text-dark);
}

.page-header {
    margin-bottom: 2rem;
}

.btn-back {
    font-family: var(--font-title);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #888;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 0.5rem;
    transition: color 0.2s;
}

.btn-back:hover {
    color: var(--c-azul);
}

.title {
    font-size: 1.8rem;
    color: var(--c-azul);
    margin-bottom: 0.2rem;
}

.subtitle {
    color: #666;
    font-size: 0.95rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2rem;
    align-items: start;
}

.sidebar {
    position: sticky;
    top: 1rem;
}

.actions-row {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
}

.btn-continue {
    font-family: var(--font-title);
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-dark));
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 15px rgba(var(--c-azul-rgb), 0.3);
}

.btn-continue:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--c-azul-rgb), 0.4);
}

.btn-continue:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

@media (max-width: 1024px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .sidebar {
        display: none;
    }

    .actions-row {
        display: none;
    }

    .admin-client-view {
        padding: 0;
        padding-bottom: 10rem;
    }
}
</style>