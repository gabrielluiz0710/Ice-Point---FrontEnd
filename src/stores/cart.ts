import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'

const ANON_CART_KEY = 'icepoint_anon_cart'

import brigadeiroImg from '@/assets/images/cards/brigadeiro.png'
import tentacaoImg from '@/assets/images/cards/tentacao.png'
import ituLeiteCondensadoImg from '@/assets/images/cards/ituleitecondensado.png'
import abacaxiImg from '@/assets/images/cards/abacaxi.png'
import ituMaracujaImg from '@/assets/images/cards/itumaracuja.png'
import morangoLeiteImg from '@/assets/images/cards/morangoleite.png'
import limaoSuicoImg from '@/assets/images/cards/limaosuico.png'
import milhoImg from '@/assets/images/cards/milho.png'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  quantity: number
}

export interface Category {
  name: string
  products: Product[]
}

export const useCartStore = defineStore('cart', () => {
  const productCategories: Ref<Category[]> = ref([
    {
      name: 'Picolés ao Leite',
      products: [
        {
          id: 1,
          name: 'Limão Suíço',
          description:
            'O equilíbrio perfeito entre o azedinho do limão e a cremosidade do leite, uma combinação refrescante.',
          price: 2.0,
          image: limaoSuicoImg,
          quantity: 0,
        },
        {
          id: 2,
          name: 'Milho Verde',
          description:
            'Sabor autêntico de milho fresquinho, transformado em um picolé cremoso que lembra festa junina.',
          price: 2.0,
          image: milhoImg,
          quantity: 0,
        },
        {
          id: 3,
          name: 'Morango',
          description:
            'A doçura natural do morango em um picolé suave e cremoso, feito com pedaços da fruta.',
          price: 2.0,
          image: morangoLeiteImg,
          quantity: 0,
        },
      ],
    },
    {
      name: 'Picolés de Fruta',
      products: [
        {
          id: 4,
          name: 'Abacaxi',
          description:
            'Refrescante e cítrico, feito com suco natural da fruta para um sabor tropical autêntico.',
          price: 1.5,
          image: abacaxiImg,
          quantity: 0,
        },
      ],
    },
    {
      name: 'Ituzinhos',
      products: [
        {
          id: 5,
          name: 'Ituzinho de Maracujá',
          description: 'A intensidade do maracujá em dose dupla com recheio por dentro.',
          price: 3.5,
          image: ituMaracujaImg,
          quantity: 0,
        },
        {
          id: 6,
          name: 'Ituzinho de Leite Condensado',
          description:
            'A doçura inconfundível do leite condensado em um formato super cremoso e irresistível.',
          price: 3.5,
          image: ituLeiteCondensadoImg,
          quantity: 0,
        },
      ],
    },
    {
      name: 'Skimo',
      products: [
        {
          id: 7,
          name: 'Brigadeiro',
          description:
            'Cremoso sorvete de brigadeiro com uma casquinha crocante de chocolate ao leite.',
          price: 4.0,
          image: brigadeiroImg,
          quantity: 0,
        },
        {
          id: 8,
          name: 'Tentação',
          description:
            'A clássica combinação de morango e chocolate, com uma cobertura que quebra a cada mordida.',
          price: 4.0,
          image: tentacaoImg,
          quantity: 0,
        },
      ],
    },
  ])

  const cartItems = computed(() => {
    return productCategories.value
      .flatMap((category) => category.products)
      .filter((product) => product.quantity > 0)
  })

  const totalCartQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  function loadAnonCartFromStorage() {
    const storedItems = localStorage.getItem(ANON_CART_KEY)
    if (storedItems) {
      const anonItems = JSON.parse(storedItems) as { productId: number; quantity: number }[]

      // Mescla os itens do LocalStorage no state do Pinia (productCategories)
      anonItems.forEach((anonItem) => {
        for (const category of productCategories.value) {
          const product = category.products.find((p) => p.id === anonItem.productId)
          if (product) {
            // Assume que a PK no DB é igual ao ID do produto no frontend
            product.quantity = anonItem.quantity
            break
          }
        }
      })
    }
  }

  function saveAnonCartToStorage() {
    // Salva apenas os itens que estão no carrinho (quantity > 0)
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

  // Watcher para salvar o carrinho no LocalStorage sempre que for alterado
  // Nota: Em um app de verdade, isso só deve acontecer se o usuário NÃO estiver logado.
  watch(cartItems, saveAnonCartToStorage, { deep: true })

  // Chamado no login (veja useUserStore)
  async function fetchUserCart() {
    console.log('Carregando/Mesclando carrinho persistente do DB...')
    // Lógica de DB virá aqui
  }

  // Inicialização: carrega o carrinho anônimo ao iniciar o Store
  loadAnonCartFromStorage()

  function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const quantity = Math.max(0, newQuantity)
    for (const category of productCategories.value) {
      const product = category.products.find((p) => p.id === productId)
      if (product) {
        product.quantity = quantity
        break
      }
    }
  }

  function emptyCart() {
    productCategories.value.forEach((category) => {
      category.products.forEach((product) => {
        product.quantity = 0
      })
    })
  }

  return {
    productCategories,
    cartItems,
    totalCartQuantity,
    totalCartPrice,
    updateQuantity,
    emptyCart,
    clearAnonStorage,
    getAnonItems,
    fetchUserCart,
  }
})
