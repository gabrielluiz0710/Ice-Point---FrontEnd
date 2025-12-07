<script setup lang="ts">
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faTimes,
    faSave,
    faSpinner,
    faIdCard,
    faCalendarAlt,
    faUser,
    faEnvelope,
    faPhone,
    faBriefcase,
    faUserTag,
    faExclamationCircle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
    show: boolean
    user: any | null
    isInternal: boolean
    apiError?: string
}>()

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const showSuccess = ref(false)
const localError = ref('')

const form = ref({
    nome: '',
    email: '',
    tipo: 'CLIENTE',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    data_admissao: ''
})

const errors = ref({
    nome: false,
    email: false,
    tipo: false
})

const formatCPF = (event: Event) => {
    const input = event.target as HTMLInputElement
    let v = input.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    form.value.cpf = v
    input.value = v
}

const formatPhone = (event: Event) => {
    const input = event.target as HTMLInputElement
    let v = input.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d)(\d{4})$/, '$1-$2')
    form.value.telefone = v
    input.value = v
}

watch(() => props.show, (val) => {
    if (val) {
        showSuccess.value = false
        localError.value = ''
        loading.value = false

        if (props.user) {
            form.value = {
                nome: props.user.nome,
                email: props.user.email,
                tipo: props.user.tipo,
                telefone: props.user.telefone || '',
                cpf: props.user.cpf || '',
                data_nascimento: props.user.data_nascimento || '',
                data_admissao: props.user.data_admissao || ''
            }
        } else {
            form.value = {
                nome: '',
                email: '',
                tipo: props.isInternal ? 'FUNCIONARIO' : 'CLIENTE',
                telefone: '',
                cpf: '',
                data_nascimento: '',
                data_admissao: ''
            }
        }
        errors.value = { nome: false, email: false, tipo: false }
    }
})

watch(() => props.apiError, (newVal) => {
    if (newVal) {
        localError.value = newVal
        loading.value = false
    }
})

const validate = () => {
    let isValid = true
    errors.value = { nome: false, email: false, tipo: false }
    localError.value = ''

    if (!form.value.nome.trim()) { errors.value.nome = true; isValid = false }
    if (!props.user && !form.value.email.trim()) { errors.value.email = true; isValid = false }

    if (!isValid) {
        localError.value = 'Preencha os campos obrigatórios marcados em vermelho.'
    }

    return isValid
}

const handleSave = async () => {
    if (!validate()) return

    loading.value = true
    localError.value = ''

    const payload = { ...form.value }
    if (payload.tipo === 'CLIENTE') {
        payload.data_admissao = ''
    }

    emit('save', payload)
}

defineExpose({
    triggerSuccess: () => {
        loading.value = false
        showSuccess.value = true
        setTimeout(() => {
            emit('close')
            showSuccess.value = false
        }, 1500)
    },
    stopLoading: () => loading.value = false
})
</script>

<template>
    <transition name="modal-fade">
        <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
            <div class="modal-container custom-scrollbar">

                <transition name="fade">
                    <div v-if="showSuccess" class="success-overlay">
                        <div class="success-content">
                            <font-awesome-icon :icon="faCheckCircle" class="success-icon" />
                            <h3>Sucesso!</h3>
                            <p>Os dados foram salvos corretamente.</p>
                        </div>
                    </div>
                </transition>

                <div class="modal-header">
                    <div class="header-text">
                        <h3>{{ user ? 'Editar Perfil' : 'Novo Cadastro' }}</h3>
                        <p>{{ user ? 'Atualize as informações abaixo' : 'Preencha os dados para criar o usuário' }}</p>
                    </div>
                    <button class="close-btn" @click="emit('close')" :disabled="loading">
                        <font-awesome-icon :icon="faTimes" />
                    </button>
                </div>

                <transition name="shake">
                    <div v-if="localError" class="error-alert">
                        <font-awesome-icon :icon="faExclamationCircle" />
                        <span>{{ localError }}</span>
                    </div>
                </transition>

                <div class="modal-body">
                    <div class="form-grid">

                        <div class="form-group full-width">
                            <label>Nome Completo <span class="required">*</span></label>
                            <div class="input-wrapper" :class="{ 'error': errors.nome }">
                                <font-awesome-icon :icon="faUser" class="icon" />
                                <input type="text" v-model="form.nome" placeholder="Ex: João da Silva">
                            </div>
                            <span v-if="errors.nome" class="field-error">Nome é obrigatório</span>
                        </div>

                        <div class="form-group full-width">
                            <label>Email <span class="required">*</span></label>
                            <div class="input-wrapper" :class="{ 'error': errors.email, 'disabled': !!user }">
                                <font-awesome-icon :icon="faEnvelope" class="icon" />
                                <input type="email" v-model="form.email" :disabled="!!user"
                                    placeholder="email@exemplo.com">
                            </div>
                            <span v-if="errors.email" class="field-error">Email é obrigatório</span>
                        </div>

                        <div class="form-group full-width section-title">
                            <div class="divider"></div>
                            <span>Dados de Acesso & Função</span>
                            <div class="divider"></div>
                        </div>

                        <div class="form-group">
                            <label>Função no Sistema</label>
                            <div class="input-wrapper select-wrapper">
                                <font-awesome-icon :icon="faUserTag" class="icon" />
                                <select v-model="form.tipo">
                                    <option value="CLIENTE">Cliente (Consumidor)</option>
                                    <option value="FUNCIONARIO">Funcionário (Equipe)</option>
                                    <option value="ADMIN">Administrador (Total)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Data de Admissão</label>
                            <div class="input-wrapper" :class="{ 'disabled': form.tipo === 'CLIENTE' }">
                                <font-awesome-icon :icon="faBriefcase" class="icon" />
                                <input type="date" v-model="form.data_admissao" :disabled="form.tipo === 'CLIENTE'">
                            </div>
                        </div>

                        <div class="form-group full-width section-title">
                            <div class="divider"></div>
                            <span>Documentos & Contato</span>
                            <div class="divider"></div>
                        </div>

                        <div class="form-group">
                            <label>CPF</label>
                            <div class="input-wrapper">
                                <font-awesome-icon :icon="faIdCard" class="icon" />
                                <input type="text" v-model="form.cpf" @input="formatCPF" maxlength="14"
                                    placeholder="000.000.000-00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Data de Nascimento</label>
                            <div class="input-wrapper">
                                <font-awesome-icon :icon="faCalendarAlt" class="icon" />
                                <input type="date" v-model="form.data_nascimento">
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label>Telefone / WhatsApp</label>
                            <div class="input-wrapper">
                                <font-awesome-icon :icon="faPhone" class="icon" />
                                <input type="tel" v-model="form.telefone" @input="formatPhone" maxlength="15"
                                    placeholder="(00) 00000-0000">
                            </div>
                        </div>

                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-cancel" @click="emit('close')" :disabled="loading">Cancelar</button>
                    <button class="btn-save" @click="handleSave" :disabled="loading">
                        <font-awesome-icon :icon="loading ? faSpinner : faSave" :spin="loading" />
                        {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
* {
    font-family: var(--font-title, 'Fredoka', sans-serif);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.shake-enter-active {
    animation: shake 0.4s;
}

@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    50% {
        transform: translateX(5px);
    }

    75% {
        transform: translateX(-5px);
    }

    100% {
        transform: translateX(0);
    }
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-container {
    background: #ffffff;
    width: 95%;
    max-width: 650px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.5);
    overflow: hidden;
    position: relative;
}

.success-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.success-content {
    text-align: center;
    animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-icon {
    font-size: 4rem;
    color: #22c55e;
    margin-bottom: 1rem;
}

.success-content h3 {
    font-size: 1.8rem;
    color: var(--text-main);
    margin: 0 0 0.5rem 0;
}

.success-content p {
    color: #64748b;
    font-size: 1.1rem;
}

@keyframes scaleUp {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.error-alert {
    background-color: #fee2e2;
    color: #ef4444;
    padding: 12px 20px;
    margin: 0 2rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid #fecaca;
}

.modal-header {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(to right, #ffffff, #f8fafc);
}

.header-text h3 {
    font-size: 1.5rem;
    color: var(--text-main, #1e293b);
    font-weight: 700;
    margin: 0 0 0.3rem 0;
}

.header-text p {
    margin: 0;
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
}

.close-btn {
    background: #f1f5f9;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.1rem;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: #e2e8f0;
    color: #ef4444;
    transform: rotate(90deg);
}

.modal-body {
    padding: 2rem;
    overflow-y: auto;
    background-color: #fff;
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
    gap: 0.4rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
    margin-left: 4px;
}

.required {
    color: var(--c-rosa, #ef4444);
}

.field-error {
    font-size: 0.8rem;
    color: #ef4444;
    margin-left: 4px;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
}

.section-title span {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    white-space: nowrap;
}

.divider {
    height: 1px;
    background: #e2e8f0;
    width: 100%;
}

.input-wrapper {
    position: relative;
    transition: all 0.3s ease;
}

.input-wrapper .icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    transition: color 0.3s;
    font-size: 1rem;
    pointer-events: none;
}

.input-wrapper input,
.input-wrapper select {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #334155;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    outline: none;
    appearance: none;
    font-family: var(--font-title, 'Fredoka', sans-serif);
}

.select-wrapper::after {
    content: '▼';
    font-size: 0.7rem;
    color: #94a3b8;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}

.input-wrapper:hover input,
.input-wrapper:hover select {
    background-color: #fff;
    border-color: #cbd5e1;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
    background-color: #fff;
    border-color: var(--primary, #00bcd4);
    box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
}

.input-wrapper input:focus+.icon,
.input-wrapper:focus-within .icon {
    color: var(--primary, #00bcd4);
}

.input-wrapper.error input {
    border-color: #ef4444;
    background-color: #fef2f2;
}

.input-wrapper.error .icon {
    color: #ef4444;
}

.input-wrapper.disabled input,
.input-wrapper.disabled select {
    background-color: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #e2e8f0;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    background-color: #f8fafc;
}

.btn-cancel {
    padding: 12px 24px;
    border: none;
    background: transparent;
    color: #64748b;
    font-weight: 700;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s;
}

.btn-cancel:hover {
    background: #e2e8f0;
    color: #334155;
}

.btn-save {
    padding: 12px 28px;
    background: linear-gradient(135deg, var(--primary, #00bcd4), var(--primary-dark, #0097a7));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    gap: 10px;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.25);
    transition: all 0.3s ease;
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 188, 212, 0.35);
}

.btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@media (max-width: 640px) {
    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .full-width {
        grid-column: span 1;
    }

    .modal-container {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
    }

    .modal-footer {
        padding-bottom: 2rem;
    }
}
</style>