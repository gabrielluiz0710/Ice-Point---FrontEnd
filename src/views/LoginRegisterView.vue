<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/service/supabase'
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const isLoginMode = ref(true)
const isLoading = ref(false)
const showForgotModal = ref(false)
const showSuccessModal = ref(false)

const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'error' | ''>('')

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const phone = ref('')
const birthDate = ref('')

const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotMsg = ref('')
const forgotType = ref<'success' | 'error' | ''>('')

const API_URL = import.meta.env.VITE_API_URL


const passwordsMatch = computed(() => {
    return isLoginMode.value || password.value === confirmPassword.value
})

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

const isValidDateAndAge = (dateString: string): { valid: boolean, msg?: string } => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return { valid: false, msg: 'Data inválida.' }

    const parts = dateString.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const currentYear = new Date().getFullYear()

    if (year < 1900 || year > currentYear) return { valid: false, msg: 'Ano inválido.' }
    if (month < 0 || month > 11) return { valid: false, msg: 'Mês inválido.' }

    const dateObj = new Date(year, month, day)
    if (dateObj.getDate() !== day || dateObj.getMonth() !== month || dateObj.getFullYear() !== year) {
        return { valid: false, msg: 'Data inexistente.' }
    }

    const today = new Date()
    let age = today.getFullYear() - dateObj.getFullYear()
    const m = today.getMonth() - dateObj.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
        age--
    }

    if (age < 18) return { valid: false, msg: 'Você precisa ter mais de 18 anos.' }

    return { valid: true }
}

const convertDateToISO = (dateString: string) => {
    const parts = dateString.split('/')
    return `${parts[2]}-${parts[1]}-${parts[0]}`
}

const handleAuth = async () => {
    feedbackMsg.value = ''

    if (!isLoginMode.value) {
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

        const rawPhone = phone.value.replace(/\D/g, '')
        if (rawPhone.length < 10) {
            showFeedback('Telefone incompleto.', 'error')
            return
        }

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
            const { data: { session } } = await userStore.supabase.auth.getSession()
            const token = session?.access_token
            try {

                const response = await axios.post(`${API_URL}/auth/check-email`, {
                    email: email.value
                });

                const statusUsuario = response.data.status;

                if (statusUsuario === 'confirmado') {
                    showFeedback('Você já tem uma conta confirmada! Redirecionando...', 'error');
                    setTimeout(() => {
                        isLoginMode.value = true;
                        feedbackMsg.value = '';
                    }, 2000);
                    isLoading.value = false;
                    return;
                }

                if (statusUsuario === 'pendente') {
                    showFeedback('Este email já está cadastrado, mas falta confirmar! Verifique sua caixa de entrada.', 'error');
                    isLoading.value = false;
                    return;
                }

            } catch (apiError) {
                console.error('Erro ao consultar backend:', apiError);
                // Se sua API cair, você decide: bloqueia ou deixa tentar cadastrar?
                // Sugiro deixar passar para o supabase.auth tentar tratar
            }

            const isoDate = convertDateToISO(birthDate.value)

            const result = await userStore.register({
                email: email.value,
                password: password.value,
                name: name.value,
                phone: phone.value,
                birthDate: isoDate
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

        const errorMsg = error.message || ''
        const errorLower = errorMsg.toLowerCase()

        if (errorLower.includes('user already registered') || errorLower.includes('email já cadastrado')) {
            showFeedback('Este email já possui conta! Redirecionando para o login...', 'error')

            setTimeout(() => {
                isLoginMode.value = true
                feedbackMsg.value = ''
            }, 2000)

            return
        }

        const translatedMsg = translateSupabaseError(errorMsg)
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

    const baseUrl = window.location.origin.replace(/\/$/, '')
    const redirectUrl = `${baseUrl}/atualizar-senha`

    console.log('Enviando reset para:', redirectUrl)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.value, {
        redirectTo: redirectUrl,
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

const formatPhone = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')

    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2')
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1')
    }

    phone.value = value
    input.value = value
}

const formatDate = (event: Event) => {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '')

    if (value.length > 8) value = value.slice(0, 8)

    if (value.length >= 5) {
        value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2')
    }

    birthDate.value = value
    input.value = value
}

onMounted(() => {
    window.scrollTo(0, 0);

    const hash = window.location.hash

    // Detecta o "erro" que na verdade é sucesso de verificação
    if (hash && hash.includes('error_code=otp_expired')) {
        router.replace('/login') // Limpa a URL
        isLoginMode.value = true // Garante que está na aba de Login
        showSuccessModal.value = true // Exibe o modal bonitinho
        return
    }

    // Erros genéricos
    if (hash && hash.includes('error_description')) {
        const params = new URLSearchParams(hash.substring(1))
        const description = params.get('error_description')?.replace(/\+/g, ' ')
        showFeedback(description || 'Link inválido ou expirado.', 'error')
        router.replace('/login')
    }
});
</script>

<template>
    <div class="page-wrapper">
        <div class="auth-card swing-in-top-fwd">

            <div class="auth-header">
                <h1>{{ isLoginMode ? 'Login' : 'Crie sua conta' }}</h1>
            </div>

            <transition name="fade">
                <div v-if="feedbackMsg" :class="['alert-box', feedbackType]">
                    {{ feedbackMsg }}
                </div>
            </transition>

            <form @submit.prevent="handleAuth" class="auth-form">

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
                            <input id="birthDate" type="text" :value="birthDate" @input="formatDate"
                                placeholder="dd/mm/aaaa" maxlength="10" />
                        </div>
                    </div>
                </transition-group>

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

        <transition name="modal-fade">
            <div v-if="showSuccessModal" class="modal-overlay">
                <div class="modal-card scale-in-center success-modal">
                    <div class="modal-body success-body">
                        <div class="success-icon-wrapper">
                            <font-awesome-icon :icon="faCheckCircle" class="success-icon" />
                        </div>
                        <h3>Email Confirmado!</h3>
                        <p>Sua conta foi ativada com sucesso.</p>
                        <p>Agora você já pode fazer login e aproveitar o melhor sorvete da cidade! 🍦</p>

                        <button @click="showSuccessModal = false" class="btn-primary btn-modal">
                            Fazer Login
                        </button>
                    </div>
                </div>
            </div>
        </transition>
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
    position: relative;
    border: 1px solid #f0f0f0;
}

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

.toggle-container {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.95rem;
    color: var(--c-text);
}

.toggle-container a {
    color: var(--c-rosa);
    font-weight: 700;
    text-decoration: none;
    margin-left: 5px;
}

.toggle-container a:hover {
    color: var(--c-rosa-dark);
}

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

.success-modal {
    text-align: center;
    max-width: 380px;
}

.success-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 10px 0;
}

.success-body h3 {
    color: var(--c-azul-dark);
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0;
}

.success-body p {
    color: var(--c-text);
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
}

.success-icon-wrapper {
    margin-bottom: 10px;
}

.success-icon {
    font-size: 4rem;
    color: #4CAF50;
    border-radius: 50%;
    animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
}
</style>