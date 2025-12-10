<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { faEye, faHistory } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'
import { supabase } from '@/service/supabase'

interface BackendOrder {
    id: number
    nome: string
    status: string
    dataCriacao: string
    dataAgendada: string
    total: string
}

interface ApiResponse {
    ativos: BackendOrder[]
    historico: BackendOrder[]
}

interface FormattedOrder {
    id: string
    date: string
    status: string
    total: number
}

const isLoading = ref(true)
const showHistory = ref(false)
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const activeOrders = ref<FormattedOrder[]>([])
const completedOrders = ref<FormattedOrder[]>([])

const formatDate = (dateString: string) => {
    if (!dateString) return '--/--/----'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR').format(date)
}

const fetchMyOrders = async () => {
    isLoading.value = true
    activeOrders.value = []
    completedOrders.value = []

    try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            router.push('/login')
            return
        }

        const response = await fetch(`${API_URL}/encomendas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        })

        if (!response.ok) throw new Error('Erro ao buscar pedidos')

        const data: ApiResponse = await response.json()

        activeOrders.value = data.ativos.map(order => ({
            id: String(order.id),
            date: formatDate(order.dataCriacao),
            status: formatStatusText(order.status),
            total: Number(order.total)
        }))

        completedOrders.value = data.historico.map(order => ({
            id: String(order.id),
            date: formatDate(order.dataCriacao),
            status: formatStatusText(order.status),
            total: Number(order.total)
        }))

    } catch (error) {
        console.error("Falha ao carregar pedidos:", error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchMyOrders()
})

const formatStatusText = (status: string) => {
    const map: Record<string, string> = {
        'PENDENTE': 'Pendente',
        'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
        'PAGO': 'Pago',
        'CONFIRMADO': 'Confirmado',
        'EM_PREPARACAO': 'Em Preparação',
        'SAIU_PARA_ENTREGA': 'Saiu para Entrega',
        'ENTREGUE': 'Entregue',
        'CANCELADO': 'Cancelado'
    }
    return map[status] || status
}

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Aguardando Pagamento':
            return 'status-warning';

        case 'Pago':
        case 'Confirmado':
            return 'status-info';

        case 'Em Preparação':
            return 'status-working';

        case 'Saiu para Entrega':
            return 'status-shipping';

        case 'Entregue':
            return 'status-success';

        case 'Cancelado':
            return 'status-danger';

        case 'Pendente':
        default:
            return 'status-neutral';
    }
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
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.5rem;
    display: inline-block;
    letter-spacing: 0.02em;
}

.status-neutral {
    background-color: #e9ecef;
    color: #495057;
    border: 1px solid #dee2e6;
}

.status-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
}

.status-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.status-working {
    background-color: #fff9c4;
    color: #f57f17;
    border: 1px solid #fff176;
}

.status-shipping {
    background-color: #e8daef;
    color: #6c3483;
    border: 1px solid #d2b4de;
}

.status-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
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