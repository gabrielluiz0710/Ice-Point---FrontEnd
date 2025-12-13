import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useUserStore } from './user'
import * as yup from 'yup'

const CHECKOUT_STORAGE_KEY = 'icepoint_checkout_state'
const API_URL = import.meta.env.VITE_API_URL

interface PersonalData {
  cpf: string
  fullName: string
  email: string
  phone: string
  birthDate: string
}

interface AddressData {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface SelectedCart {
  color: string
  quantity: number
  cartIds?: number[]
}

const personalDataSchema = yup.object({
  fullName: yup
    .string()
    .required('O nome é obrigatório')
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: yup.string().required('O email é obrigatório').email('Digite um email válido'),
  cpf: yup
    .string()
    .required('O CPF é obrigatório')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  phone: yup
    .string()
    .required('O celular é obrigatório')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Celular inválido'),
  birthDate: yup
    .string()
    .required('A data é obrigatória')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida'),
})

const addressSchema = yup.object({
  cep: yup
    .string()
    .required('O CEP é obrigatório')
    .matches(/^\d{5}-\d{3}$/, 'CEP inválido'),
  street: yup.string().required(),
  number: yup.string().required('O número é obrigatório'),
  neighborhood: yup.string().required(),
})

export const useCheckoutStore = defineStore('checkout', () => {
  const cartStore = useCartStore()
  const userStore = useUserStore()

  const personalData = ref({} as PersonalData)
  const address = ref({} as AddressData)

  const deliveryAddress = ref({} as AddressData)
  const useSameAddressForDelivery = ref(true)

  const deliveryMethod = ref<'pickup' | 'delivery' | null>(null)
  const schedule = ref({ date: '', time: '' })
  const paymentMode = ref<'online' | 'offline'>('offline')
  const paymentMethod = ref<'pix' | 'cash' | 'card'>('pix')
  const agreedToTerms = ref(false)
  const isCepLoading = ref(false)
  const selectedCarts = ref<SelectedCart[]>([])
  const showDeliveryFee = computed(() => deliveryMethod.value === 'delivery')
  const calculatedDeliveryFee = ref<number | null>(null)
  const isCalculatingFee = ref(false)

  const showDiscount = computed(() => {
    if (paymentMode.value === 'online') return false
    return paymentMethod.value === 'pix' || paymentMethod.value === 'cash'
  })

  const isPersonalDataComplete = computed(() => personalDataSchema.isValidSync(personalData.value))
  const isAddressComplete = computed(
    () => addressSchema.isValidSync(address.value) && schedule.value.date && schedule.value.time,
  )

  const deliveryFee = computed(() => {
    if (!showDeliveryFee.value) return 0
    return calculatedDeliveryFee.value !== null ? calculatedDeliveryFee.value : 20
  })
  const discount = computed(() => (showDiscount.value ? cartStore.totalCartPrice * 0.1 : 0))
  const grandTotal = computed(() => cartStore.totalCartPrice + deliveryFee.value - discount.value)

  async function lookupCep() {
    const cep = address.value.cep.replace(/\D/g, '')
    if (cep.length !== 8) return

    isCepLoading.value = true
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        address.value.street = data.logradouro
        address.value.neighborhood = data.bairro
        address.value.city = data.localidade
        address.value.state = data.uf
      }
    } catch (error) {
      console.error('Falha ao buscar CEP:', error)
    } finally {
      isCepLoading.value = false
    }
  }

  async function calculateShipping() {
    // Só calcula se tiver os dados mínimos
    if (!address.value.cep || !address.value.number || !address.value.street) return

    isCalculatingFee.value = true

    try {
      const payload = {
        cep: address.value.cep,
        street: address.value.street,
        number: address.value.number,
        city: address.value.city,
        state: address.value.state,
      }

      const response = await fetch(`${API_URL}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        calculatedDeliveryFee.value = data.fee
        console.log(`Distância: ${data.distance}, Frete: R$ ${data.fee}`)
      } else {
        // Se der erro, assume o padrão de 20 ou exibe erro
        console.error('Erro ao calcular frete')
        calculatedDeliveryFee.value = 20
      }
    } catch (error) {
      console.error(error)
      calculatedDeliveryFee.value = 20 // Fallback
    } finally {
      isCalculatingFee.value = false
    }
  }

  // Lembre de resetar o frete se mudar o método para pickup
  watch(deliveryMethod, (newMethod) => {
    paymentMethod.value = 'pix'
    if (newMethod === 'pickup') {
      calculatedDeliveryFee.value = 0
    }
  })

  watch(deliveryMethod, () => {
    paymentMethod.value = 'pix'
  })

  const totalPopsicles = computed(() => {
    return cartStore.cartItems.reduce((acc, item) => acc + item.quantity, 0)
  })

  const requiredCartsCount = computed(() => {
    const total = totalPopsicles.value
    if (total === 0) return 0
    return Math.ceil(total / 250)
  })

  const isCartSelectionComplete = computed(() => {
    const totalSelected = selectedCarts.value.reduce((acc, c) => acc + c.quantity, 0)
    return totalSelected === requiredCartsCount.value
  })

  function resetState() {
    personalData.value = {} as PersonalData
    address.value = {} as AddressData
    deliveryAddress.value = {} as AddressData
    useSameAddressForDelivery.value = true
    deliveryMethod.value = null
    schedule.value = { date: '', time: '' }
    paymentMode.value = 'offline'
    paymentMethod.value = 'pix'
    agreedToTerms.value = false
    selectedCarts.value = []
    localStorage.removeItem(CHECKOUT_STORAGE_KEY)
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.personalData) personalData.value = data.personalData
        if (data.address) address.value = data.address
        if (data.deliveryAddress) deliveryAddress.value = data.deliveryAddress
        if (data.useSameAddressForDelivery !== undefined)
          useSameAddressForDelivery.value = data.useSameAddressForDelivery
        if (data.deliveryMethod) deliveryMethod.value = data.deliveryMethod
        if (data.schedule) schedule.value = data.schedule
        if (data.paymentMode) paymentMode.value = data.paymentMode
        if (data.paymentMethod) paymentMethod.value = data.paymentMethod
        if (data.selectedCarts) selectedCarts.value = data.selectedCarts
      } catch (e) {
        console.error('Erro ao carregar checkout do storage', e)
        localStorage.removeItem(CHECKOUT_STORAGE_KEY)
      }
    }
  }

  function saveToStorage() {
    const dataToSave = {
      personalData: personalData.value,
      address: address.value,
      deliveryAddress: deliveryAddress.value,
      useSameAddressForDelivery: useSameAddressForDelivery.value,
      deliveryMethod: deliveryMethod.value,
      schedule: schedule.value,
      paymentMethod: paymentMethod.value,
      selectedCarts: selectedCarts.value,
    }
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(dataToSave))
  }

  async function submitOrder() {
    const token = cartStore.getAuthToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('Itens selecionados:', selectedCarts.value)
    const flatCartIds = selectedCarts.value.map((c) => c.cartIds || []).flat()
    console.log('IDs planos para envio:', flatCartIds)

    const backendPaymentMethod =
      paymentMode.value === 'online' ? 'ONLINE' : paymentMethod.value.toUpperCase()

    const payload = {
      userId: userStore.user?.id || null,
      items: cartStore.cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      cartIds: flatCartIds,
      dataAgendada: schedule.value.date,
      horaAgendada: schedule.value.time,
      metodoEntrega: deliveryMethod.value === 'delivery' ? 'DELIVERY' : 'PICKUP',
      metodoPagamento: backendPaymentMethod,

      personalData: {
        fullName: personalData.value.fullName,
        email: personalData.value.email,
        cpf: personalData.value.cpf,
        phone: personalData.value.phone,
        birthDate: personalData.value.birthDate,
      },

      enderecoCep:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.cep
            : deliveryAddress.value.cep
          : undefined,
      enderecoLogradouro:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.street
            : deliveryAddress.value.street
          : undefined,
      enderecoNumero:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.number
            : deliveryAddress.value.number
          : undefined,
      enderecoComplemento:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.complement
            : deliveryAddress.value.complement
          : undefined,
      enderecoBairro:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.neighborhood
            : deliveryAddress.value.neighborhood
          : undefined,
      enderecoCidade:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.city
            : deliveryAddress.value.city
          : undefined,
      enderecoEstado:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value.state
            : deliveryAddress.value.state
          : undefined,

      fullAddress:
        deliveryMethod.value === 'delivery'
          ? useSameAddressForDelivery.value
            ? address.value
            : deliveryAddress.value
          : null,
    }

    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Falha ao salvar o pedido no banco de dados.')
    }

    const data = await response.json()
    return data.orderId
  }

  loadFromStorage()

  watch(
    [
      personalData,
      address,
      deliveryAddress,
      useSameAddressForDelivery,
      deliveryMethod,
      schedule,
      paymentMethod,
      selectedCarts,
    ],
    () => {
      saveToStorage()
    },
    { deep: true },
  )

  return {
    personalData,
    address,
    deliveryAddress,
    useSameAddressForDelivery,
    deliveryMethod,
    schedule,
    paymentMethod,
    agreedToTerms,
    isCepLoading,
    isPersonalDataComplete,
    isAddressComplete,
    deliveryFee,
    discount,
    grandTotal,
    showDeliveryFee,
    showDiscount,
    lookupCep,
    selectedCarts,
    totalPopsicles,
    requiredCartsCount,
    isCartSelectionComplete,
    resetState,
    paymentMode,
    submitOrder,
    loadFromStorage,
    calculatedDeliveryFee,
    isCalculatingFee,
    calculateShipping,
  }
})
