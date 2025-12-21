<script setup lang="ts">
import { useToast } from '../../stores/useToast'
import { faCheckCircle, faTimesCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
    if (type === 'success') return faCheckCircle
    if (type === 'error') return faTimesCircle
    return faInfoCircle
}
</script>

<template>
    <Teleport to="body">
        <div class="toast-container">
            <TransitionGroup name="toast">
                <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.type">
                    <div class="icon">
                        <FontAwesomeIcon :icon="getIcon(toast.type)" />
                    </div>
                    <div class="message">{{ toast.message }}</div>
                    <button class="close-btn" @click="removeToast(toast.id)">
                        <FontAwesomeIcon :icon="faTimes" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast-item {
    background: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    border-left: 4px solid #ccc;
    font-family: 'Fredoka', sans-serif;
    color: #333;
}

/* Tipos */
.toast-item.success {
    border-left-color: #10b981;
}

.toast-item.success .icon {
    color: #10b981;
}

.toast-item.error {
    border-left-color: #ef4444;
}

.toast-item.error .icon {
    color: #ef4444;
}

.toast-item.info {
    border-left-color: #3b82f6;
}

.toast-item.info .icon {
    color: #3b82f6;
}

.message {
    flex-grow: 1;
    font-size: 0.9rem;
    font-weight: 500;
}

.close-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 0.9rem;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>