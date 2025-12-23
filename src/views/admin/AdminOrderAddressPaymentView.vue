<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { faArrowLeft, faCheck, faSpinner, faCheckCircle, faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { useAdminCartStore } from '@/stores/adminCart'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import { useUserStore } from '@/stores/user'

import AdminDeliveryForm from '@/components/admin/order/AdminDeliveryForm.vue'
import AdminCheckoutSummary from '@/components/admin/order/AdminCheckoutSummary.vue'
import AdminMobileCheckoutBar from '@/components/admin/order/AdminMobileCheckoutBar.vue'

const userStore = useUserStore()
const router = useRouter()
const adminCart = useAdminCartStore()
const store = useAdminCheckoutStore()

const isSubmitting = ref(false)
const API_URL = import.meta.env.VITE_API_URL

const showSuccessModal = ref(false)
const createdOrderId = ref<number | null>(null)

onMounted(() => {
    window.scrollTo(0, 0);
    if (store.customerData.fullName === '' || adminCart.cartItems.length === 0) {
        router.replace({ name: 'admin-order-client-select' })
    }
})

const parseDateToISO = (dateStr?: string) => {
    if (!dateStr || dateStr.length < 10) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

const goToOrderDetails = () => {
    if (createdOrderId.value) {
        router.push({
            name: 'admin-encomenda-detalhe',
            params: { id: createdOrderId.value }
        })
    }
}

const handleFinish = async () => {
    if (!store.isDeliveryDataValid()) {
        alert('Verifique os dados: Endereço, Data, Seleção de Carrinhos e Pagamento são obrigatórios.')
        return
    }

    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
        const payload = {
            items: adminCart.cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
            fullName: store.customerData.fullName,
            email: store.customerData.email,
            phone: store.customerData.phone,
            cpf: store.customerData.cpf || '',
            birthDate: parseDateToISO(store.customerData.birthDate),
            dataAgendada: store.schedule.date,
            horaAgendada: store.schedule.time,
            metodoEntrega: store.deliveryMethod === 'delivery' ? 'DELIVERY' : 'PICKUP',
            metodoPagamento: store.paymentMethod.toUpperCase(),
            cartIds: store.selectedCarts.flatMap(c => c.cartIds || []),
            enderecoCep: store.address.cep,
            enderecoLogradouro: store.address.street,
            enderecoNumero: store.address.number,
            enderecoBairro: store.address.neighborhood,
            enderecoCidade: store.address.city,
            enderecoEstado: store.address.state,
            taxaEntrega: store.shippingFee,
            valorDesconto: store.discount,
        }

        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) {
            alert('Sessão expirada. Faça login novamente.')
            return
        }

        const response = await fetch(`${API_URL}/cart/admin/criar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar encomenda')
        }
        createdOrderId.value = data.orderId

        store.reset()
        adminCart.emptyCart()

        showSuccessModal.value = true

    } catch (error: any) {
        console.error('Erro ao finalizar:', error)
        alert('Erro: ' + error.message)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="admin-address-view">
        <header class="page-header">
            <button class="btn-back" @click="$router.go(-1)">
                <FontAwesomeIcon :icon="faArrowLeft" /> Voltar
            </button>
            <h1 class="title">Entrega e Valores</h1>
            <span class="subtitle">Defina endereço, agendamento, pagamento e taxas</span>
        </header>

        <div class="layout-grid">
            <div class="main-content">
                <AdminDeliveryForm />

                <div class="actions-row">
                    <button class="btn-finish" @click="handleFinish" :disabled="!store.isDeliveryDataValid()">
                        <span v-if="isSubmitting">
                            <FontAwesomeIcon :icon="faSpinner" spin /> Processando...
                        </span>
                        <span v-else>
                            <FontAwesomeIcon :icon="faCheck" /> Finalizar Pedido
                        </span>
                    </button>
                </div>
            </div>

            <aside class="sidebar">
                <AdminCheckoutSummary />
            </aside>
        </div>

        <AdminMobileCheckoutBar @checkout="handleFinish" :disabled="!store.isDeliveryDataValid()" />

        <Teleport to="body">
            <div v-if="showSuccessModal" class="modal-overlay">
                <div class="modal-card success-card">
                    <div class="success-icon">
                        <FontAwesomeIcon :icon="faCheckCircle" />
                    </div>

                    <h3>Pedido Criado!</h3>
                    <p>A encomenda <strong>#{{ createdOrderId }}</strong> foi lançada com sucesso no sistema.</p>

                    <div class="success-actions">
                        <button class="btn-secondary" @click="$router.push({ name: 'admin-encomendas' })">
                            <FontAwesomeIcon :icon="faList" /> Lista
                        </button>
                        <button class="btn-primary" @click="goToOrderDetails">
                            Ver Detalhes
                            <FontAwesomeIcon :icon="faArrowLeft" transform="rotate-180" />
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.admin-address-view {
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
    font-family: var(--font-title);
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
    grid-template-columns: 1fr 380px;
    gap: 2rem;
    align-items: start;
    margin-bottom: 2rem;
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

.btn-finish {
    background: linear-gradient(135deg, #10b981, #059669);
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
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    font-family: var(--font-title);
}

.btn-finish:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-finish:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

/* MODAL STYLES */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}

.modal-card {
    background: #fff;
    width: 90%;
    max-width: 400px;
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-card .success-icon {
    font-size: 4rem;
    color: #10b981;
    margin-bottom: 1rem;
}

.success-card h3 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.success-card p {
    color: #6b7280;
    margin-bottom: 2rem;
}

.success-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-primary,
.btn-secondary {
    font-family: var(--font-title);
    padding: 0.8rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    font-size: 0.95rem;
    transition: transform 0.2s;
}

.btn-primary {
    background: var(--c-azul);
    color: white;
}

.btn-secondary {
    background: #f3f4f6;
    color: #4b5563;
}

.btn-primary:hover,
.btn-secondary:hover {
    transform: translateY(-2px);
}

@keyframes popIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
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
}
</style>