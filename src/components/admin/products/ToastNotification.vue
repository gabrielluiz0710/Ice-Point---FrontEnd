<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
    show: boolean
    message: string
    type?: 'success' | 'error' | 'info'
}>()

const emit = defineEmits(['close'])

const icon = computed(() => {
    switch (props.type) {
        case 'success': return faCheckCircle
        case 'error': return faExclamationCircle
        default: return faInfoCircle
    }
})
</script>

<template>
    <transition name="toast-slide">
        <div v-if="show" class="toast-container" :class="type">
            <div class="toast-content">
                <font-awesome-icon :icon="icon" class="toast-icon" />
                <span class="toast-message">{{ message }}</span>
            </div>
            <button class="toast-close" @click="$emit('close')">
                <font-awesome-icon :icon="faTimes" />
            </button>
        </div>
    </transition>
</template>

<style scoped>
.toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    min-width: 300px;
    padding: 1rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-left: 6px solid #CBD5E1;
}

/* Tipos de Toast */
.toast-container.success {
    border-left-color: #10B981;
}

.toast-container.success .toast-icon {
    color: #10B981;
}

.toast-container.error {
    border-left-color: #EF4444;
}

.toast-container.error .toast-icon {
    color: #EF4444;
}

.toast-container.info {
    border-left-color: #3B82F6;
}

.toast-container.info .toast-icon {
    color: #3B82F6;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.toast-message {
    font-weight: 600;
    color: var(--text-main, #333);
    font-size: 0.95rem;
}

.toast-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #94A3B8;
    font-size: 1rem;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.toast-close:hover {
    background: #F1F5F9;
    color: #64748B;
}

/* Animação */
.toast-slide-enter-active,
.toast-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>