import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
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
          name: 'Chocolate',
          description: 'Cremoso e intenso, o clássico que todos amam.',
          price: 8.5,
          image: limaoSuicoImg,
          quantity: 0,
        },
        {
          id: 2,
          name: 'Doce de Leite',
          description: 'Aveludado, com pedaços de doce de leite argentino.',
          price: 8.5,
          image: morangoLeiteImg,
          quantity: 0,
        },
        {
          id: 3,
          name: 'Ninho Trufado',
          description: 'Leite Ninho com recheio cremoso de trufa de chocolate.',
          price: 9.0,
          image: ituMaracujaImg,
          quantity: 0,
        },
      ],
    },
    {
      name: 'Picolés de Fruta',
      products: [
        {
          id: 4,
          name: 'Limão Suíço',
          description: 'Refrescante e cítrico, feito com suco natural.',
          price: 7.0,
          image: abacaxiImg,
          quantity: 0,
        },
        {
          id: 5,
          name: 'Morango',
          description: 'Puro sabor da fruta, leve e delicioso.',
          price: 7.0,
          image: ituLeiteCondensadoImg,
          quantity: 0,
        },
        {
          id: 6,
          name: 'Maracujá com Leite Condensado',
          description: 'A combinação perfeita entre o azedinho e o doce.',
          price: 7.5,
          image: tentacaoImg,
          quantity: 0,
        },
      ],
    },
    {
      name: 'Sorvetes de Massa (500ml)',
      products: [
        {
          id: 7,
          name: 'Flocos Crocante',
          description: 'Creme com pedaços crocantes de chocolate.',
          price: 25.0,
          image: brigadeiroImg,
          quantity: 0,
        },
        {
          id: 8,
          name: 'Pistache Premium',
          description: 'Sabor autêntico de pistache importado.',
          price: 30.0,
          image: milhoImg,
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

  const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

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
    totalCartPrice,
    updateQuantity,
    emptyCart,
  }
})
