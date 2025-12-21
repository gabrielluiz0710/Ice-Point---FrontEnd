import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAdminCartStore } from './adminCart'

const STORAGE_KEY = 'admin_checkout_data'

export interface AdminCustomerData {
  fullName: string
  phone: string
  email: string
  cpf?: string
  birthDate?: string
}

export interface AddressData {
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

export const useAdminCheckoutStore = defineStore('admin-checkout', () => {
  const adminCart = useAdminCartStore()

  const loadState = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
    return null
  }

  const cached = loadState()

  const customerData = ref<AdminCustomerData>(
    cached?.customerData || {
      fullName: '',
      phone: '',
      email: '',
      cpf: '',
      birthDate: '',
    },
  )

  const deliveryMethod = ref<'delivery' | 'pickup'>(cached?.deliveryMethod || 'delivery')
  const selectedCarts = ref<SelectedCart[]>(cached?.selectedCarts || [])
  const paymentMode = ref<'online' | 'offline'>(cached?.paymentMode || 'offline')
  const paymentMethod = ref<'pix' | 'cash' | 'card'>(cached?.paymentMethod || 'pix')

  const address = ref<AddressData>(
    cached?.address || {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Uberaba',
      state: 'MG',
    },
  )

  const showAddressModal = ref(false)

  const schedule = ref(cached?.schedule || { date: '', time: '' })
  const shippingFee = ref(cached?.shippingFee || 0)
  const discount = ref(cached?.discount || 0)
  const isAutoDiscount = ref(cached?.isAutoDiscount ?? true)

  watch(
    [
      customerData,
      deliveryMethod,
      paymentMode,
      paymentMethod,
      address,
      schedule,
      shippingFee,
      discount,
      isAutoDiscount,
      selectedCarts,
    ],
    () => {
      const stateToSave = {
        customerData: customerData.value,
        deliveryMethod: deliveryMethod.value,
        paymentMode: paymentMode.value,
        paymentMethod: paymentMethod.value,
        address: address.value,
        schedule: schedule.value,
        shippingFee: shippingFee.value,
        discount: discount.value,
        isAutoDiscount: isAutoDiscount.value,
        selectedCarts: selectedCarts.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    },
    { deep: true },
  )

  watch([paymentMethod, paymentMode, () => adminCart.totalCartPrice], () => {
    if (!isAutoDiscount.value) return

    if (
      paymentMode.value === 'offline' &&
      (paymentMethod.value === 'pix' || paymentMethod.value === 'cash')
    ) {
      discount.value = adminCart.totalCartPrice * 0.1
    } else {
      discount.value = 0
    }
  })

  const grandTotal = computed(() => {
    return Math.max(0, adminCart.totalCartPrice + shippingFee.value - discount.value)
  })

  const requiredCartsCount = computed(() => {
    const totalPopsicles = adminCart.totalCartQuantity
    if (totalPopsicles === 0) return 0
    return Math.ceil(totalPopsicles / 250)
  })

  const isCartSelectionComplete = computed(() => {
    const totalSelected = selectedCarts.value.reduce((acc, c) => acc + c.quantity, 0)
    return totalSelected === requiredCartsCount.value
  })

  const isCustomerDataValid = () => {
    return (
      customerData.value.fullName.length > 3 &&
      customerData.value.phone.length >= 10 &&
      customerData.value.email.length > 3 &&
      customerData.value.email.includes('@')
    )
  }

  const isDeliveryDataValid = () => {
    const hasDate = !!schedule.value.date && !!schedule.value.time
    const hasCarts = isCartSelectionComplete.value
    const hasPayment =
      paymentMode.value === 'online' || (paymentMode.value === 'offline' && !!paymentMethod.value)

    if (deliveryMethod.value === 'pickup') {
      return hasDate && hasCarts && hasPayment
    } else {
      const hasAddress =
        address.value.street.length > 0 &&
        address.value.number.length > 0 &&
        address.value.neighborhood.length > 0
      return hasDate && hasCarts && hasAddress && hasPayment
    }
  }

  function reset() {
    customerData.value = { fullName: '', phone: '', email: '', cpf: '', birthDate: '' }
    address.value = {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Uberaba',
      state: 'MG',
    }
    schedule.value = { date: '', time: '' }
    selectedCarts.value = []
    shippingFee.value = 0
    discount.value = 0
    isAutoDiscount.value = true
    deliveryMethod.value = 'delivery'
    paymentMode.value = 'offline'
    paymentMethod.value = 'pix'
    showAddressModal.value = false

    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    customerData,
    address,
    deliveryMethod,
    schedule,
    selectedCarts,
    shippingFee,
    discount,
    grandTotal,
    requiredCartsCount,
    isCartSelectionComplete,
    isCustomerDataValid,
    isDeliveryDataValid,
    reset,
    paymentMode,
    paymentMethod,
    isAutoDiscount,
    showAddressModal,
  }
})
