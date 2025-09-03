import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import * as yup from 'yup'

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

  const personalData = ref({} as PersonalData)
  const address = ref({} as AddressData)

  const deliveryAddress = ref({} as AddressData)
  const useSameAddressForDelivery = ref(true)

  const deliveryMethod = ref<'pickup' | 'delivery' | null>(null)
  const schedule = ref({ date: '', time: '' })
  const paymentMethod = ref<'pix' | 'cash' | 'card'>('pix')
  const agreedToTerms = ref(false)
  const isCepLoading = ref(false)

  const showDeliveryFee = computed(() => deliveryMethod.value === 'delivery')

  const showDiscount = computed(
    () =>
      (paymentMethod.value === 'pix' || paymentMethod.value === 'cash') && isAddressComplete.value,
  )

  const isPersonalDataComplete = computed(() => personalDataSchema.isValidSync(personalData.value))
  const isAddressComplete = computed(
    () => addressSchema.isValidSync(address.value) && schedule.value.date && schedule.value.time,
  )

  const deliveryFee = computed(() => (showDeliveryFee.value ? 20 : 0))
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

  watch(deliveryMethod, () => {
    paymentMethod.value = 'pix'
  })

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
  }
})
