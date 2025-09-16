<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    faBox,
    faClipboardCheck,
    faTruck,
    faHouseUser,
    faUser,
    faMapMarkerAlt,
    faCreditCard,
    faMoneyBillWave,
    faQrcode,
    faChevronLeft,
    faSpinner,
    faIceCream
} from '@fortawesome/free-solid-svg-icons'

const route = useRoute()
const router = useRouter()
interface OrderItem {
    id: number
    name: string
    quantity: number
    price: number
    image: string
}
interface Order {
    id: string
    status: 'Pedido Recebido' | 'Em preparação' | 'A caminho' | 'Entregue'
    date: string
    time: string
    customer: { name: string }
    delivery: { method: 'delivery' | 'pickup', address: string }
    payment: { method: 'pix' | 'cash' | 'card' }
    items: OrderItem[]
    summary: { deliveryFee: number, discount: number }
}

const order = ref<Order | null>(null)
const isLoading = ref(true)

const generateMockOrderData = (id: string): Order => {
    const statuses: Order['status'][] = ['Pedido Recebido', 'Em preparação', 'A caminho', 'Entregue']
    const names = ['Ana Silva', 'Bruno Costa', 'Carla Dias', 'Daniel Alves', 'Eduarda Lima', 'Fabio Souza']

    let seed = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    if (isNaN(seed)) seed = 0;

    const allProducts: Omit<OrderItem, 'quantity'>[] = [
        { id: 7, name: 'Brigadeiro Skimo', price: 4.0, image: '/src/assets/images/cards/brigadeiro.png' },
        { id: 5, name: 'Ituzinho de Maracujá', price: 3.5, image: '/src/assets/images/cards/itumaracuja.png' },
        { id: 1, name: 'Limão Suíço', price: 2.0, image: '/src/assets/images/cards/limaosuico.png' },
        { id: 8, name: 'Tentação', price: 4.0, image: '/src/assets/images/cards/tentacao.png' },
        { id: 6, name: 'Ituzinho Leite Condensado', price: 3.5, image: '/src/assets/images/cards/ituleitecondensado.png' },
        { id: 2, name: 'Milho Verde', price: 2.0, image: '/src/assets/images/cards/milho.png' },
    ];

    const orderItems: OrderItem[] = [];
    let totalQuantity = 0;
    let productIndex = seed % allProducts.length;

    while (totalQuantity < 80) {
        const productToAdd = allProducts[productIndex];

        const quantity = 10 + ((seed + totalQuantity) % 16);

        orderItems.push({
            ...productToAdd,
            quantity: quantity
        });

        totalQuantity += quantity;
        productIndex = (productIndex + 1) % allProducts.length;
    }

    return {
        id,
        status: statuses[seed % statuses.length],
        date: `${10 + (seed % 18)} de Setembro, 2025`,
        time: `${10 + (seed % 10)}:${10 + (seed % 49)}`,
        customer: { name: names[seed % names.length] },
        delivery: {
            method: seed % 2 === 0 ? 'delivery' : 'pickup',
            address: `Rua das Flores, ${100 + seed * 3}, Uberlândia - MG`,
        },
        payment: { method: seed % 3 === 0 ? 'pix' : seed % 3 === 1 ? 'card' : 'cash' },
        items: orderItems,
        summary: {
            deliveryFee: seed % 2 === 0 ? 5.0 : 0.0,
            discount: parseFloat(((1 + seed % 5) * 0.5).toFixed(2)),
        },
    }
}

const subtotal = computed(() =>
    order.value?.items.reduce((total, item) => total + item.price * item.quantity, 0) || 0
)
const totalItems = computed(() =>
    order.value?.items.reduce((total, item) => total + item.quantity, 0) || 0
)
const grandTotal = computed(() =>
    (subtotal.value + (order.value?.summary.deliveryFee || 0)) - (order.value?.summary.discount || 0)
)
const paymentDetails = computed(() => {
    if (!order.value) return { label: '', icon: faCreditCard }
    switch (order.value.payment.method) {
        case 'pix': return { label: 'Pix', icon: faQrcode }
        case 'cash': return { label: 'Dinheiro', icon: faMoneyBillWave }
        case 'card': return { label: 'Cartão de Crédito', icon: faCreditCard }
        default: return { label: 'Não informado', icon: faCreditCard }
    }
})

const statusSteps = ['Pedido Recebido', 'Em preparação', 'A caminho', 'Entregue']
const currentStatusIndex = computed(() => {
    if (!order.value) return 0
    return statusSteps.indexOf(order.value.status) + 1
})

onMounted(() => {
    window.scrollTo(0, 0)
    setTimeout(() => {
        const orderId = route.params.id as string

        if (orderId && orderId.length > 0) {
            console.log(`Gerando dados para o pedido ID: ${orderId}`)
            order.value = generateMockOrderData(orderId)
        } else {
            console.error(`ID de pedido inválido ou não encontrado na URL: ${orderId}`)
            order.value = null
        }
        isLoading.value = false
    }, 1000)
})
</script>

<template>
    <div class="order-detail-view">
        <div v-if="isLoading" class="loading-container">
            <font-awesome-icon :icon="faSpinner" spin-pulse class="loading-icon" />
            <h2>Carregando seu pedido...</h2>
        </div>

        <div v-else-if="!order" class="loading-container">
            <h2>Ops! Pedido não encontrado.</h2>
            <button class="back-btn" @click="router.push('/perfil?tab=orders')">
                <font-awesome-icon :icon="faChevronLeft" /> Voltar para Meus Pedidos
            </button>
        </div>

        <div v-else class="main-content">
            <div class="header-container">
                <button class="back-btn" @click="router.push('/perfil?tab=orders')">
                    <font-awesome-icon :icon="faChevronLeft" /> Voltar para Meus Pedidos
                </button>
                <h1 class="main-title">
                    Detalhes do Pedido <span class="order-id">#{{ order.id }}</span>
                </h1>
            </div>

            <div class="status-tracker">
                <div v-for="(step, index) in statusSteps" :key="step" class="step" :class="{
                    'completed': (index + 1) < currentStatusIndex,
                    'active': (index + 1) === currentStatusIndex
                }">
                    <div class="icon-wrapper">
                        <font-awesome-icon v-if="index === 0" :icon="faClipboardCheck" />
                        <font-awesome-icon v-if="index === 1" :icon="faBox" />
                        <font-awesome-icon v-if="index === 2" :icon="faTruck" />
                        <font-awesome-icon v-if="index === 3" :icon="faHouseUser" />
                    </div>
                    <span>{{ step }}</span>
                </div>
            </div>

            <div class="details-grid">
                <div class="detail-card items-card">
                    <h2 class="card-title">
                        <font-awesome-icon :icon="faIceCream" />
                        Produtos ({{ totalItems }} itens)
                    </h2>
                    <ul class="items-list">
                        <li v-for="item in order.items" :key="item.id" class="order-item">
                            <img :src="item.image" :alt="item.name" class="item-image" />
                            <div class="item-info">
                                <span class="item-name">{{ item.name }}</span>
                                <span class="item-qty-price">{{ item.quantity }} x R$ {{
                                    item.price.toFixed(2).replace('.', ',') }}</span>
                            </div>
                            <strong class="item-subtotal">R$ {{ (item.price * item.quantity).toFixed(2).replace('.',
                                ',') }}</strong>
                        </li>
                    </ul>
                </div>

                <div class="detail-card summary-card">
                    <h2 class="card-title">Resumo do Pagamento</h2>
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span>R$ {{ subtotal.toFixed(2).replace('.', ',') }}</span>
                    </div>
                    <div class="summary-line">
                        <span>Taxa de Entrega</span>
                        <span>R$ {{ order.summary.deliveryFee.toFixed(2).replace('.', ',') }}</span>
                    </div>
                    <div v-if="order.summary.discount > 0" class="summary-line discount">
                        <span>Desconto</span>
                        <span>- R$ {{ order.summary.discount.toFixed(2).replace('.', ',') }}</span>
                    </div>
                    <div class="summary-line grand-total">
                        <strong>Total</strong>
                        <strong>R$ {{ grandTotal.toFixed(2).replace('.', ',') }}</strong>
                    </div>
                </div>

                <div class="detail-card">
                    <h2 class="card-title"><font-awesome-icon :icon="faUser" /> Cliente</h2>
                    <p>{{ order.customer.name }}</p>
                </div>
                <div class="detail-card">
                    <h2 class="card-title"><font-awesome-icon :icon="faMapMarkerAlt" /> Entrega</h2>
                    <p><strong>Método:</strong> {{ order.delivery.method === 'delivery' ? 'Entrega em domicílio' :
                        'Retirada' }}</p>
                    <p><strong>Endereço:</strong> {{ order.delivery.address }}</p>
                    <p><strong>Agendamento:</strong> {{ order.date }} às {{ order.time }}</p>
                </div>
                <div class="detail-card">
                    <h2 class="card-title"><font-awesome-icon :icon="paymentDetails.icon" /> Pagamento</h2>
                    <p>Pagamento via <strong>{{ paymentDetails.label }}</strong></p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(218, 96, 118, 0.4);
    }

    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(218, 96, 118, 0);
    }
}

.order-detail-view {
    min-height: 100vh;
    background: linear-gradient(135deg, hsl(345, 80%, 96%), hsl(206, 80%, 96%));
    padding: 2rem;
    font-family: 'Fredoka', sans-serif;
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    color: var(--c-text-dark);
    gap: 1.5rem;
}

.loading-icon {
    font-size: 3rem;
    color: var(--c-rosa);
}

.main-content {
    animation: slideInUp 0.6s ease-out;
}

.header-container {
    max-width: 1000px;
    margin: 0 auto 2rem auto;
}

.back-btn {
    font-family: 'Fredoka', sans-serif;
    background: none;
    border: none;
    color: var(--c-azul);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
    padding: 0.5rem 0;
}

.back-btn:hover {
    color: var(--c-rosa);
    transform: translateX(-3px);
}

.main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--c-text-dark);
}

.order-id {
    color: var(--c-rosa);
}

.status-tracker {
    display: flex;
    justify-content: space-between;
    max-width: 1000px;
    margin: 0 auto 3rem auto;
    position: relative;
}

.status-tracker::before {
    content: '';
    position: absolute;
    top: 25px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    z-index: 1;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: #9e9e9e;
    font-weight: 500;
    z-index: 2;
    position: relative;
    width: 100px;
}

.icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 4px solid #fff;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 0.5rem;
    transition: all 0.4s ease;
}

.step.completed .icon-wrapper {
    background-color: var(--c-azul);
}

.step.active .icon-wrapper {
    background-color: var(--c-rosa);
    animation: pulse 2s infinite;
}

.step.completed,
.step.active {
    color: var(--c-text-dark);
}

.details-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
}

.detail-card {
    background-color: white;
    border-radius: 20px;
    padding: 1.5rem 2rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    animation: slideInUp 0.5s ease-out backwards;
    opacity: 0;
    animation-fill-mode: forwards;
}

.detail-card:nth-child(1) {
    animation-delay: 0.2s;
}

.detail-card:nth-child(2) {
    animation-delay: 0.3s;
}

.detail-card:nth-child(3) {
    animation-delay: 0.4s;
}

.detail-card:nth-child(4) {
    animation-delay: 0.5s;
}

.detail-card:nth-child(5) {
    animation-delay: 0.6s;
}

.items-card {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--c-azul);
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.detail-card p {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: var(--c-text-dark);

}

.items-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.item-image {
    width: 60px;
    height: 60px;
    object-fit: contain;
    background-color: #f9f9f9;
    border-radius: 10px;
    border: 1px solid #f0f0f0;
}

.item-info {
    flex-grow: 1;
}

.item-name {
    display: block;
    font-weight: 600;
    color: var(--c-text-dark);
}

.item-qty-price {
    color: var(--c-text-light);
    font-size: 0.9rem;
}

.item-subtotal {
    font-weight: 600;
    font-size: 1rem;
    color: var(--c-text-dark);
}

.summary-line {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-weight: 500;
    color: var(--c-text-dark);
}

.summary-line.discount span {
    color: #10B981;
}

.grand-total {
    border-top: 2px dashed #f0f0f0;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1.2rem;
    color: var(--c-rosa);
}

@media (max-width: 992px) {
    .details-grid {
        grid-template-columns: 1fr;
    }

    .items-card {
        grid-row: auto;
    }
}

@media (max-width: 768px) {
    .order-detail-view {
        padding: 1.5rem;
    }

    .main-title {
        font-size: 2rem;
        text-align: center;
    }

    .header-container {
        text-align: center;
    }

    .back-btn {
        margin: 0 auto 1.5rem;
    }

    .status-tracker {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .status-tracker::before {
        left: 25px;
        top: 0;
        bottom: 0;
        width: 4px;
        height: 100%;
    }

    .step {
        flex-direction: row;
        gap: 1.5rem;
        width: 100%;
    }
}
</style>