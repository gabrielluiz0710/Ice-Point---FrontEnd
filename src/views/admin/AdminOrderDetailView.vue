<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
    faBoxOpen,
    faClipboardCheck,
    faTruckFast,
    faHouseCircleCheck,
    faUserCircle,
    faLocationDot,
    faCreditCard,
    faMoneyBillWave,
    faChevronLeft,
    faSpinner,
    faIceCream,
    faBan,
    faEnvelope,
    faPhone,
    faReceipt,
    faCheckCircle,
    faCheckDouble,
    faClock,
    faUserShield,
    faSave,
    faHeadset,
    faFilePdf,
    faDownload,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CancelOrderModal from '@/components/orders/CancelOrderModal.vue'
import { useToast } from '@/stores/useToast'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const API_URL = import.meta.env.VITE_API_URL

const cartImages: Record<string, string> = {
    'azul': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/azul.webp',
    'rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/rosa.webp',
    'misto': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'azul/rosa': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp',
    'default': 'https://db.icepoint.com.br/storage/v1/object/public/images/carrinhos/misto.webp'
}

interface OrderItem {
    id: number; name: string; quantity: number; price: number; image: string;
}

interface Order {
    id: string; status: string; paymentStatus: string; displayStatus: string; date: string; requestDate: string; time: string;
    customer: { name: string; email: string; phone: string; };
    delivery: { method: 'delivery' | 'pickup'; address: string; };
    payment: { method: string; };
    cart: { name: string; image: string; };
    items: OrderItem[];
    summary: { deliveryFee: number; discount: number; };
    rawDeliveryDate: Date;
    registeredBy?: { nome: string; email: string; tipo: string; } | null;
}

const { addToast } = useToast()
const order = ref<Order | null>(null)
const isLoading = ref(true)
const showCancelModal = ref(false)
const isCancelling = ref(false)
const isUpdatingStatus = ref(false)
const selectedNewStatus = ref('')
const isUpdatingPayment = ref(false)
const selectedPaymentStatus = ref('')
const receiptElement = ref<HTMLElement | null>(null)
const isGeneratingPdf = ref(false)
const paymentReceiptElement = ref<HTMLElement | null>(null)
const isGeneratingPaymentPdf = ref(false)
const showStatusDropdown = ref(false)
const showPaymentDropdown = ref(false)

const getStatusLabel = (val: string) => availableStatuses.find(s => s.value === val)?.label || 'Selecione...'
const getPaymentLabel = (val: string) => paymentStatuses.find(s => s.value === val)?.label || 'Selecione...'

const selectStatus = (val: string) => {
    selectedNewStatus.value = val
    showStatusDropdown.value = false
}

const selectPayment = (val: string) => {
    selectedPaymentStatus.value = val
    showPaymentDropdown.value = false
}

const paymentStatuses = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PAGO', label: 'Pago' }
]

const availableStatuses = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'EM_PREPARACAO', label: 'Em Preparação' },
    { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para Entrega' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CONCLUIDO', label: 'Concluído' }
]

const goBack = () => router.push({ name: 'admin-encomendas' })

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-').map(Number)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

const formatIsoDate = (isoString: string) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString))
}

const getDisplayStatus = (status: string) => {
    const map: Record<string, string> = {
        'PENDENTE': 'Pendente', 'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento', 'PAGO': 'Pago',
        'CONFIRMADO': 'Confirmado', 'EM_PREPARACAO': 'Em Preparação', 'SAIU_PARA_ENTREGA': 'Saiu para Entrega',
        'ENTREGUE': 'Entregue', 'CONCLUIDO': 'Concluído', 'CANCELADO': 'Cancelado'
    }
    return map[status] || status
}

const fetchOrderDetails = async (orderId: string) => {
    isLoading.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return router.push('/login')

        const response = await fetch(`${API_URL}/encomendas/detalhes/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Erro ao buscar detalhes')
        const data = await response.json()

        let rawCartColor = data.carrinhos?.[0]?.cor || 'Misto'
        const datePart = data.dataAgendada || data.dataSolicitacao.split('T')[0]
        const timePart = data.horaAgendada || '00:00:00'
        const [y, m, d] = datePart.split('-').map(Number)
        const [h, min] = timePart.split(':').map(Number)

        order.value = {
            id: String(data.id),
            status: data.status,
            paymentStatus: data.statusPagamento,
            displayStatus: getDisplayStatus(data.status),
            date: formatDate(datePart),
            requestDate: formatIsoDate(data.dataSolicitacao),
            time: data.horaAgendada ? data.horaAgendada.substring(0, 5) : '00:00',
            rawDeliveryDate: new Date(y, m - 1, d, h, min),
            customer: {
                name: data.nomeCliente || 'Desconhecido',
                email: data.emailCliente || '-',
                phone: data.telefoneCliente || '-'
            },
            delivery: {
                method: data.metodoEntrega === 'DELIVERY' ? 'delivery' : 'pickup',
                address: data.metodoEntrega === 'DELIVERY'
                    ? `${data.enderecoLogradouro}, ${data.enderecoNumero} - ${data.enderecoBairro}`
                    : 'Retirada na Loja'
            },
            payment: { method: data.metodoPagamento },
            cart: {
                name: rawCartColor,
                image: cartImages[rawCartColor.toLowerCase()] || cartImages['default']
            },
            summary: {
                deliveryFee: Number(data.taxaEntrega),
                discount: Number(data.valorDesconto)
            },
            items: data.itens.map((i: any) => ({
                id: i.id,
                name: i.produto.nome,
                quantity: i.quantidade,
                price: Number(i.precoUnitarioCongelado),
                image: i.produto.imagemCapa || '/images/placeholder.png'
            })),
            registeredBy: data.cadastradoPor || null
        }
        if (order.value) {
            selectedNewStatus.value = data.status
            selectedPaymentStatus.value = data.statusPagamento
        }
    } catch (error) {
        console.error(error)
        order.value = null
    } finally {
        isLoading.value = false
    }
}

const handlePaymentUpdate = async () => {
    if (!order.value || !selectedPaymentStatus.value || selectedPaymentStatus.value === order.value.paymentStatus) return

    isUpdatingPayment.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()

        const response = await fetch(`${API_URL}/encomendas/${order.value.id}/pagamento`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: selectedPaymentStatus.value })
        })

        if (!response.ok) throw new Error('Falha ao atualizar pagamento')

        addToast('Pagamento atualizado com sucesso!', 'success')

        fetchOrderDetails(order.value.id)
    } catch (e) {
        console.error(e)
        addToast('Erro ao atualizar pagamento.', 'error')
    } finally {
        isUpdatingPayment.value = false
    }
}

const handleStatusUpdate = async () => {
    if (!order.value || !selectedNewStatus.value) return

    if (selectedNewStatus.value === order.value.status) return

    isUpdatingStatus.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()

        const response = await fetch(`${API_URL}/encomendas/${order.value.id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: selectedNewStatus.value })
        })

        if (!response.ok) throw new Error('Falha ao atualizar')

        order.value.status = selectedNewStatus.value
        order.value.displayStatus = getDisplayStatus(selectedNewStatus.value)

        addToast('Status atualizado e e-mails enviados!', 'success')
    } catch (e) {
        console.error(e)
        addToast('Erro ao atualizar status do pedido.', 'error')
    } finally {
        isUpdatingStatus.value = false
    }
}

const subtotal = computed(() => order.value?.items.reduce((t, i) => t + i.price * i.quantity, 0) || 0)
const grandTotal = computed(() => (subtotal.value + (order.value?.summary.deliveryFee || 0)) - (order.value?.summary.discount || 0))

const paymentIcon = computed(() => {
    const m = order.value?.payment.method
    if (m === 'PIX') return { icon: faPix, color: '#32BCAD', label: 'Pix' }
    if (m === 'CASH') return { icon: faMoneyBillWave, color: '#16a34a', label: 'Dinheiro' }
    return { icon: faCreditCard, color: '#2563eb', label: 'Cartão' }
})

const currentStatusIndex = computed(() => {
    if (!order.value) return 0
    const s = order.value.status
    if (s === 'CANCELADO') return -1
    const levels = ['PENDENTE', 'CONFIRMADO', 'EM_PREPARACAO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CONCLUIDO']
    if (['PENDENTE', 'AGUARDANDO_PAGAMENTO'].includes(s)) return 1
    if (['PAGO', 'CONFIRMADO'].includes(s)) return 2
    if (s === 'EM_PREPARACAO') return 3
    if (s === 'SAIU_PARA_ENTREGA') return 4
    if (['ENTREGUE', 'CONCLUIDO'].includes(s)) return 5
    return 1
})

const statusSteps = [
    { label: 'Recebido', icon: faClipboardCheck },
    { label: 'Confirmado', icon: faCheckCircle },
    { label: 'Produção', icon: faBoxOpen },
    { label: 'Transporte', icon: faTruckFast },
    { label: 'Finalizado', icon: faCheckDouble }
]

const handleCancelOrder = async (reason: string) => {
    if (!order.value) return
    isCancelling.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        await fetch(`${API_URL}/encomendas/${order.value.id}/cancelar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo: reason })
        })
        order.value.status = 'CANCELADO'
        order.value.displayStatus = 'Cancelado'
        showCancelModal.value = false
        addToast('Encomenda cancelada com sucesso!', 'success')
    } catch (e) {
        addToast('Erro ao cancelar encomenda.', 'error')
    } finally {
        isCancelling.value = false
    }
}

const downloadReceipt = async () => {
    if (!order.value || !receiptElement.value) return

    isGeneratingPdf.value = true
    try {
        const opt = {
            margin: 10,
            filename: `Recibo_Pedido_${order.value.id}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 800
            },
            jsPDF: {
                unit: 'mm' as const,
                format: 'a4' as const,
                orientation: 'portrait' as const
            },
            pagebreak: {
                mode: 'css',
                before: '#page-break-before',
                avoid: ['tr', '.pdf-totals-section']
            }
        }

        await html2pdf().set(opt).from(receiptElement.value).save()
        addToast('Recibo baixado com sucesso!', 'success')
    } catch (e) {
        console.error('Erro ao gerar PDF:', e)
        addToast('Erro ao gerar o arquivo PDF.', 'error')
    } finally {
        isGeneratingPdf.value = false
    }
}

const downloadPaymentReceipt = async () => {
    if (!order.value || !paymentReceiptElement.value) return

    isGeneratingPaymentPdf.value = true
    try {
        const opt = {
            margin: 10,
            filename: `Comprovante_Pagamento_${order.value.id}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 800
            },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
            pagebreak: { mode: 'css', avoid: ['tr', '.pdf-totals-section'] }
        }

        await html2pdf().set(opt).from(paymentReceiptElement.value).save()
        addToast('Comprovante baixado com sucesso!', 'success')
    } catch (e) {
        console.error('Erro ao gerar comprovante:', e)
        addToast('Erro ao gerar o comprovante.', 'error')
    } finally {
        isGeneratingPaymentPdf.value = false
    }
}

onMounted(() => {
    window.scrollTo(0, 0);
    if (route.params.id) fetchOrderDetails(route.params.id as string)
})
</script>

<template>
    <div class="admin-detail-page">
        <ToastContainer />
        <div v-if="isLoading" class="loading-state">
            <font-awesome-icon :icon="faSpinner" spin size="3x" class="text-blue" />
            <p>Carregando dados da encomenda...</p>
        </div>

        <div v-else-if="order" class="content-container">
            <header class="page-header">
                <button @click="goBack" class="btn-back">
                    <font-awesome-icon :icon="faChevronLeft" /> Voltar
                </button>
                <div class="header-main">
                    <div class="title-group">
                        <span class="admin-badge"><font-awesome-icon :icon="faUserShield" /> Admin View</span>
                        <h1>Pedido #{{ order.id }}</h1>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button @click="downloadReceipt" class="btn-pdf" :disabled="isGeneratingPdf">
                            <font-awesome-icon :icon="isGeneratingPdf ? faSpinner : faFilePdf"
                                :spin="isGeneratingPdf" />
                            {{ isGeneratingPdf ? 'Gerando...' : 'Baixar Recibo' }}
                        </button>

                        <button v-if="order.paymentStatus === 'PAGO'" @click="downloadPaymentReceipt"
                            class="btn-pdf btn-receipt" :disabled="isGeneratingPaymentPdf">
                            <font-awesome-icon :icon="isGeneratingPaymentPdf ? faSpinner : faReceipt"
                                :spin="isGeneratingPaymentPdf" />
                            {{ isGeneratingPaymentPdf ? 'Gerando...' : 'Comprovante' }}
                        </button>

                        <div class="status-badge" :class="order.status.toLowerCase()">
                            {{ order.displayStatus }}
                        </div>
                    </div>
                </div>
                <div class="meta-container">
                    <div class="meta-info">
                        <font-awesome-icon :icon="faClock" /> Criado em: {{ order.requestDate }}
                    </div>

                    <div v-if="order.registeredBy" class="meta-info registered-by">
                        <font-awesome-icon :icon="faHeadset" /> Registrado por:
                        <strong>{{ order.registeredBy.nome.split(' ')[0] }}</strong>
                        <span class="meta-email">({{ order.registeredBy.email }})</span>
                    </div>
                    <div v-else class="meta-info self-registered">
                        <font-awesome-icon :icon="faUserCircle" /> Autoatendimento (Feito pelo Site)
                    </div>
                </div>
            </header>

            <div v-if="order.status !== 'CANCELADO'" class="stepper-card">
                <div class="stepper-track">
                    <div class="progress-bar-bg"></div>
                    <div class="progress-bar-fill" :style="{ width: `${((currentStatusIndex - 1) / 4) * 100}%` }"></div>
                    <div v-for="(step, index) in statusSteps" :key="index" class="step-item"
                        :class="{ 'active': (index + 1) === currentStatusIndex, 'completed': (index + 1) < currentStatusIndex }">
                        <div class="step-circle"><font-awesome-icon :icon="step.icon" /></div>
                        <span>{{ step.label }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="cancelled-banner">
                <font-awesome-icon :icon="faBan" />
                <span>Encomenda Cancelada</span>
            </div>

            <div class="details-grid">
                <div class="main-column">
                    <div class="card items-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faIceCream" class="icon-blue" />
                            <h3>Itens ({{ order.items.length }})</h3>
                        </div>
                        <div class="items-list">
                            <div v-for="item in order.items" :key="item.id" class="item-row">
                                <img :src="item.image" class="item-thumb" />
                                <div class="item-info">
                                    <h4>{{ item.name }}</h4>
                                    <div class="item-meta">
                                        <span class="qty">{{ item.quantity }}x</span>
                                        <span class="price">{{ formatCurrency(item.price) }}</span>
                                    </div>
                                </div>
                                <div class="item-total">{{ formatCurrency(item.price * item.quantity) }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mini-cards-row">
                        <div class="card mini-card">
                            <span class="label">Pagamento</span>
                            <font-awesome-icon :icon="paymentIcon.icon" :style="{ color: paymentIcon.color }"
                                size="2x" />
                            <span class="value">{{ paymentIcon.label }}</span>
                        </div>
                        <div class="card mini-card">
                            <span class="label">Carrinho</span>
                            <img :src="order.cart.image" class="cart-mini-img" />
                            <span class="value">{{ order.cart.name }}</span>
                        </div>
                    </div>
                </div>

                <div class="sidebar-column">
                    <div v-if="order.status !== 'CANCELADO'" class="card status-manager-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faClipboardCheck" class="icon-blue" />
                            <h3>Atualizar Status</h3>
                        </div>
                        <div class="status-controls">
                            <div class="custom-dropdown" tabindex="0" @blur="showStatusDropdown = false">
                                <div class="dropdown-selected" @click="showStatusDropdown = !showStatusDropdown"
                                    :class="{ 'is-open': showStatusDropdown }">
                                    <span>{{ getStatusLabel(selectedNewStatus) }}</span>
                                    <font-awesome-icon :icon="faChevronDown" class="chevron" />
                                </div>
                                <Transition name="drop-fade">
                                    <ul v-if="showStatusDropdown" class="dropdown-options custom-scrollbar">
                                        <li v-for="st in availableStatuses" :key="st.value"
                                            @mousedown.prevent="selectStatus(st.value)"
                                            :class="{ 'active': st.value === selectedNewStatus }">
                                            {{ st.label }}
                                        </li>
                                    </ul>
                                </Transition>
                            </div>

                            <button class="btn-save-status" @click="handleStatusUpdate"
                                :disabled="isUpdatingStatus || selectedNewStatus === order.status">
                                <font-awesome-icon :icon="isUpdatingStatus ? faSpinner : faSave"
                                    :spin="isUpdatingStatus" />
                                {{ isUpdatingStatus ? 'Salvando...' : 'Salvar' }}
                            </button>
                        </div>
                    </div>
                    <div v-if="order.status !== 'CANCELADO'" class="card payment-manager-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faMoneyBillWave" class="icon-green" />
                            <h3>Pagamento</h3>
                        </div>
                        <div class="status-controls">
                            <div class="custom-dropdown" tabindex="0" @blur="showPaymentDropdown = false">
                                <div class="dropdown-selected" @click="showPaymentDropdown = !showPaymentDropdown"
                                    :class="{ 'is-open': showPaymentDropdown }">
                                    <span>{{ getPaymentLabel(selectedPaymentStatus) }}</span>
                                    <font-awesome-icon :icon="faChevronDown" class="chevron" />
                                </div>
                                <Transition name="drop-fade">
                                    <ul v-if="showPaymentDropdown" class="dropdown-options">
                                        <li v-for="st in paymentStatuses" :key="st.value"
                                            @mousedown.prevent="selectPayment(st.value)"
                                            :class="{ 'active': st.value === selectedPaymentStatus }">
                                            {{ st.label }}
                                        </li>
                                    </ul>
                                </Transition>
                            </div>

                            <button class="btn-save-payment" @click="handlePaymentUpdate"
                                :disabled="isUpdatingPayment || selectedPaymentStatus === order.paymentStatus">
                                <font-awesome-icon :icon="isUpdatingPayment ? faSpinner : faSave"
                                    :spin="isUpdatingPayment" />
                            </button>
                        </div>
                    </div>
                    <div v-if="order.status !== 'CANCELADO' && order.status !== 'CONCLUIDO'" class="card actions-card">
                        <button class="btn-cancel" @click="showCancelModal = true">
                            <font-awesome-icon :icon="faBan" /> Cancelar Encomenda
                        </button>
                    </div>

                    <div class="card info-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faUserCircle" class="icon-purple" />
                            <h3>Cliente</h3>
                        </div>
                        <div class="info-content">
                            <p class="strong">{{ order.customer.name }}</p>
                            <p><font-awesome-icon :icon="faEnvelope" /> {{ order.customer.email }}</p>
                            <p><font-awesome-icon :icon="faPhone" /> {{ order.customer.phone }}</p>
                        </div>
                    </div>

                    <div class="card info-card">
                        <div class="card-title">
                            <font-awesome-icon :icon="faLocationDot" class="icon-orange" />
                            <h3>Entrega</h3>
                        </div>
                        <div class="info-content">
                            <p class="address">{{ order.delivery.address }}</p>
                            <div class="date-box">
                                <strong>{{ order.date }}</strong>
                                <span>aprox. {{ order.time }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card summary-card">
                        <div class="summary-row"><span>Subtotal</span> <span>{{ formatCurrency(subtotal) }}</span></div>
                        <div class="summary-row"><span>Entrega</span> <span>{{ formatCurrency(order.summary.deliveryFee)
                                }}</span></div>
                        <div v-if="order.summary.discount" class="summary-row discount"><span>Desconto</span> <span>-{{
                            formatCurrency(order.summary.discount) }}</span></div>
                        <div class="divider"></div>
                        <div class="summary-row total"><span>Total</span> <span>{{ formatCurrency(grandTotal) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="receipt-hidden-container">
            <div ref="receiptElement" class="pdf-receipt">
                <div class="pdf-header">
                    <img src="https://www.icepoint.com.br/assets/logo_full-CTT1BAul.png" alt="Ice Point Logo"
                        class="pdf-logo" crossorigin="anonymous" />
                    <div class="pdf-header-text">
                        <h2>RECIBO DE PEDIDO</h2>
                        <p><strong>Pedido #</strong>{{ order?.id }}</p>
                        <p><strong>Data da Emissão:</strong> {{ new Date().toLocaleDateString('pt-BR') }}</p>
                    </div>
                </div>

                <div class="pdf-section-row">
                    <div class="pdf-box">
                        <h3>DADOS DO CLIENTE</h3>
                        <p><strong>Nome:</strong> {{ order?.customer.name }}</p>
                        <p><strong>Email:</strong> {{ order?.customer.email }}</p>
                        <p><strong>Telefone:</strong> {{ order?.customer.phone }}</p>
                    </div>
                    <div class="pdf-box">
                        <h3>INFORMAÇÕES DA FESTA</h3>
                        <p><strong>Data Agendada:</strong> {{ order?.date }} às {{ order?.time }}</p>
                        <p><strong>Método:</strong> {{ order?.delivery.method === 'delivery' ? 'Entrega' :
                            'Retirada na Loja' }}</p>
                        <p><strong>Endereço:</strong> {{ order?.delivery.address }}</p>
                    </div>
                </div>

                <div class="pdf-table-container">
                    <h3>ITENS DO PEDIDO</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th style="width: 50px; text-align: center;">Img</th>
                                <th style="width: 60px;">Qtd.</th>
                                <th>Produto</th>
                                <th style="text-align: right;">Preço Un.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in order?.items" :key="item.id">
                                <td style="text-align: center;">
                                    <img :src="item.image" class="pdf-item-img" crossorigin="anonymous" />
                                </td>
                                <td>{{ item.quantity }}x</td>
                                <td>{{ item.name }}</td>
                                <td style="text-align: right;">{{ formatCurrency(item.price) }}</td>
                                <td style="text-align: right; font-weight: bold;">{{ formatCurrency(item.price *
                                    item.quantity) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="pdf-totals-section">
                    <div class="pdf-payment-info">
                        <p><strong>Forma de Pagamento:</strong> {{ order?.payment.method }}</p>
                        <p><strong>Status do Pagamento:</strong> {{ order?.paymentStatus }}</p>
                        <div class="pdf-cart-box">
                            <p><strong>Carrinho:</strong> {{ order?.cart.name }}</p>
                            <img :src="order?.cart.image" crossorigin="anonymous" />
                        </div>
                    </div>
                    <div class="pdf-totals-box">
                        <div class="pdf-total-row">
                            <span>Subtotal:</span>
                            <span>{{ formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="pdf-total-row">
                            <span>Taxa de Entrega:</span>
                            <span>{{ formatCurrency(order?.summary.deliveryFee || 0) }}</span>
                        </div>
                        <div v-if="order?.summary.discount" class="pdf-total-row pdf-discount">
                            <span>Desconto:</span>
                            <span>- {{ formatCurrency(order.summary.discount) }}</span>
                        </div>
                        <div class="pdf-total-row pdf-grand-total">
                            <span>TOTAL:</span>
                            <span>{{ formatCurrency(grandTotal) }}</span>
                        </div>
                    </div>
                </div>

                <div class="pdf-footer">
                    <p>Obrigado por escolher a Ice Point Sorveteria para o seu evento!</p>
                    <p>www.icepoint.com.br</p>
                </div>
            </div>
        </div>

        <div class="receipt-hidden-container">
            <div ref="paymentReceiptElement" class="pdf-receipt payment-receipt-mode">
                <div class="pdf-header payment-header">
                    <img src="https://www.icepoint.com.br/assets/logo_full-CTT1BAul.png" alt="Ice Point Logo"
                        class="pdf-logo" crossorigin="anonymous" />
                    <div class="pdf-header-text">
                        <h2 style="color: #10b981;">COMPROVANTE DE PAGAMENTO</h2>
                        <p><strong>Referência:</strong> Pedido #{{ order?.id }}</p>
                        <p><strong>Emissão:</strong> {{ new Date().toLocaleDateString('pt-BR') }} às {{ new
                            Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</p>
                    </div>
                </div>

                <div class="payment-success-banner">
                    <font-awesome-icon :icon="faCheckCircle"
                        style="color: #10b981; font-size: 24px; margin-right: 10px; vertical-align: middle;" />
                    <span style="font-size: 18px; font-weight: bold; color: #065f46; vertical-align: middle;">Pagamento
                        Confirmado</span>
                </div>

                <div class="pdf-section-row">
                    <div class="pdf-box">
                        <h3>DADOS DO PAGADOR</h3>
                        <p><strong>Nome:</strong> {{ order?.customer.name }}</p>
                        <p><strong>CPF/CNPJ:</strong> {{ userStore.user?.cpf || 'Não informado' }}</p>
                        <p><strong>Email:</strong> {{ order?.customer.email }}</p>
                    </div>
                    <div class="pdf-box">
                        <h3>DETALHES DA TRANSAÇÃO</h3>
                        <p><strong>Valor Pago:</strong> <span
                                style="color: #10b981; font-weight: bold; font-size: 15px;">{{
                                    formatCurrency(grandTotal) }}</span></p>
                        <p><strong>Método de Pagamento:</strong> {{ order?.payment.method }}</p>
                        <p><strong>Status Atual:</strong> {{ order?.paymentStatus }}</p>
                    </div>
                </div>

                <div class="pdf-table-container">
                    <h3>RESUMO DOS ITENS PAGOS</h3>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th style="text-align: right;">Quantidade</th>
                                <th style="text-align: right;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Produtos ({{ order?.items.length }} Itens Diferentes)</td>
                                <td style="text-align: right;">-</td>
                                <td style="text-align: right;">{{ formatCurrency(subtotal) }}</td>
                            </tr>
                            <tr v-if="order?.summary.deliveryFee">
                                <td>Taxa de Serviço / Entrega</td>
                                <td style="text-align: right;">1x</td>
                                <td style="text-align: right;">{{ formatCurrency(order.summary.deliveryFee) }}</td>
                            </tr>
                            <tr v-if="order?.summary.discount">
                                <td>Desconto Aplicado</td>
                                <td style="text-align: right;">-</td>
                                <td style="text-align: right; color: #16a34a;">- {{
                                    formatCurrency(order.summary.discount) }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"
                                    style="text-align: right; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 15px;">
                                    TOTAL PAGO:</td>
                                <td
                                    style="text-align: right; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 16px;">
                                    {{ formatCurrency(grandTotal) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="pdf-footer" style="margin-top: 80px;">
                    <p>Este documento serve como comprovante de quitação dos valores referentes ao pedido #{{ order?.id
                    }}.</p>
                    <p style="font-weight: bold; margin-top: 10px;">Sorveteria Ice Point</p>
                    <p>CNPJ: 39.256.511/0001-04</p>
                </div>
            </div>
        </div>

        <CancelOrderModal :is-open="showCancelModal" :is-loading="isCancelling" @close="showCancelModal = false"
            @confirm="handleCancelOrder" />
    </div>
</template>

<style scoped>
.admin-detail-page {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 0 2rem 2rem 2rem;
    font-family: 'Fredoka', sans-serif;
    color: #334155;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #64748b;
    gap: 1rem;
}

.text-blue {
    color: #3b82f6;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    animation: fadeIn 0.4s ease;
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

.page-header {
    margin-bottom: 2rem;
}

.btn-back {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    transition: color 0.2s;
    font-family: var(--font-title);
}

.btn-back:hover {
    color: #3b82f6;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.title-group h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.admin-badge {
    background: #1e293b;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 5px;
    display: inline-block;
}

.meta-info {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-badge {
    padding: 0.5rem 1.2rem;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
}

.status-badge.pendente {
    background: #fff7ed;
    color: #c2410c;
}

.status-badge.confirmado {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.entregue {
    background: #dcfce7;
    color: #166534;
}

.status-badge.concluido {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
    border: 1px solid #059669;
}

.status-badge.cancelado {
    background: #fee2e2;
    color: #991b1b;
}

.stepper-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stepper-track {
    display: flex;
    justify-content: space-between;
    position: relative;
}

.progress-bar-bg {
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    height: 4px;
    background: #e2e8f0;
}

.progress-bar-fill {
    position: absolute;
    top: 20px;
    left: 0;
    height: 4px;
    background: #3b82f6;
    transition: width 0.5s ease;
}

.step-item {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
}

.step-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #f8fafc;
    border: 4px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    transition: all 0.3s;
}

.step-item span {
    font-size: 0.8rem;
    font-weight: 600;
    color: #cbd5e1;
    margin-top: 0.5rem;
}

.step-item.active .step-circle {
    background: #3b82f6;
    color: white;
    transform: scale(1.1);
}

.step-item.active span {
    color: #1e40af;
}

.step-item.completed .step-circle {
    background: #1e40af;
    color: white;
}

.step-item.completed span {
    color: #1e40af;
}

.cancelled-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 700;
    margin-bottom: 2rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.8rem;
}

.card-title h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}

.icon-blue {
    color: #3b82f6;
}

.icon-purple {
    color: #8b5cf6;
}

.icon-orange {
    color: #f97316;
}

.item-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px dashed #f1f5f9;
}

.item-row:last-child {
    border: none;
}

.item-thumb {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    object-fit: contain;
}

.item-info {
    flex-grow: 1;
}

.item-info h4 {
    margin: 0;
    font-size: 0.95rem;
    color: #334155;
}

.item-meta {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 2px;
}

.qty {
    font-weight: bold;
    color: #0f172a;
    margin-right: 5px;
}

.item-total {
    font-weight: 700;
    color: #334155;
}

.mini-cards-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.mini-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    justify-content: center;
    padding: 1rem;
}

.mini-card .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8;
}

.mini-card .value {
    font-weight: 600;
    font-size: 0.9rem;
}

.cart-mini-img {
    height: 40px;
    object-fit: contain;
}

.info-content p {
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.strong {
    font-weight: 700;
    color: #1e293b;
    font-size: 1rem;
}

.address {
    line-height: 1.4;
}

.date-box {
    background: #f0f9ff;
    padding: 0.8rem;
    border-radius: 8px;
    margin-top: 0.8rem;
    border: 1px dashed #bae6fd;
    color: #0369a1;
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    color: #64748b;
}

.summary-row.total {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
    margin-top: 0.5rem;
}

.summary-row.discount {
    color: #16a34a;
}

.divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.btn-cancel {
    font-family: var(--font-title);
    width: 100%;
    padding: 0.8rem;
    background: white;
    border: 2px solid #fee2e2;
    color: #ef4444;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.payment-manager-card {
    border-left: 4px solid #10b981;
}

.icon-green {
    color: #10b981;
}

.btn-save-payment {
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.2s;
}

.btn-save-payment:hover:not(:disabled) {
    background-color: #059669;
}

.btn-save-payment:disabled {
    background-color: #a7f3d0;
    cursor: not-allowed;
}

.btn-cancel:hover {
    background: #fee2e2;
}

.status-manager-card {
    border-left: 4px solid #3b82f6;
}

.status-controls {
    display: flex;
    gap: 0.5rem;
}

.custom-dropdown {
    flex-grow: 1;
    position: relative;
    outline: none;
}

.dropdown-selected {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #f8fafc;
    color: #334155;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.dropdown-selected:hover {
    border-color: #cbd5e1;
    background-color: #f1f5f9;
}

.dropdown-selected.is-open {
    border-color: #3b82f6;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown-selected .chevron {
    color: #94a3b8;
    transition: transform 0.3s ease;
}

.dropdown-selected.is-open .chevron {
    transform: rotate(180deg);
    color: #3b82f6;
}

.dropdown-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 0.4rem;
    margin: 0;
    z-index: 50;
    max-height: 200px;
    overflow-y: auto;
    box-sizing: border-box;
}

.dropdown-options li {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    color: #475569;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
    margin-bottom: 2px;
}

.dropdown-options li:last-child {
    margin-bottom: 0;
}

.dropdown-options li:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}

.dropdown-options li.active {
    background-color: #e0f2fe;
    color: #0369a1;
    font-weight: 600;
}

.drop-fade-enter-active,
.drop-fade-leave-active {
    transition: all 0.2s ease;
}

.drop-fade-enter-from,
.drop-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.btn-save-status {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 1.2rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s;
    font-family: var(--font-title);
}

.btn-save-status:hover:not(:disabled) {
    background-color: #2563eb;
}

.btn-save-status:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.7;
}

@media (max-width: 900px) {
    .admin-detail-page {
        padding: 0;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .header-main {
        flex-direction: column;
        align-items: flex-start;
    }

    .stepper-track {
        overflow-x: auto;
        padding-bottom: 10px;
    }

    .stepper-card {
        padding: 0.5rem;
    }

    .step-item {
        min-width: 70px;
    }
}

.meta-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 0.8rem;
}

.meta-info {
    color: #94a3b8;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.registered-by {
    color: #0369a1;
    background: #e0f2fe;
    padding: 0.2rem 0.8rem;
    border-radius: 50px;
    font-size: 0.85rem;
}

.registered-by strong {
    font-weight: 700;
}

.meta-email {
    font-size: 0.75rem;
    opacity: 0.8;
}

.self-registered {
    color: #15803d;
    background: #dcfce7;
    padding: 0.2rem 0.8rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 600;
}

.btn-pdf {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-title);
    transition: all 0.2s;
    font-size: 0.9rem;
}

.btn-pdf:hover:not(:disabled) {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.btn-pdf:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.receipt-hidden-container {
    position: absolute;
    left: -9999px;
    top: 0;
    width: 800px;
}

.pdf-receipt {
    width: 700px;
    padding: 30px;
    background: #ffffff;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333;
    box-sizing: border-box;
}

.pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #1e3a8a;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.pdf-logo {
    height: 50px;
    object-fit: contain;
}

.pdf-header-text {
    text-align: right;
}

.pdf-header-text h2 {
    margin: 0 0 10px 0;
    color: #1e3a8a;
    font-size: 24px;
    letter-spacing: 1px;
}

.pdf-header-text p {
    margin: 3px 0;
    font-size: 14px;
    color: #666;
}

.pdf-section-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
}

.pdf-box {
    width: 48%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 15px;
    border-radius: 8px;
    box-sizing: border-box;
}

.pdf-box h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #1e3a8a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 5px;
}

.pdf-box p {
    margin: 5px 0;
    font-size: 13px;
    line-height: 1.4;
}

.pdf-table-container {
    margin-bottom: 30px;
}

.pdf-table-container h3 {
    font-size: 16px;
    color: #1e3a8a;
    margin-bottom: 10px;
}

.pdf-table {
    width: 100%;
    border-collapse: collapse;
}

.pdf-table th {
    background-color: #1e3a8a;
    color: white;
    padding: 12px 10px;
    text-align: left;
    font-size: 14px;
}

.pdf-table td {
    padding: 10px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
    vertical-align: middle;
}

.pdf-item-img {
    width: 35px;
    height: 35px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
}

.pdf-totals-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 20px;
}

.pdf-payment-info {
    width: 45%;
    font-size: 13px;
    color: #666;
}

.pdf-payment-info p {
    margin: 4px 0;
}

.pdf-cart-box {
    margin-top: 15px;
    padding: 10px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    display: inline-block;
}

.pdf-cart-box img {
    height: 40px;
    margin-top: 5px;
}

.pdf-totals-box {
    width: 45%;
    background: #f8fafc;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e2e8f0;
    box-sizing: border-box;
}

.pdf-total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #475569;
}

.pdf-discount {
    color: #16a34a;
}

.pdf-grand-total {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 2px solid #cbd5e1;
    font-weight: bold;
    font-size: 18px;
    color: #1e293b;
}

.pdf-footer {
    margin-top: 50px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
    font-size: 12px;
    color: #94a3b8;
}

.btn-receipt {
    background-color: #10b981;
}

.btn-receipt:hover:not(:disabled) {
    background-color: #059669;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.payment-receipt-mode .payment-header {
    border-bottom: 3px solid #10b981;
}

.payment-success-banner {
    background-color: #d1fae5;
    border: 1px solid #10b981;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 30px;
    text-align: center;
}

.payment-receipt-mode .pdf-table th {
    background-color: #f8fafc;
    color: #475569;
    border-bottom: 2px solid #cbd5e1;
}

.payment-receipt-mode .pdf-box h3 {
    color: #065f46;
}

.payment-receipt-mode .pdf-table-container h3 {
    color: #065f46;
}
</style>