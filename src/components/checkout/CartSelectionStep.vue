<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import { faSnowflake, faCheck, faMinus, faPlus, faSpinner, faExclamationTriangle, faFaceFrown, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const API_URL = import.meta.env.VITE_API_URL
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const emit = defineEmits(['completed', 'back'])

interface CartDetail {
    id: number
    identificacao: string
    cor: string
    capacidade: number
}

const availability = ref<{
    totalAvailable: number,
    byColor: Record<string, number>,
    details: CartDetail[]
} | null>(null)

const isLoading = ref(true)
const error = ref('')
const selections = ref<Record<string, number>>({})

const cartImages: Record<string, string> = {
    'Azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
    'Rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
    'Azul/Rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'default': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
}

const currentSelectedCount = computed(() => {
    return Object.values(selections.value).reduce((a, b) => a + b, 0)
})

const remainingToSelect = computed(() => {
    return checkoutStore.requiredCartsCount - currentSelectedCount.value
})

const progressPercentage = computed(() => {
    if (checkoutStore.requiredCartsCount === 0) return 0
    return (currentSelectedCount.value / checkoutStore.requiredCartsCount) * 100
})

const fetchAvailability = async () => {
    if (!checkoutStore.schedule.date || !checkoutStore.schedule.time) {
        error.value = 'Data ou horário não selecionados. Por favor, volte para a etapa anterior.'
        isLoading.value = false
        return
    }

    isLoading.value = true
    error.value = ''
    try {
        const dateTimeStr = `${checkoutStore.schedule.date}T${checkoutStore.schedule.time}:00`

        const sessionStr = localStorage.getItem('sb-db-auth-token')
        const token = sessionStr ? JSON.parse(sessionStr).access_token : null

        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const response = await fetch(`${API_URL}/cart/availability?date=${dateTimeStr}`, {
            method: 'GET',
            headers
        })

        if (!response.ok) throw new Error('Erro ao consultar disponibilidade')

        const data = await response.json()
        availability.value = data

        const newSelections: Record<string, number> = {}

        if (data.byColor) {
            Object.keys(data.byColor).forEach(color => {
                newSelections[color] = 0
            })

            if (checkoutStore.selectedCarts && checkoutStore.selectedCarts.length > 0) {
                checkoutStore.selectedCarts.forEach(savedItem => {
                    const matchingKey = Object.keys(newSelections).find(
                        k => k.toLowerCase() === savedItem.color.toLowerCase()
                    )

                    if (matchingKey) {
                        const maxAvailable = data.byColor[matchingKey] || 0
                        const qtyToRestore = Math.min(savedItem.quantity, maxAvailable)

                        newSelections[matchingKey] = qtyToRestore
                    }
                })
            }
        }

        selections.value = newSelections

    } catch (err) {
        console.error(err)
        error.value = 'Não foi possível verificar a disponibilidade. Tente outro horário.'
    } finally {
        isLoading.value = false
    }
}

const getImage = (color: string) => {
    const key = Object.keys(cartImages).find(k => k.toLowerCase() === color.toLowerCase())
    return key ? cartImages[key] : cartImages['default']
}

const increment = (color: string) => {
    const maxAvailable = availability.value?.byColor[color] || 0
    const current = selections.value[color] || 0

    if (current < maxAvailable && currentSelectedCount.value < checkoutStore.requiredCartsCount) {
        selections.value[color]++
    }
}

const decrement = (color: string) => {
    if (selections.value[color] > 0) {
        selections.value[color]--
    }
}

watch(selections, (newSelections) => {
    const availableDetails = availability.value?.details || []

    if (availableDetails.length === 0 && availability.value) {
        console.warn('⚠️ API retornou disponibilidade, mas a lista de "details" está vazia!')
    }

    const finalSelection = Object.entries(newSelections)
        .filter(([_, qty]) => qty > 0)
        .map(([colorKey, qty]) => {
            const cartsOfThisColor = availableDetails.filter(c =>
                c.cor && c.cor.toLowerCase() === colorKey.toLowerCase()
            )

            const selectedIds = cartsOfThisColor
                .slice(0, qty)
                .map(c => c.id)

            console.log(`Cor: ${colorKey}, Qtd: ${qty}, IDs encontrados:`, selectedIds)

            return {
                color: colorKey,
                quantity: qty,
                cartIds: selectedIds
            }
        })

    checkoutStore.selectedCarts = finalSelection
}, { deep: true })

onMounted(() => {
    checkoutStore.loadFromStorage()

    setTimeout(() => {
        fetchAvailability()
    }, 100)
})
</script>

<template>
    <div class="cart-selection-container">

        <div class="info-header">
            <div class="header-left">
                <div class="popsicle-count">
                    <font-awesome-icon :icon="faSnowflake" class="icon-snow" />
                    <span>Total: <strong>{{ checkoutStore.totalPopsicles }}</strong> picolés</span>
                </div>
                <div class="capacity-hint">Capacidade máx: 250un/carrinho</div>
            </div>

            <div class="header-right">
                <div class="badge-requirement">
                    Necessário: {{ checkoutStore.requiredCartsCount }} carrinho(s)
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="state-container">
            <font-awesome-icon :icon="faSpinner" spin class="loading-icon" />
            <p>Verificando carrinhos disponíveis...</p>
        </div>

        <div v-else-if="error" class="state-container error">
            <font-awesome-icon :icon="faExclamationTriangle" class="error-icon" />
            <p>{{ error }}</p>
            <button class="retry-btn" @click="fetchAvailability">Tentar Novamente</button>
        </div>

        <div v-else-if="availability && availability.totalAvailable === 0" class="state-container empty-state">
            <div class="sad-icon-wrapper">
                <font-awesome-icon :icon="faFaceFrown" class="sad-icon" />
            </div>

            <h3>Poxa! Sem carrinhos disponíveis.</h3>
            <p class="empty-desc">
                Infelizmente não temos carrinhos livres para esta data e horário.
            </p>

            <div class="empty-actions">
                <a href="https://wa.me/5534999658035" target="_blank" class="action-btn whatsapp">
                    <font-awesome-icon :icon="faWhatsapp" />
                    Falar no WhatsApp
                </a>

                <span class="divider-text">ou</span>

                <p class="retry-text">
                    <font-awesome-icon :icon="faCalendarDays" />
                    Tente buscar por outra data e horário
                </p>
            </div>
        </div>

        <div v-else class="selection-content">
            <p class="instruction">
                Selecione as cores dos carrinhos para entrega em
                <strong>{{ checkoutStore.schedule.date.split('-').reverse().join('/') }}</strong>:
            </p>

            <div class="cards-grid">
                <div v-for="(qtdAvailable, color) in availability?.byColor" :key="color" class="cart-card" :class="{
                    'selected': selections[color] > 0,
                    'disabled': qtdAvailable === 0
                }">
                    <div class="stock-badge" :class="qtdAvailable > 0 ? 'in-stock' : 'out-stock'">
                        {{ qtdAvailable > 0 ? `${qtdAvailable} disp.` : 'Esgotado' }}
                    </div>

                    <div class="image-area">
                        <img :src="getImage(color)" :alt="color">
                    </div>

                    <div class="card-footer">
                        <h3>Carrinho {{ color }}</h3>

                        <div class="counter-control">
                            <button type="button" class="btn-control minus" @click="decrement(color)"
                                :disabled="selections[color] === 0">
                                <font-awesome-icon :icon="faMinus" />
                            </button>

                            <span class="qty-display">{{ selections[color] }}</span>

                            <button type="button" class="btn-control plus" @click="increment(color)"
                                :disabled="selections[color] >= qtdAvailable || currentSelectedCount >= checkoutStore.requiredCartsCount">
                                <font-awesome-icon :icon="faPlus" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-footer">
                <div class="progress-info">
                    <div class="progress-labels">
                        <span>Selecionado: <strong>{{ currentSelectedCount }}</strong>/{{
                            checkoutStore.requiredCartsCount }}</span>
                        <span v-if="remainingToSelect > 0" class="hint-text">Faltam {{ remainingToSelect }}</span>
                        <span v-else class="success-text">Pronto! Pode avançar.</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"
                            :class="{ 'filled': progressPercentage === 100 }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cart-selection-container {
    animation: fadeIn 0.4s ease;
}

.info-header {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.popsicle-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--c-azul, #0ea5e9);
    font-size: 1.1rem;
}

.capacity-hint {
    font-size: 0.8rem;
    color: #64748b;
    margin-left: 1.8rem;
}

.badge-requirement {
    background: var(--c-rosa, #ec4899);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: 0 2px 5px rgba(236, 72, 153, 0.3);
}

.state-container {
    text-align: center;
    padding: 3rem;
    color: #64748b;
}

.loading-icon {
    font-size: 2rem;
    color: var(--c-azul, #0ea5e9);
    margin-bottom: 1rem;
}

.error-icon {
    font-size: 2rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.retry-btn {
    font-family: var(--font-title);
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 8px;
    cursor: pointer;
}

.empty-state {
    padding: 2rem 1rem;
    animation: fadeIn 0.5s ease-out;
}

.sad-icon-wrapper {
    background: #f1f5f9;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.sad-icon {
    font-size: 3rem;
    color: #94a3b8;
}

.empty-state h3 {
    color: #334155;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-family: var(--font-title, sans-serif);
}

.empty-desc {
    color: #64748b;
    margin-bottom: 2rem;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
}

.empty-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
}

.action-btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.whatsapp {
    background-color: #25D366;
    color: white;
    box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
}

.action-btn.outline {
    background-color: white;
    border: 2px solid #e2e8f0;
    color: #64748b;
}

.action-btn.outline:hover {
    border-color: var(--c-azul, #0ea5e9);
    color: var(--c-azul, #0ea5e9);
}

.divider-text {
    font-size: 0.9rem;
    color: #cbd5e1;
    font-weight: 500;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.divider-text::before,
.divider-text::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
}

.divider-text::before {
    margin-right: 10px;
}

.divider-text::after {
    margin-left: 10px;
}

.retry-text {
    margin-top: 0.5rem;
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    background: #f8fafc;
    padding: 0.8rem;
    border-radius: 12px;
    width: 100%;
}

.retry-text svg {
    color: var(--c-azul, #0ea5e9);
    font-size: 1.1rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.cart-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
}

.cart-card.selected {
    border-color: var(--c-azul, #0ea5e9);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.cart-card.disabled {
    opacity: 0.6;
    filter: grayscale(1);
}

.stock-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 2;
}

.stock-badge.in-stock {
    background: #dcfce7;
    color: #166534;
}

.stock-badge.out-stock {
    background: #fee2e2;
    color: #991b1b;
}

.image-area {
    height: 160px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #f1f5f9 0%, #ffffff 70%);
}

.image-area img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
    transition: transform 0.3s;
}

.cart-card:hover:not(.disabled) .image-area img {
    transform: scale(1.1);
}

.card-footer {
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #f1f5f9;
}

.card-footer h3 {
    font-size: 1.1rem;
    color: #334155;
    margin-bottom: 1rem;
    font-family: var(--font-title, sans-serif);
}

.counter-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 10px;
}

.btn-control {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s;
    color: white;
}

.btn-control:active:not(:disabled) {
    transform: scale(0.9);
}

.btn-control.minus {
    background: #ef4444;
}

.btn-control.plus {
    background: var(--c-azul, #0ea5e9);
}

.btn-control:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
}

.qty-display {
    font-weight: bold;
    font-size: 1.2rem;
    min-width: 20px;
    color: #0f172a;
}

/* Footer Action */
.action-footer {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.progress-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.hint-text {
    color: #f59e0b;
    font-weight: 500;
}

.success-text {
    color: #10b981;
    font-weight: bold;
}

.progress-track {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--c-azul, #0ea5e9);
    transition: width 0.3s ease;
}

.progress-fill.filled {
    background: var(--c-rosa, #ec4899);
}

.instruction {
    text-align: center;
    padding-bottom: 1rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media(max-width: 600px) {
    .info-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .header-right {
        width: 100%;
        text-align: center;
    }
}
</style>