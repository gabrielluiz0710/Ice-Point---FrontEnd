<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import {
    faIdCard,
    faMapMarkedAlt,
    faCreditCard,
    faPen,
    faShoppingCart,
    faUser,
    faReceipt,
    faChevronDown,
    faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons'
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary.vue'
import StepPersonalData from '@/components/checkout/StepPersonalData.vue'
import StepAddress from '@/components/checkout/StepAddress.vue'
import StepPayment from '@/components/checkout/StepPayment.vue'

const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()

const isMobileSummaryOpen = ref(false)

const activeStep = ref(1)
const personalDataSection = ref<HTMLElement | null>(null);
const addressSection = ref<HTMLElement | null>(null);
const paymentSection = ref<HTMLElement | null>(null);
const addressStepKey = ref(0);
const checkoutSteps = [
    { name: 'Carrinho', icon: faShoppingCart },
    { name: 'Dados & Pagamento', icon: faUser },
    { name: 'Confirmação', icon: faReceipt }
]
const currentCheckoutStep = 2

function formatDate(dateString: string): string {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function scrollToSection(step: number) {
    let targetElement: HTMLElement | null = null;

    switch (step) {
        case 1:
            targetElement = personalDataSection.value;
            break;
        case 2:
            targetElement = addressSection.value;
            break;
        case 3:
            targetElement = paymentSection.value;
            break;
    }

    if (targetElement) {
        const header = document.querySelector<HTMLElement>('.header');

        const headerHeight = header ? header.offsetHeight : 0;

        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;

        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

watch(activeStep, (newStep) => {
    nextTick(() => {
        setTimeout(() => {
            scrollToSection(newStep);
        }, 350);
    });
});

onMounted(() => {
    window.scrollTo(0, 0);
});
</script>

<template>
    <div class="checkout-view">
        <h1 class="page-title">Configure seu Pedido</h1>

        <CheckoutProgressBar :steps="checkoutSteps" :current-step="currentCheckoutStep" />

        <div class="mobile-summary">
            <button class="summary-toggle" @click="isMobileSummaryOpen = !isMobileSummaryOpen"
                :class="{ open: isMobileSummaryOpen }">
                <div class="toggle-left">
                    <font-awesome-icon :icon="faFileInvoiceDollar" />
                    <span>Ver Resumo do Pedido</span>
                </div>
                <div class="toggle-right">
                    <span class="total-preview">R$ {{ checkoutStore.grandTotal.toFixed(2).replace('.', ',') }}</span>
                    <font-awesome-icon :icon="faChevronDown" class="chevron-icon" />
                </div>
            </button>
            <Transition name="slide-fade">
                <div v-if="isMobileSummaryOpen" class="summary-content">
                    <CheckoutOrderSummary />
                </div>
            </Transition>
        </div>

        <div class="checkout-layout">
            <main class="checkout-main">
                <section id="dados-pessoais" ref="personalDataSection" class="checkout-section"
                    :class="{ 'active-section': activeStep === 1 }">
                    <div class="section-header">
                        <h2 class="section-title">
                            <font-awesome-icon :icon="faIdCard" /> Dados Pessoais
                        </h2>
                        <button v-if="activeStep > 1" class="edit-button" @click="activeStep = 1">
                            <font-awesome-icon :icon="faPen" /> Modificar
                        </button>
                    </div>
                    <Transition name="fade-step" mode="out-in">
                        <div v-if="activeStep === 1" class="step-wrapper">
                            <StepPersonalData @completed="activeStep = 2" />
                        </div>
                        <div v-else class="section-summary-display">
                            <p><span>Nome:</span> {{ checkoutStore.personalData.fullName }}</p>
                            <p><span>Email:</span> {{ checkoutStore.personalData.email }}</p>
                            <p><span>Telefone:</span> {{ checkoutStore.personalData.phone }}</p>
                            <p><span>CPF:</span> {{ checkoutStore.personalData.cpf }}</p>
                            <p><span>Data de Nascimento:</span> {{ checkoutStore.personalData.birthDate }}</p>
                        </div>
                    </Transition>
                </section>

                <section id="endereco-entrega" ref="addressSection" class="checkout-section"
                    :class="{ 'disabled': activeStep < 2, 'active-section': activeStep === 2 }">
                    <div class="section-header">
                        <h2 class="section-title">
                            <font-awesome-icon :icon="faMapMarkedAlt" /> Endereço e Entrega
                        </h2>
                        <button v-if="activeStep > 2" class="edit-button" @click="activeStep = 2; addressStepKey++">
                            <font-awesome-icon :icon="faPen" /> Modificar
                        </button>
                    </div>
                    <Transition name="fade-step" mode="out-in">
                        <div v-if="activeStep === 2" class="step-wrapper">
                            <StepAddress :key="addressStepKey" @completed="activeStep = 3" />
                        </div>
                        <div v-else-if="activeStep > 2" class="section-summary-display">

                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span class="summary-label">Quando</span>
                                    <p class="summary-value">{{ formatDate(checkoutStore.schedule.date) }} às {{
                                        checkoutStore.schedule.time }}</p>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Método</span>
                                    <p class="summary-value">{{ checkoutStore.deliveryMethod === 'delivery' ? 'Entrega'
                                        : 'Retirada' }}</p>
                                </div>
                            </div>

                            <div v-if="checkoutStore.deliveryMethod === 'delivery'" class="address-summary-card">
                                <h4 class="address-card-title">
                                    {{ checkoutStore.useSameAddressForDelivery ?
                                        'Endereço de Entrega' : 'Entregar em Outro Endereço' }}
                                </h4>
                                <div class="address-card-body">
                                    <template v-if="checkoutStore.useSameAddressForDelivery">
                                        <p class="address-line">{{ checkoutStore.address.street }}, {{
                                            checkoutStore.address.number }}</p>
                                        <p v-if="checkoutStore.address.complement" class="address-line complement">{{
                                            checkoutStore.address.complement }}</p>
                                        <p class="address-line">{{ checkoutStore.address.neighborhood }}</p>
                                        <div class="address-line-group">
                                            <span>{{ checkoutStore.address.city }} / {{ checkoutStore.address.state
                                                }}</span>
                                            <span>CEP: {{ checkoutStore.address.cep }}</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <p class="address-line">{{ checkoutStore.deliveryAddress.street }}, {{
                                            checkoutStore.deliveryAddress.number }}</p>
                                        <p v-if="checkoutStore.deliveryAddress.complement"
                                            class="address-line complement">{{ checkoutStore.deliveryAddress.complement
                                            }}</p>
                                        <p class="address-line">{{ checkoutStore.deliveryAddress.neighborhood }}</p>
                                        <div class="address-line-group">
                                            <span>{{ checkoutStore.deliveryAddress.city }} / {{
                                                checkoutStore.deliveryAddress.state }}</span>
                                            <span>CEP: {{ checkoutStore.deliveryAddress.cep }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <div v-if="checkoutStore.deliveryMethod === 'pickup'" class="address-summary-card">
                                <h4 class="address-card-title">Endereço de Faturamento</h4>
                                <div class="address-card-body">
                                    <p class="address-line">{{ checkoutStore.address.street }}, {{
                                        checkoutStore.address.number }}</p>
                                    <p v-if="checkoutStore.address.complement" class="address-line complement">{{
                                        checkoutStore.address.complement
                                        }}</p>
                                    <p class="address-line">{{ checkoutStore.address.neighborhood }}</p>
                                    <div class="address-line-group">
                                        <span>{{ checkoutStore.address.city }} / {{ checkoutStore.address.state
                                            }}</span>
                                        <span>CEP: {{ checkoutStore.address.cep }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </section>

                <section id="pagamento" ref="paymentSection" class="checkout-section"
                    :class="{ 'disabled': activeStep < 3, 'active-section': activeStep === 3 }">
                    <div class="section-header">
                        <h2 class="section-title">
                            <font-awesome-icon :icon="faCreditCard" /> Pagamento
                        </h2>
                    </div>
                    <Transition name="fade-step" mode="out-in">
                        <div v-if="activeStep === 3" class="step-wrapper">
                            <StepPayment />
                        </div>
                    </Transition>
                </section>
            </main>

            <aside class="checkout-sidebar">
                <CheckoutOrderSummary />
            </aside>
        </div>
    </div>
</template>

<style scoped>
.checkout-view {
    background-color: var(--c-branco);
    max-width: 1200px;
    margin: 2rem auto auto auto;
    padding: 1rem;
    font-family: 'Fredoka', sans-serif;
}

.checkout-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.5fr) 1fr;
    gap: 2.5rem;
    align-items: flex-start;
}

.checkout-section {
    background: var(--c-branco);
    border-radius: 20px;
    margin-bottom: 2rem;
    border: 1px solid var(--color-border);
    transition: all 0.4s ease;
    overflow: hidden;
}

.checkout-section.disabled {
    opacity: 0.7;
    filter: grayscale(80%);
    pointer-events: none;
}

.checkout-section.active-section {
    border-color: var(--c-azul);
    box-shadow: 0 6px 20px rgba(25, 197, 203, 0.2);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--c-azul);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.step-wrapper {
    padding: 2rem;
}

.edit-button {
    background: none;
    border: 1px solid var(--c-rosa-light);
    color: var(--c-rosa);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

.edit-button:hover {
    background-color: var(--c-rosa);
    color: white;
}

.section-summary-display {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-size: 0.95rem;
}

.section-summary-display p {
    color: var(--c-text-dark);
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.summary-item .summary-label {
    font-weight: 300;
    font-size: 0.8rem;
    color: var(--c-text-light);
    margin-bottom: 0.25rem;
    display: block;
}

.summary-item .summary-value {
    font-weight: 500;
    color: var(--c-text);
}

.address-summary-card {
    background-color: #f8f9fa;
    /* Um cinza bem claro */
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    width: 100%;
}

.address-card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--c-azul);
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
}

.address-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--c-text);
    font-size: 0.9rem;
}

.address-line.complement {
    color: var(--c-text-light);
    font-size: 0.85rem;
}

.address-line-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

/* Responsividade */
@media (max-width: 576px) {
    .summary-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .address-line-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

.checkout-sidebar {
    position: sticky;
    top: 5rem;
}

.fade-step-enter-active,
.fade-step-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-step-enter-from,
.fade-step-leave-to {
    opacity: 0;
    transform: translateY(15px);
}

.page-title {
    text-align: center;
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 2.5rem;
}

.mobile-summary {
    display: none;
    margin: 2rem 0;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.summary-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem 1.5rem;
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    background-color: var(--c-branco);
    border: none;
    cursor: pointer;
    color: var(--c-azul);
}

.summary-toggle .toggle-left,
.summary-toggle .toggle-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.summary-toggle .total-preview {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--c-rosa);
}

.summary-toggle .chevron-icon {
    transition: transform 0.3s ease;
}

.summary-toggle.open .chevron-icon {
    transform: rotate(180deg);
}

.summary-content {
    padding: 1rem 1rem 1rem 1rem;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease-out;
    max-height: 500px;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
}

@media (max-width: 1024px) {
    .checkout-layout {
        grid-template-columns: 1fr;
    }

    .checkout-sidebar {
        display: none;
    }

    .checkout-view {
        padding: 1rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
    }

    .section-title {
        font-size: 1.3rem;
    }

    .mobile-summary {
        display: block;
    }
}
</style>