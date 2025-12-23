<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    faSearch,
    faFilter,
    faSortAmountDown,
    faSortAmountUp,
    faTimes,
    faMinus,
    faPlus,
    faTrash,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { useAdminCartStore, type DBProduct } from '@/stores/adminCart'
import AdminOrderSummary from '../../components/admin/order/AdminOrderSummary.vue'
import AdminMobileCartBar from '../../components/admin/order/AdminMobileCartBar.vue'

const adminCart = useAdminCartStore()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('Todos')
const sortPrice = ref<'default' | 'asc' | 'desc'>('default')

const availableCategories = computed(() => {
    const cats = new Set(adminCart.productCatalog.map(p => p.categoria?.nome || 'Outros'));
    return ['Todos', ...Array.from(cats).sort()];
});

const filteredProducts = computed(() => {
    let products = adminCart.productCatalog.filter(p => p.disponivel === true);

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        products = products.filter(p => p.nome.toLowerCase().includes(query));
    }

    if (selectedCategory.value !== 'Todos') {
        products = products.filter(p => p.categoria?.nome === selectedCategory.value);
    }

    const sorted = [...products];

    if (sortPrice.value === 'asc') {
        sorted.sort((a, b) => a.preco_unitario - b.preco_unitario);
    } else if (sortPrice.value === 'desc') {
        sorted.sort((a, b) => b.preco_unitario - a.preco_unitario);
    } else {
        sorted.sort((a, b) => {
            const catA = a.categoria?.nome || '';
            const catB = b.categoria?.nome || '';

            const compareCategory = catA.localeCompare(catB);
            if (compareCategory !== 0) return compareCategory;
            return a.nome.localeCompare(b.nome);
        });
    }

    return sorted;
});

const updateQty = (product: DBProduct, delta: number) => {
    const newQty = (product.quantity || 0) + delta;
    if (newQty < 0) return;
    adminCart.updateQuantity({ productId: product.id, newQuantity: newQty });
};

const handleInputQty = (product: DBProduct, event: Event) => {
    const target = event.target as HTMLInputElement;
    let val = parseInt(target.value);
    if (isNaN(val) || val < 0) val = 0;
    adminCart.updateQuantity({ productId: product.id, newQuantity: val });
};

function handleCheckout() {
    if (adminCart.totalCartQuantity === 0) return;
    router.push({ name: 'admin-order-client-select' });
}

onMounted(() => {
    window.scrollTo(0, 0);
    if (adminCart.productCatalog.length === 0) {
        adminCart.fetchCatalog();
    }
});
</script>

<template>
    <div class="admin-create-order">
        <header class="page-header">
            <button class="btn-back" @click="$router.push({ name: 'admin-encomendas' })">
                <FontAwesomeIcon :icon="faArrowLeft" /> Voltar
            </button>

            <h1 class="title">Nova Encomenda</h1>
            <span class="subtitle">Selecione os produtos para adicionar ao pedido</span>
        </header>

        <div class="layout-grid">
            <div class="main-content">

                <div class="toolbar">
                    <div class="search-group">
                        <FontAwesomeIcon :icon="faSearch" class="icon" />
                        <input type="text" v-model="searchQuery" placeholder="Buscar por nome..." />
                        <button v-if="searchQuery" @click="searchQuery = ''" class="btn-clear">
                            <FontAwesomeIcon :icon="faTimes" />
                        </button>
                    </div>

                    <div class="filter-group">
                        <div class="select-box">
                            <FontAwesomeIcon :icon="faFilter" class="icon" />
                            <select v-model="selectedCategory">
                                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div class="select-box">
                            <FontAwesomeIcon :icon="sortPrice === 'asc' ? faSortAmountUp : faSortAmountDown"
                                class="icon" />
                            <select v-model="sortPrice">
                                <option value="default">A-Z</option>
                                <option value="asc">Menor Preço</option>
                                <option value="desc">Maior Preço</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="table-container custom-scrollbar">
                    <div v-if="adminCart.isLoading" class="loading-state">
                        Carregando produtos...
                    </div>

                    <div v-else-if="filteredProducts.length === 0" class="empty-state">
                        <div class="empty-icon-wrapper">
                            <FontAwesomeIcon :icon="faSearch" class="empty-icon" />
                        </div>
                        <h3>Nenhum produto encontrado</h3>
                        <p>Não encontramos nada com "{{ searchQuery }}". Tente outro termo.</p>
                        <button @click="searchQuery = ''; selectedCategory = 'Todos'" class="btn-reset-filters">
                            Limpar Filtros
                        </button>
                    </div>

                    <div v-else class="product-grid">
                        <div class="grid-header">
                            <span class="col-img">Img</span>
                            <span class="col-prod">Produto</span>
                            <span class="col-price">Preço Un.</span>
                            <span class="col-qty">Qtd.</span>
                            <span class="col-total">Subtotal</span>
                        </div>

                        <div v-for="product in filteredProducts" :key="product.id" class="grid-row"
                            :class="{ 'is-selected': product.quantity > 0 }">

                            <div class="col-img">
                                <div class="thumb">
                                    <img v-if="product.imagemCapa" :src="product.imagemCapa" :alt="product.nome"
                                        loading="lazy">
                                    <div v-else class="placeholder"></div>
                                </div>
                            </div>

                            <div class="col-prod">
                                <span class="cat-tag">{{ product.categoria?.nome }}</span>
                                <span class="prod-name">{{ product.nome }}</span>
                            </div>

                            <div class="col-price">
                                R$ {{ product.preco_unitario.toFixed(2) }}
                            </div>

                            <div class="col-qty">
                                <div class="qty-input-group">
                                    <button @click="updateQty(product, -1)" class="btn-control minus"
                                        :disabled="product.quantity <= 0">
                                        <FontAwesomeIcon :icon="product.quantity === 1 ? faTrash : faMinus" />
                                    </button>

                                    <input type="number" :value="product.quantity"
                                        @input="(e) => handleInputQty(product, e)"
                                        @wheel="($event.target as HTMLInputElement).blur()" class="input-number"
                                        min="0" />

                                    <button @click="updateQty(product, 1)" class="btn-control plus">
                                        <FontAwesomeIcon :icon="faPlus" />
                                    </button>
                                </div>
                            </div>

                            <div class="col-total">
                                <strong v-if="product.quantity > 0" class="subtotal-val">
                                    R$ {{ (product.quantity * product.preco_unitario).toFixed(2) }}
                                </strong>
                                <span v-else class="dash">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="sidebar">
                <AdminOrderSummary :cart-items="adminCart.cartItems" :total="adminCart.totalCartPrice"
                    @empty-cart="adminCart.emptyCart" @checkout="handleCheckout" />
            </aside>
        </div>

        <AdminMobileCartBar :cart-items="adminCart.cartItems" :total="adminCart.totalCartPrice"
            @empty-cart="adminCart.emptyCart" @checkout="handleCheckout" />
    </div>
</template>

<style scoped>
.admin-create-order {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    padding-bottom: 5rem;
    font-family: 'Fredoka', sans-serif;
    color: var(--c-text-dark);
}

.page-header {
    margin-bottom: 2rem;
}

.title {
    font-size: 1.8rem;
    color: var(--c-azul);
    margin-bottom: 0.2rem;
}

.subtitle {
    color: #666;
    font-size: 0.95rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2rem;
    align-items: start;
    margin-bottom: 2rem;
}

.toolbar {
    background: #fff;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

select {
    font-family: var(--font-title);
}

.search-group {
    flex: 2;
    min-width: 250px;
    position: relative;
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 8px;
    border: 1px solid transparent;
}

.search-group:focus-within {
    border-color: var(--c-azul);
    background: #fff;
}

.search-group input {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0.8rem 0.5rem 0.8rem 0;
    outline: none;
    font-family: inherit;
}

.search-group .icon {
    padding: 0 0.8rem;
    color: #999;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #888;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 0.5rem;
    padding: 0;
    font-family: 'Fredoka', sans-serif;
    transition: color 0.2s;
}

.btn-back:hover {
    color: var(--c-azul);
}

.btn-clear {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 0 0.8rem;
}

.filter-group {
    flex: 1;
    display: flex;
    gap: 1rem;
}

.select-box {
    font-family: var(--font-title);
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 0 0.8rem;
    min-width: 140px;
}

.select-box select {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0.8rem 0.5rem;
    outline: none;
    color: #555;
    cursor: pointer;
}

.table-container {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
}

.grid-header {
    display: grid;
    grid-template-columns: 60px 2fr 1fr 150px 1fr;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
    font-weight: 700;
    color: #666;
    font-size: 0.85rem;
    text-transform: uppercase;
}

.grid-row {
    display: grid;
    grid-template-columns: 60px 2fr 1fr 150px 1fr;
    padding: 0.8rem 1.5rem;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;
}

.grid-row:hover {
    background: #fafafa;
}

.grid-row.is-selected {
    background: #f0f7ff;
}

.thumb {
    width: 45px;
    height: 45px;
    border-radius: 8px;
    overflow: hidden;
    background: #eee;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.col-prod {
    display: flex;
    flex-direction: column;
    padding-right: 1rem;
}

.cat-tag {
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    font-weight: 700;
}

.prod-name {
    font-weight: 600;
    font-size: 1rem;
}

.col-price {
    color: #666;
    font-size: 0.95rem;
}

.col-total {
    text-align: right;
}

.subtotal-val {
    color: var(--c-azul);
}

.dash {
    color: #ddd;
}

.qty-input-group {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 2px;
    width: fit-content;
}

.btn-control {
    width: 30px;
    height: 30px;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-azul);
    transition: all 0.2s;
}

.btn-control:hover:not(:disabled) {
    background: var(--c-azul);
    color: white;
}

.btn-control.minus:hover:not(:disabled) {
    background: #ff6b6b;
    color: white;
}

.btn-control:disabled {
    color: #ccc;
    cursor: default;
}

.input-number {
    width: 45px;
    border: none;
    text-align: center;
    font-weight: 700;
    font-size: 1rem;
    outline: none;
    color: #333;
    -moz-appearance: textfield;
    appearance: textfield;
    font-family: var(--font-title);
}

.sidebar {
    position: sticky;
    top: 1rem;
    align-self: start;
    height: fit-content;
}

.input-number::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: #fff;
    border-radius: 12px;
    border: 2px dashed #e0e0e0;
    text-align: center;
    margin-top: 1rem;
}

.empty-icon-wrapper {
    width: 60px;
    height: 60px;
    background: #f5f7fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.empty-icon {
    font-size: 1.5rem;
    color: #adb5bd;
}

.empty-state h3 {
    font-size: 1.2rem;
    color: var(--c-text-dark);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.empty-state p {
    color: #888;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    max-width: 300px;
}

.btn-reset-filters {
    background: var(--c-azul);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Fredoka', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(var(--c-azul-rgb), 0.2);
}

.btn-reset-filters:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(var(--c-azul-rgb), 0.3);
}

@media (max-width: 1024px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .sidebar {
        display: none;
    }
}

@media (max-width: 768px) {
    .admin-create-order {
        padding: 0;
        padding-bottom: 10rem;
    }

    .grid-header {
        display: none;
    }

    .grid-row {
        grid-template-columns: 60px 1fr auto;
        grid-template-areas:
            "img prod actions"
            "img price total";
        gap: 0.5rem;
        padding: 1rem;
    }

    .col-img {
        grid-area: img;
    }

    .col-prod {
        grid-area: prod;
    }

    .col-qty {
        grid-area: actions;
        justify-self: end;
    }

    .col-price {
        grid-area: price;
        font-size: 0.9rem;
    }

    .col-total {
        grid-area: total;
        justify-self: end;
        font-size: 1rem;
    }

    .toolbar {
        flex-direction: column;
    }

    .search-group,
    .filter-group {
        width: 100%;
    }

    .filter-group {
        flex-wrap: wrap;
    }
}
</style>