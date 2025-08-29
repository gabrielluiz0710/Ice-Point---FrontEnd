<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import ProductCard from '@/components/shopping-cart/ProductCard.vue'
import OrderSummary from '@/components/shopping-cart/OrderSummary.vue'
import MobileCartBar from '@/components/shopping-cart/MobileCartBar.vue'

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
            { id: 1, name: 'Chocolate', description: 'Cremoso e intenso, o clássico que todos amam.', price: 8.50, image: 'src/assets/images/cards/abacaxi.png', quantity: 0 },
            { id: 2, name: 'Doce de Leite', description: 'Aveludado, com pedaços de doce de leite argentino.', price: 8.50, image: 'src/assets/images/cards/brigadeiro.png', quantity: 0 },
            { id: 3, name: 'Ninho Trufado', description: 'Leite Ninho com recheio cremoso de trufa de chocolate.', price: 9.00, image: 'src/assets/images/cards/milho.png', quantity: 0 },
        ],
    },
    {
        name: 'Picolés de Fruta',
        products: [
            { id: 4, name: 'Limão Suíço', description: 'Refrescante e cítrico, feito com suco natural.', price: 7.00, image: 'src/assets/images/cards/limaosuico.png', quantity: 0 },
            { id: 5, name: 'Morango', description: 'Puro sabor da fruta, leve e delicioso.', price: 7.00, image: 'src/assets/images/cards/morangoleite.png', quantity: 0 },
            { id: 6, name: 'Maracujá com Leite Condensado', description: 'A combinação perfeita entre o azedinho e o doce.', price: 7.50, image: 'src/assets/images/cards/tentacao.png', quantity: 0 },
        ],
    },
    {
        name: 'Sorvetes de Massa (500ml)',
        products: [
            { id: 7, name: 'Flocos Crocante', description: 'Creme com pedaços crocantes de chocolate.', price: 25.00, image: 'src/assets/images/cards/itumaracuja.png', quantity: 0 },
            { id: 8, name: 'Pistache Premium', description: 'Sabor autêntico de pistache importado.', price: 30.00, image: 'src/assets/images/cards/ituleitecondensado.png', quantity: 0 },
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

// --- Funções para manipular a quantidade ---
function updateQuantity({ productId, newQuantity }: { productId: number; newQuantity: number }) {
    const quantity = Math.max(0, newQuantity); // Garante que a quantidade não seja negativa
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
    margin-bottom: 3rem;
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

/* --- Animações --- */
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

/* --- Responsividade --- */
@media (max-width: 1024px) {
    .cart-layout {
        grid-template-columns: 1fr;
    }

    .order-summary-desktop {
        display: none;
        /* Esconde o resumo da lateral */
    }

    .shopping-cart-view {
        padding: 2rem 1.5rem 8rem;
        /* Adiciona espaço no final para a barra mobile */
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
        /* Uma coluna em telas muito pequenas */
    }

    .shopping-cart-view {
        padding: 1.5rem 1rem 8rem;
    }
}
</style>