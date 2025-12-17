<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // Usando a store existente
import {
    faBoxOpen,
    faClipboardCheck,
    faTruckFast,
    faHouseCircleCheck,
    faUserCircle,
    faLocationDot,
    faCreditCard,
    faMoneyBillWave,
    faChevronLeft,
    faSpinner,
    faIceCream,
    faBan,
    faEnvelope,
    faPhone,
    faReceipt,
    faCheckCircle,
    faCheckDouble,
    faClock,
    faUserShield // Ícone de Admin
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CancelOrderModal from '@/components/orders/CancelOrderModal.vue'

// --- Configurações ---
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const API_URL = import.meta.env.VITE_API_URL

// Imagens estáticas (mesma lógica)
const cartImages: Record<string, string> = {
    'azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
    'rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
    'misto': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'azul/rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'default': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
}

// --- Tipagem ---
interface OrderItem {
    id: number; name: string; quantity: number; price: number; image: string;
}

interface Order {
    id: string; status: string; displayStatus: string; date: string; requestDate: string; time: string;
    customer: { name: string; email: string; phone: string; };
    delivery: { method: 'delivery' | 'pickup'; address: string; };
    payment: { method: string; };
    cart: { name: string; image: string; };
    items: OrderItem[];
    summary: { deliveryFee: number; discount: number; };
    rawDeliveryDate: Date;
}

// --- Estado ---
const order = ref<Order | null>(null)
const isLoading = ref(true)
const showCancelModal = ref(false)
const isCancelling = ref(false)

// --- Helpers ---
const goBack = () => router.push({ name: 'admin-encomendas' })

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-').map(Number)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

const formatIsoDate = (isoString: string) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString))
}

const getDisplayStatus = (status: string) => {
    const map: Record<string, string> = {
        'PENDENTE': 'Pendente', 'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento', 'PAGO': 'Pago',
        'CONFIRMADO': 'Confirmado', 'EM_PREPARACAO': 'Em Preparação', 'SAIU_PARA_ENTREGA': 'Saiu para Entrega',
        'ENTREGUE': 'Entregue', 'CONCLUIDO': 'Concluído', 'CANCELADO': 'Cancelado'
    }
    return map[status] || status
}

// --- Fetch Admin ---
const fetchOrderDetails = async (orderId: string) => {
    isLoading.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return router.push('/login')

        // ROTA DIFERENTE AQUI (Rota de Admin que criamos)
        const response = await fetch(`${API_URL}/encomendas/detalhes/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Erro ao buscar detalhes')
        const data = await response.json()

        // Mapeamento (Igual ao do cliente)
        let rawCartColor = data.carrinhos?.[0]?.cor || 'Misto'
        const datePart = data.dataAgendada || data.dataSolicitacao.split('T')[0]
        const timePart = data.horaAgendada || '00:00:00'
        const [y, m, d] = datePart.split('-').map(Number)
        const [h, min] = timePart.split(':').map(Number)

        order.value = {
            id: String(data.id),
            status: data.status,
            displayStatus: getDisplayStatus(data.status),
            date: formatDate(datePart),
            requestDate: formatIsoDate(data.dataSolicitacao),
            time: data.horaAgendada ? data.horaAgendada.substring(0, 5) : '00:00',
            rawDeliveryDate: new Date(y, m - 1, d, h, min),
            customer: {
                name: data.nomeCliente || 'Desconhecido',
                email: data.emailCliente || '-',
                phone: data.telefoneCliente || '-'
            },
            delivery: {
                method: data.metodoEntrega === 'DELIVERY' ? 'delivery' : 'pickup',
                address: data.metodoEntrega === 'DELIVERY'
                    ? `${data.enderecoLogradouro}, ${data.enderecoNumero} - ${data.enderecoBairro}`
                    : 'Retirada na Loja'
            },
            payment: { method: data.metodoPagamento },
            cart: {
                name: rawCartColor,
                image: cartImages[rawCartColor.toLowerCase()] || cartImages['default']
            },
            summary: {
                deliveryFee: Number(data.taxaEntrega),
                discount: Number(data.valorDesconto)
            },
            items: data.itens.map((i: any) => ({
                id: i.id,
                name: i.produto.nome,
                quantity: i.quantidade,
                price: Number(i.precoUnitarioCongelado),
                image: i.produto.imagemCapa || '/images/placeholder.png'
            }))
        }
    } catch (error) {
        console.error(error)
        order.value = null
    } finally {
        isLoading.value = false
    }
}

// --- Computed ---
const subtotal = computed(() => order.value?.items.reduce((t, i) => t + i.price * i.quantity, 0) || 0)
const grandTotal = computed(() => (subtotal.value + (order.value?.summary.deliveryFee || 0)) - (order.value?.summary.discount || 0))

const paymentIcon = computed(() => {
    const m = order.value?.payment.method
    if (m === 'PIX') return { icon: faPix, color: '#32BCAD', label: 'Pix' }
    if (m === 'CASH') return { icon: faMoneyBillWave, color: '#16a34a', label: 'Dinheiro' }
    return { icon: faCreditCard, color: '#2563eb', label: 'Cartão' }
})

const currentStatusIndex = computed(() => {
    if (!order.value) return 0
    const s = order.value.status
    if (s === 'CANCELADO') return -1
    const levels = ['PENDENTE', 'CONFIRMADO', 'EM_PREPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CONCLUIDO']
    // Mapeamento simples para a barra de progresso
    if (['PENDENTE', 'AGUARDANDO_PAGAMENTO'].includes(s)) return 1
    if (['PAGO', 'CONFIRMADO'].includes(s)) return 2
    if (s === 'EM_PREPARACAO') return 3
    if (s === 'SAIU_PARA_ENTREGA') return 4
    if (['ENTREGUE', 'CONCLUIDO'].includes(s)) return 5
    return 1
})

const statusSteps = [
    { label: 'Recebido', icon: faClipboardCheck },
    { label: 'Confirmado', icon: faCheckCircle },
    { label: 'Produção', icon: faBoxOpen },
    { label: 'Transporte', icon: faTruckFast },
    { label: 'Finalizado', icon: faCheckDouble }
]

const handleCancelOrder = async (reason: string) => {
    if (!order.value) return
    isCancelling.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        await fetch(`${API_URL}/encomendas/${order.value.id}/cancelar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo: reason })
        })
        order.value.status = 'CANCELADO'
        order.value.displayStatus = 'Cancelado'
        showCancelModal.value = false
    } catch (e) {
        alert('Erro ao cancelar')
    } finally {
        isCancelling.value = false
    }
}

onMounted(() => {
    if (route.params.id) fetchOrderDetails(route.params.id as string)
})
</script>

<template>
    <div class="admin-detail-page">
        <div v-if="isLoading" class="loading-state">
            <font-awesome-icon :icon="faSpinner" spin size="3x" class="text-blue" />
            <p>Carregando dados da encomenda...</p>
        </div>

        <div v-else-if="order" class="content-container">
            <header class="page-header">
                <button @click="goBack" class="btn-back">
                    <font-awesome-icon :icon="faChevronLeft" /> Voltar
                </button>
                <div class="header-main">
                    <div class="title-group">
                        <span class="admin-badge"><font-awesome-icon :icon="faUserShield" /> Admin View</span>
                        <h1>Pedido #{{ order.id }}</h1>
                    </div>
                    <div class="status-badge" :class="order.status.toLowerCase()">
                        {{ order.displayStatus }}
                    </div>
                </div>
                <div class="meta-info">
                    <font-awesome-icon :icon="faClock" /> Criado em: {{ order.requestDate }}
                </div>
            </header>

            <div v-if="order.status !== 'CANCELADO'" class="stepper-card">
                <div class="stepper-track">
                    <div class="progress-bar-bg"></div>
                    <div class="progress-bar-fill" :style="{ width: `${((currentStatusIndex - 1) / 4) * 100}%` }"></div>
                    <div v-for="(step, index) in statusSteps" :key="index" class="step-item"
                        :class="{ 'active': (index + 1) === currentStatusIndex, 'completed': (index + 1) < currentStatusIndex }">
                        <div class="step-circle"><font-awesome-icon :icon="step.icon" /></div>
                        <span>{{ step.label }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="cancelled-banner">
                <font-awesome-icon :icon="faBan" />
                <span>Encomenda Cancelada</span>
            </div>

            <div class="details-grid">
                <div class="main-column">
                    <div class="card items-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faIceCream" class="icon-blue" />
                            <h3>Itens ({{ order.items.length }})</h3>
                        </div>
                        <div class="items-list">
                            <div v-for="item in order.items" :key="item.id" class="item-row">
                                <img :src="item.image" class="item-thumb" />
                                <div class="item-info">
                                    <h4>{{ item.name }}</h4>
                                    <div class="item-meta">
                                        <span class="qty">{{ item.quantity }}x</span>
                                        <span class="price">{{ formatCurrency(item.price) }}</span>
                                    </div>
                                </div>
                                <div class="item-total">{{ formatCurrency(item.price * item.quantity) }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mini-cards-row">
                        <div class="card mini-card">
                            <span class="label">Pagamento</span>
                            <font-awesome-icon :icon="paymentIcon.icon" :style="{ color: paymentIcon.color }"
                                size="2x" />
                            <span class="value">{{ paymentIcon.label }}</span>
                        </div>
                        <div class="card mini-card">
                            <span class="label">Carrinho</span>
                            <img :src="order.cart.image" class="cart-mini-img" />
                            <span class="value">{{ order.cart.name }}</span>
                        </div>
                    </div>
                </div>

                <div class="sidebar-column">
                    <div v-if="order.status !== 'CANCELADO' && order.status !== 'CONCLUIDO'" class="card actions-card">
                        <button class="btn-cancel" @click="showCancelModal = true">
                            <font-awesome-icon :icon="faBan" /> Cancelar Encomenda
                        </button>
                    </div>

                    <div class="card info-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faUserCircle" class="icon-purple" />
                            <h3>Cliente</h3>
                        </div>
                        <div class="info-content">
                            <p class="strong">{{ order.customer.name }}</p>
                            <p><font-awesome-icon :icon="faEnvelope" /> {{ order.customer.email }}</p>
                            <p><font-awesome-icon :icon="faPhone" /> {{ order.customer.phone }}</p>
                        </div>
                    </div>

                    <div class="card info-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faLocationDot" class="icon-orange" />
                            <h3>Entrega</h3>
                        </div>
                        <div class="info-content">
                            <p class="address">{{ order.delivery.address }}</p>
                            <div class="date-box">
                                <strong>{{ order.date }}</strong>
                                <span>aprox. {{ order.time }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card summary-card">
                        <div class="summary-row"><span>Subtotal</span> <span>{{ formatCurrency(subtotal) }}</span></div>
                        <div class="summary-row"><span>Entrega</span> <span>{{ formatCurrency(order.summary.deliveryFee)
                        }}</span></div>
                        <div v-if="order.summary.discount" class="summary-row discount"><span>Desconto</span> <span>-{{
                            formatCurrency(order.summary.discount) }}</span></div>
                        <div class="divider"></div>
                        <div class="summary-row total"><span>Total</span> <span>{{ formatCurrency(grandTotal) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <CancelOrderModal :is-open="showCancelModal" :is-loading="isCancelling" @close="showCancelModal = false"
            @confirm="handleCancelOrder" />
    </div>
</template>

<style scoped>
.admin-detail-page {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 0 2rem 2rem 2rem;
    font-family: 'Fredoka', sans-serif;
    color: #334155;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #64748b;
    gap: 1rem;
}

.text-blue {
    color: #3b82f6;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-header {
    margin-bottom: 2rem;
}

.btn-back {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    transition: color 0.2s;
    font-family: var(--font-title);
}

.btn-back:hover {
    color: #3b82f6;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.title-group h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.admin-badge {
    background: #1e293b;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 5px;
    display: inline-block;
}

.meta-info {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Status Badge */
.status-badge {
    padding: 0.5rem 1.2rem;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
}

.status-badge.pendente {
    background: #fff7ed;
    color: #c2410c;
}

.status-badge.confirmado {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.entregue {
    background: #dcfce7;
    color: #166534;
}

.status-badge.cancelado {
    background: #fee2e2;
    color: #991b1b;
}

.stepper-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stepper-track {
    display: flex;
    justify-content: space-between;
    position: relative;
}

.progress-bar-bg {
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    height: 4px;
    background: #e2e8f0;
}

.progress-bar-fill {
    position: absolute;
    top: 20px;
    left: 0;
    height: 4px;
    background: #3b82f6;
    /* Admin Blue */
    transition: width 0.5s ease;
}

.step-item {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
}

.step-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #f8fafc;
    border: 4px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    transition: all 0.3s;
}

.step-item span {
    font-size: 0.8rem;
    font-weight: 600;
    color: #cbd5e1;
    margin-top: 0.5rem;
}

.step-item.active .step-circle {
    background: #3b82f6;
    color: white;
    transform: scale(1.1);
}

.step-item.active span {
    color: #1e40af;
}

.step-item.completed .step-circle {
    background: #1e40af;
    color: white;
}

.cancelled-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 700;
    margin-bottom: 2rem;
}

/* Grid */
.details-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
}

/* Cards Comuns */
.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.8rem;
}

.card-title h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}

.icon-blue {
    color: #3b82f6;
}

.icon-purple {
    color: #8b5cf6;
}

.icon-orange {
    color: #f97316;
}

/* Lista de Itens */
.item-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px dashed #f1f5f9;
}

.item-row:last-child {
    border: none;
}

.item-thumb {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    object-fit: contain;
}

.item-info {
    flex-grow: 1;
}

.item-info h4 {
    margin: 0;
    font-size: 0.95rem;
    color: #334155;
}

.item-meta {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 2px;
}

.qty {
    font-weight: bold;
    color: #0f172a;
    margin-right: 5px;
}

.item-total {
    font-weight: 700;
    color: #334155;
}

/* Mini Cards */
.mini-cards-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.mini-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    justify-content: center;
    padding: 1rem;
}

.mini-card .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8;
}

.mini-card .value {
    font-weight: 600;
    font-size: 0.9rem;
}

.cart-mini-img {
    height: 40px;
    object-fit: contain;
}

/* Sidebar Info */
.info-content p {
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.strong {
    font-weight: 700;
    color: #1e293b;
    font-size: 1rem;
}

.address {
    line-height: 1.4;
}

.date-box {
    background: #f0f9ff;
    padding: 0.8rem;
    border-radius: 8px;
    margin-top: 0.8rem;
    border: 1px dashed #bae6fd;
    color: #0369a1;
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
}

/* Resumo */
.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    color: #64748b;
}

.summary-row.total {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
    margin-top: 0.5rem;
}

.summary-row.discount {
    color: #16a34a;
}

.divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.btn-cancel {
    font-family: var(--font-title);
    width: 100%;
    padding: 0.8rem;
    background: white;
    border: 2px solid #fee2e2;
    color: #ef4444;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.btn-cancel:hover {
    background: #fee2e2;
}

@media (max-width: 900px) {
    .admin-detail-page {
        padding: 0;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .header-main {
        flex-direction: column;
        align-items: flex-start;
    }

    .stepper-track {
        overflow-x: auto;
        padding-bottom: 10px;
    }

    .stepper-card {
        padding: 0.5rem;
    }

    .step-item {
        min-width: 70px;
    }
}
</style>