<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/service/supabase'
import {
    faBoxOpen,
    faClipboardCheck,
    faTruckFast,
    faHouseCircleCheck,
    faUserCircle,
    faLocationDot,
    faCreditCard,
    faMoneyBillWave,
    faQrcode,
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
} from '@fortawesome/free-solid-svg-icons'
import CancelOrderModal from '@/components/orders/CancelOrderModal.vue'
import LateCancelModal from '@/components/orders/LateCancelModal.vue'
import { faPix } from '@fortawesome/free-brands-svg-icons'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL
const showLateCancelModal = ref(false)

const cartImages: Record<string, string> = {
    'azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
    'rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
    'misto': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'azul/rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'default': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
}

interface OrderItem {
    id: number
    name: string
    quantity: number
    price: number
    image: string
}

interface Order {
    id: string
    status: string
    displayStatus: string
    date: string
    requestDate: string
    time: string
    customer: {
        name: string
        email: string
        phone: string
    }
    delivery: {
        method: 'delivery' | 'pickup'
        address: string
    }
    payment: { method: string }
    cart: {
        name: string
        image: string
    }
    items: OrderItem[]
    summary: { deliveryFee: number, discount: number }
    rawDeliveryDate: Date
}

interface BackendOrder {
    id: number
    status: string
    dataSolicitacao: string
    dataAgendada: string
    horaAgendada: string
    nomeCliente: string
    emailCliente: string
    telefoneCliente: string
    metodoEntrega: string
    enderecoLogradouro: string
    enderecoNumero: string
    enderecoBairro: string
    enderecoCidade: string
    enderecoEstado: string
    metodoPagamento: string
    taxaEntrega: string | number
    valorDesconto: string | number
    carrinhos: { id: number, cor: string, identificacao: string }[]
    itens: {
        id: number
        quantidade: number
        precoUnitarioCongelado: string | number
        produto: {
            nome: string
            imagemCapa: string | null
        }
    }[]
}

const goBackToOrders = () => {
    router.push({ path: '/perfil', query: { tab: 'orders' } })
}

const order = ref<Order | null>(null)
const isLoading = ref(true)
const showCancelModal = ref(false)
const isCancelling = ref(false)

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

const formatIsoDate = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

const formatTime = (dateString: string) => {
    if (!dateString) return ''
    if (dateString.includes(':') && dateString.length <= 8) return dateString.substring(0, 5);
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

const getDisplayStatus = (status: string) => {
    const map: Record<string, string> = {
        'PENDENTE': 'Pendente',
        'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
        'PAGO': 'Pago',
        'CONFIRMADO': 'Confirmado',
        'EM_PREPARACAO': 'Em Preparação',
        'SAIU_PARA_ENTREGA': 'Saiu para Entrega',
        'ENTREGUE': 'Entregue',
        'CONCLUIDO': 'Concluído',
        'CANCELADO': 'Cancelado'
    }
    return map[status] || status
}

const fetchOrderDetails = async (orderId: string) => {
    isLoading.value = true
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        const response = await fetch(`${API_URL}/encomendas/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Pedido não encontrado na API')

        const data: BackendOrder = await response.json()

        let rawCartColor = 'Misto';
        if (data.carrinhos && data.carrinhos.length > 0) {
            rawCartColor = data.carrinhos[0].cor || 'Misto';
        }

        const normalizedColor = rawCartColor.toLowerCase();
        const cartImgUrl = cartImages[normalizedColor] || cartImages['default'];
        const datePart = data.dataAgendada || data.dataSolicitacao;
        const timePart = data.horaAgendada || '00:00:00';
        const [y, m, d] = datePart.split('-').map(Number);
        const [h, min, s] = timePart.split(':').map(Number);

        const deliveryDateObj = new Date(y, m - 1, d, h, min, s || 0);

        console.log("📅 [DEBUG] Data Entrega (Banco):", datePart, timePart);
        console.log("📅 [DEBUG] Objeto Date Criado:", deliveryDateObj.toString());

        order.value = {
            id: String(data.id),
            status: data.status,
            displayStatus: getDisplayStatus(data.status),
            date: formatDate(data.dataAgendada || data.dataSolicitacao),
            requestDate: formatIsoDate(data.dataSolicitacao),
            rawDeliveryDate: deliveryDateObj,
            time: data.horaAgendada || formatTime(data.dataSolicitacao),
            customer: {
                name: data.nomeCliente || 'Cliente',
                email: data.emailCliente || 'Email não informado',
                phone: data.telefoneCliente || 'Telefone não informado'
            },
            delivery: {
                method: data.metodoEntrega === 'DELIVERY' ? 'delivery' : 'pickup',
                address: data.metodoEntrega === 'DELIVERY'
                    ? `${data.enderecoLogradouro}, ${data.enderecoNumero} - ${data.enderecoBairro}, ${data.enderecoCidade} - ${data.enderecoEstado}`
                    : 'Retirada na Loja'
            },
            payment: { method: data.metodoPagamento },
            cart: {
                name: rawCartColor.charAt(0).toUpperCase() + rawCartColor.slice(1),
                image: cartImgUrl
            },
            summary: {
                deliveryFee: Number(data.taxaEntrega),
                discount: Number(data.valorDesconto)
            },
            items: data.itens.map(item => ({
                id: item.id,
                name: item.produto.nome,
                quantity: item.quantidade,
                price: Number(item.precoUnitarioCongelado),
                image: item.produto.imagemCapa || '/img/placeholder.png'
            }))
        }
    } catch (error) {
        console.error("Erro no processamento do pedido:", error)
        order.value = null
    } finally {
        isLoading.value = false
    }
}

const subtotal = computed(() => order.value?.items.reduce((t, i) => t + i.price * i.quantity, 0) || 0)
const grandTotal = computed(() => (subtotal.value + (order.value?.summary.deliveryFee || 0)) - (order.value?.summary.discount || 0))

function getNowInBrazil() {
    const now = new Date();

    const brString = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const cleanString = brString.replace(',', '');

    const [datePart, timePart] = cleanString.split(" ");

    if (!datePart || !timePart) {
        console.error("Erro ao fazer parse da data BR:", brString);
        return new Date();
    }

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, second || 0);
}


const canCancel = computed(() => {
    if (!order.value || order.value.status === 'CANCELADO' || order.value.status === 'ENTREGUE' || order.value.status === 'CONCLUIDO') {
        return false;
    }

    const nowBr = getNowInBrazil();
    const deliveryDate = order.value.rawDeliveryDate;

    const diffMs = deliveryDate.getTime() - nowBr.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    console.log("⏰ [DEBUG] Agora (BR):", nowBr.toString());
    console.log("📦 [DEBUG] Entrega:", deliveryDate.toString());
    console.log("⏳ [DEBUG] Diferença (horas):", diffHours.toFixed(2));
    console.log("✅ [DEBUG] Pode cancelar?", diffHours >= 2);

    return diffHours >= 2;
});

const handleCancelClick = () => {
    if (canCancel.value) {
        showCancelModal.value = true
    } else {
        showLateCancelModal.value = true
    }
}

const handleCancelOrder = async (reason: string) => {
    if (!order.value) return
    isCancelling.value = true

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch(`${API_URL}/encomendas/${order.value.id}/cancelar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ motivo: reason })
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.message || 'Erro ao cancelar')
        }

        order.value.status = 'CANCELADO'
        order.value.displayStatus = 'Cancelado'
        showCancelModal.value = false

    } catch (error) {
        console.error(error)
        alert('Não foi possível cancelar o pedido. Tente novamente ou contate o suporte.')
    } finally {
        isCancelling.value = false
    }
}

const paymentDetails = computed(() => {
    if (!order.value) return { label: '...', icon: faCreditCard, color: '#64748b' }
    const m = order.value.payment.method
    if (m === 'PIX') return { label: 'Pix', icon: faPix, color: '#32BCAD' }
    if (m === 'CASH') return { label: 'Dinheiro', icon: faMoneyBillWave, color: '#16a34a' }
    if (m === 'CARD' || m === 'ONLINE') return { label: 'Cartão', icon: faCreditCard, color: '#2563eb' }
    return { label: m, icon: faCreditCard, color: '#64748b' }
})

const statusSteps = [
    { label: 'Recebido', icon: faClipboardCheck },
    { label: 'Confirmado', icon: faCheckCircle },
    { label: 'Preparando', icon: faBoxOpen },
    { label: 'A Caminho', icon: faTruckFast },
    { label: 'Entregue', icon: faHouseCircleCheck },
    { label: 'Concluído', icon: faCheckDouble }

]

const currentStatusIndex = computed(() => {
    if (!order.value) return 0
    const s = order.value.status

    if (s === 'CANCELADO') return -1

    if (['PENDENTE', 'AGUARDANDO_PAGAMENTO'].includes(s)) return 1
    if (['PAGO', 'CONFIRMADO'].includes(s)) return 2
    if (s === 'EM_PREPARACAO') return 3
    if (s === 'SAIU_PARA_ENTREGA') return 4
    if (s === 'ENTREGUE') return 5
    if (s === 'CONCLUÍDO') return 6

    return 1
})

onMounted(() => {
    window.scrollTo(0, 0)
    const orderId = route.params.id as string
    if (orderId) fetchOrderDetails(orderId)
})
</script>

<template>
    <div class="page-background">
        <div class="content-wrapper">

            <div v-if="isLoading" class="state-container">
                <div class="loader-pulse">
                    <font-awesome-icon :icon="faSpinner" spin />
                </div>
                <p>Carregando detalhes...</p>
            </div>

            <div v-else-if="!order" class="state-container">
                <div class="error-circle">
                    <font-awesome-icon :icon="faBan" />
                </div>
                <h2>Pedido não encontrado</h2>
                <p>Verifique se o ID está correto ou tente novamente.</p>
                <button class="btn-back" @click="goBackToOrders">
                    <font-awesome-icon :icon="faChevronLeft" /> Voltar
                </button>
            </div>

            <div v-else class="order-container">

                <header class="order-header">
                    <div class="header-nav">
                        <button class="btn-text-back" @click="goBackToOrders">
                            <font-awesome-icon :icon="faChevronLeft" /> Meus Pedidos
                        </button>
                        <span class="meta-date">
                            <font-awesome-icon :icon="faClock" /> Solicitado em {{ order.requestDate }}
                        </span>
                    </div>
                    <div class="header-title-row">
                        <h1>Pedido <span class="highlight">#{{ order.id }}</span></h1>
                        <div class="status-badge" :class="order.status.toLowerCase()">
                            {{ order.displayStatus }}
                        </div>
                    </div>
                </header>

                <div v-if="order.status !== 'CANCELADO'" class="stepper-card">
                    <div class="stepper-track">
                        <div class="progress-bar-bg"></div>
                        <div class="progress-bar-fill" :style="{ width: `${((currentStatusIndex - 1) / 4) * 100}%` }">
                        </div>

                        <div v-for="(step, index) in statusSteps" :key="step.label" class="step-item" :class="{
                            'active': (index + 1) === currentStatusIndex,
                            'completed': (index + 1) < currentStatusIndex
                        }">
                            <div class="step-icon-circle">
                                <font-awesome-icon :icon="step.icon" />
                            </div>
                            <span class="step-label">{{ step.label }}</span>
                        </div>
                    </div>
                </div>

                <div v-else class="cancelled-banner">
                    <div class="cancelled-icon"><font-awesome-icon :icon="faBan" /></div>
                    <div class="cancelled-text">
                        <h3>Pedido Cancelado</h3>
                        <p>Este pedido foi cancelado e a entrega não será realizada.</p>
                    </div>
                </div>

                <div class="order-grid">

                    <section class="products-section">
                        <div class="card">
                            <div class="card-header">
                                <div class="header-icon ice-cream"><font-awesome-icon :icon="faIceCream" /></div>
                                <h2>Itens do Pedido</h2>
                                <span class="badge-count">{{ order.items.length }}</span>
                            </div>

                            <div class="products-list">
                                <div v-for="item in order.items" :key="item.id" class="product-row">
                                    <div class="product-thumb">
                                        <img :src="item.image" :alt="item.name" />
                                    </div>
                                    <div class="product-info">
                                        <h3>{{ item.name }}</h3>
                                        <div class="product-meta">
                                            <span class="qty">{{ item.quantity }}x</span>
                                            <span class="unit-price">{{ formatCurrency(item.price) }}</span>
                                        </div>
                                    </div>
                                    <div class="product-total">
                                        {{ formatCurrency(item.price * item.quantity) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card info-card address-card">
                            <div class="card-header compact">
                                <div class="header-icon loc"><font-awesome-icon :icon="faLocationDot" /></div>
                                <h2>Entrega</h2>
                            </div>
                            <div class="info-body">
                                <p class="address-text">{{ order.delivery.address }}</p>
                                <div class="delivery-badge-row">
                                    <span class="method-badge">
                                        {{ order.delivery.method === 'delivery' ? 'Entrega' : 'Retirada' }}
                                    </span>
                                </div>
                                <div v-if="order.delivery.method === 'delivery'" class="schedule-box">
                                    <div><strong>Agendado:</strong> {{ order.date }}</div>
                                    <div><strong>Horário:</strong> Aprox. {{ order.time }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="mini-grid">
                            <div class="card mini-card" :style="{ '--accent': paymentDetails.color }">
                                <span class="mini-label">Pagamento</span>
                                <font-awesome-icon :icon="paymentDetails.icon" class="mini-icon" />
                                <span class="mini-value">{{ paymentDetails.label }}</span>
                            </div>

                            <div class="card mini-card cart-card">
                                <span class="mini-label">Carrinho</span>
                                <div class="cart-img-wrap">
                                    <img :src="order.cart.image" :alt="order.cart.name">
                                </div>
                                <span class="mini-value">{{ order.cart.name }}</span>
                            </div>
                        </div>
                    </section>

                    <aside class="sidebar-section">
                        <div class="sticky-wrapper">
                            <div v-if="order.status !== 'CANCELADO' && order.status !== 'ENTREGUE' && order.status !== 'CONCLUIDO'"
                                class="actions-card">
                                <button class="btn-cancel" @click="handleCancelClick">
                                    <font-awesome-icon :icon="faBan" />
                                    Cancelar Pedido
                                </button>
                            </div>

                            <div class="card summary-card">
                                <div class="card-header">
                                    <div class="header-icon receipt"><font-awesome-icon :icon="faReceipt" /></div>
                                    <h2>Resumo</h2>
                                </div>
                                <div class="summary-body">
                                    <div class="summary-row">
                                        <span>Subtotal</span>
                                        <span class="val">{{ formatCurrency(subtotal) }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>Taxa de Entrega</span>
                                        <span class="val">{{ order.summary.deliveryFee === 0 ? 'Grátis' :
                                            formatCurrency(order.summary.deliveryFee) }}</span>
                                    </div>
                                    <div v-if="order.summary.discount > 0" class="summary-row discount">
                                        <span>Desconto</span>
                                        <span class="val">- {{ formatCurrency(order.summary.discount) }}</span>
                                    </div>
                                    <div class="divider"></div>
                                    <div class="summary-row total">
                                        <span>Total</span>
                                        <span class="val">{{ formatCurrency(grandTotal) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card info-card client-card">
                                <div class="card-header compact">
                                    <div class="header-icon user"><font-awesome-icon :icon="faUserCircle" /></div>
                                    <h2>Cliente</h2>
                                </div>
                                <div class="info-body">
                                    <div class="client-name">{{ order.customer.name }}</div>
                                    <div class="info-item">
                                        <font-awesome-icon :icon="faEnvelope" /> {{ order.customer.email }}
                                    </div>
                                    <div class="info-item">
                                        <font-awesome-icon :icon="faPhone" /> {{ order.customer.phone }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
    </div>
    <CancelOrderModal :is-open="showCancelModal" :is-loading="isCancelling" @close="showCancelModal = false"
        @confirm="handleCancelOrder" />
    <LateCancelModal :show="showLateCancelModal" @close="showLateCancelModal = false" />
</template>

<style scoped>
.page-background {
    min-height: 100vh;
    background-color: #f8fafc;
    font-family: 'Fredoka', 'Segoe UI', sans-serif;
    padding: 2rem 1rem;
    color: #334155;
}

.content-wrapper {
    max-width: 1140px;
    margin: 0 auto;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulseGlow {
    0% {
        box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
    }

    70% {
        box-shadow: 0 0 0 8px rgba(236, 72, 153, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
    }
}

.state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
    text-align: center;
    color: #64748b;
}

.loader-pulse {
    font-size: 3rem;
    color: #ec4899;
}

.error-circle {
    width: 80px;
    height: 80px;
    background: #fee2e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #ef4444;
    margin-bottom: 0.5rem;
}

.btn-back {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s;
}

.btn-back:hover {
    transform: translateY(-2px);
}

.order-header {
    margin-bottom: 2.5rem;
    animation: fadeInUp 0.4s ease-out;
}

.header-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.btn-text-back {
    font-family: var(--font-title);
    background: none;
    border: none;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    transition: color 0.2s;
}

.btn-text-back:hover {
    color: #ec4899;
}

.meta-date {
    font-size: 0.9rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.header-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-title-row h1 {
    font-size: 2.2rem;
    margin: 0;
    color: #1e293b;
    font-weight: 800;
}

.highlight {
    color: #ec4899;
}

.status-badge {
    padding: 0.5rem 1.2rem;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
}

.status-badge.pendente,
.status-badge.aguardando_pagamento {
    background: #fff7ed;
    color: #c2410c;
}

.status-badge.pago,
.status-badge.confirmado {
    background: #eff6ff;
    color: #1d4ed8;
}

.status-badge.em_preparacao {
    background: #fefce8;
    color: #a16207;
}

.status-badge.saiu_para_entrega {
    background: #f3e8ff;
    color: #7e22ce;
}

.status-badge.entregue {
    background: #f0fdf4;
    color: #15803d;
}

.status-badge.cancelado {
    background: #fef2f2;
    color: #b91c1c;
}

.stepper-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem 2rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
    border: 1px solid #f1f5f9;
    animation: fadeInUp 0.5s ease-out;
}

.stepper-track {
    display: flex;
    justify-content: space-between;
    position: relative;
    max-width: 850px;
    margin: 0 auto;
}

.progress-bar-bg {
    position: absolute;
    top: 22px;
    left: 0;
    right: 0;
    height: 4px;
    background: #e2e8f0;
    border-radius: 4px;
    z-index: 0;
}

.progress-bar-fill {
    position: absolute;
    top: 22px;
    left: 0;
    height: 4px;
    background: #ec4899;
    border-radius: 4px;
    z-index: 1;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
    z-index: 2;
    position: relative;
    cursor: default;
}

.step-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f8fafc;
    border: 4px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #cbd5e1;
    transition: all 0.4s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.step-label {
    margin-top: 0.8rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #cbd5e1;
    transition: color 0.4s;
    text-align: center;
}

.step-item.active .step-icon-circle {
    background: #ec4899;
    color: white;
    transform: scale(1.1);
    animation: pulseGlow 2s infinite;
    border-color: #fdf2f8;
}

.step-item.active .step-label {
    color: #be185d;
}

.step-item.completed .step-icon-circle {
    background: #be185d;
    color: white;
    border-color: #eff6ff;
}

.step-item.completed .step-label {
    color: #be185d;
}

.info-card {
    margin-top: 2rem;
}

.cancelled-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    color: #991b1b;
}

.cancelled-icon {
    font-size: 2.5rem;
    color: #ef4444;
}

.cancelled-text h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
}

.cancelled-text p {
    margin: 0;
    opacity: 0.9;
}

.order-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    align-items: start;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
    border: 1px solid #f1f5f9;
    animation: fadeInUp 0.6s ease-out;
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f8fafc;
}

.card-header.compact {
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
}

.header-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.header-icon.ice-cream {
    background: #e0f2fe;
    color: #0284c7;
}

.header-icon.receipt {
    background: #dcfce7;
    color: #16a34a;
}

.header-icon.user {
    background: #f3e8ff;
    color: #7e22ce;
}

.header-icon.loc {
    background: #ffedd5;
    color: #c2410c;
}

.card-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #334155;
    flex-grow: 1;
}

.badge-count {
    background: #f1f5f9;
    color: #64748b;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.85rem;
}

.products-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.product-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    border-radius: 12px;
    transition: background 0.2s;
}

.product-row:hover {
    background: #f8fafc;
}

.product-thumb {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.product-info {
    flex-grow: 1;
}

.product-info h3 {
    margin: 0 0 0.2rem 0;
    font-size: 1rem;
    color: #1e293b;
    font-weight: 600;
}

.product-meta {
    font-size: 0.9rem;
    color: #64748b;
}

.qty {
    font-weight: 600;
    color: #334155;
    margin-right: 0.5rem;
}

.product-total {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.05rem;
}

.sidebar-section {
    position: relative;
}

.sticky-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 1.5rem;
    z-index: 10;
}

.summary-body {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: #64748b;
}

.summary-row .val {
    color: #334155;
    font-weight: 600;
}

.summary-row.discount {
    color: #16a34a;
}

.summary-row.discount .val {
    color: #16a34a;
}

.divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.summary-row.total {
    font-size: 1.25rem;
    color: #ec4899;
    font-weight: 800;
    align-items: center;
}

.info-body {
    font-size: 0.95rem;
    color: #475569;
}

.client-name {
    font-weight: 700;
    color: #334155;
    margin-bottom: 0.4rem;
    font-size: 1rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: #64748b;
}

.address-text {
    line-height: 1.5;
    margin: 0 0 0.8rem 0;
}

.method-badge {
    background: #e2e8f0;
    color: #475569;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8rem;
}

.schedule-box {
    margin-top: 1rem;
    background: #f0f9ff;
    border: 1px dashed #bae6fd;
    padding: 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #0369a1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.mini-grid {
    display: grid;
    margin-top: 2rem;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.mini-card {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    border: 2px solid #f1f5f9;
    box-shadow: none;
    height: 100%;
    justify-content: center;
}

.mini-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
}

.mini-value {
    font-weight: 600;
    font-size: 0.9rem;
    color: #334155;
}

.mini-icon {
    font-size: 1.8rem;
    color: var(--accent);
    margin: 0.2rem 0;
}

.cart-img-wrap {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cart-img-wrap img {
    max-height: 100%;
    max-width: 100%;
}

@media (max-width: 900px) {

    .order-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: normal;
    }

    .header-nav {
        display: inline;
    }

    .meta-date {
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;

    }

    .sidebar-section,
    .sticky-wrapper {
        display: contents;
    }

    .sidebar-section .card,
    .sticky-wrapper .card {
        width: 100%;
        box-sizing: border-box;
    }

    .summary-card {
        order: 1;
    }

    .products-section {
        order: 2;
    }

    .client-card {
        order: 3;
    }

    .address-card {
        order: 4;
    }

    .mini-grid {
        order: 5;
        grid-template-columns: 1fr 1fr;
        width: 100%;
    }

    .header-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .sticky-wrapper {
        position: static;
    }

    .stepper-card {
        padding: 1.5rem 1rem;
    }

    .stepper-track {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0;
        position: relative;
        overflow-x: auto;
        padding: 15px 5px 1rem 5px;
    }

    .progress-bar-bg {
        top: 33px;
        display: block;
        width: 100%;
    }

    .progress-bar-fill {
        top: 33px;
        display: block;
    }

    .step-item {
        width: auto;
        flex: 1;
        min-width: 60px;
    }

    .step-icon-circle {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
        margin: 0 auto;
        z-index: 2;
        position: relative;
        background-color: white;
        overflow: visible;
    }

    .step-label {
        font-size: 0.7rem;
        margin-top: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        padding: 0 2px;
    }

    .step-item.active .step-icon-circle {
        overflow: visible;
    }
}

.actions-card {
    margin-top: 1.5rem;
    text-align: center;
}

.btn-cancel {
    width: 100%;
    padding: 1rem;
    background-color: white;
    border: 2px solid #fee2e2;
    color: #ef4444;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
    font-family: inherit;
    transition: all 0.4s ease;

}

.btn-cancel:hover:not(:disabled) {
    background-color: #fee2e2;
    border-color: #ef4444;
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
    border-color: #e2e8f0;
    color: #94a3b8;
}

.cancel-note {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.5rem;
}
</style>