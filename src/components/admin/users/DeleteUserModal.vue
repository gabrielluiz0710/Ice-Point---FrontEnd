<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faExclamationTriangle, faTrash, faLock } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
    show: boolean
    user: any | null
}>()

const emit = defineEmits(['close', 'confirm'])

const emailConfirmation = ref('')

// Limpa o campo sempre que o modal abre
watch(() => props.show, (val) => {
    if (val) {
        emailConfirmation.value = ''
    }
})

// Verifica se o email digitado é EXATAMENTE igual ao do usuário
const isMatch = computed(() => {
    if (!props.user?.email) return false
    return emailConfirmation.value === props.user.email
})

const handleConfirm = () => {
    if (isMatch.value) {
        emit('confirm')
    }
}
</script>

<template>
    <transition name="modal-bounce">
        <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container">
                <div class="icon-header">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                </div>

                <h3>Excluir Usuário?</h3>

                <div class="warning-text">
                    <p>
                        Você está prestes a excluir <strong>{{ user?.nome }}</strong>.
                        Essa ação é <span>irreversível</span> e removerá todo o histórico deste usuário.
                    </p>
                </div>

                <div class="confirmation-box">
                    <label>
                        Para confirmar, digite o email abaixo: <br>
                        <span class="email-to-copy">{{ user?.email }}</span>
                    </label>

                    <input type="text" v-model="emailConfirmation" placeholder="Digite o email do usuário"
                        class="confirm-input" @keyup.enter="handleConfirm" />
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" @click="$emit('close')">Cancelar</button>

                    <button class="btn-delete" :disabled="!isMatch" @click="handleConfirm"
                        :title="!isMatch ? 'Digite o email corretamente para liberar' : 'Excluir usuário'">
                        <font-awesome-icon :icon="isMatch ? faTrash : faLock" />
                        {{ isMatch ? 'Sim, Excluir' : 'Bloqueado' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
}

.modal-container {
    background: white;
    padding: 2.5rem;
    border-radius: 24px;
    width: 90%;
    max-width: 420px;
    /* Um pouco mais largo que o original para caber o input */
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid #FEE2E2;
}

.icon-header {
    width: 64px;
    height: 64px;
    background: #FEE2E2;
    color: #EF4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin: 0 auto 1.5rem auto;
}

h3 {
    font-size: 1.5rem;
    color: var(--text-main);
    margin-bottom: 1rem;
    font-weight: 700;
}

.warning-text p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}

.warning-text span {
    color: #EF4444;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
}

.confirmation-box {
    background: #F8FAFC;
    padding: 1.2rem;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    margin-bottom: 2rem;
    text-align: left;
}

.confirmation-box label {
    font-size: 0.9rem;
    color: var(--text-muted);
    display: block;
    margin-bottom: 0.5rem;
}

.email-to-copy {
    color: var(--text-main);
    font-weight: 700;
    font-family: monospace;
    background: #E2E8F0;
    padding: 2px 6px;
    border-radius: 4px;
    user-select: all;
    /* Facilita a seleção para copiar */
}

.confirm-input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid var(--border-light);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
}

.confirm-input:focus {
    outline: none;
    border-color: #EF4444;
    /* Foco vermelho para indicar zona de perigo */
    background: white;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-cancel {
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--border-light);
    background: white;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
    font-family: var(--font-title);
    color: var(--text-muted);
}

.btn-cancel:hover {
    background: #F1F5F9;
    color: var(--text-main);
}

.btn-delete {
    padding: 0.75rem 1.5rem;
    background: #EF4444;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
    font-family: var(--font-title);
}

.btn-delete:hover:not(:disabled) {
    background: #DC2626;
    transform: translateY(-2px);
}

.btn-delete:disabled {
    background: #CBD5E1;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.8;
}

/* Animação */
.modal-bounce-enter-active,
.modal-bounce-leave-active {
    transition: opacity 0.3s ease;
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
    opacity: 0;
}

.modal-bounce-enter-active .modal-container {
    animation: bounce-in 0.4s;
}

.modal-bounce-leave-active .modal-container {
    animation: bounce-in 0.4s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    50% {
        transform: scale(1.05);
        opacity: 1;
    }

    100% {
        transform: scale(1);
    }
}
</style>