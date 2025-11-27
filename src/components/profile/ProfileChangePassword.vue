<script setup lang="ts">
import { ref } from 'vue'
import { faPaperPlane, faCheckCircle, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/service/supabase'

const userStore = useUserStore()
const isLoading = ref(false)
const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')

const handleSendResetEmail = async () => {
    // Segurança: garante que temos o email
    if (!userStore.user?.email) {
        feedbackMsg.value = 'Erro: Não foi possível identificar seu email.'
        feedbackType.value = 'error'
        return
    }

    isLoading.value = true
    feedbackMsg.value = ''
    feedbackType.value = ''

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(userStore.user.email, {
            // Redireciona para a rota que você criou no router (/atualizar-senha)
            redirectTo: window.location.origin + '/atualizar-senha',
        })

        if (error) {
            throw error
        }

        feedbackMsg.value = 'Email enviado com sucesso! Verifique sua caixa de entrada.'
        feedbackType.value = 'success'

    } catch (error: any) {
        console.error(error)
        feedbackMsg.value = 'Erro ao enviar email. Tente novamente mais tarde.'
        feedbackType.value = 'error'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="content-wrapper">
        <h1 class="content-title">Trocar Senha</h1>
        <p class="content-subtitle">
            O processo de troca de senha é feito via email para garantir sua segurança.
        </p>

        <div class="info-container">
            <div class="steps-box">
                <h3>Como funciona:</h3>
                <ol class="steps-list">
                    <li>Clique no botão abaixo para solicitar a troca.</li>
                    <li>Um link seguro será enviado para o seu email: <br>
                        <strong>{{ userStore.user?.email }}</strong>
                    </li>
                    <li>Clique no link recebido para definir sua nova senha.</li>
                </ol>
            </div>

            <div v-if="feedbackMsg" class="feedback-box" :class="feedbackType">
                <font-awesome-icon :icon="feedbackType === 'success' ? faCheckCircle : faExclamationCircle" />
                <span>{{ feedbackMsg }}</span>
            </div>

            <button @click="handleSendResetEmail" class="action-btn"
                :disabled="isLoading || feedbackType === 'success'">
                <font-awesome-icon v-if="isLoading" :icon="faSpinner" spin />
                <font-awesome-icon v-else :icon="faPaperPlane" />
                <span v-if="isLoading">Enviando...</span>
                <span v-else-if="feedbackType === 'success'">Email Enviado</span>
                <span v-else>Enviar Email de Troca</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.content-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 0.5rem;
}

.content-subtitle {
    font-size: 1rem;
    color: var(--c-text-light);
    margin-top: 0;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.info-container {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.steps-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
}

.steps-box h3 {
    margin-top: 0;
    color: var(--c-azul);
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

.steps-list {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    color: var(--c-text-dark);
}

.steps-list li {
    line-height: 1.5;
}

.steps-list strong {
    color: var(--c-rosa);
    word-break: break-all;
}

.action-btn {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-azul);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    width: 100%;
}

.action-btn:hover:not(:disabled) {
    background-color: var(--c-azul-dark);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(29, 78, 216, 0.3);
}

.action-btn:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
    transform: none;
}

.feedback-box {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-weight: 500;
}

.feedback-box.success {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.feedback-box.error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}
</style>