import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_KEY = 'admin_cart_items'

export interface DBProduct {
  id: number
  nome: string
  descricao: string
  preco_unitario: number
  imagemCapa: string | null
  disponivel: boolean
  categoria: { nome: string }
  quantity: number
}

export const useAdminCartStore = defineStore('admin-cart', () => {
  const productCatalog: Ref<DBProduct[]> = ref([])
  const isLoading = ref(false)

  const savedQuantities = ref<Record<number, number>>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
  )

  const cartItems = computed(() => {
    return productCatalog.value.filter((p) => p.quantity > 0)
  })

  const totalCartQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.preco_unitario * item.quantity, 0)
  })

  watch(
    () => productCatalog.value.filter((p) => p.quantity > 0),
    (items) => {
      const cache: Record<number, number> = {}
      items.forEach((i) => (cache[i.id] = i.quantity))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    },
    { deep: true },
  )

  async function fetchCatalog() {
    isLoading.value = true
    try {
      const response = await fetch(`${API_URL}/products`)
      if (response.ok) {
        const rawProducts = await response.json()

        productCatalog.value = rawProducts.map((p: any) => ({
          ...p,
          preco_unitario: Number(p.preco_unitario),
          quantity: savedQuantities.value[p.id] || 0,
          disponivel: p.disponivel === true,
        }))
      }
    } catch (e) {
      console.error('Erro ao buscar catálogo admin:', e)
    } finally {
      isLoading.value = false
    }
  }

  function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const product = productCatalog.value.find((p) => p.id === productId)
    if (product) {
      product.quantity = Math.max(0, newQuantity)
    }
  }

  function emptyCart() {
    productCatalog.value.forEach((p) => (p.quantity = 0))
    localStorage.removeItem(STORAGE_KEY)
    savedQuantities.value = {}
  }

  if (productCatalog.value.length === 0) {
    fetchCatalog()
  }

  return {
    productCatalog,
    cartItems,
    totalCartQuantity,
    totalCartPrice,
    fetchCatalog,
    updateQuantity,
    emptyCart,
    isLoading,
  }
})
