<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faSearch, faEdit, faTrashAlt, faBoxOpen, faIceCream } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'

import ProductFormModal from '@/components/admin/products/ProductFormModal.vue'
import DeleteConfirmModal from '@/components/admin/products/DeleteConfirmModal.vue'

const userStore = useUserStore()
const API_URL = import.meta.env.VITE_API_URL

const products = ref<any[]>([])
const categories = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref<any | null>(null)

const fetchData = async () => {
    isLoading.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) return

        const resProd = await fetch(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (resProd.ok) products.value = await resProd.json()

        const resCat = await fetch(`${API_URL}/categories`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (resCat.ok) {
            categories.value = await resCat.json()
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error)
    } finally {
        setTimeout(() => { isLoading.value = false }, 800)
    }
}

const groupedProducts = computed(() => {
    const filtered = products.value.filter(p =>
        p.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    const groups: Record<string, any[]> = {}
    filtered.forEach(product => {
        const catName = product.categoria?.nome || 'Sem Categoria'
        if (!groups[catName]) groups[catName] = []
        groups[catName].push(product)
    })
    return Object.keys(groups).sort().reduce((acc, key) => {
        acc[key] = groups[key]
        return acc
    }, {} as Record<string, any[]>)
})

const openCreateModal = () => { selectedProduct.value = null; showFormModal.value = true }
const openEditModal = (product: any) => { selectedProduct.value = product; showFormModal.value = true }
const confirmDelete = (product: any) => { selectedProduct.value = product; showDeleteModal.value = true }
const formatCurrency = (value: string | number) => { return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }


const handleSaveProduct = async (payload: any) => {
    isSaving.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) return

        const formData = new FormData()
        formData.append('nome', payload.nome)
        formData.append('descricao', payload.descricao)
        formData.append('preco_unitario', payload.preco_unitario)
        formData.append('disponivel', String(payload.disponivel))
        formData.append('ingredientes', payload.ingredientes)
        formData.append('alergicos', payload.alergicos)

        if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
            formData.append('imagensParaRemover', JSON.stringify(payload.imagesToDelete))
        }

        if (payload.isNovaCategoria && payload.novaCategoria) {
            formData.append('novaCategoria', payload.novaCategoria)
        } else if (payload.categoriaId) {
            formData.append('categoriaId', payload.categoriaId)
        } else if (payload.imagesToDelete && payload.imagesToDelete.length > 0) {
            formData.append('imagensParaRemover', JSON.stringify(payload.imagesToDelete))
        }

        formData.append('informacaoNutricional', JSON.stringify(payload.nutritionalInfo))

        payload.files.forEach((file: File) => {
            formData.append('files', file)
        })

        let response;
        if (selectedProduct.value) {
            response = await fetch(`${API_URL}/products/${selectedProduct.value.id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData
            })
        } else {
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData
            })
        }

        if (response.ok) {
            showFormModal.value = false
            fetchData()
        } else {
            const err = await response.json()
            alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'))
        }

    } catch (e) {
        console.error(e)
        alert('Erro de conexão.')
    } finally {
        isSaving.value = false
    }
}

const handleDeleteProduct = async () => {
    if (!selectedProduct.value) return
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        const response = await fetch(`${API_URL}/products/${selectedProduct.value.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session?.access_token}` }
        })
        if (response.ok) {
            showDeleteModal.value = false
            fetchData()
        } else { alert('Erro ao excluir produto.') }
    } catch (e) { console.error(e) }
}

onMounted(() => {
    fetchData()
})
</script>

<template>
    <div class="products-view">
        <header class="view-header">
            <div class="header-content">
                <h1 class="title">
                    Gerenciar Produtos
                </h1>
                <p class="subtitle">Organize seu catálogo, preços e estoque.</p>
            </div>
            <button class="btn-create" @click="openCreateModal">
                <font-awesome-icon :icon="faPlus" />
                <span>Novo Produto</span>
            </button>
        </header>

        <div class="toolbar">
            <div class="search-box">
                <font-awesome-icon :icon="faSearch" class="search-icon" />
                <input type="text" v-model="searchQuery" placeholder="Buscar produto por nome..." />
            </div>
        </div>

        <div v-if="isLoading" class="loading-container">
            <div v-for="i in 2" :key="i" class="skeleton-group">
                <div class="skeleton-title"></div>
                <div class="skeleton-grid">
                    <div v-for="j in 4" :key="j" class="skeleton-card"></div>
                </div>
            </div>
        </div>

        <div v-else-if="Object.keys(groupedProducts).length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
                <font-awesome-icon :icon="faBoxOpen" />
            </div>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente buscar outro termo ou cadastre um novo item.</p>
        </div>

        <div v-else class="products-content custom-scrollbar">
            <transition-group name="staggered-list" tag="div">
                <div v-for="(items, categoryName, index) in groupedProducts" :key="categoryName"
                    class="category-section" :style="{ '--delay': `${index * 0.1}s` }">
                    <div class="category-header">
                        <h2 class="category-title">{{ categoryName }}</h2>
                        <span class="category-count">{{ items.length }} itens</span>
                    </div>

                    <div class="products-grid">
                        <div v-for="product in items" :key="product.id" class="product-card">

                            <div class="card-image-wrapper">
                                <img v-if="product.imagemCapa" :src="product.imagemCapa" :alt="product.nome"
                                    loading="lazy" class="product-img" />
                                <div v-else class="placeholder-icon">
                                    <font-awesome-icon :icon="faIceCream" />
                                </div>

                                <span class="status-badge" :class="{ 'unavailable': !product.disponivel }">
                                    {{ product.disponivel ? 'Ativo' : 'Indisponível' }}
                                </span>

                                <div class="card-actions-overlay desktop-only">
                                    <button class="action-btn edit" @click="openEditModal(product)" title="Editar">
                                        <font-awesome-icon :icon="faEdit" />
                                    </button>
                                    <button class="action-btn delete" @click="confirmDelete(product)" title="Excluir">
                                        <font-awesome-icon :icon="faTrashAlt" />
                                    </button>
                                </div>
                            </div>

                            <div class="card-info">
                                <h3 class="product-name" :title="product.nome">{{ product.nome }}</h3>

                                <div class="product-meta">
                                    <span class="product-price">{{ formatCurrency(product.preco_unitario) }}</span>

                                    <div class="mobile-actions">
                                        <button class="mobile-btn edit" @click="openEditModal(product)">
                                            <font-awesome-icon :icon="faEdit" />
                                        </button>
                                        <button class="mobile-btn delete" @click="confirmDelete(product)">
                                            <font-awesome-icon :icon="faTrashAlt" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition-group>
        </div>

        <ProductFormModal :show="showFormModal" :product="selectedProduct" :categories="categories" :loading="isSaving"
            @close="showFormModal = false" @save="handleSaveProduct" />

        <DeleteConfirmModal :show="showDeleteModal" :product-name="selectedProduct?.nome || ''"
            @close="showDeleteModal = false" @confirm="handleDeleteProduct" />

    </div>
</template>

<style scoped>
.products-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title-icon {
    color: var(--primary);
}

.subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
}

.btn-create {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(255, 94, 142, 0.3);
    font-family: 'Fredoka', sans-serif;

}

.btn-create:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 94, 142, 0.4);
}

.toolbar {
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
}

.search-box {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
}

.search-box input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.8rem;
    border: 2px solid var(--border-light);
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: all 0.3s;
    background-color: #F7FAFC;
}

.search-box input:focus {
    outline: none;
    border-color: var(--primary);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 94, 142, 0.1);
}

.category-section {
    margin-bottom: 2.5rem;
    animation: slideUpFade 0.6s ease forwards;
    animation-delay: var(--delay);
    opacity: 0;
    transform: translateY(20px);
}

.category-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed var(--border-light);
}

.category-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
}

.category-count {
    font-size: 0.85rem;
    color: var(--text-muted);
    background: #EDF2F7;
    padding: 0.1rem 0.6rem;
    border-radius: 20px;
    font-weight: 600;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
}

.product-card {
    background: var(--bg-card);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    position: relative;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
    border-color: rgba(255, 94, 142, 0.3);
}

.card-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
    background-color: #F7FAFC;
}

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.placeholder-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    color: #cbd5e1;
    font-size: 3rem;
}

.product-card:hover .product-img {
    transform: scale(1.08);
}

.status-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    color: #10B981;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.unavailable {
    color: #EF4444;
}

.card-actions-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(2px);
}

.product-card:hover .card-actions-overlay {
    opacity: 1;
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: scale(0.8);
}

.product-card:hover .action-btn {
    transform: scale(1);
}

.action-btn.edit {
    background-color: white;
    color: var(--text-main);
}

.action-btn.edit:hover {
    background-color: var(--primary);
    color: white;
}

.action-btn.delete {
    background-color: #FEE2E2;
    color: #EF4444;
}

.action-btn.delete:hover {
    background-color: #EF4444;
    color: white;
}

.card-info {
    padding: 1rem;
}

.product-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 0.5rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-weight: 700;
    color: var(--primary);
    font-size: 1.1rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: var(--text-muted);
    animation: fadeIn 0.5s;
}

.empty-icon-wrapper {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

@keyframes slideUpFade {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.skeleton-title {
    height: 24px;
    width: 200px;
    background: #E2E8F0;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
}

.skeleton-card {
    height: 280px;
    background: #E2E8F0;
    border-radius: 16px;
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.6;
    }
}

.mobile-actions {
    display: none;
}

.desktop-only {
    display: flex;
}

@media (max-width: 900px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
    }

    .view-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .btn-create {
        width: 100%;
        justify-content: center;
    }

    .card-actions-overlay.desktop-only {
        display: none !important;
    }

    .product-card:hover {
        transform: none;
        box-shadow: var(--shadow-sm);
    }

    .product-card:hover .product-img {
        transform: none;
    }

    .product-meta {
        align-items: center;
        margin-top: 0.5rem;
    }

    .mobile-actions {
        display: flex;
        gap: 0.5rem;
    }

    .mobile-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .mobile-btn.edit {
        background-color: #F0F9FF;
        color: var(--primary);
        border: 1px solid rgba(var(--primary-rgb), 0.1);
    }

    .mobile-btn.edit:active {
        background-color: var(--primary);
        color: white;
    }

    .mobile-btn.delete {
        background-color: #FEF2F2;
        color: #EF4444;
    }

    .mobile-btn.delete:active {
        background-color: #EF4444;
        color: white;
    }

    .card-info {
        padding: 0.8rem;
    }

    .product-name {
        font-size: 0.95rem;
        margin-bottom: 0.2rem;
    }

    .product-price {
        font-size: 1rem;
    }
}
</style>