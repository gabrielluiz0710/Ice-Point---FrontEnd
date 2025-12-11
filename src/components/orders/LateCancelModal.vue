<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="show" class="modal-overlay" @mousedown.self="emit('close')">
            <div class="modal-content" role="dialog" aria-modal="true">

                <div class="centered-icon-container">
                    <div class="modal-icon-alert">
                        <font-awesome-icon :icon="faTriangleExclamation" />
                    </div>
                </div>

                <button class="close-btn-styled" @click="emit('close')" aria-label="Fechar modal">
                    <font-awesome-icon :icon="faXmark" />
                </button>

                <div class="modal-body">
                    <h2>Prazo Curto para Cancelamento</h2>
                    <p>
                        Sua encomenda está agendada para daqui a menos de 2 horas.
                        Para cancelar agora, por favor, entre em contato urgente com nossa equipe:
                    </p>
                </div>

                <div class="modal-footer">
                    <div class="contact-links">
                        <a href="https://wa.me/5534999658035?text=Preciso%20cancelar%20um%20pedido%20urgente"
                            target="_blank" rel="noopener noreferrer" class="contact-btn whatsapp-btn">
                            <font-awesome-icon :icon="faWhatsapp" />
                            <span>WhatsApp</span>
                        </a>
                        <a href="tel:+5534999658035" class="contact-btn phone-btn">
                            <font-awesome-icon :icon="faPhone" />
                            <span>Ligar Agora</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.modal-overlay {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    background-color: rgba(10, 25, 47, 0.6);
    backdrop-filter: blur(5px);
    padding: 1rem;
}

.modal-content {
    font-family: 'Fredoka', sans-serif;
    background-color: white;
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    position: relative;
    padding: 3.5rem 2rem 2rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.centered-icon-container {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.modal-icon-alert {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 15px rgba(245, 158, 11, 0.4);
    border: 4px solid white;
}

.close-btn-styled {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.close-btn-styled:hover {
    background: #ef4444;
    color: white;
    transform: rotate(90deg);
}

.modal-body h2 {
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.modal-body p {
    color: #475569;
    line-height: 1.5;
    font-size: 1rem;
    margin-bottom: 1.5rem;
}

.contact-links {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
}

.contact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.8rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s;
}

.contact-btn:hover {
    transform: translateY(-2px);
}

.whatsapp-btn {
    background: #25D366;
    color: white;
}

.phone-btn {
    background: var(--c-azul);
    color: white;
}

@media (min-width: 480px) {
    .contact-links {
        grid-template-columns: 1fr 1fr;
    }
}
</style>