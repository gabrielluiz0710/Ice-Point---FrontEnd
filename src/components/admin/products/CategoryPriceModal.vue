<script setup lang="ts">
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTags, faSave, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
    show: boolean
    categories: any[]
    loading: boolean
}>()

const emit = defineEmits(['close', 'save'])

const selectedCategoryId = ref<string>('')
const newPrice = ref<string>('')

const errors = ref({
    category: false,
    price: false
})

watch(() => props.show, (val) => {
    if (val) {
        selectedCategoryId.value = ''
        newPrice.value = ''
        errors.value = { category: false, price: false }
    }
})

watch(selectedCategoryId, (val) => {
    if (val) errors.value.category = false
})
watch(newPrice, (val) => {
    if (val) errors.value.price = false
})

const handleConfirm = () => {
    const isCategoryEmpty = !selectedCategoryId.value
    const isPriceEmpty = !newPrice.value

    errors.value = {
        category: isCategoryEmpty,
        price: isPriceEmpty
    }

    if (isCategoryEmpty || isPriceEmpty) {
        return
    }

    emit('save', {
        categoryId: Number(selectedCategoryId.value),
        newPrice: Number(newPrice.value)
    })
}
</script>

<template>
    <transition name="modal-fade">
        <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="icon-wrapper">
                        <font-awesome-icon :icon="faTags" />
                    </div>
                    <h3>Atualizar Preço por Categoria</h3>
                </div>

                <p class="description">
                    Selecione a categoria e o novo valor.
                </p>
                <p class="description red">
                    <strong>Atenção:</strong> Todos os produtos dessa categoria terão o preço alterado.
                </p>

                <div class="form-group">
                    <label>Categoria</label>
                    <select v-model="selectedCategoryId" class="custom-input"
                        :class="{ 'input-error': errors.category }">
                        <option value="" disabled>Selecione...</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.nome }}
                        </option>
                    </select>
                    <span v-if="errors.category" class="error-msg">
                        <font-awesome-icon :icon="faExclamationCircle" /> Selecione uma categoria
                    </span>
                </div>

                <div class="form-group">
                    <label>Novo Preço (R$)</label>
                    <input type="number" step="0.01" v-model="newPrice" placeholder="Ex: 15.90" class="custom-input"
                        :class="{ 'input-error': errors.price }" />
                    <span v-if="errors.price" class="error-msg">
                        <font-awesome-icon :icon="faExclamationCircle" /> Insira um preço válido
                    </span>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" @click="$emit('close')" :disabled="loading">Cancelar</button>
                    <button class="btn-confirm" @click="handleConfirm" :disabled="loading">
                        <font-awesome-icon :icon="faSave" />
                        {{ loading ? 'Salvando...' : 'Atualizar Preços' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
}

.modal-container {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
}

.icon-wrapper {
    width: 50px;
    height: 50px;
    background: #E0F2FE;
    color: #0284C7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 1rem;
}

h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
}

.description {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    /* Ajustado um pouco */
    line-height: 1.4;
}

.description.red {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
    display: flex;
    /* Para alinhar erro e input se necessário, mas column é melhor aqui */
    flex-direction: column;
}

.form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
}

.red {
    color: #EF4444;
    /* Forcei a cor caso a variável CSS não exista */
}

.custom-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-light);
    border-radius: 10px;
    font-size: 1rem;
    background: #F8FAFC;
    transition: all 0.2s;
    font-family: var(--font-title);
}

.custom-input:focus {
    outline: none;
    border-color: #0284C7;
    background: white;
}

/* === Estilos de Erro Adicionados === */
.custom-input.input-error {
    border-color: #EF4444;
    background-color: #FEF2F2;
    animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
}

.custom-input.input-error:focus {
    border-color: #EF4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-msg {
    color: #EF4444;
    font-size: 0.8rem;
    margin-top: 0.4rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

@keyframes shake {

    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

/* ================================== */

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    justify-content: flex-end;
}

.btn-cancel {
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--border-light);
    background: white;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    color: var(--text-muted);
    font-family: var(--font-title);
}

.btn-confirm {
    padding: 0.75rem 1.5rem;
    background: #0284C7;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s;
    font-family: var(--font-title);
}

.btn-confirm:hover {
    background: #0369A1;
}

.btn-confirm:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>