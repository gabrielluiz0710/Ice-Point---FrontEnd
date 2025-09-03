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
    faLocationArrow,
    faMapMarkedAlt,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import type { InferType } from 'yup'

const checkoutStore = useCheckoutStore()
const emit = defineEmits(['completed'])
const isCepLoading = ref(false)
const isAddressSectionFilled = ref(false)
const cepInputRef = ref<HTMLInputElement | null>(null);
const isDeliveryCepLoading = ref(false);
const additionalAddressFormRef = ref<HTMLElement | null>(null);
const setCepInputRef = (el: Element | ComponentPublicInstance | null) => {
    if (el instanceof HTMLInputElement) {
        cepInputRef.value = el;
    }
}
const showCepNotFoundErrorModal = ref(false);
const lastInvalidCepField = ref<'main' | 'delivery' | null>(null);
const showCityErrorModal = ref(false);
const isInvalidCity = ref(false);
const showInvalidMainAddressModal = ref(false);
type FormValues = InferType<typeof schema>;
type FormKeys = keyof FormValues;
const isDeliveryInvalidCity = ref(false);
const deliveryChoiceRef = ref<HTMLElement | null>(null);

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
    city: yup.string().required('A cidade é obrigatória'),
    state: yup.string().required('O estado é obrigatório'),
    deliveryMethod: yup.string().required('Escolha um método'),
    useSameAddressForDelivery: yup.boolean().when('deliveryMethod', {
        is: 'delivery',
        then: schema => schema.required('Por favor, escolha onde entregar.'),
        otherwise: schema => schema.notRequired(),
    }),
    delivery_cep: yup.string().when('useSameAddressForDelivery', {
        is: false,
        then: schema => schema.required('O CEP é obrigatório').matches(/^(\d{5}-\d{3})$/, 'Formato de CEP inválido'),
        otherwise: schema => schema.notRequired(),
    }),
    delivery_street: yup.string().when('useSameAddressForDelivery', {
        is: false, then: schema => schema.required('O endereço é obrigatório'), otherwise: schema => schema.notRequired()
    }),
    delivery_number: yup.string().when('useSameAddressForDelivery', {
        is: false, then: schema => schema.required('O número é obrigatório'), otherwise: schema => schema.notRequired()
    }),
    delivery_complement: yup.string().notRequired(),
    delivery_neighborhood: yup.string().when('useSameAddressForDelivery', {
        is: false, then: schema => schema.required('O bairro é obrigatório'), otherwise: schema => schema.notRequired()
    }),
    delivery_city: yup.string().when('useSameAddressForDelivery', {
        is: false, then: schema => schema.required('A cidade é obrigatória').oneOf(['Uberaba'], 'No momento, entregamos apenas em Uberaba.'), otherwise: schema => schema.notRequired()
    }),
    delivery_state: yup.string().when('useSameAddressForDelivery', {
        is: false, then: schema => schema.required('O estado é obrigatório'), otherwise: schema => schema.notRequired()
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
    cep: checkoutStore.address.cep,
    street: checkoutStore.address.street,
    number: checkoutStore.address.number,
    complement: checkoutStore.address.complement,
    neighborhood: checkoutStore.address.neighborhood,
    city: checkoutStore.address.city,
    state: checkoutStore.address.state,

    delivery_cep: checkoutStore.deliveryAddress.cep,
    delivery_street: checkoutStore.deliveryAddress.street,
    delivery_number: checkoutStore.deliveryAddress.number,
    delivery_complement: checkoutStore.deliveryAddress.complement,
    delivery_neighborhood: checkoutStore.deliveryAddress.neighborhood,
    delivery_city: checkoutStore.deliveryAddress.city,
    delivery_state: checkoutStore.deliveryAddress.state,

    deliveryMethod: checkoutStore.deliveryMethod,
    scheduleDate: checkoutStore.schedule.date,
    scheduleTime: checkoutStore.schedule.time,
    useSameAddressForDelivery:
        checkoutStore.useSameAddressForDelivery !== null &&
            checkoutStore.useSameAddressForDelivery !== undefined
            ? checkoutStore.useSameAddressForDelivery
            : undefined,
};

const { setFieldValue, values, setFieldError } = useForm({
    validationSchema: schema,
    initialValues: initialValues,
});

watch(showInvalidMainAddressModal, async (isShowing, wasShowing) => {
    if (!isShowing && wasShowing) {
        await nextTick();
        cepInputRef.value?.focus();
    }
});

watch(showCityErrorModal, async (isShowing, wasShowing) => {
    if (!isShowing && wasShowing) {
        await nextTick();
        const deliveryCepInput = document.getElementById('delivery_cep');
        if (deliveryCepInput) {
            deliveryCepInput.focus();
        }
    }
});

watch(() => values.useSameAddressForDelivery, (isSelected) => {
    if (isSelected === true) {
        deliveryAddressFormFields.value.forEach(field => {
            setFieldValue(field.name as FormKeys, undefined);
            setFieldError(field.name as FormKeys, undefined);
        });
    }
});

watch(showCepNotFoundErrorModal, async (isShowing, wasShowing) => {
    if (!isShowing && wasShowing) {
        await nextTick();

        if (lastInvalidCepField.value === 'main') {
            cepInputRef.value?.focus();
        } else if (lastInvalidCepField.value === 'delivery') {
            const deliveryCepInput = document.getElementById('delivery_cep');
            deliveryCepInput?.focus();
        }

        lastInvalidCepField.value = null;
    }
});

function selectDeliveryMethod(method: 'delivery' | 'pickup', setFieldValueFn: Function) {
    setFieldValueFn('deliveryMethod', method);
    checkoutStore.deliveryMethod = method;

    if (method === 'pickup') {
        setFieldValueFn('useSameAddressForDelivery', undefined);
        setFieldError('useSameAddressForDelivery', undefined);

        deliveryAddressFormFields.value.forEach(field => {
            setFieldValueFn(field.name as FormKeys, undefined);
            setFieldError(field.name as FormKeys, undefined);
        });
    }
}

function handleUseSameAddress(city: string, onChange: (value: boolean) => void) {
    if (city === 'Uberaba') {
        onChange(true);
    } else {
        showInvalidMainAddressModal.value = true;
    }
}

onMounted(() => {
    cepInputRef.value?.focus();

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

const deliveryAddressFormFields = computed(() =>
    addressFormFields.map(field => ({
        ...field,
        name: `delivery_${field.name}`,
        label: field.label.replace(' (Opcional)', ''),
    }))
);

async function handleCepLookup(cepValue: string, setFieldValueFn: Function, isDelivery: boolean = false) {
    console.log(`[handleCepLookup] 🚀 Iniciando busca...`, { cepValue, isDelivery });

    const cep = cepValue?.replace(/\D/g, '') || '';
    console.log(`[handleCepLookup] CEP limpo: "${cep}"`);

    if (cep.length !== 8) {
        console.log(`[handleCepLookup] ⚠️ Tamanho do CEP inválido. Abortando.`);
        return;
    }

    const prefix = isDelivery ? 'delivery_' : '';
    const loadingRef = isDelivery ? isDeliveryCepLoading : isCepLoading;
    console.log(`[handleCepLookup] Contexto definido como '${isDelivery ? 'Entrega' : 'Principal'}'. Prefixo: "${prefix}"`);

    loadingRef.value = true;
    console.log(`[handleCepLookup] 🔄 Estado de carregamento ativado.`);

    if (isDelivery) {
        isDeliveryInvalidCity.value = false;
    }

    if (!isDelivery) {
        isAddressSectionFilled.value = false;
    }

    const clearFields = () => {
        const fieldsToClear = [`${prefix}street`, `${prefix}neighborhood`, `${prefix}city`, `${prefix}state`];
        console.log(`[handleCepLookup] 🧹 Limpando campos:`, fieldsToClear);
        fieldsToClear.forEach(field => setFieldValueFn(field as FormKeys, ''));
        if (!isDelivery) isAddressSectionFilled.value = false;
    };

    try {
        const apiUrl = `https://viacep.com.br/ws/${cep}/json/`;
        console.log(`[handleCepLookup] 📡 Fazendo requisição para: ${apiUrl}`);
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(`[handleCepLookup] ✅ Resposta recebida da API:`, data);

        if (data.erro) {
            console.warn(`[handleCepLookup] ❌ API retornou 'erro: true'. CEP não encontrado.`);
            lastInvalidCepField.value = isDelivery ? 'delivery' : 'main';
            showCepNotFoundErrorModal.value = true;
            clearFields();
            return;
        }

        if (isDelivery && data.localidade !== 'Uberaba') {
            console.warn(`[handleCepLookup] ❌ Cidade inválida para entrega. Recebido: "${data.localidade}"`);
            showCityErrorModal.value = true;
            isDeliveryInvalidCity.value = true;
            clearFields();
            setFieldValueFn('delivery_cep' as FormKeys, '');
        } else {
            console.log(`[handleCepLookup] ✅ Sucesso! Preenchendo campos do formulário.`);

            console.log(`   ➡️ ${prefix}street:`, data.logradouro);
            setFieldValueFn(`${prefix}street` as FormKeys, data.logradouro);

            console.log(`   ➡️ ${prefix}neighborhood:`, data.bairro);
            setFieldValueFn(`${prefix}neighborhood` as FormKeys, data.bairro);

            console.log(`   ➡️ ${prefix}city:`, data.localidade);
            setFieldValueFn(`${prefix}city` as FormKeys, data.localidade);

            console.log(`   ➡️ ${prefix}state:`, data.uf);
            setFieldValueFn(`${prefix}state` as FormKeys, data.uf);

            if (!isDelivery) {
                isAddressSectionFilled.value = true;
                console.log(`[handleCepLookup] Seção de endereço principal marcada como preenchida.`);
            }

            await nextTick();
            const numberInput = document.getElementById(`${prefix}number`);
            console.log(`[handleCepLookup] 🖱️ Tentando focar no campo de número: #${prefix}number`);
            if (numberInput) {
                numberInput.focus();
                console.log(`[handleCepLookup] Foco aplicado com sucesso.`);
            } else {
                console.warn(`[handleCepLookup] Campo de número não encontrado no DOM.`);
            }
        }

    } catch (error) {
        console.error('[handleCepLookup] 💥 ERRO CRÍTICO na busca do CEP:', error);
        clearFields();
    } finally {
        loadingRef.value = false;
        console.log(`[handleCepLookup] 🏁 Fim da execução. Estado de carregamento desativado.`);
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
    checkoutStore.useSameAddressForDelivery = formValues.useSameAddressForDelivery;

    if (formValues.deliveryMethod === 'delivery' && !formValues.useSameAddressForDelivery) {
        checkoutStore.deliveryAddress = {
            cep: formValues.delivery_cep,
            street: formValues.delivery_street,
            number: formValues.delivery_number,
            complement: formValues.delivery_complement,
            neighborhood: formValues.delivery_neighborhood,
            city: formValues.delivery_city,
            state: formValues.delivery_state,
        };
        checkoutStore.address = {
            cep: formValues.cep,
            street: formValues.street,
            number: formValues.number,
            complement: formValues.complement,
            neighborhood: formValues.neighborhood,
            city: formValues.city,
            state: formValues.state,
        };

    } else {
        checkoutStore.address = {
            cep: formValues.cep,
            street: formValues.street,
            number: formValues.number,
            complement: formValues.complement,
            neighborhood: formValues.neighborhood,
            city: formValues.city,
            state: formValues.state,
        };
        checkoutStore.deliveryAddress = {
            cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
        };
    }

    checkoutStore.deliveryMethod = formValues.deliveryMethod;
    checkoutStore.schedule = { date: formValues.scheduleDate, time: formValues.scheduleTime };

    emit('completed');
}

function getRef(field: { name: string }) {
    if (field.name === 'cep') {
        return setCepInputRef;
    }
    return undefined;
}
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="showCepNotFoundErrorModal" class="modal-overlay" @click="showCepNotFoundErrorModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-icon-wrapper">
                    <font-awesome-icon :icon="faQuestionCircle" class="modal-icon" />
                </div>
                <h3>CEP Não Encontrado</h3>
                <p>O CEP digitado não foi encontrado em nossa base de dados. Por favor, verifique o número e tente
                    novamente.</p>
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
                <p>No momento, só conseguimos processar pedidos para a cidade de <strong>Uberaba</strong>. Por favor,
                    insira um CEP válido.</p>
                <button @click="showCityErrorModal = false" class="modal-button">Entendi</button>
            </div>
        </div>
    </Transition>

    <Transition name="modal-fade">
        <div v-if="showInvalidMainAddressModal" class="modal-overlay" @click="showInvalidMainAddressModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-icon-wrapper">
                    <font-awesome-icon :icon="faExclamationTriangle" class="modal-icon" />
                </div>
                <h3>Endereço Principal Fora da Área de Entrega</h3>
                <p>No momento, só conseguimos processar pedidos para a cidade de <strong>Uberaba</strong>. Por favor,
                    insira um CEP válido.</p>
                <button @click="showInvalidMainAddressModal = false" class="modal-button">Entendi</button>
            </div>
        </div>
    </Transition>

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
                            <input :ref="getRef(fieldData)" v-bind="veeField" :id="fieldData.name"
                                :placeholder="fieldData.placeholder" :type="fieldData.type"
                                :readonly="fieldData.readonly"
                                @input="handleInput($event, fieldData.mask, veeField.onChange)"
                                @blur="fieldData.name === 'cep' ? handleCepLookup(veeField.value, setFieldValue, false) : null"
                                :disabled="(isCepLoading && fieldData.name !== 'cep')" />
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
            <div v-if="values.deliveryMethod === 'delivery'" class="delivery-details-wrapper">
                <div class="info-box delivery">
                    <font-awesome-icon :icon="faTruck" />
                    <p>Uma taxa de entrega fixa de <strong>R$ 20,00</strong> será adicionada ao seu pedido.</p>
                </div>

                <div ref="deliveryChoiceRef" class="delivery-address-choice">
                    <h3 class="section-subtitle--small">Onde entregar?</h3>
                    <Field name="useSameAddressForDelivery" v-slot="{ field, value }">
                        <div class="choice-buttons">
                            <button type="button" :class="{ active: value === true }"
                                @click="handleUseSameAddress(values.city, field.onChange)"> <font-awesome-icon
                                    :icon="faLocationArrow" />
                                <span>Usar o mesmo endereço</span>
                            </button>

                            <button type="button" :class="{ active: value === false }"
                                @click="setFieldValue('useSameAddressForDelivery', false)">
                                <font-awesome-icon :icon="faMapMarkedAlt" />
                                <span>Usar outro endereço</span>
                            </button>
                        </div>
                    </Field>
                    <ErrorMessage name="useSameAddressForDelivery" class="error-message" />
                </div>

                <Transition name="fade-step">
                    <div ref="additionalAddressFormRef" v-if="values.useSameAddressForDelivery === false"
                        class="additional-address-form">
                        <fieldset :disabled="isDeliveryCepLoading" class="fieldset-additional-address">
                            <div class="form-grid">
                                <div v-for="(fieldData, index) in deliveryAddressFormFields" :key="fieldData.name"
                                    class="form-field" :style="{ animationDelay: `${index * 80}ms` }">
                                    <label :for="fieldData.name">{{ fieldData.label }}</label>
                                    <div class="input-wrapper">
                                        <font-awesome-icon
                                            v-if="fieldData.name === 'delivery_cep' && isDeliveryCepLoading"
                                            :icon="faSpinner" class="input-icon spin" />
                                        <font-awesome-icon v-else-if="fieldData.icon" :icon="fieldData.icon"
                                            class="input-icon" />

                                        <Field :name="fieldData.name" v-slot="{ field: veeField }">
                                            <input v-bind="veeField" :id="fieldData.name"
                                                :placeholder="fieldData.placeholder" :type="fieldData.type"
                                                :readonly="fieldData.readonly"
                                                @input="handleInput($event, fieldData.mask, veeField.onChange)"
                                                @blur="fieldData.name === 'delivery_cep' ? handleCepLookup(veeField.value, setFieldValue, true) : null"
                                                @focus="(fieldData.name === 'delivery_cep') && (isDeliveryInvalidCity = false)"
                                                :disabled="(isDeliveryCepLoading && fieldData.name !== 'delivery_cep') || (isDeliveryInvalidCity && fieldData.name !== 'delivery_cep')" />
                                        </Field>
                                    </div>
                                    <ErrorMessage :name="fieldData.name" class="error-message" />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </Transition>
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

        <button type="submit" class="action-button" :disabled="!meta.valid || isCepLoading || isDeliveryCepLoading">
            <span v-if="isCepLoading">Buscando CEP...</span>
            <span v-else>Ir para Pagamento</span>
            <font-awesome-icon v-if="!isCepLoading" :icon="faArrowRight" />
        </button>
    </Form>
</template>

<style scoped>
.delivery-details-wrapper {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background-color: #f9fafb;
    border-radius: 16px;
    border: 1px solid var(--color-border);
}

.info-box.delivery {
    margin-top: 0;
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