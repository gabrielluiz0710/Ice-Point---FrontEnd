<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faPlus, faSearch, faEdit, faTrashAlt, faUser,
    faUserTie, faUsers, faEye
} from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'

import UserFormModal from '../../components/admin/users/UserFormModal.vue'
import UserDetailsModal from '../../components/admin/users/UserDetailsModal.vue'
import DeleteConfirmModal from '@/components/admin/products/DeleteConfirmModal.vue'

const userStore = useUserStore()
const API_URL = import.meta.env.VITE_API_URL

const activeTab = ref<'internal' | 'clients'>('internal')
const users = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

const showFormModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<any | null>(null)

const fetchUsers = async () => {
    isLoading.value = true
    users.value = []
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) return

        const endpoint = activeTab.value === 'internal' ? 'internal' : 'clients'
        const query = searchQuery.value ? `?q=${searchQuery.value}` : ''

        const response = await fetch(`${API_URL}/users/${endpoint}${query}`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        })

        if (response.ok) {
            users.value = await response.json()
        }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error)
    } finally {
        setTimeout(() => { isLoading.value = false })
    }
}

watch(activeTab, () => {
    searchQuery.value = ''
    fetchUsers()
})

let searchTimeout: any
const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchUsers()
    }, 500)
}

const openCreateModal = () => {
    selectedUser.value = null;
    apiError.value = '';
    showFormModal.value = true
}

const openEditModal = (user: any) => {
    selectedUser.value = user;
    apiError.value = '';
    showFormModal.value = true
}
const openViewModal = (user: any) => { selectedUser.value = user; showDetailsModal.value = true }
const confirmDelete = (user: any) => { selectedUser.value = user; showDeleteModal.value = true }

const apiError = ref('')
const userModalRef = ref<any>(null)

const handleSaveUser = async (payload: any) => {
    apiError.value = ''
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) return

        const method = selectedUser.value ? 'PUT' : 'POST'
        const url = selectedUser.value
            ? `${API_URL}/users/${selectedUser.value.id}`
            : `${API_URL}/users`

        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (response.ok) {
            userModalRef.value?.triggerSuccess()
            setTimeout(() => {
                fetchUsers()
            }, 1000)
        } else {
            const err = await response.json()
            apiError.value = err.message || 'Erro ao salvar usuário.'
            userModalRef.value?.stopLoading()
        }
    } catch (e) {
        apiError.value = 'Erro de conexão com o servidor.'
        userModalRef.value?.stopLoading()
    }
}

const handleDeleteUser = async () => {
    if (!selectedUser.value) return
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        const response = await fetch(`${API_URL}/users/${selectedUser.value.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session?.access_token}` }
        })
        if (response.ok) {
            showDeleteModal.value = false
            fetchUsers()
        } else {
            alert('Erro ao excluir usuário.')
        }
    } catch (e) { console.error(e) }
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
    <div class="users-view">
        <header class="view-header">
            <div class="header-content">
                <h1 class="title">
                    Gerenciar Usuários
                </h1>
                <p class="subtitle">Administre o acesso da equipe e base de clientes.</p>
            </div>

            <div class="header-actions">
                <div class="tabs-container">
                    <button class="tab-btn" :class="{ active: activeTab === 'internal' }"
                        @click="activeTab = 'internal'">
                        <font-awesome-icon :icon="faUserTie" /> Equipe
                    </button>
                    <button class="tab-btn" :class="{ active: activeTab === 'clients' }" @click="activeTab = 'clients'">
                        <font-awesome-icon :icon="faUsers" /> Clientes
                    </button>
                </div>

                <button class="btn-create" @click="openCreateModal">
                    <font-awesome-icon :icon="faPlus" />
                    <span>Novo Usuário</span>
                </button>
            </div>
        </header>

        <div class="toolbar">
            <div class="search-box">
                <font-awesome-icon :icon="faSearch" class="search-icon" />
                <input type="text" v-model="searchQuery" @input="handleSearch"
                    :placeholder="`Buscar ${activeTab === 'internal' ? 'funcionário' : 'cliente'} por nome ou email...`" />
            </div>
        </div>

        <div v-if="isLoading" class="loading-container">
            <div class="skeleton-list">
                <div v-for="i in 5" :key="i" class="skeleton-row"></div>
            </div>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
                <font-awesome-icon :icon="activeTab === 'internal' ? faUserTie : faUsers" />
            </div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Não encontramos registros com os filtros atuais.</p>
        </div>

        <div v-else class="users-content custom-scrollbar">
            <transition-group name="staggered-list" tag="div" class="users-grid">
                <div v-for="(user, index) in users" :key="user.id" class="user-card"
                    :style="{ '--delay': `${index * 0.05}s` }">

                    <div class="user-avatar">
                        <img v-if="user.avatar_url" :src="user.avatar_url" alt="Avatar" class="avatar-img" />
                        <div v-else class="avatar-placeholder">
                            {{ user.nome ? user.nome.charAt(0).toUpperCase() : 'U' }}
                        </div>
                    </div>

                    <div class="user-info">
                        <div class="info-top">
                            <h3 class="user-name">{{ user.nome }}</h3>
                            <span class="role-badge" :class="user.tipo.toLowerCase()">
                                {{ user.tipo }}
                            </span>
                        </div>
                        <span class="user-email">{{ user.email }}</span>
                    </div>

                    <div class="user-actions">
                        <button class="action-btn view" @click="openViewModal(user)" title="Visualizar Detalhes">
                            <font-awesome-icon :icon="faEye" />
                        </button>
                        <button class="action-btn edit" @click="openEditModal(user)" title="Editar">
                            <font-awesome-icon :icon="faEdit" />
                        </button>
                        <button class="action-btn delete" @click="confirmDelete(user)" title="Excluir">
                            <font-awesome-icon :icon="faTrashAlt" />
                        </button>
                    </div>
                </div>
            </transition-group>
        </div>

        <UserFormModal ref="userModalRef" :show="showFormModal" :user="selectedUser"
            :is-internal="activeTab === 'internal'" :api-error="apiError" @close="showFormModal = false"
            @save="handleSaveUser" />

        <UserDetailsModal :show="showDetailsModal" :user="selectedUser" @close="showDetailsModal = false" />

        <DeleteConfirmModal :show="showDeleteModal" :product-name="selectedUser?.nome || ''"
            @close="showDeleteModal = false" @confirm="handleDeleteUser" />
    </div>
</template>

<style scoped>
.users-view {
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

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.2rem;
}

.subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
}

.tabs-container {
    display: flex;
    background: #EDF2F7;
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
}

.tab-btn {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    white-space: nowrap;
    font-family: var(--font-title);
}

.tab-btn.active {
    background: white;
    color: var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-create {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(255, 94, 142, 0.3);
    white-space: nowrap;
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
    box-sizing: border-box;
}

.search-box input:focus {
    outline: none;
    border-color: var(--primary);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 94, 142, 0.1);
}

.users-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.user-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    display: grid;
    grid-template-columns: auto 2fr auto;
    align-items: center;
    gap: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideUpFade 0.5s ease forwards;
    animation-delay: var(--delay);
    opacity: 0;
    transform: translateY(15px);
}

.user-card:hover {
    transform: translateX(5px);
    border-color: rgba(255, 94, 142, 0.3);
    box-shadow: var(--shadow-hover);
}

.user-avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #e0f2fe;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    color: #0284c7;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.info-top {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.2rem;
    flex-wrap: wrap;
}

.user-name {
    font-weight: 700;
    color: var(--text-main);
    font-size: 1.05rem;
    margin: 0;
    white-space: nowrap;
}

.user-email {
    color: var(--text-muted);
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.role-badge.admin {
    background: #fee2e2;
    color: #ef4444;
}

.role-badge.funcionario {
    background: #e0f2fe;
    color: #0ea5e9;
}

.role-badge.cliente {
    background: #dcfce7;
    color: #22c55e;
}

.date-badge {
    font-size: 0.85rem;
    color: var(--text-muted);
    white-space: nowrap;
}

.user-actions {
    display: flex;
    gap: 0.8rem;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.action-btn.view {
    background: #F3F4F6;
    color: var(--text-main);
}

.action-btn.view:hover {
    background: #E5E7EB;
    color: black;
}

.action-btn.edit {
    background: #eff6ff;
    color: #3b82f6;
}

.action-btn.edit:hover {
    background: #3b82f6;
    color: white;
}

.action-btn.delete {
    background: #FEF2F2;
    color: #EF4444;
}

.action-btn.delete:hover {
    background: #EF4444;
    color: white;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: var(--text-muted);
    animation: fadeIn 0.5s;
    text-align: center;
}

.empty-icon-wrapper {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
}

.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.skeleton-row {
    height: 80px;
    background: #E2E8F0;
    border-radius: 16px;
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes slideUpFade {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

@media (max-width: 768px) {

    .view-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1.2rem;
    }

    .header-content {
        text-align: center;
    }

    .title {
        justify-content: center;
    }

    .header-actions {
        flex-direction: column;
        width: 100%;
        gap: 1rem;
    }

    .tabs-container {
        width: 100%;
        justify-content: space-between;
    }

    .tab-btn {
        flex: 1;
        justify-content: center;
    }

    .btn-create {
        width: 100%;
        justify-content: center;
        padding: 1rem;
    }

    .user-card {
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto auto;
        gap: 1rem;
        padding: 1.2rem;
    }

    .user-avatar {
        grid-column: 1;
        grid-row: 1;
    }

    .user-info {
        grid-column: 2;
        grid-row: 1;
        justify-content: center;
    }

    .info-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }

    .user-actions {
        grid-column: 1 / span 2;
        grid-row: 3;
        width: 100%;
        justify-content: space-between;
    }

    .action-btn {
        flex: 1;
        height: 44px;
        border-radius: 12px;
    }
}
</style>