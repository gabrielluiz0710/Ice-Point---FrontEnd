<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import {
    faMoneyBillWave,
    faCreditCard,
    faReceipt,
    faShieldAlt,
    faTags,
    faGlobe,
    faHandHoldingUsd,
    faSpinner
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'

const API_URL = import.meta.env.VITE_API_URL
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const router = useRouter()
const isProcessing = ref(false)

const offlineOptions = [
    { value: 'pix', label: 'PIX (Na Entrega)', icon: faPix },
    { value: 'cash', label: 'Dinheiro', icon: faMoneyBillWave },
    { value: 'card', label: 'Cartão (Maquininha)', icon: faCreditCard },
] as const;

const schema = yup.object({
    paymentMode: yup.string().required('Escolha quando deseja pagar.'),
    paymentMethod: yup.string().when('paymentMode', {
        is: 'offline',
        then: schema => schema.required('Escolha uma forma de pagamento.'),
        otherwise: schema => schema.notRequired()
    }),
    agreedToTerms: yup.boolean().oneOf([true], 'Você deve aceitar os termos e condições.'),
});

const initialValues = {
    paymentMode: checkoutStore.paymentMode,
    paymentMethod: checkoutStore.paymentMethod,
    agreedToTerms: checkoutStore.agreedToTerms,
};

async function finalizeOrder(formValues: any) {
    checkoutStore.paymentMode = formValues.paymentMode;
    checkoutStore.agreedToTerms = formValues.agreedToTerms;
    if (formValues.paymentMode === 'offline') {
        checkoutStore.paymentMethod = formValues.paymentMethod;
    }

    try {
        isProcessing.value = true

        const orderId = await checkoutStore.submitOrder()

        if (checkoutStore.paymentMode === 'online') {
            await processOnlinePayment(orderId)
        } else {
            const receiptData = {
                orderId: orderId,
                personalData: { ...checkoutStore.personalData },
                address: { ...checkoutStore.address },
                deliveryAddress: { ...checkoutStore.deliveryAddress },
                deliveryMethod: checkoutStore.deliveryMethod,
                useSameAddress: checkoutStore.useSameAddressForDelivery,
                schedule: { ...checkoutStore.schedule },
                paymentMethod: checkoutStore.paymentMethod,
                items: JSON.parse(JSON.stringify(cartStore.cartItems)),
                selectedCarts: JSON.parse(JSON.stringify(checkoutStore.selectedCarts)),
                financials: {
                    total: checkoutStore.grandTotal,
                    deliveryFee: checkoutStore.deliveryFee,
                    discount: checkoutStore.discount,
                    productsTotal: cartStore.totalCartPrice
                }
            };

            sessionStorage.setItem('last_order_receipt', JSON.stringify(receiptData));

            checkoutStore.resetState()
            cartStore.emptyCart()

            const orderHash = btoa(String(orderId));

            router.push({
                name: 'OrderConfirmation',
                params: { hash: orderHash }
            });
        }
    } catch (e: any) {
        console.error(e)
        alert('Erro ao finalizar: ' + (e.message || 'Erro desconhecido'))
    } finally {
        if (checkoutStore.paymentMode === 'offline') {
            isProcessing.value = false
        }
    }
}

async function processOnlinePayment(orderId: number) {
    isProcessing.value = true;
    try {
        const orderPayload = {
            items: checkoutStore.selectedCarts.map(cart => ({
                color: cart.color,
                quantity: cart.quantity,
                unitPrice: 250
            })),
            buyer: checkoutStore.personalData,
            deliveryFee: checkoutStore.deliveryFee,
            orderId: orderId.toString()
        };

        const response = await fetch(`${API_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) throw new Error('Falha ao criar pagamento');

        const data = await response.json();

        if (data.checkoutUrl) {
            checkoutStore.resetState()
            cartStore.emptyCart()
            window.location.href = data.checkoutUrl;
        } else {
            alert('Erro: URL de pagamento não gerada.');
            isProcessing.value = false;
        }

    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao conectar com o Mercado Pago.');
        isProcessing.value = false;
    }
}
</script>

<template>
    <Form @submit="finalizeOrder" :validation-schema="schema" :initial-values="initialValues" :keep-values="true"
        v-slot="{ meta, setFieldValue, values }">

        <div class="payment-options-section">
            <h3 class="section-subtitle">Quando deseja pagar?</h3>
            <div class="mode-buttons">
                <!-- <button class="online" type="button" :class="{ active: values.paymentMode === 'online' }"
                    @click="() => { setFieldValue('paymentMode', 'online'); checkoutStore.paymentMode = 'online'; }">
                    <font-awesome-icon :icon="faGlobe" />
                    <span>Pagar Agora (Online)</span>
                </button> -->

                <button type="button" :class="{ active: values.paymentMode === 'offline' }"
                    @click="() => { setFieldValue('paymentMode', 'offline'); checkoutStore.paymentMode = 'offline'; }">
                    <font-awesome-icon :icon="faHandHoldingUsd" />
                    <span>Pagar na Entrega/Retirada</span>
                </button>
            </div>
            <ErrorMessage name="paymentMode" class="error-message" />
        </div>

        <Transition name="fade-step" mode="out-in">
            <div v-if="values.paymentMode === 'offline'" class="offline-selection">
                <h4 class="subsection-title">Como você vai pagar?</h4>
                <Field name="paymentMethod" v-slot="{ value }">
                    <div class="choice-buttons">
                        <button v-for="option in offlineOptions" :key="option.value" type="button"
                            :class="{ active: value === option.value }"
                            @click="() => { setFieldValue('paymentMethod', option.value); checkoutStore.paymentMethod = option.value; }">
                            <font-awesome-icon :icon="option.icon" />
                            <span>{{ option.label }}</span>
                        </button>
                    </div>
                </Field>
                <ErrorMessage name="paymentMethod" class="error-message" />

                <div v-if="checkoutStore.discount > 0" class="info-box discount">
                    <font-awesome-icon :icon="faTags" />
                    <p>Oba! <strong>10% de desconto</strong> aplicado por pagar em dinheiro ou PIX na entrega.</p>
                </div>
            </div>

            <div v-else-if="values.paymentMode === 'online'" class="online-info">
                <div class="mp-card">
                    <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png"
                        alt="Mercado Pago" class="mp-logo" />
                    <div class="mp-text">
                        <h4>Ambiente Seguro Mercado Pago</h4>
                        <p>Ao finalizar, você será redirecionado para pagar com <strong>PIX, Cartão de Crédito ou
                                Débito</strong> com total segurança.</p>
                    </div>
                </div>
            </div>
        </Transition>

        <div class="terms-section">
            <Field name="agreedToTerms" type="checkbox" :value="true" :unchecked-value="false"
                v-slot="{ field, value }">
                <label class="checkbox-label">
                    <input type="checkbox" v-bind="field" :checked="value" />
                    <span class="checkbox-custom"></span>
                    Li e aceito os
                    <a href="/termos-condicoes" target="_blank" class="terms-link">
                        termos e condições
                    </a>.
                </label>
            </Field>
            <ErrorMessage name="agreedToTerms" class="error-message" />
        </div>

        <button type="submit" class="action-button" :disabled="!meta.valid || isProcessing">
            <span v-if="isProcessing">
                <font-awesome-icon :icon="faSpinner" spin /> Processando...
            </span>
            <span v-else>
                {{ values.paymentMode === 'online' ? 'Ir para Pagamento' : 'Finalizar Pedido' }}
                <font-awesome-icon :icon="faReceipt" />
            </span>
        </button>
    </Form>
</template>

<style scoped>
.section-subtitle {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 1rem;
}

.subsection-title {
    font-size: 1rem;
    color: var(--c-text-light);
    margin: 1.5rem 0 0.8rem 0;
}

.mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    font-family: var(--font-title);
}

.mode-buttons span {
    font-family: var(--font-title);
}

.online {
    display: none;
}

.mode-buttons button {
    padding: 1.5rem;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    background: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    font-weight: 600;
    color: var(--c-text-light);
    transition: all 0.2s;
}

.mode-buttons button.active {
    border-color: var(--c-azul);
    background: #f0f9ff;
    color: var(--c-azul);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.mode-buttons svg {
    font-size: 1.8rem;
}

.choice-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.8rem;
}

.choice-buttons button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background-color: var(--c-branco);
    cursor: pointer;
    transition: all 0.2s ease;
}

.choice-buttons button:hover {
    border-color: var(--c-azul);
    color: var(--c-azul);
}

.choice-buttons button.active {
    border-color: var(--c-rosa);
    background-color: #fff1f4;
    color: var(--c-rosa);
}

.mp-card {
    background: #009ee3;
    color: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1rem;
    box-shadow: 0 8px 20px rgba(0, 158, 227, 0.25);
}

.mp-logo {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    padding: 10px;
    object-fit: contain;
}

.mp-text h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
}

.mp-text p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.4;
}

.info-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    margin-top: 2rem;
    font-weight: 500;
}

.info-box.discount {
    background-color: #e6f7f2;
    color: #00875a;
}

.info-box.notice {
    background-color: #f0f4ff;
    color: #3b5bdb;
}

.info-box svg {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-box p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
}

.terms-section {
    margin-top: 2rem;
}

.terms-link {
    font-weight: 700;
    color: var(--c-azul);
    text-decoration: none;
    border-bottom: 1px dashed transparent;
    transition: all 0.2s ease;
    margin-left: 3px;
}

.terms-link:hover {
    color: var(--c-rosa);
    border-bottom: 1px dashed var(--c-rosa);
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    color: var(--c-text-dark);
}

.checkbox-label input[type="checkbox"] {
    opacity: 0;
    width: 0;
    height: 0;
}

.checkbox-custom {
    position: relative;
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: var(--c-branco);
    border: 2px solid var(--color-border);
    border-radius: 6px;
    margin-right: 0.75rem;
    transition: all 0.2s ease;
    color: var(--c-text-dark);
}

.checkbox-label input[type="checkbox"]:checked+.checkbox-custom {
    background-color: var(--c-rosa);
    border-color: var(--c-rosa);
}

.checkbox-custom::after {
    content: '';
    position: absolute;
    left: 7px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked+.checkbox-custom::after {
    opacity: 1;
}

.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: linear-gradient(45deg, var(--c-azul), var(--c-azul-dark-footer));
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 2rem;
    box-shadow: 0 4px 15px rgba(25, 132, 203, 0.3);
}

.action-button:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(25, 132, 203, 0.4);
}

.action-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none;
}

.error-message {
    color: #e53e3e;
    font-size: .85rem;
    margin-top: .5rem;
    padding-left: .2rem;
}

.fade-step-enter-active,
.fade-step-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-step-enter-from,
.fade-step-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

@media (max-width: 600px) {
    .mode-buttons {
        grid-template-columns: 1fr;
    }

    .mp-card {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
}
</style>