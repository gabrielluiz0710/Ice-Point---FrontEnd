<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import { faUser, faMapMarkerAlt, faCalendarAlt, faReceipt, faShoppingBag, faUserCircle, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import ConfettiExplosion from "vue-confetti-explosion";
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'

const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const router = useRouter()

const finalGrandTotal = checkoutStore.grandTotal;
const finalDeliveryFee = checkoutStore.deliveryFee;
const finalDiscount = checkoutStore.discount;

const checkoutSteps = [
    { name: 'Carrinho', icon: faShoppingCart },
    { name: 'Dados & Pagamento', icon: faUser },
    { name: 'Confirmação', icon: faReceipt }
]
const currentCheckoutStep = 3

const orderDetails = {
    id: Math.floor(Math.random() * 900000) + 100000,
    status: 'Em preparação',
    items: JSON.parse(JSON.stringify(cartStore.cartItems))
}

function formatDate(dateString: string): string {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

onMounted(() => {
    window.scrollTo(0, 0)

    cartStore.emptyCart()
})
</script>

<template>
    <div class="confirmation-view">

        <div class="confetti-container">
            <ConfettiExplosion :particleCount="200" :force="0.3" />
        </div>
        <div class="confirmation-card">

            <div class="progress-bar-container">
                <CheckoutProgressBar :steps="checkoutSteps" :current-step="currentCheckoutStep" />
            </div>
            <div class="header-animation">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
            </div>

            <h1 class="title">Pedido Confirmado!</h1>
            <p class="subtitle">Oba! Seu pedido já está sendo preparado com muito carinho.</p>

            <div class="order-meta">
                <div class="meta-item">
                    <span>Nº do Pedido</span>
                    <strong>#{{ orderDetails.id }}</strong>
                </div>
                <div class="meta-item">
                    <span>Status</span>
                    <strong class="status-badge">{{ orderDetails.status }}</strong>
                </div>
            </div>

            <div class="details-grid">
                <div class="detail-box">
                    <h2 class="box-title"><font-awesome-icon :icon="faUser" /> Cliente</h2>
                    <p>{{ checkoutStore.personalData.fullName }}</p>
                </div>
                <div class="detail-box">
                    <h2 class="box-title">
                        <font-awesome-icon :icon="faMapMarkerAlt" />
                        {{ checkoutStore.deliveryMethod === 'pickup' ? 'Endereço de Faturamento' : 'Endereço de Entrega'
                        }}
                    </h2>

                    <template
                        v-if="!checkoutStore.useSameAddressForDelivery && checkoutStore.deliveryMethod === 'delivery'">
                        <p>{{ checkoutStore.deliveryAddress.street }}, {{ checkoutStore.deliveryAddress.number }}</p>
                        <p v-if="checkoutStore.deliveryAddress.complement">{{ checkoutStore.deliveryAddress.complement
                        }}</p>
                        <p>{{ checkoutStore.deliveryAddress.neighborhood }}, {{ checkoutStore.deliveryAddress.city }} -
                            {{
                                checkoutStore.deliveryAddress.state }}</p>
                    </template>
                    <template v-else>
                        <p>{{ checkoutStore.address.street }}, {{ checkoutStore.address.number }}</p>
                        <p v-if="checkoutStore.address.complement">{{ checkoutStore.address.complement }}</p>
                        <p>{{ checkoutStore.address.neighborhood }}, {{ checkoutStore.address.city }} - {{
                            checkoutStore.address.state }}</p>
                    </template>
                </div>
                <div class="detail-box">
                    <h2 class="box-title"><font-awesome-icon :icon="faCalendarAlt" /> Agendamento</h2>
                    <p>{{ formatDate(checkoutStore.schedule.date) }} às {{ checkoutStore.schedule.time }}</p>
                </div>
                <div class="detail-box order-summary">
                    <h2 class="box-title"><font-awesome-icon :icon="faReceipt" /> Resumo da Compra</h2>
                    <ul>
                        <li v-for="item in orderDetails.items" :key="item.id">
                            <span>{{ item.quantity }}x {{ item.name }}</span>
                            <strong>R$ {{ (item.price * item.quantity).toFixed(2).replace('.', ',') }}</strong>
                        </li>
                    </ul>
                    <div class="total-line">
                        <span>Taxa de Entrega</span>
                        <strong>R$ {{ finalDeliveryFee.toFixed(2).replace('.', ',') }}</strong>
                    </div>
                    <div v-if="finalDiscount > 0" class="total-line discount">
                        <span>Desconto</span>
                        <strong>- R$ {{ finalDiscount.toFixed(2).replace('.', ',') }}</strong>
                    </div>
                    <div class="grand-total">
                        <span>Total</span>
                        <strong>R$ {{ finalGrandTotal.toFixed(2).replace('.', ',') }}</strong>
                    </div>
                </div>
            </div>

            <div class="next-steps">
                <p>Você pode acompanhar o status do seu pedido a qualquer momento na sua área de perfil.</p>
                <div class="action-buttons">
                    <button @click="router.push({ path: '/perfil', query: { tab: 'orders' } })" class="btn-primary">
                        <font-awesome-icon :icon="faUserCircle" /> Ver Meus Pedidos
                    </button>
                    <button @click="router.push('/carrinho')" class="btn-secondary">
                        <font-awesome-icon :icon="faShoppingBag" /> Comprar Novamente
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.confetti-container {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    z-index: 9999;
}

.confirmation-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f8f9fa;
    padding: 2rem;
}

.progress-bar-container {
    width: 100%;
    max-width: 800px;
    margin-bottom: 2rem;
    opacity: 0;
    animation: fadeInUp 0.6s 0.1s ease-out forwards;
}

.confirmation-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    text-align: center;
    max-width: 800px;
    width: 100%;
    font-family: 'Fredoka', sans-serif;
    opacity: 0;
    animation: fadeInUp 0.7s 0.2s ease-out forwards;
}

.title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--c-azul);
    margin: 1.5rem 0 0.5rem;
}

.subtitle {
    font-size: 1.1rem;
    color: var(--c-text);
    margin-bottom: 2.5rem;
}

.order-meta {
    display: flex;
    justify-content: center;
    gap: 2rem;
    background-color: var(--c-cinza-light);
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 2.5rem;
    border: 1px solid var(--color-border);
}

.meta-item {
    text-align: center;
}

.meta-item span {
    font-size: 0.9rem;
    color: var(--c-text-light);
}

.meta-item strong {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--c-text-dark);
}

.status-badge {
    background-color: #ffc107;
    color: #333;
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    font-size: 1rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    text-align: left;
    margin-bottom: 2.5rem;
}

.detail-box {
    background: var(--c-cinza-light);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid var(--color-border);
}

.box-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--c-azul);
    margin-top: 0;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-box p {
    margin: 0.3rem 0;
    color: var(--c-text);
}

.order-summary {
    grid-column: 1 / -1;
    color: var(--c-text-dark);
}

.order-summary ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.order-summary li {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px dashed var(--color-border);
}

.order-summary li:last-child {
    border-bottom: none;
}

.total-line,
.grand-total {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

.grand-total {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--c-azul);
}

.total-line.discount {
    color: #00875a;
}

.next-steps {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
}

.next-steps p {
    color: var(--c-text-light);
    margin-bottom: 1.5rem;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    align-items: center;
}

.btn-primary,
.btn-secondary {
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    justify-content: center;
    min-width: 220px;
}

.btn-primary {
    background-color: var(--c-rosa);
    border-color: var(--c-rosa);
    color: white;
}

.btn-primary:hover {
    background-color: var(--c-rosa-dark);
    border-color: var(--c-rosa-dark);
    transform: translateY(-3px);
}

.btn-secondary {
    background-color: transparent;
    border-color: var(--c-azul);
    color: var(--c-azul);
}

.btn-secondary:hover {
    background-color: var(--c-azul);
    color: var(--c-branco);
    transform: translateY(-3px);
}

@media (max-width: 768px) {
    .details-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column;
    }

    .confirmation-card {
        padding: 2rem;
    }

    .title {
        font-size: 2rem;
    }
}

.checkmark {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: block;
    stroke-width: 4;
    stroke: #fff;
    stroke-miterlimit: 10;
    margin: 0 auto;
}

.checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke: var(--c-azul);
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
}

.checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke: var(--c-azul);
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 1.1s forwards;
}

@keyframes stroke {
    100% {
        stroke-dashoffset: 0;
    }
}

.header-animation {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    background: #eafcfa;
    border-radius: 50%;
}
</style>