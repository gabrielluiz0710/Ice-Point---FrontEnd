<script setup lang="ts">
import { ref, computed } from 'vue'
import { faFaceFrown, faTimes, faExclamationTriangle, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
    isOpen: boolean
    isLoading: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const step = ref(1)
const selectedReason = ref('')
const customReason = ref('')

const reasons = [
    'Não quero mais meu carrinho de picolé',
    'Pedi para o endereço errado',
    'Pedi com dados errados',
    'Mudei de ideia sobre os sabores',
    'Encontrei mais barato em outro lugar',
    'O prazo de entrega é muito longo',
    'Fiz o pedido por engano',
    'Outro'
]

const canProceed = computed(() => {
    if (selectedReason.value === 'Outro') return customReason.value.trim().length > 5
    return !!selectedReason.value
})

const nextStep = () => {
    if (canProceed.value) step.value = 2
}

const confirmCancellation = () => {
    const finalReason = selectedReason.value === 'Outro' ? customReason.value : selectedReason.value
    emit('confirm', finalReason)
}

const reset = () => {
    step.value = 1
    selectedReason.value = ''
    customReason.value = ''
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="reset">
        <div class="modal-content">
            <button class="close-btn" @click="reset" :disabled="isLoading">
                <font-awesome-icon :icon="faTimes" />
            </button>

            <div v-if="step === 1" class="step-content">
                <div class="modal-header">
                    <div class="sad-icon-wrapper">
                        <font-awesome-icon :icon="faFaceFrown" />
                    </div>
                    <h2>Poxa, que pena!</h2>
                    <p>Tem certeza que deseja cancelar sua encomenda? Conta pra gente o motivo:</p>
                </div>

                <div class="scroll-area">
                    <div class="reasons-list">
                        <label v-for="reason in reasons" :key="reason" class="reason-item"
                            :class="{ active: selectedReason === reason }">
                            <input type="radio" :value="reason" v-model="selectedReason">
                            <span class="radio-custom"></span>
                            {{ reason }}
                        </label>
                    </div>

                    <div v-if="selectedReason === 'Outro'" class="custom-reason-box">
                        <textarea v-model="customReason" placeholder="Descreva o motivo..." rows="3"></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-action btn-next" @click="nextStep" :disabled="!canProceed">
                        Continuar
                    </button>
                </div>
            </div>

            <div v-else class="step-content step-confirm">
                <div class="scroll-area centered-content">
                    <div class="warning-icon">
                        <font-awesome-icon :icon="faExclamationTriangle" />
                    </div>
                    <h2>Certeza absoluta?</h2>
                    <p>Essa ação não poderá ser desfeita e você perderá sua reserva de carrinho.</p>
                </div>

                <div class="modal-footer confirm-actions">
                    <button class="btn-secondary" @click="step = 1" :disabled="isLoading">
                        <font-awesome-icon :icon="faArrowLeft" /> Voltar
                    </button>
                    <button class="btn-action btn-danger" @click="confirmCancellation" :disabled="isLoading">
                        <font-awesome-icon v-if="isLoading" :icon="faSpinner" spin />
                        <span v-else>Sim, cancelar pedido</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
}

.modal-content {
    background: white;
    width: 100%;
    max-width: 500px;
    border-radius: 20px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.3s ease-out;
    overflow: hidden;
}

.step-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.modal-header {
    text-align: center;
    padding: 2rem 2rem 1rem 2rem;
    flex-shrink: 0;
}

.scroll-area {
    padding: 0 2rem;
    overflow-y: auto;
    flex: 1;
    margin-bottom: 1rem;
    min-height: 0;
}

.scroll-area::-webkit-scrollbar {
    width: 6px;
}

.scroll-area::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 10px;
}

.scroll-area::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.scroll-area::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.centered-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.modal-footer {
    padding: 0 2rem 2rem 2rem;
    flex-shrink: 0;
    background: white;
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    z-index: 10;
}

.sad-icon-wrapper {
    font-size: 3.5rem;
    color: #64748b;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
}

.modal-header h2 {
    color: #334155;
    margin: 0 0 0.5rem 0;
}

.modal-header p {
    color: #64748b;
    margin: 0;
    line-height: 1.5;
}

.reasons-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.reason-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
    border: 2px solid #f1f5f9;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: #475569;
}

.reason-item:hover {
    border-color: #cbd5e1;
}

.reason-item.active {
    border-color: #ef4444;
    background: #fef2f2;
    color: #b91c1c;
}

.reason-item input {
    display: none;
}

.radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
}

.reason-item.active .radio-custom {
    border-color: #ef4444;
}

.reason-item.active .radio-custom::after {
    content: '';
    position: absolute;
    inset: 3px;
    background: #ef4444;
    border-radius: 50%;
}

.custom-reason-box {
    margin-top: 1rem;
}

.custom-reason-box textarea {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    resize: none;
    font-family: inherit;
}

.custom-reason-box textarea:focus {
    outline: none;
    border-color: #ef4444;
}

.btn-action {
    width: 100%;
    padding: 1rem;
    border-radius: 50px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;
    font-size: 1rem;
    font-family: var(--font-title);
}

.btn-next {
    background: #3b82f6;
    color: white;
}

.btn-next:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
}

.btn-danger {
    background: #ef4444;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.warning-icon {
    font-size: 3rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.confirm-actions {
    display: flex;
    gap: 1rem;
}

.btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 0 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    font-family: var(--font-title);
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>