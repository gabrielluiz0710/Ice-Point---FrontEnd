<script setup lang="ts">
import { ref, computed, onMounted, type ComponentPublicInstance, watch, nextTick } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { Field, Form, ErrorMessage, useForm } from 'vee-validate'
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
    faTruck,
    faExclamationTriangle,
    faHome,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'
import CartSelectionStep from './CartSelectionStep.vue'

const checkoutStore = useCheckoutStore()
const userStore = useUserStore()
const emit = defineEmits(['completed'])

const isCepLoading = ref(false)
const cepInputRef = ref<HTMLInputElement | null>(null);
const selectedAddressId = ref<number | null>(null);

const showCepNotFoundErrorModal = ref(false);
const showCityErrorModal = ref(false);

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

const savedAddresses = computed(() => {
    if (userStore.isAuthenticated && userStore.user?.addresses) {
        return userStore.user.addresses;
    }
    return [];
});

const schema = yup.object({
    deliveryMethod: yup.string().required('Escolha um método'),

    cep: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('O CEP é obrigatório').matches(/^(\d{5}-\d{3})$/, 'Formato de CEP inválido'),
        otherwise: schema => schema.notRequired()
    }),
    street: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('O endereço é obrigatório'),
        otherwise: schema => schema.notRequired()
    }),
    number: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('O número é obrigatório'),
        otherwise: schema => schema.notRequired()
    }),
    complement: yup.string(),
    neighborhood: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('O bairro é obrigatório'),
        otherwise: schema => schema.notRequired()
    }),
    city: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('A cidade é obrigatória').oneOf(['Uberaba'], 'No momento, entregamos apenas em Uberaba.'),
        otherwise: schema => schema.notRequired()
    }),
    state: yup.string().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('O estado é obrigatório'),
        otherwise: schema => schema.notRequired()
    }),

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
    deliveryMethod: checkoutStore.deliveryMethod || null,
    cep: checkoutStore.address.cep,
    street: checkoutStore.address.street,
    number: checkoutStore.address.number,
    complement: checkoutStore.address.complement,
    neighborhood: checkoutStore.address.neighborhood,
    city: checkoutStore.address.city,
    state: checkoutStore.address.state,
    scheduleDate: checkoutStore.schedule.date,
    scheduleTime: checkoutStore.schedule.time,
};

const { setFieldValue, values, handleSubmit, meta } = useForm({
    validationSchema: schema,
    initialValues: initialValues,
});


function selectDeliveryMethod(method: 'delivery' | 'pickup') {
    setFieldValue('deliveryMethod', method);
    checkoutStore.deliveryMethod = method;

    if (method === 'pickup') {
        selectedAddressId.value = null;
    }
}

function selectSavedAddress(addr: any) {
    selectedAddressId.value = addr.id;
    setFieldValue('cep', applyMask(addr.zip, '#####-###'));
    setFieldValue('street', addr.street);
    setFieldValue('number', addr.number);
    setFieldValue('complement', addr.complement || '');
    setFieldValue('neighborhood', addr.neighborhood);
    setFieldValue('city', addr.city);
    setFieldValue('state', addr.state);
}

async function handleCepLookup(cepValue: string) {
    const cep = cepValue?.replace(/\D/g, '') || '';

    if (cep.length !== 8) return;

    selectedAddressId.value = null;
    isCepLoading.value = true;

    ['street', 'neighborhood', 'city', 'state'].forEach(field => setFieldValue(field as any, ''));

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            showCepNotFoundErrorModal.value = true;
            return;
        }

        if (data.localidade !== 'Uberaba') {
            showCityErrorModal.value = true;
            setFieldValue('cep', '');
            return;
        }

        setFieldValue('street', data.logradouro);
        setFieldValue('neighborhood', data.bairro);
        setFieldValue('city', data.localidade);
        setFieldValue('state', data.uf);

        await nextTick();
        document.getElementById('number')?.focus();

    } catch (error) {
        console.error(error);
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

function normalize(value: string | undefined | null) {
    return value ? String(value).replace(/\D/g, '').trim() : '';
}

function cleanString(str: string | undefined | null) {
    return (str || '').toString().trim();
}

const onSubmit = handleSubmit((formValues) => {
    checkoutStore.deliveryMethod = formValues.deliveryMethod as 'delivery' | 'pickup';

    if (formValues.deliveryMethod === 'delivery') {
        checkoutStore.address = {
            cep: formValues.cep,
            street: formValues.street,
            number: formValues.number,
            complement: formValues.complement,
            neighborhood: formValues.neighborhood,
            city: formValues.city,
            state: formValues.state,
        };
        checkoutStore.deliveryAddress = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
        checkoutStore.useSameAddressForDelivery = true;
    } else {
        checkoutStore.address = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
    }

    checkoutStore.schedule = { date: formValues.scheduleDate, time: formValues.scheduleTime };
    emit('completed');
});

const setCepInputRef = (el: Element | ComponentPublicInstance | null) => {
    if (el instanceof HTMLInputElement) {
        cepInputRef.value = el;
    }
}

const dateTimeKey = computed(() => {
    if (!values.scheduleDate || !values.scheduleTime) return undefined;
    return `${values.scheduleDate}-${values.scheduleTime}`;
});

watch([() => values.scheduleDate, () => values.scheduleTime], ([newDate, newTime]) => {
    checkoutStore.schedule = {
        date: newDate || '',
        time: newTime || ''
    };
    checkoutStore.selectedCarts = [];
});

watch(values, (newValues) => {
    if (savedAddresses.value.length > 0) {

        const match = savedAddresses.value.find(addr => {
            const formCep = normalize(newValues.cep);
            const addrCep = normalize(addr.zip);

            const isCepEqual = formCep === addrCep;
            const isStreetEqual = cleanString(newValues.street) === cleanString(addr.street);
            const isNumberEqual = cleanString(newValues.number) === cleanString(addr.number);
            const isCompEqual = cleanString(newValues.complement) === cleanString(addr.complement);
            const isNeighborhoodEqual = cleanString(newValues.neighborhood) === cleanString(addr.neighborhood);

            return isCepEqual && isStreetEqual && isNumberEqual && isCompEqual && isNeighborhoodEqual;
        });

        selectedAddressId.value = match ? (match.id ?? null) : null;
    }
}, { deep: true });

onMounted(async () => {
    await nextTick();

    const storeCep = normalize(checkoutStore.address.cep);
    const storeNumber = normalize(checkoutStore.address.number);
    const hasStoreData = storeCep && storeNumber;

    if (savedAddresses.value.length > 0) {
        if (hasStoreData) {
            const match = savedAddresses.value.find(addr => {
                const addrZip = normalize(addr.zip);
                const addrNum = normalize(addr.number);
                return addrZip === storeCep && addrNum === storeNumber;
            });

            if (match) {
                selectedAddressId.value = match.id ?? null;
            }
        } else {
            const principal = savedAddresses.value.find(a => a.principal);
            if (principal) {
                selectSavedAddress(principal);
            }
        }
    } else {
        if (!hasStoreData) {
            cepInputRef.value?.focus();
        }
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
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="showCepNotFoundErrorModal" class="modal-overlay" @click="showCepNotFoundErrorModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-icon-wrapper">
                    <font-awesome-icon :icon="faQuestionCircle" class="modal-icon" />
                </div>
                <h3>CEP Não Encontrado</h3>
                <p>O CEP digitado não foi encontrado. Verifique e tente novamente.</p>
                <button @click="showCepNotFoundErrorModal = false" class="modal-button">Entendi</button>
            </div>
        </div>
    </Transition>

    <Transition name="modal-fade">
        <div v-if="showCityErrorModal" class="modal-overlay" @click="showCityErrorModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-icon-wrapper">
                    <font-awesome-icon :icon="faExclamationTriangle" class="modal-icon" />
                </div>
                <h3>Fora da Área de Entrega</h3>
                <p>No momento, entregamos apenas em <strong>Uberaba</strong>.</p>
                <button @click="showCityErrorModal = false" class="modal-button">Entendi</button>
            </div>
        </div>
    </Transition>

    <form @submit="onSubmit">

        <div class="delivery-options-section">
            <h3 class="section-subtitle-endereco">Como você quer receber seu pedido?</h3>
            <Field name="deliveryMethod" v-slot="{ value }">
                <div class="choice-buttons">
                    <button type="button" :class="{ active: value === 'delivery' }"
                        @click="selectDeliveryMethod('delivery')">
                        <font-awesome-icon :icon="faShippingFast" />
                        <span>Entregar no meu endereço</span>
                    </button>

                    <button type="button" :class="{ active: value === 'pickup' }"
                        @click="selectDeliveryMethod('pickup')">
                        <font-awesome-icon :icon="faBoxOpen" />
                        <span>Retirar na sorveteria</span>
                    </button>
                </div>
            </Field>
            <ErrorMessage name="deliveryMethod" class="error-message" />
        </div>

        <Transition name="fade-step">
            <div v-if="values.deliveryMethod === 'delivery'">

                <div class="info-box delivery" style="margin-bottom: 1.5rem;">
                    <font-awesome-icon :icon="faTruck" />
                    <p>Uma taxa de entrega fixa de <strong>R$ 20,00</strong> será adicionada ao seu pedido.</p>
                </div>

                <div v-if="savedAddresses.length > 0" class="saved-addresses-section">
                    <h3 class="section-subtitle-endereco">Meus Endereços</h3>
                    <div class="address-cards-grid">
                        <div v-for="addr in savedAddresses" :key="addr.id" class="address-card"
                            :class="{ active: selectedAddressId === addr.id }" @click="selectSavedAddress(addr)">
                            <div class="card-header-addr">
                                <font-awesome-icon :icon="faHome" />
                                <span v-if="addr.principal" class="principal-tag">Principal</span>
                            </div>
                            <p class="addr-text"><strong>{{ addr.street }}, {{ addr.number }}</strong></p>
                            <p class="addr-text">{{ addr.neighborhood }}</p>
                            <p class="addr-text">{{ addr.city }} - {{ addr.state }}</p>
                            <p class="addr-text cep">{{ addr.zip }}</p>
                        </div>
                    </div>
                </div>

                <h3 class="section-subtitle-endereco" v-if="savedAddresses.length > 0">Ou preencha um novo:</h3>
                <fieldset :disabled="isCepLoading" class="form-fieldset">
                    <div class="form-grid">
                        <div v-for="(fieldData, index) in addressFormFields" :key="fieldData.name" class="form-field"
                            :style="{ animationDelay: `${index * 80}ms` }">
                            <label :for="fieldData.name">{{ fieldData.label }}</label>
                            <div class="input-wrapper">
                                <font-awesome-icon v-if="fieldData.name === 'cep' && isCepLoading" :icon="faSpinner"
                                    class="input-icon spin" />
                                <font-awesome-icon v-else-if="fieldData.icon" :icon="fieldData.icon"
                                    class="input-icon" />

                                <Field :name="fieldData.name" v-slot="{ field: veeField }">
                                    <input :ref="fieldData.name === 'cep' ? setCepInputRef : undefined"
                                        v-bind="veeField" :id="fieldData.name" :placeholder="fieldData.placeholder"
                                        :type="fieldData.type" :readonly="fieldData.readonly"
                                        @input="handleInput($event, fieldData.mask, veeField.onChange)"
                                        @blur="fieldData.name === 'cep' ? handleCepLookup(veeField.value) : null"
                                        :disabled="(isCepLoading && fieldData.name !== 'cep')" />
                                </Field>
                            </div>
                            <ErrorMessage :name="fieldData.name" class="error-message" />
                        </div>
                    </div>
                </fieldset>
            </div>
        </Transition>

        <Transition name="fade-step">
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
        </Transition>

        <Transition name="fade-step">
            <div v-if="values.scheduleDate && values.scheduleTime && values.deliveryMethod" class="cart-step-wrapper">
                <h3 class="section-subtitle-endereco">Seleção de Carrinhos</h3>
                <CartSelectionStep :key="dateTimeKey" @completed="() => { }" />
            </div>
        </Transition>

        <button type="submit" class="action-button"
            :disabled="!meta.valid || isCepLoading || !checkoutStore.isCartSelectionComplete">

            <span v-if="isCepLoading">Buscando CEP...</span>
            <span v-else-if="!values.deliveryMethod">Escolha o método de entrega</span>
            <span v-else-if="!values.scheduleDate">Escolha a Data</span>
            <span v-else-if="!checkoutStore.isCartSelectionComplete">Selecione os Carrinhos</span>
            <span v-else>Ir para Pagamento</span>

            <font-awesome-icon v-if="!isCepLoading && values.deliveryMethod" :icon="faArrowRight" />
        </button>
    </form>
</template>
<style scoped>
.cart-step-wrapper {
    margin-top: 2rem;
    border-top: 1px dashed var(--color-border);
    padding-top: 2rem;
}

.saved-addresses-section {
    margin-bottom: 2rem;
}

.address-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.address-card {
    border: 2px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--c-branco);
}

.address-card:hover {
    border-color: var(--c-azul-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.address-card.active {
    border-color: var(--c-azul);
    background-color: #f0f9ff;
    box-shadow: 0 0 0 2px rgba(25, 197, 203, 0.2);
}

.card-header-addr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    color: var(--c-azul);
}

.principal-tag {
    background-color: var(--c-azul);
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}

.addr-text {
    font-size: 0.9rem;
    color: var(--c-text);
    margin: 0;
    line-height: 1.4;
}

.addr-text.cep {
    color: var(--c-text-light);
    font-size: 0.8rem;
    margin-top: 0.5rem;
}

.delivery-details-wrapper {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background-color: #f9fafb;
    border-radius: 16px;
    border: 1px solid var(--color-border);
}

.info-box.delivery {
    margin-top: 2rem;
}

.delivery-address-choice {
    margin-top: 2rem;
}

.section-subtitle--small {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 1rem;
}

.fieldset-additional-address {
    border: none;
}

.additional-address-form {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
    transform: scale(0.9);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background-color: #fff;
    padding: 2.5rem;
    border-radius: 16px;
    width: 90%;
    max-width: 450px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-top: 5px solid var(--c-amarelo, #ffc107);
}

.modal-icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background-color: #fff8e1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-icon {
    font-size: 2.5rem;
    color: var(--c-amarelo, #ffc107);
}

.modal-content h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
    color: var(--c-text-dark);
}

.modal-content p {
    margin-bottom: 2rem;
    color: var(--vt-c-text-light-2);
    line-height: 1.6;
}

.modal-button {
    width: 100%;
    padding: 0.9rem 1rem;
    border: none;
    background-color: var(--c-azul-dark);
    color: #fff;
    border-radius: 12px;
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.modal-button:hover {
    background-color: #0d7175;
    transform: translateY(-2px);
}

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

.section-subtitle-endereco {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 1rem;
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
    background-color: var(--c-branco);
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

.info-box.delivery {
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