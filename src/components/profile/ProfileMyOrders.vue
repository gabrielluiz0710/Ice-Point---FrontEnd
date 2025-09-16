<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { faEye, faHistory } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'

const isLoading = ref(true)
const showHistory = ref(false)
const router = useRouter()

const activeOrders = [
    { id: '987654', date: '15/09/2025', status: 'Em preparação', total: 75.50 },
    { id: '987123', date: '14/09/2025', status: 'Aguardando Pagamento', total: 42.00 },
]
const completedOrders = [
    { id: '852369', date: '01/08/2025', status: 'Concluído', total: 112.30 },
]

onMounted(() => {
    setTimeout(() => {
        isLoading.value = false
    }, 1500)
})

const getStatusClass = (status: string) => {
    if (status === 'Em preparação') return 'status-preparing';
    if (status === 'Aguardando Pagamento') return 'status-pending';
    if (status === 'Concluído') return 'status-completed';
    return '';
}
</script>

<template>
    <div class="content-wrapper">
        <div class="header-flex">
            <div>
                <h1 class="content-title">Meus Pedidos</h1>
                <p class="content-subtitle">
                    Acompanhe seus pedidos em andamento e veja seu histórico.
                </p>
            </div>
            <button class="toggle-history-btn" @click="showHistory = !showHistory">
                <font-awesome-icon :icon="faHistory" />
                <span>{{ showHistory ? 'Ver Pedidos Ativos' : 'Ver Histórico' }}</span>
            </button>
        </div>

        <div v-if="isLoading" class="orders-list">
            <div class="skeleton-order-card" v-for="i in 2" :key="i">
                <div class="skeleton-line w-60"></div>
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-line w-80"></div>
            </div>
        </div>

        <div v-else class="orders-list">
            <TransitionGroup name="list">
                <div v-if="!showHistory" v-for="order in activeOrders" :key="order.id" class="order-card">
                    <div>
                        <h3>Pedido #{{ order.id }}</h3>
                        <p>Data: {{ order.date }}</p>
                        <span class="status-badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
                    </div>
                    <div class="order-details">
                        <span>Total: <strong>R$ {{ order.total.toFixed(2).replace('.', ',') }}</strong></span>
                        <button class="details-btn" @click="router.push(`/perfil/pedidos/${order.id}`)">
                            <font-awesome-icon :icon="faEye" /> Detalhes
                        </button>
                    </div>
                </div>

                <div v-if="showHistory" v-for="order in completedOrders" :key="order.id" class="order-card">
                    <div>
                        <h3>Pedido #{{ order.id }}</h3>
                        <p>Data: {{ order.date }}</p>
                        <span class="status-badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
                    </div>
                    <div class="order-details">
                        <span>Total: <strong>R$ {{ order.total.toFixed(2).replace('.', ',') }}</strong></span>
                        <button class="details-btn" @click="router.push(`/perfil/pedidos/${order.id}`)">
                            <font-awesome-icon :icon="faEye" /> Detalhes
                        </button>
                    </div>
                </div>
            </TransitionGroup>

            <div v-if="(!showHistory && !activeOrders.length) || (showHistory && !completedOrders.length)"
                class="no-orders">
                <p>Nenhum pedido encontrado aqui.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.content-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 0.5rem;
}

.content-subtitle {
    font-size: 1rem;
    color: var(--c-text-light);
    margin-top: 0;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.header-flex {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.toggle-history-btn {
    font-family: 'Fredoka', sans-serif;
    background-color: transparent;
    border: 2px solid var(--c-azul);
    color: var(--c-azul);
    padding: 0.7rem 1.2rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggle-history-btn:hover {
    background-color: var(--c-azul);
    color: white;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.order-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.order-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.order-card h3 {
    margin: 0 0 0.5rem;
    color: var(--c-text-dark);
}

.order-card p {
    margin: 0;
    color: var(--c-text-light);
}

.order-details {
    text-align: right;
}

.order-details span {
    display: block;
    margin-bottom: 1rem;
    color: var(--c-text-dark);
}

.status-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.5rem;
    display: inline-block;
}

.status-preparing {
    background-color: #ffc107;
    color: #333;
}

.status-pending {
    background-color: #fd7e14;
    color: white;
}

.status-completed {
    background-color: #28a745;
    color: white;
}

.details-btn {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-rosa);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.details-btn:hover {
    background-color: var(--c-rosa-dark);
}

.no-orders {
    text-align: center;
    padding: 2rem;
    color: var(--c-text-light);
}

@keyframes shimmer {
    0% {
        background-position: -468px 0;
    }

    100% {
        background-position: 468px 0;
    }
}

.skeleton-order-card {
    background: #f6f7f8;
    border-radius: 12px;
    padding: 1.5rem;
}

.skeleton-line {
    height: 1rem;
    background: #e0e0e0;
    margin-bottom: 0.8rem;
    border-radius: 4px;
    background-image: linear-gradient(to right, #e0e0e0 0%, #f0f0f0 20%, #e0e0e0 40%, #e0e0e0 100%);
    background-repeat: no-repeat;
    background-size: 800px 104px;
    animation: shimmer 1.5s linear infinite;
}

.w-60 {
    width: 60%;
}

.w-40 {
    width: 40%;
}

.w-80 {
    width: 80%;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

@media (max-width: 768px) {
    .header-flex {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 20px;
    }

    .content-title,
    .content-subtitle {
        text-align: center;
    }

    .content-subtitle {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
}
</style>