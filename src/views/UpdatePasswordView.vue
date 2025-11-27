<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/service/supabase'
import router from '@/router'

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')

const translateSupabaseError = (msg: string) => {
    const errorLower = msg.toLowerCase()
    if (errorLower.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.'
    if (errorLower.includes('weak password')) return 'Senha muito fraca. Use letras e números.'
    return msg
}

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        alert('Link inválido ou expirado. Por favor, solicite novamente.')
        router.push('/login')
    }
})

const handleUpdate = async () => {
    feedbackMsg.value = ''

    if (password.value.length < 6) {
        feedbackMsg.value = 'A senha deve ter no mínimo 6 caracteres.'
        feedbackType.value = 'error'
        return
    }

    if (password.value !== confirmPassword.value) {
        feedbackMsg.value = 'As senhas não conferem.'
        feedbackType.value = 'error'
        return
    }

    isLoading.value = true

    const { error } = await supabase.auth.updateUser({
        password: password.value
    })

    if (error) {
        feedbackMsg.value = translateSupabaseError(error.message)
        feedbackType.value = 'error'
        isLoading.value = false
    } else {
        feedbackMsg.value = 'Senha atualizada com sucesso!'
        feedbackType.value = 'success'
        setTimeout(() => {
            router.push('/perfil')
        }, 2000)
    }
}
</script>

<template>
    <div class="page-wrapper">
        <div class="auth-card scale-in-center">

            <div class="auth-header">
                <div class="icon-lock">🔒</div>
                <h1>Nova Senha</h1>
                <p>Crie uma senha segura para sua conta</p>
            </div>

            <div v-if="feedbackMsg" :class="['alert-box', feedbackType]">
                {{ feedbackMsg }}
            </div>

            <form @submit.prevent="handleUpdate" class="auth-form">

                <div class="input-group">
                    <label for="pass">Nova Senha</label>
                    <input id="pass" type="password" v-model="password" required placeholder="••••••••" />
                </div>

                <div class="input-group">
                    <label for="confPass">Confirmar Senha</label>
                    <input id="confPass" type="password" v-model="confirmPassword" required placeholder="••••••••" />
                </div>

                <button type="submit" :disabled="isLoading" class="btn-primary">
                    <span v-if="!isLoading">Salvar Nova Senha</span>
                    <span v-else class="loader"></span>
                </button>

            </form>
        </div>
    </div>
</template>

<style scoped>
* {
    font-family: 'Fredoka', sans-serif !important;
}

.page-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 20px;
}

.auth-card {
    background: var(--c-branco);
    width: 100%;
    max-width: 420px;
    padding: 3rem 2.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    position: relative;
    border: 1px solid #f0f0f0;
}

.icon-lock {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
    text-align: center;
}

.auth-header {
    text-align: center;
    margin-bottom: 2rem;
}

.auth-header h1 {
    color: var(--c-azul-dark);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.auth-header p {
    color: var(--c-text-light);
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.input-group label {
    font-size: 0.9rem;
    color: var(--c-azul);
    font-weight: 600;
    margin-left: 4px;
}

.input-group input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid transparent;
    background-color: #f1f5f9;
    border-radius: 12px;
    font-size: 1rem;
    color: var(--c-text-dark);
    transition: all 0.3s ease;
    outline: none;
}

.input-group input:focus {
    background-color: #fff;
    border-color: var(--c-azul);
    box-shadow: 0 4px 12px rgba(25, 197, 203, 0.15);
}

.btn-primary {
    background-color: var(--c-azul);
    color: white;
    padding: 15px;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: transform 0.2s;
    width: 100%;
    box-shadow: 0 4px 10px rgba(25, 197, 203, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--c-azul-dark);
    transform: translateY(-2px);
}

.loader {
    width: 20px;
    height: 20px;
    border: 3px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.alert-box {
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 500;
    font-size: 0.9rem;
}

.alert-box.error {
    background-color: #ffebee;
    color: #d32f2f;
    border: 1px solid #ffcdd2;
}

.alert-box.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

.scale-in-center {
    animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

@keyframes scale-in-center {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>