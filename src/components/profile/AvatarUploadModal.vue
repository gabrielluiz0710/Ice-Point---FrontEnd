<script setup lang="ts">
import { faTimes, faCheck, faCloudUploadAlt, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{
    isOpen: boolean
    previewUrl: string | null
    isLoading: boolean
}>()

const emit = defineEmits(['close', 'confirm', 'retry'])
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Nova Foto de Perfil</h3>
                    <button class="close-btn" @click="$emit('close')" :disabled="isLoading">
                        <font-awesome-icon :icon="faTimes" />
                    </button>
                </div>

                <div class="modal-body">
                    <div class="preview-area">
                        <div class="image-wrapper">
                            <img v-if="previewUrl" :src="previewUrl" alt="Pré-visualização" class="preview-img" />
                        </div>
                        <p class="preview-text">Sua foto ficará assim</p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-cancel" @click="$emit('close')" :disabled="isLoading">
                        Cancelar
                    </button>

                    <button class="btn-retry" @click="$emit('retry')" :disabled="isLoading" title="Escolher outra foto">
                        <font-awesome-icon :icon="faExchangeAlt" /> Trocar
                    </button>

                    <button class="btn-confirm" @click="$emit('confirm')" :disabled="isLoading">
                        <span v-if="!isLoading">
                            <font-awesome-icon :icon="faCheck" /> Salvar
                        </span>
                        <span v-else>
                            <font-awesome-icon :icon="faCloudUploadAlt" beat /> Enviando...
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
}

.modal-container {
    background: white;
    width: 90%;
    max-width: 400px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: slideUp 0.3s ease;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: var(--c-text-dark, #333);
    font-size: 1.25rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    padding: 5px;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #ff4757;
}

.modal-body {
    padding: 2rem;
    display: flex;
    justify-content: center;
}

.preview-area {
    text-align: center;
}

.image-wrapper {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid var(--c-azul, #00bcd4);
    padding: 4px;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2);
    overflow: hidden;
}

.preview-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.preview-text {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.modal-footer {
    padding: 1.5rem;
    background-color: #f9f9f9;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-cancel {
    padding: 0.8rem 1.5rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    color: #666;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-title);
}

.btn-cancel:hover:not(:disabled) {
    background: #f1f1f1;
}

.btn-confirm {
    padding: 0.8rem 1.5rem;
    border: none;
    background: var(--c-azul, #00bcd4);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    font-family: var(--font-title);
}

.btn-confirm:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 4px 10px rgba(0, 188, 212, 0.3);
}

.btn-confirm:disabled,
.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
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

.modal-footer {
    padding: 1.5rem;
    background-color: #f9f9f9;
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
    align-items: center;
}

.btn-cancel {
    padding: 0.8rem 1.2rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 8px;
    color: #666;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-title, sans-serif);
}

.btn-cancel:hover:not(:disabled) {
    background: #f1f1f1;
    color: #333;
}

.btn-retry {
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--c-azul, #00bcd4);
    background: white;
    color: var(--c-azul, #00bcd4);
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-title, sans-serif);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-retry:hover:not(:disabled) {
    background: #e0f7fa;
}

.btn-confirm {
    padding: 0.8rem 1.5rem;
    border: none;
    background: var(--c-azul, #00bcd4);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    font-family: var(--font-title, sans-serif);
    box-shadow: 0 4px 10px rgba(0, 188, 212, 0.3);
}

.btn-confirm:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.btn-confirm:disabled,
.btn-retry:disabled,
.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

@media (max-width: 576px) {
    .modal-footer {
        flex-direction: column;
        gap: 12px;
        padding: 1.2rem;
    }

    .btn-cancel,
    .btn-retry,
    .btn-confirm {
        width: 100%;
        display: flex;
        justify-content: center;
        margin: 0;
    }
}
</style>