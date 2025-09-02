<script setup lang="ts">
import { useCheckoutStore } from '@/stores/checkout'
import { Field, Form, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import {
    faArrowRight,
    faUser,
    faEnvelope,
    faIdCard,
    faMobileAlt,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'

const checkoutStore = useCheckoutStore()
const emit = defineEmits(['completed'])
const showAgeModal = ref(false)

type PersonalData = typeof checkoutStore.personalData;

interface FormField {
    name: keyof PersonalData;
    label: string;
    type: string;
    placeholder: string;
    icon: any;
    mask?: string;
}

const schema = yup.object({
    fullName: yup.string().required('O nome é obrigatório').min(3, 'Digite seu nome completo'),
    email: yup.string().required('O email é obrigatório').email('Digite um email válido'),
    cpf: yup.string().required('O CPF é obrigatório').matches(/^(\d{3}\.\d{3}\.\d{3}-\d{2})$/, 'CPF no formato 000.000.000-00'),
    phone: yup.string().required('O celular é obrigatório').matches(/^(\(\d{2}\) \d{5}-\d{4})$/, 'Celular no formato (00) 00000-0000'),
    birthDate: yup
        .string()
        .required('A data é obrigatória')
        .matches(/^(\d{2}\/\d{2}\/\d{4})$/, 'Data no formato DD/MM/AAAA')
        .test('isValidDate', 'A data informada é inválida', (value) => {
            if (!value) return true
            const parts = value.split('/')
            if (parts.length !== 3) return false

            const day = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10)
            const year = parseInt(parts[2], 10)

            if (isNaN(day) || isNaN(month) || isNaN(year)) return false
            if (month < 1 || month > 12) return false

            const date = new Date(year, month - 1, day)
            return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        })
        .test('isNotTooOld', 'Verifique o ano de nascimento', (value) => {
            if (!value) return true
            const [day, month, year] = value.split('/').map(Number)
            const birthDate = new Date(year, month - 1, day)
            const today = new Date()
            const maxAgeDate = new Date()
            maxAgeDate.setFullYear(today.getFullYear() - 150)
            return birthDate >= maxAgeDate && birthDate < today
        })
});

const formFields: FormField[] = [
    { name: 'fullName', label: 'Nome Completo', type: 'text', placeholder: 'Digite seu nome', icon: faUser },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com', icon: faEnvelope },
    { name: 'cpf', label: 'CPF', type: 'text', mask: '###.###.###-##', placeholder: '000.000.000-00', icon: faIdCard },
    { name: 'phone', label: 'Celular', type: 'tel', mask: '(##) #####-####', placeholder: '(99) 99999-9999', icon: faMobileAlt },
    { name: 'birthDate', label: 'Data de Nascimento', type: 'text', mask: '##/##/####', placeholder: 'DD/MM/AAAA', icon: faCalendarAlt },
]

function applyMask(value: string, mask: string): string {
    if (!value) return '';

    const cleanValue = value.replace(/\D/g, '');
    let maskedValue = '';
    let digitIndex = 0;

    for (let i = 0; i < mask.length; i++) {
        if (digitIndex >= cleanValue.length) {
            break;
        }
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

function checkAgeAndShowModal(value: string | undefined) {
    if (!value || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return

    const [day, month, year] = value.split('/').map(Number)
    const birthDate = new Date(year, month - 1, day)

    if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
        return
    }

    const today = new Date()
    const eighteenYearsAgo = new Date()
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18)

    if (birthDate > eighteenYearsAgo) {
        showAgeModal.value = true
    }
}

function onSubmit(values: any) {
    checkoutStore.personalData = { ...checkoutStore.personalData, ...values };
    emit('completed');
}
</script>

<template>
    <Form @submit="onSubmit" :validation-schema="schema" :initial-values="checkoutStore.personalData" v-slot="{ meta }">
        <div class="form-grid">
            <div v-for="(fieldData, index) in formFields" :key="fieldData.name" class="form-field"
                :style="{ animationDelay: `${index * 80}ms` }">
                <label :for="fieldData.name">{{ fieldData.label }}</label>
                <div class="input-wrapper">
                    <font-awesome-icon v-if="fieldData.icon" :icon="fieldData.icon" class="input-icon" />

                    <Field :name="fieldData.name" v-model="checkoutStore.personalData[fieldData.name]"
                        v-slot="{ field: veeField }">
                        <input v-bind="veeField" :placeholder="fieldData.placeholder" :type="fieldData.type"
                            :id="fieldData.name" @input="handleInput($event, fieldData.mask, veeField.onChange)"
                            @blur="fieldData.name === 'birthDate' ? checkAgeAndShowModal(veeField.value) : null" />
                    </Field>
                </div>
                <ErrorMessage :name="fieldData.name" class="error-message" />
            </div>
        </div>

        <button type="submit" class="action-button" :disabled="!meta.valid">
            Continuar para Endereço
            <font-awesome-icon :icon="faArrowRight" />
        </button>
    </Form>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="showAgeModal" class="age-modal-overlay">
                <div class="age-modal-box">
                    <h4>Pedido Bloqueado</h4>
                    <p>Para prosseguir com o pedido, você deve ter 18 anos ou mais.</p>
                    <button @click="showAgeModal = false">Entendi</button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
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

.form-field input {
    padding: .9rem .9rem .9rem 1rem;
    border-radius: 12px;
    border: 2px solid var(--color-border);
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    background-color: var(--color-background-soft);
    transition: border-color .2s, box-shadow .2s;
    width: 100%
}

.form-field input:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 4px rgba(25, 197, 203, .2)
}

.form-field input:focus+.input-icon {
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

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem 1.25rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    opacity: 0;
    /* Começa invisível para a animação */
    animation: field-enter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.form-field label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--c-text);
}

.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: var(--c-text-light);
    transition: color 0.2s;
}

/* O <Field> da VeeValidate renderiza um <input>, então podemos estilizá-lo assim */
.form-field input {
    padding: 0.9rem 0.9rem 0.9rem 3rem;
    /* Espaço para o ícone */
    border-radius: 12px;
    border: 2px solid var(--color-border);
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    background-color: var(--color-background-soft);
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
}

.form-field input:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 4px rgba(25, 197, 203, 0.2);
}

.form-field input:focus+.input-icon {
    color: var(--c-azul);
}

.error-message {
    color: #e53e3e;
    font-size: 0.85rem;
    margin-top: 0.4rem;
    padding-left: 0.2rem;
    animation: shake 0.3s;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-3px);
    }

    75% {
        transform: translateX(3px);
    }
}

.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: linear-gradient(45deg, var(--c-rosa), var(--c-rosa-dark));
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
    box-shadow: 0 4px 15px rgba(254, 117, 143, 0.3);
}

.action-button:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(254, 117, 143, 0.4);
}

.action-button:disabled {
    background: #e0e0e0;
    color: #a8a8a8;
    cursor: not-allowed;
    box-shadow: none;
}

.age-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.age-modal-box {
    background: var(--c-branco);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    text-align: center;
    width: 90%;
    max-width: 350px;
}

.age-modal-box h4 {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--c-text-dark);
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.age-modal-box p {
    font-size: 1rem;
    color: var(--c-text);
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.age-modal-box button {
    width: 100%;
    padding: 0.8rem;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    font-size: 1rem;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--c-azul);
    color: var(--c-branco);
}

.age-modal-box button:hover {
    background-color: var(--c-azul-dark);
    transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>