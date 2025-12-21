<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminCheckoutStore } from '@/stores/adminCheckout'
import AdminCartSelector from './AdminCartSelector.vue'
import {
    faTruck, faStore, faMapPin, faSearch, faCalendarAlt,
    faClock, faMoneyBillWave, faTag, faCreditCard, faHandHoldingUsd,
    faSpinner, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const API_URL = import.meta.env.VITE_API_URL
const store = useAdminCheckoutStore()
const isCepLoading = ref(false)
const isShippingLoading = ref(false)

const searchLoading = ref(false)
const searchError = ref('')
const foundAddresses = ref<any[]>([])

const modalSearch = ref({
    street: '',
    city: 'Uberaba',
    state: 'MG'
})

const handleCep = async () => {
    const cep = store.address.cep.replace(/\D/g, '')

    if (cep.length !== 8) return

    isCepLoading.value = true

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)

        if (!res.ok) throw new Error('CEP não encontrado')

        const data = await res.json()

        store.address.street = data.street
        store.address.neighborhood = data.neighborhood
        store.address.city = data.city
        store.address.state = data.state

        document.getElementById('addr-num')?.focus()
        if (store.address.number) calculateShipping()

    } catch (e) {
        try {
            const resBackup = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const dataBackup = await resBackup.json()

            if (!dataBackup.erro) {
                store.address.street = dataBackup.logradouro
                store.address.neighborhood = dataBackup.bairro
                store.address.city = dataBackup.localidade
                store.address.state = dataBackup.uf
                document.getElementById('addr-num')?.focus()
                if (store.address.number) calculateShipping()
                return
            }
        } catch (e2) {
            console.error('Falha nos serviços de CEP')
        }
        if (!store.address.street) store.showAddressModal = true
    } finally {
        isCepLoading.value = false
    }
}

const searchAddressByStreet = async () => {
    const { street, city, state } = modalSearch.value

    if (street.length < 3) {
        searchError.value = 'Digite pelo menos 3 letras da rua.'
        return
    }

    searchLoading.value = true
    searchError.value = ''
    foundAddresses.value = []

    try {
        const url = `https://viacep.com.br/ws/${state}/${city}/${encodeURIComponent(street)}/json/`
        const res = await fetch(url)
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
            foundAddresses.value = data
        } else {
            searchError.value = 'Nenhum endereço encontrado.'
        }
    } catch (e) {
        searchError.value = 'Erro ao buscar endereço. Verifique a conexão.'
    } finally {
        searchLoading.value = false
    }
}

const selectAddress = (addr: any) => {
    store.address.cep = addr.cep
    store.address.street = addr.logradouro
    store.address.neighborhood = addr.bairro
    store.address.city = addr.localidade
    store.address.state = addr.uf

    store.showAddressModal = false
    foundAddresses.value = []
    modalSearch.value.street = ''

    if (store.address.number) calculateShipping()
}

const maskCep = (e: Event) => {
    const el = e.target as HTMLInputElement
    let v = el.value.replace(/\D/g, '')
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2')
    store.address.cep = v
    el.value = v
}

const calculateShipping = async () => {
    if (!store.address.cep || !store.address.number) return
    if (store.deliveryMethod === 'pickup') {
        store.shippingFee = 0
        return
    }

    isShippingLoading.value = true
    try {
        const payload = {
            cep: store.address.cep,
            street: store.address.street,
            number: store.address.number,
            city: store.address.city,
            state: store.address.state,
        }
        const response = await fetch(`${API_URL}/shipping/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (response.ok) {
            const data = await response.json()
            store.shippingFee = data.fee
        }
    } catch (e) {
        console.error('Erro frete:', e)
    } finally {
        isShippingLoading.value = false
    }
}

let timeout: any
watch(() => [store.address.number, store.deliveryMethod], () => {
    if (store.deliveryMethod === 'pickup') {
        store.shippingFee = 0
        return
    }
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        if (store.address.cep.length >= 8 && store.address.number) calculateShipping()
    }, 800)
})

const availableTimes = computed(() => {
    const times = []
    for (let i = 8; i <= 20; i++) times.push(`${String(i).padStart(2, '0')}:00`)
    return times
})
const minDate = new Date().toISOString().split('T')[0]

interface PaymentOption {
    val: 'pix' | 'cash' | 'card';
    label: string;
    icon: any;
}
const paymentOptions: PaymentOption[] = [
    { val: 'pix', label: 'PIX', icon: faPix },
    { val: 'cash', label: 'Dinheiro', icon: faMoneyBillWave },
    { val: 'card', label: 'Cartão', icon: faCreditCard },
]
</script>

<template>
    <div class="admin-delivery-form">

        <div class="section-block">
            <h3 class="block-title">Método de Entrega</h3>
            <div class="toggle-group">
                <button type="button" class="toggle-btn" :class="{ active: store.deliveryMethod === 'delivery' }"
                    @click="store.deliveryMethod = 'delivery'">
                    <FontAwesomeIcon :icon="faTruck" /> Entrega
                </button>
                <button type="button" class="toggle-btn" :class="{ active: store.deliveryMethod === 'pickup' }"
                    @click="store.deliveryMethod = 'pickup'">
                    <FontAwesomeIcon :icon="faStore" /> Retirada
                </button>
            </div>
        </div>

        <div v-if="store.deliveryMethod === 'delivery'" class="section-block">
            <div class="block-header">
                <h3 class="block-title">Endereço</h3>
                <span v-if="isShippingLoading" class="badge-loading">
                    <FontAwesomeIcon :icon="faSpinner" spin /> Calculando frete...
                </span>
                <button v-else type="button" class="btn-link" @click="store.showAddressModal = true">
                    <FontAwesomeIcon :icon="faMapPin" /> Não sei o CEP
                </button>
            </div>

            <div class="form-grid">
                <div class="form-group span-2">
                    <label>CEP</label>
                    <div class="input-icon-wrapper">
                        <input type="text" :value="store.address.cep" @input="maskCep" @blur="handleCep"
                            placeholder="00000-000">
                        <FontAwesomeIcon :icon="isCepLoading ? faSpinner : faSearch" :spin="isCepLoading"
                            class="icon-r" />
                    </div>
                </div>
                <div class="form-group span-4">
                    <label>Rua</label>
                    <input type="text" v-model="store.address.street" placeholder="Rua..." :readonly="isCepLoading">
                </div>
                <div class="form-group span-2">
                    <label>Número</label>
                    <input id="addr-num" type="text" v-model="store.address.number" @blur="calculateShipping"
                        placeholder="123">
                </div>
                <div class="form-group span-4">
                    <label>Bairro</label>
                    <input type="text" v-model="store.address.neighborhood" placeholder="Bairro...">
                </div>
                <div class="form-group span-6">
                    <label>Complemento</label>
                    <input type="text" v-model="store.address.complement" placeholder="Apto, Bloco, Referência...">
                </div>
            </div>
        </div>

        <div class="section-block">
            <h3 class="block-title">Agendamento</h3>
            <div class="form-grid">
                <div class="form-group span-3">
                    <label>Data</label>
                    <div class="input-icon-wrapper left">
                        <FontAwesomeIcon :icon="faCalendarAlt" class="icon-l" />
                        <input type="date" v-model="store.schedule.date" :min="minDate">
                    </div>
                </div>
                <div class="form-group span-3">
                    <label>Horário</label>
                    <div class="input-icon-wrapper left">
                        <FontAwesomeIcon :icon="faClock" class="icon-l" />
                        <select v-model="store.schedule.time">
                            <option value="" disabled>--:--</option>
                            <option v-for="t in availableTimes" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-block">
            <h3 class="block-title">Seleção de Carrinhos</h3>
            <AdminCartSelector />
        </div>

        <div class="section-block">
            <h3 class="block-title">Pagamento</h3>
            <div class="payment-modes">
                <label class="mode-radio">
                    <input type="radio" value="offline" v-model="store.paymentMode">
                    <span class="radio-box">
                        <FontAwesomeIcon :icon="faHandHoldingUsd" /> Na Entrega/Retirada
                    </span>
                </label>
            </div>
            <div v-if="store.paymentMode === 'offline'" class="payment-methods-grid">
                <button v-for="opt in paymentOptions" :key="opt.val" type="button" class="pm-btn"
                    :class="{ active: store.paymentMethod === opt.val }" @click="store.paymentMethod = opt.val">
                    <FontAwesomeIcon :icon="opt.icon" class="pm-icon" />
                    <span>{{ opt.label }}</span>
                </button>
            </div>
        </div>

        <div class="section-block values-block">
            <div class="block-header">
                <h3 class="block-title">Valores (Editável)</h3>
                <div class="badges">
                    <span v-if="store.isAutoDiscount" class="badge-info">Automático</span>
                    <span v-else class="badge-warn">Manual</span>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group span-3">
                    <label>Frete (R$)</label>
                    <div class="input-icon-wrapper left">
                        <FontAwesomeIcon :icon="faTruck" class="icon-l" />
                        <input type="number" v-model.number="store.shippingFee" step="0.50" min="0">
                    </div>
                </div>
                <div class="form-group span-3">
                    <label>Desconto (R$)</label>
                    <div class="input-icon-wrapper left">
                        <FontAwesomeIcon :icon="faTag" class="icon-l" />
                        <input type="number" :value="store.discount" @input="(e) => {
                            store.discount = Number((e.target as HTMLInputElement).value);
                            store.isAutoDiscount = false
                        }" step="0.50" min="0">
                    </div>
                </div>
            </div>
        </div>


        <Teleport to="body">
            <div v-if="store.showAddressModal" class="modal-overlay">
                <div class="modal-card">
                    <div class="modal-header">
                        <h3>Buscar Endereço</h3>
                        <button class="btn-close" @click="store.showAddressModal = false">
                            <FontAwesomeIcon :icon="faTimes" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-desc">
                            Digite o nome da rua para encontrar o CEP automaticamente.
                        </p>

                        <div class="search-inputs">
                            <div class="form-grid" style="margin-bottom: 10px;">
                                <div class="form-group span-2">
                                    <label>UF</label>
                                    <input type="text" v-model="modalSearch.state" maxlength="2">
                                </div>
                                <div class="form-group span-4">
                                    <label>Cidade</label>
                                    <input type="text" v-model="modalSearch.city">
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <label>Nome da Rua (Logradouro)</label>
                                <div class="input-icon-wrapper">
                                    <input type="text" v-model="modalSearch.street" placeholder="Ex: Avenida Leopoldino"
                                        @keyup.enter="searchAddressByStreet">
                                    <button class="btn-search-icon" @click="searchAddressByStreet">
                                        <FontAwesomeIcon :icon="searchLoading ? faSpinner : faSearch"
                                            :spin="searchLoading" />
                                    </button>
                                </div>
                            </div>

                            <div v-if="searchError" class="error-msg">
                                {{ searchError }}
                            </div>
                        </div>

                        <div v-if="foundAddresses.length > 0" class="results-list custom-scrollbar">
                            <div v-for="(addr, idx) in foundAddresses" :key="idx" class="result-item"
                                @click="selectAddress(addr)">
                                <div class="res-main">
                                    <strong>{{ addr.logradouro }}</strong>
                                    <span>{{ addr.bairro }}</span>
                                </div>
                                <div class="res-cep">
                                    {{ addr.cep }}
                                </div>
                            </div>
                        </div>

                        <div v-else-if="!searchLoading && modalSearch.street.length > 3 && !searchError"
                            class="empty-hint">
                            Clique na lupa para buscar.
                        </div>

                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<style scoped>
.btn-search-icon {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--c-azul);
    color: white;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.results-list {
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-top: 1rem;
}

.result-item {
    padding: 0.8rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
}

.result-item:last-child {
    border-bottom: none;
}

.result-item:hover {
    background: #f0f9ff;
}

.res-main {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
}

.res-main strong {
    color: var(--c-text-dark);
}

.res-main span {
    font-size: 0.8rem;
    color: #666;
}

.res-cep {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--c-azul);
    background: #e0f2fe;
    padding: 2px 6px;
    border-radius: 4px;
}

.error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.5rem;
}

.empty-hint {
    text-align: center;
    color: #999;
    font-size: 0.9rem;
    margin-top: 1rem;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #999;
}

.admin-delivery-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: var(--font-title);
}

.section-block {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.8rem;
    margin-bottom: 1.2rem;
}

.block-title {
    font-size: 1.1rem;
    color: var(--c-azul);
    font-weight: 700;
    margin: 0;
}

.badge-loading {
    font-size: 0.8rem;
    color: #666;
    display: flex;
    gap: 0.3rem;
    align-items: center;
}

.badge-info {
    background: #e0f2fe;
    color: #0284c7;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-warn {
    background: #fef3c7;
    color: #d97706;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.btn-link {
    background: none;
    border: none;
    color: var(--c-azul);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    font-family: var(--font-title);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
}

.span-2 {
    grid-column: span 2;
}

.span-3 {
    grid-column: span 3;
}

.span-4 {
    grid-column: span 4;
}

.span-6 {
    grid-column: span 6;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
}

.mb-3 {
    margin-bottom: 1rem;
}

.input-icon-wrapper {
    position: relative;
}

.input-icon-wrapper input,
.input-icon-wrapper select {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border 0.2s;
}

.input-icon-wrapper.left input,
.input-icon-wrapper.left select {
    padding-left: 2.4rem;
}

.icon-l {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
}

.icon-r {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
}

input,
select {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    color: #374151;
}

input:focus,
select:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 3px rgba(var(--c-azul-rgb), 0.1);
}

input[readonly] {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.toggle-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.toggle-btn {
    font-family: var(--font-title);
    flex: 1;
    padding: 0.9rem;
    border: 1px solid #e0e0e0;
    background: #f9fafb;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.toggle-btn.active {
    background: #eff6ff;
    border-color: var(--c-azul);
    color: var(--c-azul);
    box-shadow: 0 2px 8px rgba(var(--c-azul-rgb), 0.15);
}

.payment-modes {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.2rem;
}

.mode-radio input {
    display: none;
}

.mode-radio .radio-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    color: #666;
    font-weight: 600;
    transition: all 0.2s;
}

.mode-radio input:checked+.radio-box {
    border-color: var(--c-azul);
    background: #f0f9ff;
    color: var(--c-azul);
}

.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
}

.pm-btn {
    padding: 1rem;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
    font-family: var(--font-title);
}

.pm-btn:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
}

.pm-btn.active {
    border-color: var(--c-azul);
    background: #f0f9ff;
    color: var(--c-azul);
    box-shadow: 0 4px 10px rgba(var(--c-azul-rgb), 0.15);
}

.pm-icon {
    font-size: 1.6rem;
    margin-bottom: 0.2rem;
}

.values-block {
    background: #f8fafc;
    border-color: #e2e8f0;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-card {
    background: #fff;
    width: 90%;
    max-width: 450px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
}

.modal-header {
    background: #f8fafc;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--c-text-dark);
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #999;
    cursor: pointer;
    font-family: var(--font-title);
}

.modal-body {
    padding: 1.5rem;
}

.modal-desc {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.4;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 600px) {
    .form-grid {
        display: flex;
        flex-direction: column;
    }

    .section-block {
        padding: 1.2rem;
    }

    .payment-methods-grid {
        grid-template-columns: 1fr;
    }

    .toggle-group {
        flex-direction: column;
    }
}
</style>