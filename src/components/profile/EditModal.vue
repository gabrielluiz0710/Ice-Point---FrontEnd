<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

interface FormField {
    name: string
    label: string
    value: string
    type?: string
    placeholder?: string
    readonly?: boolean
    width?: 'full' | 'half'
}

const props = defineProps<{
    isOpen: boolean
    title: string
    fields: FormField[]
    isLoading: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'save', payload: Record<string, string>): void
}>()

const formData = ref<Record<string, string>>({})
const cepError = ref<string | null>(null)
const ageError = ref<string | null>(null)
const isFetchingCep = ref(false)

watchEffect(() => {
    if (props.isOpen) {
        formData.value = props.fields.reduce((acc, field) => {
            acc[field.name] = field.value
            return acc
        }, {} as Record<string, string>)
        cepError.value = null
    }
})

// --- MASCARA CPF ---
watch(() => formData.value.cpf, (newVal) => {
    if (!newVal) return
    let v = newVal.replace(/\D/g, '')

    if (v.length > 11) v = v.slice(0, 11)

    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

    if (v !== newVal) formData.value.cpf = v
})

// --- MASCARA TELEFONE ---
watch(() => formData.value.phone, (newVal) => {
    if (!newVal) return
    let v = newVal.replace(/\D/g, '')

    if (v.length > 11) v = v.slice(0, 11)

    if (v.length > 10) {
        v = v.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (v.length > 5) {
        v = v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (v.length > 2) {
        v = v.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
    } else {
        v = v.replace(/^(\d*)/, "($1");
    }

    if (v !== newVal) formData.value.phone = v
})

// --- MASCARA CEP ---
watch(() => formData.value.zip, (newCep, oldCep) => {
    if (newCep === undefined) return

    const cleanedCep = newCep.replace(/\D/g, '').slice(0, 8)

    let maskedCep = cleanedCep
    if (cleanedCep.length > 5) {
        maskedCep = cleanedCep.slice(0, 5) + '-' + cleanedCep.slice(5)
    }

    if (maskedCep !== newCep) {
        formData.value.zip = maskedCep
    }

    if (cleanedCep.length === 8) {
        if (oldCep?.replace(/\D/g, '') !== cleanedCep) {
            fetchAddressFromCep(cleanedCep)
        }
    } else {
        cepError.value = null
    }
})

async function fetchAddressFromCep(cep: string) {
    isFetchingCep.value = true
    cepError.value = null
    try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

        if (data.erro) {
            cepError.value = 'CEP não encontrado.'
            return
        }

        formData.value.street = data.logradouro
        formData.value.neighborhood = data.bairro
        formData.value.city = data.localidade
        formData.value.state = data.uf

        document.getElementById('number')?.focus()

    } catch (error) {
        console.error("Erro ao buscar CEP:", error)
        cepError.value = 'Não foi possível buscar o CEP.'
    } finally {
        isFetchingCep.value = false
    }
}

function handleSave() {
    if (props.isLoading) return

    if (formData.value.birthDate) {
        const birthDate = new Date(formData.value.birthDate)
        const today = new Date()

        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        if (age < 18) {
            ageError.value = 'É preciso ser maior de 18 anos.'
            return
        } else {
            ageError.value = null
        }
    }

    const cleanData = { ...formData.value }
    if (cleanData.cpf) cleanData.cpf = cleanData.cpf.replace(/\D/g, '')
    if (cleanData.phone) cleanData.phone = cleanData.phone.replace(/\D/g, '')
    if (cleanData.zip) cleanData.zip = cleanData.zip.replace(/\D/g, '')

    emit('save', cleanData)
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isOpen" class="modal-backdrop" @click="$emit('close')">
                <div class="modal-content" @click.stop>
                    <header class="modal-header">
                        <h2>{{ title }}</h2>
                        <button class="close-btn" @click="$emit('close')">
                            <font-awesome-icon :icon="faTimes" />
                        </button>
                    </header>

                    <main class="modal-body">
                        <div class="form-grid">
                            <div v-for="field in fields" :key="field.name" class="form-group"
                                :class="`field-${field.width || 'half'}`">
                                <label :for="field.name">{{ field.label }}</label>
                                <div class="input-wrapper">
                                    <input :id="field.name" v-model="formData[field.name]" :type="field.type || 'text'"
                                        :placeholder="field.placeholder || `Digite...`" :readonly="field.readonly" />

                                    <font-awesome-icon v-if="field.name === 'zip' && isFetchingCep" :icon="faSpinner"
                                        spin class="input-spinner" />
                                </div>
                                <p v-if="field.name === 'zip' && cepError" class="cep-error">{{ cepError }}</p>
                                <p v-if="field.name === 'birthDate' && ageError" class="cep-error">{{ ageError }}</p>
                            </div>
                        </div>
                    </main>

                    <footer class="modal-footer">
                        <button class="btn-secondary" @click="$emit('close')">Cancelar</button>
                        <button class="btn-primary" @click="handleSave" :disabled="isLoading">
                            <font-awesome-icon v-if="isLoading" :icon="faSpinner" spin />
                            <span v-else>Salvar Alterações</span>
                        </button>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    font-family: 'Fredoka', sans-serif;
}

.modal-content {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
}

.modal-header,
.modal-footer {
    flex-shrink: 0;
}

.modal-body {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex-grow: 1;
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--c-azul);
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.2s ease;
}

.close-btn:hover {
    color: #374151;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-group {
    font-family: 'Fredoka', sans-serif;
    display: flex;
    flex-direction: column;
}

.field-full {
    grid-column: 1 / -1;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--c-text-light);
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.form-group input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    font-family: 'Fredoka', sans-serif;
}

.form-group input:read-only {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.form-group input:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.input-spinner {
    position: absolute;
    right: 1rem;
    color: var(--c-azul);
}

.cep-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}


.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn-primary,
.btn-secondary {
    padding: 0.7rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid;
    font-family: 'Fredoka', sans-serif;
}

.btn-primary {
    background-color: var(--c-rosa);
    border-color: var(--c-rosa);
    color: white;
}

.btn-primary:hover {
    background-color: var(--c-rosa-dark);
    border-color: var(--c-rosa-dark);
}

.btn-primary:disabled {
    background-color: #fca5a5;
    border-color: #fca5a5;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: transparent;
    border-color: #d1d5db;
    color: #4b5563;
}

.btn-secondary:hover {
    background-color: #f3f4f6;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
    transform: scale(0.95) translateY(10px);
}
</style>