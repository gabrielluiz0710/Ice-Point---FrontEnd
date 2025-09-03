<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { watch } from 'vue';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);

watch(() => props.show, (newValue) => {
    console.log(`%c[CHECKPOINT 3] MODAL: Propriedade 'show' recebida com valor: ${newValue}`, 'color: #34d399; font-weight: bold;');
});
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="show" class="modal-overlay" @mousedown.self="emit('close')">
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">

                <div class="centered-icon-container">
                    <div class="modal-icon-alert">
                        <font-awesome-icon :icon="faTriangleExclamation" />
                    </div>
                </div>

                <button class="close-btn-styled" @click="emit('close')" aria-label="Fechar modal">
                    <font-awesome-icon :icon="faXmark" />
                </button>

                <div class="modal-body">
                    <h2 id="modal-title">Limite de Itens Atingido</h2>
                    <p>
                        O limite por encomenda é de 2.000 unidades. Para pedidos maiores com condições especiais, fale
                        diretamente com nossa equipe:
                    </p>
                </div>

                <div class="modal-footer">
                    <div class="contact-links">
                        <a href="https://wa.me/5534999658035" target="_blank" rel="noopener noreferrer"
                            class="contact-btn whatsapp-btn">
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
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
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
    background-color: rgba(10, 25, 47, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 1rem;
}


.modal-content {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-branco);
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    min-width: 320px;
    position: relative;
    padding-top: 50px;
    padding-bottom: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}


.centered-icon-container {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.modal-icon-alert {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(145deg, var(--c-rosa), var(--c-rosa-dark));
    color: white;
    font-size: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(254, 117, 143, 0.5);
    border: 4px solid var(--c-branco);
    animation: icon-pop-in 0.6s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes icon-pop-in {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}


.close-btn-styled {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: var(--c-cinza-claro);
    color: var(--c-text-light);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s ease;
    z-index: 20;
}

.close-btn-styled:hover {
    background-color: var(--c-rosa);
    color: white;
    transform: scale(1.1) rotate(180deg);
}


.modal-body {
    padding: 1rem 0;
}

#modal-title {
    color: var(--c-azul-dark);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.modal-body p {
    color: var(--c-text);
    line-height: 1.6;
    font-size: 1rem;
    margin: 0 auto 1.5rem auto;
}


.modal-footer {
    padding: 0;
}

.contact-links {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

.contact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.85rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.contact-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.whatsapp-btn {
    background-color: #25D366;
    color: white;
}

.whatsapp-btn:hover {
    background-color: #1DAA50;
}

.phone-btn {
    background-color: var(--c-azul);
    color: white;
}

.phone-btn:hover {
    background-color: var(--c-azul-dark);
}


@media (min-width: 480px) {
    .contact-links {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
}
</style>