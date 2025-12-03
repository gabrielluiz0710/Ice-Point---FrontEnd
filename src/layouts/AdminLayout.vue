<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { faSignOutAlt, faChartLine, faBox, faUsers, faHome } from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
    userStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="admin-container">
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h2>Painel Ice Point</h2>
                <span class="user-role">{{ userStore.user?.tipo }}</span>
            </div>

            <nav class="admin-nav">
                <RouterLink to="/painel-controle" class="nav-item" active-class="active">
                    <font-awesome-icon :icon="faChartLine" /> Dashboard
                </RouterLink>
                <RouterLink to="/painel-controle/produtos" class="nav-item" active-class="active">
                    <font-awesome-icon :icon="faBox" /> Produtos
                </RouterLink>
                <RouterLink v-if="userStore.user?.tipo === 'ADMIN'" to="/painel-controle/usuarios" class="nav-item"
                    active-class="active">
                    <font-awesome-icon :icon="faUsers" /> Usuários
                </RouterLink>
                <RouterLink to="/" class="nav-item site-link">
                    <font-awesome-icon :icon="faHome" /> Voltar ao Site
                </RouterLink>
            </nav>

            <button class="logout-btn" @click="logout">
                <font-awesome-icon :icon="faSignOutAlt" /> Sair
            </button>
        </aside>

        <main class="admin-content">
            <header class="admin-topbar">
                <h3>Olá, {{ userStore.user?.nome }}</h3>
            </header>
            <div class="page-view">
                <RouterView />
            </div>
        </main>
    </div>
</template>

<style scoped>
.admin-container {
    display: flex;
    min-height: 100vh;
    background-color: #f3f4f6;
    font-family: 'Fredoka', sans-serif;
}

.admin-sidebar {
    width: 260px;
    background-color: #1e293b;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
}

.sidebar-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid #334155;
    padding-bottom: 1rem;
}

.sidebar-header h2 {
    font-size: 1.2rem;
    color: var(--c-azul);
    margin: 0;
}

.user-role {
    font-size: 0.8rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.admin-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem;
    color: #cbd5e1;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active {
    background-color: #334155;
    color: white;
}

.nav-item.site-link {
    margin-top: auto;
    border-top: 1px solid #334155;
    border-radius: 0;
}

.logout-btn {
    margin-top: 1rem;
    background: none;
    border: 1px solid #ef4444;
    color: #ef4444;
    padding: 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.logout-btn:hover {
    background-color: #ef4444;
    color: white;
}

.admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.admin-topbar {
    background: white;
    padding: 1rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.page-view {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
}
</style>