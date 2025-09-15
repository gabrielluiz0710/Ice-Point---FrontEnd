<script setup lang="ts">
import { computed } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import {
    faMoneyBillWave,
    faCreditCard,
    faReceipt,
    faShieldAlt,
    faTags
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'

const checkoutStore = useCheckoutStore()
const router = useRouter()

const paymentOptions = [
    { value: 'pix', label: 'PIX', icon: faPix, hasDiscount: true },
    { value: 'cash', label: 'Dinheiro', icon: faMoneyBillWave, hasDiscount: true },
    { value: 'card', label: 'Cartão', icon: faCreditCard, hasDiscount: false },
] as const;

const schema = yup.object({
    paymentMethod: yup.string().required('Escolha uma forma de pagamento.'),
    agreedToTerms: yup.boolean().oneOf([true], 'Você deve aceitar os termos e condições.'),
});

const initialValues = {
    paymentMethod: checkoutStore.paymentMethod,
    agreedToTerms: checkoutStore.agreedToTerms,
};

function finalizeOrder(formValues: any) {
    checkoutStore.paymentMethod = formValues.paymentMethod;
    checkoutStore.agreedToTerms = formValues.agreedToTerms;

    console.log("PEDIDO FINALIZADO!", { ...checkoutStore });

    nextTick(() => {
        router.push('/pedido-confirmado');
    });
}
</script>

<template>
    <Form @submit="finalizeOrder" :validation-schema="schema" :initial-values="initialValues" :keep-values="true"
        v-slot="{ meta, setFieldValue, values }">

        <div class="payment-options-section">
            <h3 class="section-subtitle">Qual a forma de pagamento?</h3>
            <Field name="paymentMethod" v-slot="{ value }">
                <div class="choice-buttons">
                    <button v-for="option in paymentOptions" :key="option.value" type="button"
                        :class="{ active: value === option.value }"
                        @click="() => { setFieldValue('paymentMethod', option.value); checkoutStore.paymentMethod = option.value; }">
                        <font-awesome-icon :icon="option.icon" />
                        <span>{{ option.label }}</span>
                    </button>
                </div>
            </Field>
            <ErrorMessage name="paymentMethod" class="error-message" />
        </div>

        <Transition name="fade-step">
            <div v-if="checkoutStore.discount > 0" class="info-box discount">
                <font-awesome-icon :icon="faTags" />
                <p>Oba! Você ganhou <strong>10% de desconto</strong> no valor dos produtos por escolher esta forma de
                    pagamento!</p>
            </div>
        </Transition>

        <div class="info-box notice">
            <font-awesome-icon :icon="faShieldAlt" />
            <p>O pagamento será realizado no momento da <strong>entrega ou retirada</strong> do seu pedido.</p>
        </div>

        <div class="terms-section">
            <Field name="agreedToTerms" type="checkbox" :value="true" :unchecked-value="false"
                v-slot="{ field, value }">
                <label class="checkbox-label">
                    <input type="checkbox" v-bind="field" :checked="value" />
                    <span class="checkbox-custom"></span>
                    Li e aceito os termos e condições.
                </label>
            </Field>
            <ErrorMessage name="agreedToTerms" class="error-message" />
        </div>

        <button type="submit" class="action-button" :disabled="!meta.valid">
            Finalizar Pedido
            <font-awesome-icon :icon="faReceipt" />
        </button>
    </Form>
</template>


<style scoped>
.section-subtitle {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 1.5rem;
}

.choice-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
}

.choice-buttons button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    border: 2px solid var(--color-border);
    border-radius: 12px;
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
    box-shadow: 0 4px 10px rgba(254, 117, 143, 0.1);
}

.choice-buttons svg {
    font-size: 1.8rem;
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

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
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
    background-color: var(--c-text-dark);
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

/* Animação de fade */
.fade-step-enter-active,
.fade-step-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-step-enter-from,
.fade-step-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>