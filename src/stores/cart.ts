import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL
const ANON_CART_KEY = 'icepoint_anon_cart'
const SUPABASE_LOCAL_STORAGE_KEY = 'sb-db-auth-token'

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
  category: string
}

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

export interface CartCategory {
  name: string
  products: DBProduct[]
}

export const useCartStore = defineStore('cart', () => {
  const productCatalog: Ref<DBProduct[]> = ref([])
  const isSyncing = ref(false)

  function getAuthToken(): string | null {
    const sessionStr = localStorage.getItem(SUPABASE_LOCAL_STORAGE_KEY)
    if (!sessionStr) return null

    try {
      const session = JSON.parse(sessionStr)
      return session.access_token || null
    } catch (e) {
      console.error('Erro ao ler token do Supabase:', e)
      return null
    }
  }

  let debounceTimer: any = null
  function triggerSyncWithDebounce() {
    if (debounceTimer) clearTimeout(debounceTimer)
    console.log('⏳ (Debounce) Aguardando 1s para salvar...')
    debounceTimer = setTimeout(() => {
      syncCartToServer()
    }, 1000)
  }

  const cartItems = computed<CartItem[]>(() => {
    return productCatalog.value
      .filter((product) => product.quantity > 0)
      .map((p) => ({
        ...p,
        name: p.nome,
        price: Number(p.preco_unitario),
        image: p.imagemCapa || '',
        category: p.categoria?.nome || 'Outros',
        nome: p.nome,
        descricao: p.descricao,
        preco_unitario: Number(p.preco_unitario),
        imagemCapa: p.imagemCapa,
        id: p.id,
        description: p.descricao,
        quantity: p.quantity,
      }))
  })

  const productCategories = computed<CartCategory[]>(() => {
    const groups = productCatalog.value.reduce(
      (acc, product) => {
        const catName = product.categoria?.nome || 'Sem Categoria'
        if (!acc[catName]) acc[catName] = { name: catName, products: [] }
        acc[catName].products.push(product)
        return acc
      },
      {} as Record<string, CartCategory>,
    )
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
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
          disponivel: p.disponivel === true,
        }))
        await loadUserCartFromServer()
      }
    } catch (e) {
      console.error('Erro ao buscar catálogo:', e)
    }
  }

  async function loadUserCartFromServer() {
    const token = getAuthToken()

    if (!token) {
      console.log('👀 Token não encontrado (Anon). Carregando local.')
      loadAnonCartFromStorage()
      return
    }

    try {
      console.log('🔄 Token encontrado! Buscando carrinho no servidor...')
      const response = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const serverCart = await response.json()
        if (serverCart && serverCart.itens) {
          console.log(`✅ Carrinho recuperado: ${serverCart.itens.length} itens.`)
          serverCart.itens.forEach((serverItem: any) => {
            const product = productCatalog.value.find((p) => p.id === serverItem.produto_id)
            if (product) {
              product.quantity = serverItem.quantidade
            }
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro loadUserCartFromServer:', error)
      loadAnonCartFromStorage()
    }
  }

  async function syncCartToServer() {
    const token = getAuthToken()

    if (!token) {
      console.warn('⚠️ Tentou sincronizar mas o token sumiu (Logout?)')
      return
    }

    isSyncing.value = true
    const payload = {
      items: cartItems.value.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    }

    try {
      console.log('📡 Enviando sync para API...')
      const response = await fetch(`${API_URL}/cart/sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('✅ Sincronizado com sucesso!')
      } else {
        console.error('❌ Erro no sync:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro de conexão no sync:', error)
    } finally {
      isSyncing.value = false
    }
  }

  function loadAnonCartFromStorage() {
    const storedItems = localStorage.getItem(ANON_CART_KEY)
    if (!storedItems) return
    const anonItems = JSON.parse(storedItems) as { productId: number; quantity: number }[]
    anonItems.forEach((anonItem) => {
      const product = productCatalog.value.find((p) => p.id === anonItem.productId)
      if (product) product.quantity = anonItem.quantity
    })
  }

  function saveAnonCartToStorage() {
    const itemsToStore = cartItems.value.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }))
    localStorage.setItem(ANON_CART_KEY, JSON.stringify(itemsToStore))
  }

  function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const quantity = Math.max(0, newQuantity)
    const product = productCatalog.value.find((p) => p.id === productId)
    if (product) product.quantity = quantity

    const token = getAuthToken()

    if (token) {
      console.log(`👤 Usuário logado. Iniciando Debounce...`)
      triggerSyncWithDebounce()
    } else {
      console.log(`🕵️ Usuário anônimo. Salvando local.`)
      saveAnonCartToStorage()
    }
  }

  function emptyCart() {
    productCatalog.value.forEach((p) => {
      p.quantity = 0
    })
    localStorage.removeItem(ANON_CART_KEY)

    const token = getAuthToken()
    if (token) {
      console.log('🗑️ Esvaziando no servidor...')
      syncCartToServer()
    }
  }

  function clearAnonStorage() {
    localStorage.removeItem(ANON_CART_KEY)
  }

  function getAnonItems() {
    const storedItems = localStorage.getItem(ANON_CART_KEY)
    return storedItems ? JSON.parse(storedItems) : []
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
    fetchUserCart: loadUserCartFromServer,
    isSyncing,
  }
})
