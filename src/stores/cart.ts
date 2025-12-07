import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const API_URL = import.meta.env.VITE_API_URL
const ANON_CART_KEY = 'icepoint_anon_cart'

export interface CartItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  quantity: number
  preco_unitario: number
  nome: string
  descricao: string
  imagemCapa: string | null
}

export interface DBProduct {
  id: number
  nome: string
  descricao: string
  preco_unitario: number
  imagemCapa: string | null
  categoria: { nome: string }
  quantity: number
}

export interface CartCategory {
  name: string
  products: DBProduct[]
}

export const useCartStore = defineStore('cart', () => {
  const productCatalog: Ref<DBProduct[]> = ref([])

  const productCategories = computed<CartCategory[]>(() => {
    const groups = productCatalog.value.reduce(
      (acc, product) => {
        const catName = product.categoria?.nome || 'Sem Categoria'
        if (!acc[catName]) {
          acc[catName] = { name: catName, products: [] }
        }
        acc[catName].products.push(product)
        return acc
      },
      {} as Record<string, CartCategory>,
    )

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
  })

  const cartItems = computed<CartItem[]>(() => {
    return productCatalog.value
      .filter((product) => product.quantity > 0)
      .map((p) => ({
        ...p,
        nome: p.nome,
        descricao: p.descricao,
        preco_unitario: Number(p.preco_unitario),
        imagemCapa: p.imagemCapa,

        id: p.id,
        name: p.nome,
        description: p.descricao,
        price: Number(p.preco_unitario),
        image: p.imagemCapa || 'placeholder_icon_url',
        quantity: p.quantity,
      }))
  })

  const totalCartQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.preco_unitario * item.quantity, 0)
  })

  async function fetchCatalog() {
    try {
      const response = await fetch(`${API_URL}/products`)
      if (response.ok) {
        const rawProducts = await response.json()

        productCatalog.value = rawProducts.map((p: any) => ({
          ...p,
          quantity: 0,
          preco_unitario: Number(p.preco_unitario),
        }))

        loadAnonCartFromStorage()
      } else {
        console.error('Falha ao carregar catálogo do DB')
      }
    } catch (e) {
      console.error('Erro de conexão ao buscar catálogo:', e)
    }
  }

  function loadAnonCartFromStorage() {
    const storedItems = localStorage.getItem(ANON_CART_KEY)
    if (!storedItems) return

    const anonItems = JSON.parse(storedItems) as { productId: number; quantity: number }[]

    anonItems.forEach((anonItem) => {
      const product = productCatalog.value.find((p) => p.id === anonItem.productId)
      if (product) {
        product.quantity = anonItem.quantity
      }
    })
  }

  function saveAnonCartToStorage() {
    const itemsToStore = cartItems.value.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }))
    localStorage.setItem(ANON_CART_KEY, JSON.stringify(itemsToStore))
  }

  function clearAnonStorage() {
    localStorage.removeItem(ANON_CART_KEY)
  }

  function getAnonItems() {
    const storedItems = localStorage.getItem(ANON_CART_KEY)
    return storedItems ? JSON.parse(storedItems) : []
  }

  watch(cartItems, saveAnonCartToStorage, { deep: true })

  function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const quantity = Math.max(0, newQuantity)

    const product = productCatalog.value.find((p) => p.id === productId)

    if (product) {
      product.quantity = quantity
    }
  }

  function emptyCart() {
    productCatalog.value.forEach((product) => {
      product.quantity = 0
    })
  }

  fetchCatalog()

  return {
    productCategories,
    productCatalog,
    cartItems,
    totalCartQuantity,
    totalCartPrice,
    updateQuantity,
    emptyCart,
    clearAnonStorage,
    getAnonItems,
    fetchUserCart: () => console.log('Ainda não implementado, mas fetchCatalog já está rodando.'),
  }
})
