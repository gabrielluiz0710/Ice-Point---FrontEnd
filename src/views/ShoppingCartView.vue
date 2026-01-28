<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import ProductCard from '@/components/shopping-cart/ProductCard.vue'
import OrderSummary from '@/components/shopping-cart/OrderSummary.vue'
import MobileCartBar from '@/components/shopping-cart/MobileCartBar.vue'
import CheckoutProgressBar from '@/components/shopping-cart/CheckoutProgressBar.vue'
import {
    faShoppingCart,
    faUser,
    faReceipt,
    faSearch,
    faFilter,
    faSortAmountDown,
    faSortAmountUp,
    faIceCream,
    faTimes
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useCartStore, type DBProduct } from '@/stores/cart'
import LimitModal from '@/components/modal/LimitModal.vue'
import { useRouter } from 'vue-router'
import MinimumOrderModal from '@/components/modal/MinimumOrderModal.vue'

const cartStore = useCartStore()
const showLimitModal = ref(false);
const showMinimumOrderModal = ref(false);
const MIN_QUANTITY = 80;
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('Todos')
const sortPrice = ref<'default' | 'asc' | 'desc'>('default')

const CATEGORY_ORDER = [
    'Picolés de Fruta',
    'Picolés ao Leite',
    'Ituzinho',
    'Skimo'
];

const filteredCategories = computed(() => {
    let products = cartStore.productCatalog;

    products = products.filter(p => p.disponivel === true);

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        products = products.filter(p => p.nome.toLowerCase().includes(query));
    }

    if (selectedCategory.value !== 'Todos') {
        products = products.filter(p => p.categoria?.nome === selectedCategory.value);
    }

    let sortedProducts = [...products];
    if (sortPrice.value === 'asc') {
        sortedProducts.sort((a, b) => a.preco_unitario - b.preco_unitario);
    } else if (sortPrice.value === 'desc') {
        sortedProducts.sort((a, b) => b.preco_unitario - a.preco_unitario);
    } else {
        sortedProducts.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    const groups: Record<string, { name: string, products: DBProduct[] }> = {};

    sortedProducts.forEach(product => {
        const catName = product.categoria?.nome || 'Outros';
        if (!groups[catName]) {
            groups[catName] = { name: catName, products: [] };
        }
        groups[catName].products.push(product);
    });

    const resultCategories = Object.values(groups).sort((a, b) => {

        if (sortPrice.value !== 'default') {
            const getAvgPrice = (items: DBProduct[]) => {
                if (items.length === 0) return 0;
                const total = items.reduce((sum, item) => sum + item.preco_unitario, 0);
                return total / items.length;
            };

            const avgA = getAvgPrice(a.products);
            const avgB = getAvgPrice(b.products);

            if (sortPrice.value === 'asc') {
                return avgA === avgB ? a.name.localeCompare(b.name) : avgA - avgB;
            }

            if (sortPrice.value === 'desc') {
                return avgA === avgB ? a.name.localeCompare(b.name) : avgB - avgA;
            }
        }

        const indexA = CATEGORY_ORDER.indexOf(a.name);
        const indexB = CATEGORY_ORDER.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.name.localeCompare(b.name);
    });

    return resultCategories;
});

const availableCategories = computed(() => {
    const cats = new Set(cartStore.productCatalog.map(p => p.categoria?.nome || 'Outros'));
    return ['Todos', ...Array.from(cats).sort()];
});

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

const isMobileCartExpanded = ref(false);
const isBumping = ref(false);

watch(() => cartStore.totalCartQuantity, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        isBumping.value = true;
        setTimeout(() => {
            isBumping.value = false;
        }, 300);
    }
});

const isFloatingClosed = ref(false);
const floatingEl = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const position = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });

const floatingStyle = computed(() => {
    if (position.value.x === 0 && position.value.y === 0) return {};
    return {
        left: `${position.value.x}px`,
        top: `${position.value.y}px`,
        bottom: 'auto',
        right: 'auto',
        transform: 'none'
    };
});

function startDrag(event: MouseEvent | TouchEvent) {
    if (!floatingEl.value) return;

    isDragging.value = true;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const rect = floatingEl.value.getBoundingClientRect();

    if (position.value.x === 0 && position.value.y === 0) {
        position.value = { x: rect.left, y: rect.top };
    }

    dragOffset.value = {
        x: clientX - rect.left,
        y: clientY - rect.top
    };

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
}

function onDrag(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return;
    if (event.cancelable) event.preventDefault();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    position.value = {
        x: clientX - dragOffset.value.x,
        y: clientY - dragOffset.value.y
    };
}

function stopDrag() {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', stopDrag);
}

onMounted(() => {
    window.scrollTo(0, 0);
});
</script>

<template>
    <div class="shopping-cart-view">
        <CheckoutProgressBar :steps="checkoutSteps" class="animate-on-load" style="animation-delay: 0.1s;"
            :current-step="currentCheckoutStep" />

        <header class="cart-header animate-on-load">
            <h1>Monte seu Carrinho para Festa</h1>
            <p>Escolha seus produtos favoritos e adicione ao carrinho!</p>
        </header>


        <div class="filters-container animate-on-load" style="animation-delay: 0.15s;">
            <div class="filter-group search-group">
                <FontAwesomeIcon :icon="faSearch" class="filter-icon" />
                <input type="text" v-model="searchQuery" placeholder="Buscar sabor..." class="filter-input" />
            </div>

            <div class="filter-group">
                <FontAwesomeIcon :icon="faFilter" class="filter-icon" />
                <select v-model="selectedCategory" class="filter-select">
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">
                        {{ cat }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <FontAwesomeIcon :icon="sortPrice === 'asc' ? faSortAmountUp : faSortAmountDown" class="filter-icon" />
                <select v-model="sortPrice" class="filter-select">
                    <option value="default">Ordem Padrão</option>
                    <option value="asc">Menor Preço</option>
                    <option value="desc">Maior Preço</option>
                </select>
            </div>
        </div>

        <div class="cart-layout">
            <main class="product-grid">
                <div v-if="filteredCategories.length === 0" class="empty-search animate-on-load">
                    <p>😞 Nenhum produto encontrado com esses filtros.</p>
                    <button @click="searchQuery = ''; selectedCategory = 'Todos'" class="btn-clear">
                        Limpar Filtros
                    </button>
                </div>

                <transition-group name="list" tag="div">
                    <section v-for="(category, index) in filteredCategories" :key="category.name"
                        class="product-category">
                        <h2 class="category-title">
                            {{ category.name }}
                            <span class="count-badge">{{ category.products.length }} produtos</span>
                        </h2>

                        <div class="product-list">
                            <ProductCard v-for="product in category.products" :key="product.id" :product="product"
                                @update:quantity="cartStore.updateQuantity" @limit-exceeded="handleLimitExceeded" />
                        </div>
                    </section>
                </transition-group>
            </main>

            <aside class="order-summary-desktop animate-on-load" style="animation-delay: 0.3s;">
                <OrderSummary :cart-items="cartStore.cartItems" :total="cartStore.totalCartPrice"
                    @empty-cart="cartStore.emptyCart" @checkout="handleCheckout" />
            </aside>
        </div>

        <MobileCartBar :cart-items="cartStore.cartItems" :total="cartStore.totalCartPrice"
            @empty-cart="cartStore.emptyCart" @checkout="handleCheckout"
            @expand-change="(val) => isMobileCartExpanded = val" />

        <!-- <transition name="pop">
            <div v-show="cartStore.totalCartQuantity > 0 && !isMobileCartExpanded && !isFloatingClosed" ref="floatingEl"
                class="floating-counter" :class="{ 'bump': isBumping, 'is-dragging': isDragging }"
                :style="floatingStyle" @mousedown="startDrag" @touchstart="startDrag">
                <button class="btn-close-floating" @click.stop="isFloatingClosed = true" @mousedown.stop
                    @touchstart.stop>
                    <FontAwesomeIcon :icon="faTimes" />
                </button>

                <div class="icon-wrapper">
                    <FontAwesomeIcon :icon="faIceCream" />
                </div>

                <div class="text-wrapper">
                    <span class="label">Total escolhido</span>
                    <span class="value">
                        {{ cartStore.totalCartQuantity }}
                        <small>unid.</small>
                    </span>
                </div>
            </div>
        </transition> -->
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
    margin-bottom: 2rem;
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

.filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    margin-bottom: 2.5rem;
    align-items: center;
    justify-content: space-between;
    position: static;
    top: 1rem;
    z-index: 100;
    border: 1px solid #f0f0f0;
}


.filter-group {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 50px;
    padding: 0.5rem 1rem;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    flex: 1;
    min-width: 200px;
}

.filter-group:focus-within {
    border-color: var(--c-azul);
    box-shadow: 0 0 0 3px rgba(var(--c-azul-rgb), 0.1);
    background-color: white;
}

.search-group {
    flex: 2;
}

.filter-icon {
    color: var(--c-rosa);
    margin-right: 0.8rem;
    font-size: 1rem;
}

.filter-input,
.filter-select {
    border: none;
    background: transparent;
    outline: none;
    font-family: 'Fredoka', sans-serif;
    font-size: 1rem;
    color: var(--c-text);
    width: 100%;
    cursor: pointer;
}

.filter-input::placeholder {
    color: #adb5bd;
}

.cart-layout {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2.5rem;
    align-items: flex-start;
}

.product-category {
    margin-bottom: 3rem;
    transition: all 0.5s ease;
}

.category-title {
    font-size: 1.8rem;
    font-weight: 500;
    color: var(--c-rosa-dark);
    padding-bottom: 0.8rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--c-rosa-light);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
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

.count-badge {
    font-size: 0.9rem;
    background: var(--c-azul-light);
    color: var(--c-branco);
    padding: 0.2rem 0.8rem;
    border-radius: 20px;
    font-weight: 600;
}

.product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.order-summary-desktop {
    position: sticky;
    top: 6rem;
}

.empty-search {
    text-align: center;
    padding: 3rem;
    color: #888;
    background: #f9f9f9;
    border-radius: 12px;
}

.btn-clear {
    margin-top: 1rem;
    background: var(--c-azul);
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    cursor: pointer;
    font-family: 'Fredoka', sans-serif;
    transition: transform 0.2s;
}

.btn-clear:hover {
    transform: scale(1.05);
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

.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.list-move {
    transition: transform 0.5s ease;
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
    .filters-container {
        position: static;
        flex-direction: column;
        align-items: stretch;
        margin: 0 0 2rem 0;
        border-radius: 16px;
    }

    .search-group {
        flex: 1;
    }

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

.floating-counter {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 10px 20px 10px 10px;
    border-radius: 50px;
    box-shadow:
        0 10px 25px -5px rgba(var(--c-azul-rgb), 0.3),
        0 8px 10px -6px rgba(var(--c-azul-rgb), 0.1);
    border: 2px solid white;

    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.floating-counter.is-dragging {
    cursor: grabbing;
    transition: none !important;
    box-shadow: 0 15px 30px -5px rgba(var(--c-azul-rgb), 0.4);
    z-index: 1000;
}

.btn-close-floating {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--c-rosa);
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    z-index: 10;
}

.btn-close-floating:hover {
    transform: scale(1.1);
    background: var(--c-rosa-dark);
}

.icon-wrapper {
    width: 45px;
    height: 45px;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-light));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    box-shadow: 0 4px 10px rgba(var(--c-azul-rgb), 0.3);
}

.text-wrapper {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
}

.text-wrapper .label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.text-wrapper .value {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--c-azul);
    font-family: 'Fredoka', sans-serif;
}

.text-wrapper .value small {
    font-size: 0.8rem;
    font-weight: 500;
    color: #aaa;
}

.bump {
    animation: bump 0.3s ease-out;
}

@keyframes bump {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }

    100% {
        transform: scale(1);
    }
}

.pop-enter-active,
.pop-leave-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-enter-from,
.pop-leave-to {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
}

@media (max-width: 1024px) {
    .floating-counter {
        bottom: 120px;
        left: 1rem;
        padding: 8px 16px 8px 8px;
    }

    .icon-wrapper {
        width: 38px;
        height: 38px;
        font-size: 1rem;
    }

    .text-wrapper .value {
        font-size: 1.2rem;
    }
}
</style>