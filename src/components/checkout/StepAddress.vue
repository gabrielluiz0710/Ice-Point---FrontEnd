<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import {
    faArrowRight,
    faMapPin,
    faRoad,
    faHashtag,
    faBuilding,
    faCity,
    faSpinner,
    faBoxOpen,
    faShippingFast,
    faCalendar,
    faClock,
    faTruck
} from '@fortawesome/free-solid-svg-icons'

const checkoutStore = useCheckoutStore()
const emit = defineEmits(['completed'])
const isCepLoading = ref(false)
const isAddressSectionFilled = ref(false)

const minDeliveryDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
});

const maxDeliveryDate = computed(() => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    return maxDate.toISOString().split('T')[0];
});

const availableTimes = computed(() => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
        times.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return times;
});

const schema = yup.object({
    cep: yup.string().required('O CEP é obrigatório').matches(/^(\d{5}-\d{3})$/, 'Formato de CEP inválido'),
    street: yup.string().required('O endereço é obrigatório'),
    number: yup.string().required('O número é obrigatório'),
    complement: yup.string(),
    neighborhood: yup.string().required('O bairro é obrigatório'),
    city: yup.string()
        .required('A cidade é obrigatória')
        .oneOf(['Uberaba'], 'No momento, entregamos apenas em Uberaba.'),
    state: yup.string().required('O estado é obrigatório'),
    deliveryMethod: yup.string().required('Escolha um método'),
    scheduleDate: yup.date()
        .transform((value, originalValue) => {
            return originalValue ? new Date(originalValue) : null;
        })
        .required('Escolha uma data')
        .min(minDeliveryDate.value, 'A data deve ser a partir de amanhã')
        .max(maxDeliveryDate.value, 'O agendamento deve ser em até 6 meses'),
    scheduleTime: yup.string().required('Escolha um horário'),
});

const initialValues = {
    ...checkoutStore.address,
    deliveryMethod: checkoutStore.address.cep ? checkoutStore.deliveryMethod : null,
    scheduleDate: checkoutStore.schedule.date,
    scheduleTime: checkoutStore.schedule.time,
};

function selectDeliveryMethod(method: 'delivery' | 'pickup', setFieldValueFn: Function) {
    setFieldValueFn('deliveryMethod', method);
    checkoutStore.deliveryMethod = method;
}

onMounted(() => {
    if (checkoutStore.address.cep && checkoutStore.address.street) {
        isAddressSectionFilled.value = true;
    }
    if (initialValues.deliveryMethod) {
        checkoutStore.deliveryMethod = initialValues.deliveryMethod;
    }
});

const addressFormFields = [
    { name: 'cep', label: 'CEP', type: 'tel', mask: '#####-###', placeholder: '00000-000', icon: faMapPin },
    { name: 'street', label: 'Endereço', type: 'text', placeholder: 'Nome da Rua', icon: faRoad, readonly: true },
    { name: 'number', label: 'Número', type: 'text', placeholder: 'Digite o número', icon: faHashtag },
    { name: 'complement', label: 'Complemento (Opcional)', type: 'text', placeholder: 'Apto, bloco, etc.', icon: faBuilding },
    { name: 'neighborhood', label: 'Bairro', type: 'text', placeholder: 'Nome do Bairro', icon: faCity, readonly: true },
    { name: 'city', label: 'Cidade', type: 'text', placeholder: 'Nome da Cidade', icon: faCity, readonly: true },
    { name: 'state', label: 'Estado', type: 'text', placeholder: 'Nome do Estado', icon: faCity, readonly: true },
]

async function handleCepLookup(cepValue: string, setFieldValue: Function) {
    const cep = cepValue?.replace(/\D/g, '') || '';
    if (cep.length !== 8) return;

    isCepLoading.value = true;
    isAddressSectionFilled.value = false;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
            setFieldValue('street', data.logradouro);
            setFieldValue('neighborhood', data.bairro);
            setFieldValue('city', data.localidade);
            setFieldValue('state', data.uf);
            isAddressSectionFilled.value = true;
            document.getElementById('number')?.focus();
        } else {
            ['street', 'neighborhood', 'city', 'state'].forEach(field => setFieldValue(field, ''));
        }
    } catch (error) {
        console.error('Falha ao buscar CEP:', error);
    } finally {
        isCepLoading.value = false;
    }
}

function applyMask(value: string, mask: string): string {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    let maskedValue = '';
    let digitIndex = 0;
    for (let i = 0; i < mask.length; i++) {
        if (digitIndex >= cleanValue.length) break;
        const maskChar = mask[i];
        if (maskChar === '#') {
            maskedValue += cleanValue[digitIndex];
            digitIndex++;
        } else {
            maskedValue += maskChar;
        }
    }
    return maskedValue;
}

function handleInput(event: Event, mask: string | undefined, fieldOnChange: (value: any) => void) {
    if (!mask) {
        fieldOnChange((event.target as HTMLInputElement).value);
        return;
    }
    const maskedValue = applyMask((event.target as HTMLInputElement).value, mask);
    (event.target as HTMLInputElement).value = maskedValue;
    fieldOnChange(maskedValue);
}

function onSubmit(formValues: any) {
    checkoutStore.address = {
        cep: formValues.cep,
        street: formValues.street,
        number: formValues.number,
        complement: formValues.complement,
        neighborhood: formValues.neighborhood,
        city: formValues.city,
        state: formValues.state,
    };
    checkoutStore.deliveryMethod = formValues.deliveryMethod;
    checkoutStore.schedule = { date: formValues.scheduleDate, time: formValues.scheduleTime };
    emit('completed');
}
</script>

<template>
    <Form @submit="onSubmit" :validation-schema="schema" :initial-values="initialValues" :keep-values="true"
        v-slot="{ meta, setFieldValue, values }">
        <fieldset :disabled="isCepLoading" class="form-fieldset">
            <div class="form-grid">
                <div v-for="(fieldData, index) in addressFormFields" :key="fieldData.name" class="form-field"
                    :style="{ animationDelay: `${index * 80}ms` }">
                    <label :for="fieldData.name">{{ fieldData.label }}</label>
                    <div class="input-wrapper">
                        <font-awesome-icon v-if="fieldData.name === 'cep' && isCepLoading" :icon="faSpinner"
                            class="input-icon spin" />
                        <font-awesome-icon v-else-if="fieldData.icon" :icon="fieldData.icon" class="input-icon" />

                        <Field :name="fieldData.name" v-slot="{ field: veeField }">
                            <input v-bind="veeField" :id="fieldData.name" :placeholder="fieldData.placeholder"
                                :type="fieldData.type" :readonly="fieldData.readonly"
                                @input="handleInput($event, fieldData.mask, veeField.onChange)"
                                @blur="fieldData.name === 'cep' ? handleCepLookup(veeField.value, setFieldValue) : null"
                                :disabled="isCepLoading && fieldData.name !== 'cep'" />
                        </Field>
                    </div>
                    <ErrorMessage :name="fieldData.name" class="error-message" />
                </div>
            </div>
        </fieldset>

        <div v-if="isAddressSectionFilled || values.cep" class="delivery-options-section">
            <h3 class="section-subtitle">Como você quer receber seu pedido?</h3>
            <Field name="deliveryMethod" v-slot="{ value }">
                <div class="choice-buttons">
                    <button type="button" :class="{ active: value === 'delivery' }"
                        @click="selectDeliveryMethod('delivery', setFieldValue)">
                        <font-awesome-icon :icon="faShippingFast" />
                        <span>Entregar no meu endereço</span>
                    </button>

                    <button type="button" :class="{ active: value === 'pickup' }"
                        @click="selectDeliveryMethod('pickup', setFieldValue)">
                        <font-awesome-icon :icon="faBoxOpen" />
                        <span>Retirar na sorveteria</span>
                    </button>
                </div>
            </Field>
            <ErrorMessage name="deliveryMethod" class="error-message" />
        </div>

        <Transition name="fade-step">
            <div v-if="values.deliveryMethod === 'delivery'" class="info-box delivery">
                <font-awesome-icon :icon="faTruck" />
                <p>
                    Uma taxa de entrega fixa de <strong>R$ 20,00</strong> será adicionada ao seu pedido.
                </p>
            </div>
        </Transition>

        <div v-if="values.deliveryMethod" class="schedule-section">
            <h3 class="section-subtitle">Quando?</h3>
            <div class="form-grid">
                <div class="form-field">
                    <label for="scheduleDate">Data</label>
                    <div class="input-wrapper">
                        <font-awesome-icon :icon="faCalendar" class="input-icon" />
                        <Field name="scheduleDate" type="date" :min="minDeliveryDate" :max="maxDeliveryDate"
                            id="scheduleDate" />
                    </div>
                    <ErrorMessage name="scheduleDate" class="error-message" />
                </div>
                <div class="form-field">
                    <label for="scheduleTime">Horário</label>
                    <div class="input-wrapper">
                        <font-awesome-icon :icon="faClock" class="input-icon" />
                        <Field name="scheduleTime" as="select" id="scheduleTime">
                            <option value="" disabled>Selecione um horário</option>
                            <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
                        </Field>
                    </div>
                    <ErrorMessage name="scheduleTime" class="error-message" />
                </div>
            </div>
        </div>

        <button type="submit" class="action-button" :disabled="!meta.valid || isCepLoading">
            <span v-if="isCepLoading">Buscando CEP...</span>
            <span v-else>Ir para Pagamento</span>
            <font-awesome-icon v-if="!isCepLoading" :icon="faArrowRight" />
        </button>
    </Form>
</template>

<style scoped>
.action-button span {
    font-weight: inherit;
}

.form-fieldset {
    border: none;
    padding: 0;
    margin: 0;
    transition: opacity 0.3s ease;
}

.form-fieldset:disabled {
    opacity: 0.5;
    pointer-events: none;
}

.section-subtitle {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text);
    margin-top: 2rem;
    margin-bottom: 1rem;
    border-top: 1px solid var(--color-border);
    padding-top: 1.5rem;
}

.choice-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
    background-color: var(--color-background-soft);
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
    font-size: 1.5rem;
}

.form-field select,
.form-field input[type="date"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

@keyframes field-enter {
    from {
        opacity: 0;
        transform: translateY(20px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem 1.25rem
}

.form-field {
    display: flex;
    flex-direction: column;
    opacity: 0;
    animation: field-enter .5s cubic-bezier(.25, .46, .45, .94) forwards
}

.form-field label {
    font-size: .9rem;
    font-weight: 500;
    margin-bottom: .5rem;
    color: var(--c-text)
}

.input-wrapper {
    position: relative
}

.input-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: var(--c-text-light);
    transition: color .2s
}

.form-field input,
.form-field select {
    padding: .9rem .9rem .9rem 3rem;
    border-radius: 12px;
    border: 2px solid var(--color-border);
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    background-color: var(--color-background-soft);
    transition: border-color .2s, box-shadow .2s;
    width: 100%
}

.form-field input[readonly] {
    background-color: #e9ecef;
    cursor: not-allowed
}

.form-field input:focus,
.form-field select:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 4px rgba(25, 197, 203, .2)
}

.form-field input:focus~.input-icon,
.form-field select:focus~.input-icon {
    color: var(--c-azul)
}

.error-message {
    color: #e53e3e;
    font-size: .85rem;
    margin-top: .4rem;
    padding-left: .2rem;
    animation: shake .3s
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0)
    }

    25% {
        transform: translateX(-3px)
    }

    75% {
        transform: translateX(3px)
    }
}

.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .75rem;
    background: linear-gradient(45deg, var(--c-rosa), var(--c-rosa-dark));
    color: #fff;
    border: none;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all .3s ease;
    width: 100%;
    margin-top: 2rem;
    box-shadow: 0 4px 15px rgba(254, 117, 143, .3)
}

.action-button:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(254, 117, 143, .4)
}

.action-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none
}

.spin {
    animation: spin 1s linear infinite
}

@keyframes spin {
    from {
        transform: translateY(-50%) rotate(0deg)
    }

    to {
        transform: translateY(-50%) rotate(360deg)
    }
}

.info-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    margin-top: 1.5rem;
    font-weight: 500;
}

/* Cor específica para o aviso de entrega */
.info-box.delivery {
    background-color: #f0f4ff;
    /* Um azul neutro */
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