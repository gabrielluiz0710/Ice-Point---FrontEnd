<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import ProductCard from '@/components/shopping-cart/ProductCard.vue'
import OrderSummary from '@/components/shopping-cart/OrderSummary.vue'
import MobileCartBar from '@/components/shopping-cart/MobileCartBar.vue'
import brigadeiroImg from '@/assets/images/cards/brigadeiro.png';
import tentacaoImg from '@/assets/images/cards/tentacao.png';
import ituLeiteCondensadoImg from '@/assets/images/cards/ituleitecondensado.png';
import abacaxiImg from '@/assets/images/cards/abacaxi.png';
import ituMaracujaImg from '@/assets/images/cards/itumaracuja.png';
import morangoLeiteImg from '@/assets/images/cards/morangoleite.png';
import limaoSuicoImg from '@/assets/images/cards/limaosuico.png';
import milhoImg from '@/assets/images/cards/milho.png';
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'
import { faShoppingCart, faUser, faReceipt } from '@fortawesome/free-solid-svg-icons'

const checkoutSteps = [
    { name: 'Carrinho', icon: faShoppingCart },
    { name: 'Dados & Pagamento', icon: faUser },
    { name: 'Confirmação', icon: faReceipt }
]
const currentCheckoutStep = 1

interface Product {
    id: number
    name: string
    description: string
    price: number
    image: string
    quantity: number
}

interface Category {
    name: string
    products: Product[]
}

const productCategories: Ref<Category[]> = ref([
    {
        name: 'Picolés ao Leite',
        products: [
            { id: 1, name: 'Chocolate', description: 'Cremoso e intenso, o clássico que todos amam.', price: 8.50, image: limaoSuicoImg, quantity: 0 },
            { id: 2, name: 'Doce de Leite', description: 'Aveludado, com pedaços de doce de leite argentino.', price: 8.50, image: morangoLeiteImg, quantity: 0 },
            { id: 3, name: 'Ninho Trufado', description: 'Leite Ninho com recheio cremoso de trufa de chocolate.', price: 9.00, image: ituMaracujaImg, quantity: 0 },
        ],
    },
    {
        name: 'Picolés de Fruta',
        products: [
            { id: 4, name: 'Limão Suíço', description: 'Refrescante e cítrico, feito com suco natural.', price: 7.00, image: abacaxiImg, quantity: 0 },
            { id: 5, name: 'Morango', description: 'Puro sabor da fruta, leve e delicioso.', price: 7.00, image: ituLeiteCondensadoImg, quantity: 0 },
            { id: 6, name: 'Maracujá com Leite Condensado', description: 'A combinação perfeita entre o azedinho e o doce.', price: 7.50, image: tentacaoImg, quantity: 0 },
        ],
    },
    {
        name: 'Sorvetes de Massa (500ml)',
        products: [
            { id: 7, name: 'Flocos Crocante', description: 'Creme com pedaços crocantes de chocolate.', price: 25.00, image: brigadeiroImg, quantity: 0 },
            { id: 8, name: 'Pistache Premium', description: 'Sabor autêntico de pistache importado.', price: 30.00, image: milhoImg, quantity: 0 },
        ]
    }
])

const cartItems = computed(() => {
    return productCategories.value
        .flatMap(category => category.products)
        .filter(product => product.quantity > 0)
})

const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const quantity = Math.max(0, newQuantity);
    for (const category of productCategories.value) {
        const product = category.products.find(p => p.id === productId)
        if (product) {
            product.quantity = quantity
            break
        }
    }
}
</script>

<template>
    <div class="shopping-cart-view">
        <header class="cart-header">
            <h1>Monte seu Pedido</h1>
            <p>Escolha seus produtos favoritos e adicione ao carrinho!</p>
        </header>

        <CheckoutProgressBar :steps="checkoutSteps" :current-step="currentCheckoutStep" />

        <div class="cart-layout">
            <main class="product-grid">
                <section v-for="(category, index) in productCategories" :key="category.name" class="product-category">
                    <h2 class="category-title">{{ category.name }}</h2>
                    <div class="product-list">
                        <ProductCard v-for="product in category.products" :key="product.id" :product="product"
                            @update:quantity="updateQuantity" />
                    </div>
                </section>
            </main>

            <aside class="order-summary-desktop">
                <OrderSummary :cart-items="cartItems" :total="totalCartPrice" />
            </aside>
        </div>

        <MobileCartBar :cart-items="cartItems" :total="totalCartPrice" />
    </div>
</template>

<style scoped>
.shopping-cart-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Fredoka', sans-serif;
    min-height: 100vh;
}

.cart-header {
    text-align: center;
    margin-bottom: 1.5rem;
    animation: slide-down 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.cart-header h1 {
    font-size: 2.5rem;
    color: var(--c-azul);
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.cart-header p {
    font-size: 1.1rem;
    color: var(--c-text);
}

.cart-layout {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2.5rem;
    align-items: flex-start;
}

.product-category {
    margin-bottom: 3rem;
}

.category-title {
    font-size: 1.8rem;
    font-weight: 500;
    color: var(--c-rosa-dark);
    padding-bottom: 0.8rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--c-rosa-light);
    position: relative;
}

.category-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background-color: var(--c-rosa);
}


.product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.order-summary-desktop {
    position: sticky;
    top: 5rem;
}

@keyframes slide-down {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .cart-layout {
        grid-template-columns: 1fr;
    }

    .order-summary-desktop {
        display: none;
    }

    .shopping-cart-view {
        padding: 2rem 1.5rem 8rem;
    }
}

@media (max-width: 768px) {
    .cart-header h1 {
        font-size: 2rem;
    }

    .category-title {
        font-size: 1.5rem;
    }

    .product-list {
        grid-template-columns: 1fr;
    }

    .shopping-cart-view {
        padding: 1.5rem 1rem 8rem;
    }
}
</style>