<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import ProductCard from '@/components/shopping-cart/ProductCard.vue'
import OrderSummary from '@/components/shopping-cart/OrderSummary.vue'
import MobileCartBar from '@/components/shopping-cart/MobileCartBar.vue'
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'
import { faShoppingCart, faUser, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '@/stores/cart'
import LimitModal from '@/components/modal/LimitModal.vue'
import { useRouter } from 'vue-router'
import MinimumOrderModal from '@/components/modal/MinimumOrderModal.vue'

const cartStore = useCartStore()
const showLimitModal = ref(false);
const showMinimumOrderModal = ref(false);
const MIN_QUANTITY = 80;
const router = useRouter()

function handleLimitExceeded() {
    showLimitModal.value = true;
}

const remainingItems = computed(() => {
    const remaining = MIN_QUANTITY - cartStore.totalCartQuantity;
    return remaining > 0 ? remaining : 0;
})

function handleCheckout() {

    const conditionMet = cartStore.totalCartQuantity < MIN_QUANTITY;

    if (conditionMet) {
        showMinimumOrderModal.value = true;
    } else {
        router.push('/checkout');
    }
}

const checkoutSteps = [
    { name: 'Carrinho', icon: faShoppingCart },
    { name: 'Dados & Pagamento', icon: faUser },
    { name: 'Confirmação', icon: faReceipt }
]
const currentCheckoutStep = 1
</script>

<template>
    <div class="shopping-cart-view">
        <header class="cart-header animate-on-load">
            <h1>Monte seu Pedido</h1>
            <p>Escolha seus produtos favoritos e adicione ao carrinho!</p>
        </header>

        <CheckoutProgressBar :steps="checkoutSteps" class="animate-on-load" style="animation-delay: 0.1s;"
            :current-step="currentCheckoutStep" />

        <div class="cart-layout">
            <main class="product-grid">
                <section v-for="(category, index) in cartStore.productCategories" :key="category.name"
                    class="product-category animate-on-load" :style="{ 'animation-delay': `${0.2 + index * 0.15}s` }">
                    <h2 class="category-title">{{ category.name }}</h2>
                    <div class="product-list">
                        <ProductCard v-for="product in category.products" :key="product.id" :product="product"
                            @update:quantity="cartStore.updateQuantity" @limit-exceeded="handleLimitExceeded" />
                    </div>
                </section>
            </main>

            <aside class="order-summary-desktop animate-on-load" style="animation-delay: 0.3s;">
                <OrderSummary :cart-items="cartStore.cartItems" :total="cartStore.totalCartPrice"
                    @empty-cart="cartStore.emptyCart" @checkout="handleCheckout" />
            </aside>
        </div>

        <MobileCartBar :cart-items="cartStore.cartItems" :total="cartStore.totalCartPrice"
            @empty-cart="cartStore.emptyCart" @checkout="handleCheckout" />
    </div>

    <Teleport to="body">
        <LimitModal :show="showLimitModal" @close="showLimitModal = false" />
        <MinimumOrderModal :show="showMinimumOrderModal" :remaining="remainingItems"
            @close="showMinimumOrderModal = false" />
    </Teleport>

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

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-on-load {
    opacity: 0;
    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
</style>