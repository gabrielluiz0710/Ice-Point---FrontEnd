<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons'

defineProps<{
    show: boolean
    productName: string
}>()

defineEmits(['close', 'confirm'])
</script>

<template>
    <transition name="modal-bounce">
        <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container">
                <div class="icon-header">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                </div>

                <h3>Tem certeza?</h3>
                <p>Você está prestes a excluir <strong>{{ productName }}</strong>. Essa ação não pode ser desfeita e o
                    produto sumirá do cardápio.</p>

                <div class="modal-actions">
                    <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
                    <button class="btn-delete" @click="$emit('confirm')">
                        <font-awesome-icon :icon="faTrash" /> Sim, Excluir
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
    max-width: 400px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.icon-header {
    width: 60px;
    height: 60px;
    background: #FEE2E2;
    color: #EF4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 1.5rem auto;
}

h3 {
    font-size: 1.5rem;
    color: var(--text-main);
    margin-bottom: 0.5rem;
    font-weight: 700;
}

p {
    color: var(--text-muted);
    margin-bottom: 2rem;
    font-size: 0.95rem;
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
    transition: 0.2s;
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
    font-family: var(--font-title);
}

.btn-delete:hover {
    background: #DC2626;
    transform: translateY(-2px);
}

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