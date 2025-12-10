<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    faUser,
    faMapMarkerAlt,
    faCalendarAlt,
    faReceipt,
    faUserCircle,
    faShoppingCart,
    faBoxOpen,
    faTruck,
    faStore,
    faMoneyBillWave,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import ConfettiExplosion from "vue-confetti-explosion";
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'

const route = useRoute()
const router = useRouter()

const receipt = ref<any>(null)
const hasData = ref(false)

const cartImages: Record<string, string> = {
    'Azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
    'Rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
    'Azul/Rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'default': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
}

const checkoutSteps = [
    { name: 'Carrinho', icon: faShoppingCart },
    { name: 'Dados & Pagamento', icon: faUser },
    { name: 'Confirmação', icon: faReceipt }
]
const currentCheckoutStep = 3

function formatDate(dateString: string): string {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function getCartImage(color: string) {
    const key = Object.keys(cartImages).find(k => k.toLowerCase() === (color || '').toLowerCase())
    return key ? cartImages[key] : cartImages['default']
}

const paymentIcon = computed(() => {
    switch (receipt.value?.paymentMethod) {
        case 'pix': return faPix;
        case 'card': return faCreditCard;
        default: return faMoneyBillWave;
    }
})

const paymentLabel = computed(() => {
    const map: Record<string, string> = { 'pix': 'PIX na Entrega', 'cash': 'Dinheiro', 'card': 'Cartão (Maquininha)' };
    return map[receipt.value?.paymentMethod] || 'Pagamento na Entrega';
})

onMounted(() => {
    window.scrollTo(0, 0)

    const storedData = sessionStorage.getItem('last_order_receipt');

    if (storedData) {
        try {
            const parsed = JSON.parse(storedData);
            const urlHashId = atob(route.params.hash as string);

            if (String(parsed.orderId) === urlHashId) {
                receipt.value = parsed;
                hasData.value = true;
            } else {
                console.warn("Hash da URL não corresponde aos dados da sessão.");
            }
        } catch (e) {
            console.error("Erro ao ler dados do pedido", e);
        }
    }
})
</script>

<template>
    <div class="confirmation-view">

        <div v-if="!hasData" class="empty-state">
            <font-awesome-icon :icon="faReceipt" class="empty-icon" />
            <h2>Detalhes não disponíveis</h2>
            <p>Por segurança, os detalhes do pedido só são exibidos logo após a compra.</p>
            <p>Verifique seu e-mail para acompanhar o status ou acesse sua conta.</p>
            <div class="action-buttons">
                <button @click="router.push('/')" class="btn-primary">Voltar ao Início</button>
            </div>
        </div>

        <div v-else class="content-wrapper">
            <div class="confetti-container">
                <ConfettiExplosion :particleCount="200" :force="0.3" :duration="3000" />
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
                <p class="subtitle">Oba, <strong>{{ receipt.personalData.fullName.split(' ')[0] }}</strong>! Recebemos
                    seu pedido.</p>

                <div class="order-meta">
                    <div class="meta-item">
                        <span>Nº do Pedido</span>
                        <strong>#{{ receipt.orderId }}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Data</span>
                        <strong>{{ formatDate(receipt.schedule.date) }} às {{ receipt.schedule.time }}</strong>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-box">
                        <h2 class="box-title">
                            <font-awesome-icon :icon="receipt.deliveryMethod === 'delivery' ? faTruck : faStore" />
                            {{ receipt.deliveryMethod === 'pickup' ? 'Retirada na Loja' : 'Endereço de Entrega' }}
                        </h2>

                        <template v-if="receipt.deliveryMethod === 'delivery'">
                            <div class="address-content">
                                <template v-if="receipt.useSameAddress">
                                    <p>{{ receipt.address.street }}, {{ receipt.address.number }}</p>
                                    <p v-if="receipt.address.complement">{{ receipt.address.complement }}</p>
                                    <p>{{ receipt.address.neighborhood }} - {{ receipt.address.city }}/{{
                                        receipt.address.state }}</p>
                                </template>
                                <template v-else>
                                    <p>{{ receipt.deliveryAddress.street }}, {{ receipt.deliveryAddress.number }}</p>
                                    <p v-if="receipt.deliveryAddress.complement">{{ receipt.deliveryAddress.complement
                                    }}</p>
                                    <p>{{ receipt.deliveryAddress.neighborhood }} - {{ receipt.deliveryAddress.city
                                    }}/{{ receipt.deliveryAddress.state }}</p>
                                </template>
                            </div>
                        </template>
                        <template v-else>
                            <p class="store-text">Você escolheu retirar os carrinhos em nossa unidade.</p>
                            <p class="store-address"><strong>Ice Point Sorvetes</strong><br>Uberaba - MG</p>
                        </template>
                    </div>

                    <div class="detail-box">
                        <h2 class="box-title"><font-awesome-icon :icon="faUser" /> Dados de Contato</h2>
                        <p><strong>Email:</strong> {{ receipt.personalData.email }}</p>
                        <p><strong>Telefone:</strong> {{ receipt.personalData.phone }}</p>
                        <p><strong>CPF:</strong> {{ receipt.personalData.cpf }}</p>
                    </div>
                </div>

                <div class="carts-visual-list" v-if="receipt.selectedCarts && receipt.selectedCarts.length > 0">
                    <h3 class="section-heading">Carrinhos Escolhidos</h3>
                    <div class="carts-grid">
                        <div v-for="(cart, index) in receipt.selectedCarts" :key="index" class="cart-item-card">
                            <div class="cart-image-wrapper">
                                <img :src="getCartImage(cart.color)" :alt="cart.color" />
                                <span class="qty-badge">{{ cart.quantity }}x</span>
                            </div>
                            <span class="cart-name">Cor {{ cart.color }}</span>
                        </div>
                    </div>
                </div>

                <div class="financial-summary">
                    <h2 class="box-title"><font-awesome-icon :icon="faReceipt" /> Resumo Financeiro</h2>

                    <div class="summary-line">
                        <span>Produtos ({{ receipt.items.length }} itens)</span>
                        <strong>R$ {{ receipt.financials.productsTotal.toFixed(2).replace('.', ',') }}</strong>
                    </div>

                    <div class="summary-line" v-if="receipt.deliveryMethod === 'delivery'">
                        <span>Taxa de Entrega</span>
                        <strong>R$ {{ receipt.financials.deliveryFee.toFixed(2).replace('.', ',') }}</strong>
                    </div>

                    <div class="summary-line discount" v-if="receipt.financials.discount > 0">
                        <span>Desconto ({{ paymentLabel }})</span>
                        <strong>- R$ {{ receipt.financials.discount.toFixed(2).replace('.', ',') }}</strong>
                    </div>

                    <div class="total-divider"></div>

                    <div class="summary-line grand-total">
                        <span>Total a Pagar</span>
                        <div class="total-value">
                            <span>R$ {{ receipt.financials.total.toFixed(2).replace('.', ',') }}</span>
                            <small>via {{ paymentLabel }} <font-awesome-icon :icon="paymentIcon" /></small>
                        </div>
                    </div>
                </div>

                <div class="next-steps">
                    <div class="alert-box">
                        <font-awesome-icon :icon="faBoxOpen" />
                        <p>Se você não possui cadastro, enviamos os detalhes para o email <strong>{{
                            receipt.personalData.email
                                }}</strong>. Cadastre-se com este email para acompanhar o pedido pelo painel.</p>
                    </div>

                    <div class="action-buttons">
                        <button @click="router.push({ path: '/perfil', query: { tab: 'orders' } })" class="btn-primary">
                            <font-awesome-icon :icon="faUserCircle" /> Ver Meus Pedidos
                        </button>
                        <button @click="router.push('/carrinho')" class="btn-secondary">
                            <font-awesome-icon :icon="faShoppingCart" /> Comprar Novamente
                        </button>
                    </div>
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
    pointer-events: none;
}

.confirmation-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f8f9fa;
    padding: 2rem 1rem;
    font-family: 'Fredoka', sans-serif;
}

.empty-state {
    text-align: center;
    color: var(--c-text-light);
    max-width: 400px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #cbd5e1;
}

.empty-state h2 {
    color: var(--c-text);
    margin-bottom: 0.5rem;
}

.empty-state p {
    margin-bottom: 1rem;
    line-height: 1.5;
}

.confirmation-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    padding: 2.5rem;
    text-align: center;
    max-width: 800px;
    width: 100%;
    opacity: 0;
    animation: fadeInUp 0.7s 0.2s ease-out forwards;
}

.progress-bar-container {
    margin-bottom: 2rem;
    opacity: 0;
    animation: fadeInUp 0.6s 0.1s ease-out forwards;
}

.header-animation {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: #eafcfa;
    border-radius: 50%;
    position: relative;
}

.checkmark {
    width: 80px;
    height: 80px;
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

.title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1.1rem;
    color: var(--c-text);
    margin-bottom: 2rem;
}

.order-meta {
    display: flex;
    justify-content: center;
    gap: 2rem;
    background-color: #f1f5f9;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.meta-item span {
    font-size: 0.85rem;
    color: var(--c-text-light);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.meta-item strong {
    font-size: 1.2rem;
    color: var(--c-text-dark);
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    text-align: left;
    margin-bottom: 2rem;
}

@media(max-width: 768px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
}

.detail-box {
    background: #fff;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid var(--color-border);
}

.box-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.5rem;
}

.detail-box p {
    margin: 0.4rem 0;
    color: var(--c-text);
    font-size: 0.95rem;
}

.carts-visual-list {
    margin-bottom: 2rem;
    text-align: left;
}

.section-heading {
    font-size: 1.1rem;
    color: var(--c-azul);
    margin-bottom: 1rem;
    text-align: center;
}

.carts-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.cart-item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.cart-image-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--c-azul-light);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.cart-image-wrapper img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

.qty-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--c-rosa);
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
}

.cart-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--c-text);
}

.financial-summary {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 16px;
    margin-bottom: 2rem;
    text-align: left;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: var(--c-text);
}

.summary-line.discount {
    color: #16a34a;
}

.total-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 1rem 0;
}

.grand-total {
    align-items: flex-end;
}

.grand-total>span {
    font-size: 1.1rem;
    font-weight: 600;
}

.total-value {
    text-align: right;
}

.total-value span {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--c-azul);
}

.total-value small {
    font-size: 0.85rem;
    color: var(--c-text-light);
}

.alert-box {
    background: #fff8e1;
    border: 1px solid #ffe082;
    color: #856404;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    text-align: left;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: 0.3s;
    min-width: 200px;
    justify-content: center;
    font-family: var(--font-title);
}

.btn-primary {
    background: var(--c-rosa);
    color: white;
    border: none;
}

.btn-primary:hover {
    background: var(--c-rosa-dark);
    transform: translateY(-2px);
}

.btn-secondary {
    background: transparent;
    border: 2px solid var(--c-azul);
    color: var(--c-azul);
}

.btn-secondary:hover {
    background: var(--c-azul);
    color: white;
    transform: translateY(-2px);
}
</style>