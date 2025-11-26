<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/service/supabase'
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons'

const userStore = useUserStore()

// Estados
const isLoginMode = ref(true)
const isLoading = ref(false)
const showForgotModal = ref(false)

// Feedback Visual
const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')

// Campos
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const phone = ref('')
const birthDate = ref('') // Agora é string formatada dd/mm/aaaa

// Esqueci a senha
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotMsg = ref('')
const forgotType = ref<'success' | 'error' | ''>('')

const passwordsMatch = computed(() => {
    return isLoginMode.value || password.value === confirmPassword.value
})

// --- FUNÇÕES DE AJUDA ---

const translateSupabaseError = (msg: string) => {
    const errorLower = msg.toLowerCase()
    if (errorLower.includes('invalid login credentials')) return 'Email ou senha incorretos.'
    if (errorLower.includes('user already registered')) return 'Este email já está cadastrado.'
    if (errorLower.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.'
    if (errorLower.includes('weak password')) return 'Senha muito fraca. Use letras e números.'
    if (errorLower.includes('anonymous')) return 'Erro na sessão anônima.'
    if (errorLower.includes('rate limit')) return 'Muitas tentativas. Tente novamente mais tarde.'
    return msg
}

const showFeedback = (msg: string, type: 'success' | 'error') => {
    feedbackMsg.value = msg
    feedbackType.value = type
    if (type === 'error') setTimeout(() => feedbackMsg.value = '', 5000)
}

// Validador de Idade e Data
const isValidDateAndAge = (dateString: string): { valid: boolean, msg?: string } => {
    // Regex para formato dd/mm/aaaa
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return { valid: false, msg: 'Data inválida.' }

    const parts = dateString.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Mês JS é 0-11
    const year = parseInt(parts[2], 10)
    const currentYear = new Date().getFullYear()

    // Validações básicas de calendário
    if (year < 1900 || year > currentYear) return { valid: false, msg: 'Ano inválido.' }
    if (month < 0 || month > 11) return { valid: false, msg: 'Mês inválido.' }

    const dateObj = new Date(year, month, day)
    // Verifica se o dia existe no mês (ex: 31/02 retornaria false aqui pois viraria março)
    if (dateObj.getDate() !== day || dateObj.getMonth() !== month || dateObj.getFullYear() !== year) {
        return { valid: false, msg: 'Data inexistente.' }
    }

    // Cálculo de Idade (+18)
    const today = new Date()
    let age = today.getFullYear() - dateObj.getFullYear()
    const m = today.getMonth() - dateObj.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
        age--
    }

    if (age < 18) return { valid: false, msg: 'Você precisa ter mais de 18 anos.' }

    return { valid: true }
}

// Converter dd/mm/aaaa para aaaa-mm-dd (Formato SQL)
const convertDateToISO = (dateString: string) => {
    const parts = dateString.split('/')
    return `${parts[2]}-${parts[1]}-${parts[0]}`
}

const handleAuth = async () => {
    feedbackMsg.value = ''

    if (!isLoginMode.value) {
        // Validações de Cadastro
        if (!name.value || !phone.value || !birthDate.value) {
            showFeedback('Todos os campos são obrigatórios.', 'error')
            return
        }

        if (!passwordsMatch.value) {
            showFeedback('As senhas não conferem.', 'error')
            return
        }

        if (password.value.length < 6) {
            showFeedback('A senha deve ter no mínimo 6 caracteres.', 'error')
            return
        }

        // Validação de telefone (Mínimo 10 dígitos + formatação)
        const rawPhone = phone.value.replace(/\D/g, '')
        if (rawPhone.length < 10) {
            showFeedback('Telefone incompleto.', 'error')
            return
        }

        // Validação de Idade
        const ageCheck = isValidDateAndAge(birthDate.value)
        if (!ageCheck.valid) {
            showFeedback(ageCheck.msg || 'Data inválida', 'error')
            return
        }
    }

    isLoading.value = true
    try {
        if (isLoginMode.value) {
            await userStore.login(email.value, password.value)
        } else {
            // Prepara data para envio (ISO)
            const isoDate = convertDateToISO(birthDate.value)

            const result = await userStore.register({
                email: email.value,
                password: password.value,
                name: name.value,
                phone: phone.value,
                birthDate: isoDate // Envia formatado aaaa-mm-dd
            })

            if (result?.success) {
                showFeedback(result.message, 'success')
                if (!result.shouldRedirect) {
                    isLoginMode.value = true
                }
            }
        }
    } catch (error: any) {
        console.error('Erro Auth:', error)
        const translatedMsg = translateSupabaseError(error.message || '')
        showFeedback(translatedMsg, 'error')
    } finally {
        isLoading.value = false
    }
}

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
        await userStore.loginWithProvider(provider)
    } catch (error: any) {
        showFeedback(`Erro ao conectar com ${provider}`, 'error')
    }
}

const handleForgotPassword = async () => {
    if (!forgotEmail.value) {
        forgotMsg.value = 'Digite seu email.'
        forgotType.value = 'error'
        return
    }

    forgotLoading.value = true
    forgotMsg.value = ''

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.value, {
        redirectTo: window.location.origin + '/atualizar-senha',
    })

    forgotLoading.value = false

    if (error) {
        const translated = translateSupabaseError(error.message)
        forgotMsg.value = translated
        forgotType.value = 'error'
    } else {
        forgotMsg.value = 'Link enviado! Verifique seu email.'
        forgotType.value = 'success'
        setTimeout(() => {
            showForgotModal.value = false
            forgotMsg.value = ''
            forgotEmail.value = ''
        }, 4000)
    }
}

// --- MÁSCARAS DE INPUT ---

// Máscara de Telefone: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
const formatPhone = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '') // Remove tudo que não é dígito

    // Limita a 11 dígitos
    if (value.length > 11) value = value.slice(0, 11)

    // Aplica a formatação
    if (value.length > 10) {
        // 11 dígitos: (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (value.length > 5) {
        // 10 dígitos ou em digitação: (XX) XXXX-XXXX
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (value.length > 2) {
        // Apenas DDD
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2')
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1')
    }

    phone.value = value
    input.value = value // Força atualização visual
}

// Máscara de Data: dd/mm/aaaa
const formatDate = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '') // Remove não dígitos

    if (value.length > 8) value = value.slice(0, 8) // Limita a 8 números

    // Adiciona as barras
    if (value.length >= 5) {
        value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    }

    birthDate.value = value
    input.value = value
}
</script>

<template>
    <div class="page-wrapper">
        <div class="auth-card swing-in-top-fwd">

            <div class="auth-header">
                <h1>{{ isLoginMode ? 'Login' : 'Crie sua conta' }}</h1>
            </div>

            <!-- Feedback Geral -->
            <transition name="fade">
                <div v-if="feedbackMsg" :class="['alert-box', feedbackType]">
                    {{ feedbackMsg }}
                </div>
            </transition>

            <form @submit.prevent="handleAuth" class="auth-form">

                <!-- Transição suave entre Login e Cadastro -->
                <transition-group name="list" tag="div" class="fields-container">

                    <div v-if="!isLoginMode" class="input-group full-width">
                        <label for="name">Nome Completo</label>
                        <input id="name" type="text" v-model="name" placeholder="Ex: João Silva" />
                    </div>

                    <div v-if="!isLoginMode" class="row-group full-width">
                        <div class="input-group">
                            <label for="phone">Celular</label>
                            <input id="phone" type="tel" :value="phone" @input="formatPhone"
                                placeholder="(99) 99999-9999" maxlength="15" />
                        </div>
                        <div class="input-group">
                            <label for="birthDate">Nascimento</label>
                            <!-- Input Text com máscara, não Date -->
                            <input id="birthDate" type="text" :value="birthDate" @input="formatDate"
                                placeholder="dd/mm/aaaa" maxlength="10" />
                        </div>
                    </div>
                </transition-group>

                <!-- Campos Comuns -->
                <div class="input-group">
                    <label for="email">Email</label>
                    <input id="email" type="email" v-model="email" required placeholder="seu@email.com" />
                </div>

                <div class="input-group">
                    <label for="password">Senha</label>
                    <input id="password" type="password" v-model="password" required placeholder="••••••••" />
                </div>

                <transition name="fade">
                    <div v-if="!isLoginMode" class="input-group">
                        <label for="confirmPassword">Confirmar Senha</label>
                        <input id="confirmPassword" type="password" v-model="confirmPassword" placeholder="••••••••"
                            :class="{ 'error-border': !passwordsMatch && confirmPassword }" />
                    </div>
                </transition>

                <div v-if="isLoginMode" class="forgot-link">
                    <a href="#" @click.prevent="showForgotModal = true">Esqueceu a senha?</a>
                </div>

                <button type="submit" :disabled="isLoading" class="btn-primary">
                    <span v-if="!isLoading">{{ isLoginMode ? 'Entrar' : 'Cadastrar' }}</span>
                    <span v-else class="loader"></span>
                </button>

            </form>

            <div class="toggle-container">
                <p>
                    {{ isLoginMode ? 'Ainda não tem conta?' : 'Já tem uma conta?' }}
                    <a href="#" @click.prevent="isLoginMode = !isLoginMode; feedbackMsg = ''">
                        {{ isLoginMode ? 'Cadastre-se' : 'Fazer Login' }}
                    </a>
                </p>
            </div>

            <div class="divider">
                <span>ou continue com</span>
            </div>

            <div class="social-buttons">
                <button type="button" class="social-btn google" @click="handleSocialLogin('google')">
                    <font-awesome-icon :icon="faGoogle" /> Google
                </button>
                <button type="button" class="social-btn facebook" @click="handleSocialLogin('facebook')">
                    <font-awesome-icon :icon="faFacebook" /> Facebook
                </button>
            </div>

        </div>

        <!-- MODAL -->
        <transition name="modal-fade">
            <div v-if="showForgotModal" class="modal-overlay" @click.self="showForgotModal = false">
                <div class="modal-card scale-in-center">
                    <div class="modal-header">
                        <h3>Recuperar Senha</h3>
                        <button class="close-btn" @click="showForgotModal = false">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label>Seu Email</label>
                            <input type="email" v-model="forgotEmail" placeholder="exemplo@email.com" />
                        </div>

                        <div v-if="forgotMsg" :class="['mini-alert', forgotType]">
                            {{ forgotMsg }}
                        </div>

                        <button @click="handleForgotPassword" :disabled="forgotLoading" class="btn-primary btn-modal">
                            {{ forgotLoading ? 'Enviando...' : 'Enviar Link' }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
/* CONFIGURAÇÕES GERAIS DE FONTE */
* {
    font-family: 'Fredoka', sans-serif !important;
}

.page-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 85vh;
    padding: 20px;
    background: transparent;
}

.auth-card {
    background: var(--c-branco);
    width: 100%;
    max-width: 450px;
    padding: 3rem 2.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    /* Sombra suave */
    position: relative;
    border: 1px solid #f0f0f0;
}

/* Header */
.auth-header {
    text-align: center;
    margin-bottom: 2rem;
}

.auth-header h1 {
    color: var(--c-azul-dark);
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
}

.auth-header p {
    color: var(--c-text-light);
    font-size: 1rem;
    font-weight: 400;
}

/* Form Styles */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.fields-container {
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

/* LABELS */
.input-group label {
    font-size: 0.9rem;
    color: var(--c-azul);
    /* Título do campo em azul/verde água */
    font-weight: 600;
    margin-left: 4px;
}

/* INPUTS */
.input-group input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid transparent;
    /* Sem borda visível inicialmente */
    background-color: #f1f5f9;
    /* Fundo cinza azulado suave */
    border-radius: 12px;
    font-size: 1rem;
    color: var(--c-text-dark);
    transition: all 0.3s ease;
    outline: none;
}

.input-group input:focus {
    background-color: #fff;
    border-color: var(--c-azul);
    /* Borda azul ao focar */
    box-shadow: 0 4px 12px rgba(25, 197, 203, 0.15);
}

.input-group input::placeholder {
    color: #aab4be;
    font-weight: 400;
}

.input-group input.error-border {
    border-color: var(--c-rosa);
    background-color: #fff5f6;
}

.row-group {
    display: flex;
    gap: 1rem;
}

/* BOTÃO PRIMÁRIO (SEM DEGRADÊ) */
.btn-primary {
    background-color: var(--c-azul);
    /* Cor chapada */
    color: white;
    padding: 15px;
    border: none;
    border-radius: 50px;
    /* Bem arredondado */
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: transform 0.2s, background-color 0.2s;
    width: 100%;
    box-shadow: 0 4px 10px rgba(25, 197, 203, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--c-azul-dark);
    transform: translateY(-2px);
}

.btn-primary:disabled {
    background-color: #ccc;
    cursor: wait;
    box-shadow: none;
}

/* Esqueci Senha */
.forgot-link {
    text-align: right;
    margin-top: -5px;
}

.forgot-link a {
    color: var(--c-text-light);
    font-size: 0.85rem;
    text-decoration: none;
    font-weight: 500;
}

.forgot-link a:hover {
    color: var(--c-azul);
    text-decoration: underline;
}

/* Toggle Mode (Rodapé do form) */
.toggle-container {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.95rem;
    color: var(--c-text);
}

.toggle-container a {
    color: var(--c-rosa);
    /* Rosa para destaque */
    font-weight: 700;
    text-decoration: none;
    margin-left: 5px;
}

.toggle-container a:hover {
    color: var(--c-rosa-dark);
}

/* Divisor */
.divider {
    display: flex;
    align-items: center;
    margin: 2rem 0;
    color: #ccc;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
}

.divider span {
    padding: 0 15px;
    color: #aaa;
}

/* Botões Sociais */
.social-buttons {
    display: flex;
    gap: 1rem;
}

.social-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: var(--c-text-dark);
    transition: all 0.2s;
    font-size: 0.95rem;
}

.social-btn:hover {
    background: #f9f9f9;
    border-color: #ddd;
}

.social-btn.google {
    color: #DB4437;
}

.social-btn.facebook {
    color: #4267B2;
}

/* ALERTAS */
.alert-box {
    padding: 12px 16px;
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

/* MODAL */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.modal-header h3 {
    color: var(--c-azul-dark);
    font-size: 1.4rem;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #ccc;
    cursor: pointer;
    line-height: 1;
}

.close-btn:hover {
    color: var(--c-rosa);
}

.btn-modal {
    width: 100%;
    margin-top: 1.5rem;
}

.mini-alert {
    font-size: 0.85rem;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    text-align: center;
}

.mini-alert.error {
    background: #ffebee;
    color: #d32f2f;
}

.mini-alert.success {
    background: #e8f5e9;
    color: #388e3c;
}

/* Animações e Transições */
.swing-in-top-fwd {
    animation: swing-in-top-fwd 0.6s cubic-bezier(0.175, 0.885, 0.320, 1.275) both;
}

@keyframes swing-in-top-fwd {
    0% {
        transform: rotateX(-100deg);
        transform-origin: top;
        opacity: 0;
    }

    100% {
        transform: rotateX(0deg);
        transform-origin: top;
        opacity: 1;
    }
}

.scale-in-center {
    animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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

/* Transições Vue */
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.list-leave-active {
    position: absolute;
    width: 100%;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* Loader Spinner */
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

@media (max-width: 480px) {
    .auth-card {
        padding: 2rem 1.5rem;
    }

    .row-group {
        flex-direction: column;
        gap: 1.2rem;
    }
}
</style>