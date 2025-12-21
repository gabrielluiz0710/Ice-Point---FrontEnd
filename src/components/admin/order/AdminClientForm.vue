<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import {
    faUser,
    faMobileAlt,
    faEnvelope,
    faIdCard,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const adminCheckout = useAdminCheckoutStore()
const emit = defineEmits(['submit'])

const maskPhone = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    if (value.length > 9) value = `${value.slice(0, 9)}-${value.slice(9)}`

    adminCheckout.customerData.phone = value
    input.value = value
}

const maskCPF = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 3) value = `${value.slice(0, 3)}.${value.slice(3)}`
    if (value.length > 7) value = `${value.slice(0, 7)}.${value.slice(7)}`
    if (value.length > 11) value = `${value.slice(0, 11)}-${value.slice(11)}`

    adminCheckout.customerData.cpf = value
    input.value = value
}

const maskDate = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)

    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`
    if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5)}`

    adminCheckout.customerData.birthDate = value
    input.value = value
}

const handleSubmit = () => {
    if (adminCheckout.isCustomerDataValid()) {
        emit('submit')
    }
}

onMounted(() => {
    window.scrollTo(0, 0);
})
</script>

<template>
    <div class="admin-client-form">
        <div class="form-header">
            <h2>Dados do Cliente</h2>
            <p>Preencha as informações para contato e identificação.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form-grid">
            <div class="form-group full-width">
                <label>Nome Completo *</label>
                <div class="input-wrapper">
                    <FontAwesomeIcon :icon="faUser" class="icon" />
                    <input type="text" v-model="adminCheckout.customerData.fullName" placeholder="Ex: João da Silva"
                        required />
                </div>
            </div>

            <div class="form-group">
                <label>Celular/WhatsApp *</label>
                <div class="input-wrapper">
                    <FontAwesomeIcon :icon="faMobileAlt" class="icon" />
                    <input type="tel" :value="adminCheckout.customerData.phone" @input="maskPhone"
                        placeholder="(99) 99999-9999" required />
                </div>
            </div>

            <div class="form-group">
                <label>Email *</label>
                <div class="input-wrapper">
                    <FontAwesomeIcon :icon="faEnvelope" class="icon" />
                    <input type="email" v-model="adminCheckout.customerData.email" placeholder="cliente@email.com"
                        required />
                </div>
            </div>

            <div class="form-group">
                <label>CPF <small>(Opcional)</small></label>
                <div class="input-wrapper">
                    <FontAwesomeIcon :icon="faIdCard" class="icon" />
                    <input type="text" :value="adminCheckout.customerData.cpf" @input="maskCPF"
                        placeholder="000.000.000-00" />
                </div>
            </div>

            <div class="form-group">
                <label>Data Nasc. <small>(Opcional)</small></label>
                <div class="input-wrapper">
                    <FontAwesomeIcon :icon="faCalendarAlt" class="icon" />
                    <input type="text" :value="adminCheckout.customerData.birthDate" @input="maskDate"
                        placeholder="DD/MM/AAAA" />
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.admin-client-form {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    padding: 2rem;
}

.form-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 1rem;
}

.form-header h2 {
    color: var(--c-azul);
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.form-header p {
    color: #666;
    font-size: 0.95rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.full-width {
    grid-column: span 2;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--c-text-dark);
}

.form-group label small {
    color: #999;
    font-weight: 400;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper .icon {
    position: absolute;
    left: 1rem;
    color: #9ca3af;
    font-size: 1rem;
    pointer-events: none;
}

.input-wrapper input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.8rem;
    /* Espaço para o ícone */
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    color: #374151;
    transition: all 0.2s;
    background: #f9fafb;
}

.input-wrapper input:focus {
    border-color: var(--c-azul);
    background: #fff;
    outline: none;
    box-shadow: 0 0 0 4px rgba(var(--c-azul-rgb), 0.1);
}

.input-wrapper input:focus+.icon {
    color: var(--c-azul);
}

/* Mobile */
@media (max-width: 768px) {
    .admin-client-form {
        padding: 1.5rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .full-width {
        grid-column: span 1;
    }
}
</style>