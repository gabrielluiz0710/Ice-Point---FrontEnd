<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import { faSpinner, faCheckCircle, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const API_URL = import.meta.env.VITE_API_URL
const store = useAdminCheckoutStore()

const isLoading = ref(false)
const error = ref('')
const availability = ref<any>(null)
const selections = ref<Record<string, number>>({})

const getCartImage = (colorName: string) => {
    const key = colorName.toLowerCase().trim()

    const map: Record<string, string> = {
        'azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
        'rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
        'azul/rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
        'misto': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
    }

    return map[key] || map['misto']
}

const currentSelected = computed(() => Object.values(selections.value).reduce((a, b) => a + b, 0))

const fetchAvailability = async () => {
    if (!store.schedule.date || !store.schedule.time) return

    isLoading.value = true
    error.value = ''
    try {
        const dateTimeStr = `${store.schedule.date}T${store.schedule.time}:00`
        const response = await fetch(`${API_URL}/cart/availability?date=${dateTimeStr}`)
        if (!response.ok) throw new Error('Erro na API')

        availability.value = await response.json()

        const newSelections: Record<string, number> = {}
        if (availability.value?.byColor) {
            Object.keys(availability.value.byColor).forEach(key => {
                const savedItem = store.selectedCarts.find(sc => sc.color === key)
                newSelections[key] = savedItem ? savedItem.quantity : 0
            })
        }
        selections.value = newSelections

    } catch (e) {
        error.value = 'Erro ao buscar disponibilidade.'
    } finally {
        isLoading.value = false
    }
}

watch(selections, (newVal) => {
    if (!availability.value) return

    const final = Object.entries(newVal)
        .filter(([_, qty]) => qty > 0)
        .map(([color, qty]) => {
            const details = availability.value.details.filter((c: any) => c.cor === color)
            return {
                color,
                quantity: qty,
                cartIds: details.slice(0, qty).map((c: any) => c.id)
            }
        })
    store.selectedCarts = final
}, { deep: true })

watch(() => [store.schedule.date, store.schedule.time], (newVal, oldVal) => {
    const [newDate, newTime] = newVal
    const [oldDate, oldTime] = oldVal || []

    if (newDate !== oldDate || newTime !== oldTime) {
        store.selectedCarts = []
        selections.value = {}
        fetchAvailability()
    }
})

const increment = (key: string | number, max: number) => {
    const color = String(key)
    if (selections.value[color] < max && currentSelected.value < store.requiredCartsCount) {
        selections.value[color]++
    }
}

const decrement = (key: string | number) => {
    const color = String(key)
    if (selections.value[color] > 0) {
        selections.value[color]--
    }
}
onMounted(() => {
    window.scrollTo(0, 0);
    if (store.schedule.date && store.schedule.time) {
        fetchAvailability()
    }
})
</script>

<template>
    <div class="cart-selector-admin">
        <div v-if="!store.schedule.date" class="wait-msg">Selecione data e hora primeiro.</div>

        <div v-else-if="isLoading" class="loading">
            <FontAwesomeIcon :icon="faSpinner" spin /> Buscando estoque...
        </div>

        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else-if="availability" class="selector-grid">
            <div class="header-req">
                Necessário: <strong>{{ store.requiredCartsCount }}</strong> |
                Selecionado: <strong>{{ currentSelected }}</strong>
                <span v-if="store.isCartSelectionComplete" class="ok-badge">
                    <FontAwesomeIcon :icon="faCheckCircle" /> OK
                </span>
            </div>

            <div class="cards-wrapper">
                <div v-for="(qtd, color) in availability.byColor" :key="color" class="mini-card"
                    :class="{ 'disabled': qtd === 0, 'selected': selections[color] > 0 }">

                    <img :src="getCartImage(String(color))" class="cart-img">

                    <div class="info">
                        <span class="color-name">{{ color }}</span>
                        <small>{{ qtd }} disp.</small>
                    </div>

                    <div class="controls">
                        <button @click="decrement(color)" :disabled="selections[color] === 0">
                            <FontAwesomeIcon :icon="faMinus" />
                        </button>

                        <span>{{ selections[color] }}</span>

                        <button @click="increment(color, qtd)"
                            :disabled="selections[color] >= qtd || currentSelected >= store.requiredCartsCount">
                            <FontAwesomeIcon :icon="faPlus" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cart-selector-admin {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.wait-msg {
    color: #999;
    font-style: italic;
    font-size: 0.9rem;
    text-align: center;
}

.loading {
    text-align: center;
    color: var(--c-azul);
}

.header-req {
    margin-bottom: 1rem;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.ok-badge {
    color: #10b981;
    font-weight: bold;
    margin-left: auto;
}

.cards-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.8rem;
}

.mini-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.2s;
}

.mini-card.selected {
    border-color: var(--c-azul);
    box-shadow: 0 0 0 2px rgba(var(--c-azul-rgb), 0.1);
}

.mini-card.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.cart-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-bottom: 0.3rem;
}

.info {
    font-size: 0.85rem;
    line-height: 1.2;
    margin-bottom: 0.5rem;
}

.info small {
    color: #64748b;
    display: block;
}

.controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
    padding: 2px;
}

.controls button {
    width: 24px;
    height: 24px;
    border: none;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    color: var(--c-azul);
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.controls button:disabled {
    color: #ccc;
}

.controls span {
    font-weight: 700;
    font-size: 0.9rem;
    min-width: 15px;
}
</style>