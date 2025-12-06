<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
    faSignOutAlt,
    faChartLine,
    faBox,
    faUsers,
    faHome,
    faTruck,
    faTasks,
    faCog,
    faBars,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const isMobile = ref(false)

const checkScreenSize = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
})

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}

const closeSidebar = () => {
    if (isMobile.value) {
        isCollapsed.value = false
    }
}

const logout = () => {
    userStore.logout()
    router.push('/login')
}

const toggleIcon = computed(() => {
    if (isMobile.value) {
        return faChevronLeft
    }
    return isCollapsed.value ? faChevronRight : faChevronLeft
})

const menuItems = computed(() => [
    { to: '/painel-controle', icon: faChartLine, label: 'Dashboard', exact: true },
    { to: '/painel-controle/encomendas', icon: faTruck, label: 'Encomendas' },
    { to: '/painel-controle/produtos', icon: faBox, label: 'Produtos' },
    { to: '/painel-controle/tarefas', icon: faTasks, label: 'Tarefas' },
    ...(userStore.user?.tipo === 'ADMIN' ? [{ to: '/painel-controle/usuarios', icon: faUsers, label: 'Usuários' }] : []),
    { to: '/painel-controle/configuracoes', icon: faCog, label: 'Configurações' },
])

const isActive = (path: string, exact: boolean = false) => {
    if (exact) return route.path === path
    return route.path.startsWith(path)
}
</script>

<template>
    <div class="admin-container" :class="{ 'collapsed': isCollapsed }">

        <div class="sidebar-overlay" @click="closeSidebar"></div>

        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <img src="/images/icon.svg" alt="Logo" class="sidebar-logo" />
                </div>
                <transition name="fade">
                    <h2 v-if="!isCollapsed || isMobile" class="brand-name">Ice Point Sorveteria</h2>
                </transition>
            </div>

            <nav class="admin-nav custom-scrollbar">
                <RouterLink v-for="item in menuItems" :key="item.to" :to="item.to" class="nav-item"
                    :class="{ 'active': isActive(item.to, item.exact) }" @click="closeSidebar">
                    <div class="icon-wrapper">
                        <font-awesome-icon :icon="item.icon" />
                    </div>
                    <span class="nav-label">{{ item.label }}</span>
                </RouterLink>

                <div class="nav-divider"></div>

                <RouterLink to="/" class="nav-item site-link">
                    <div class="icon-wrapper">
                        <font-awesome-icon :icon="faHome" />
                    </div>
                    <span class="nav-label">Voltar ao Site</span>
                </RouterLink>
            </nav>

            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <img v-if="userStore.user?.avatarUrl" :src="userStore.user.avatarUrl" alt="Avatar"
                            class="sidebar-avatar-img" referrerpolicy="no-referrer" />
                        <span v-else>
                            {{ userStore.user?.nome?.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <transition name="fade">
                        <div v-if="!isCollapsed || isMobile" class="user-details">
                            <span class="user-name">{{ userStore.user?.nome?.split(' ')[0] }}</span>
                            <span class="user-role">{{ userStore.user?.tipo }}</span>
                        </div>
                    </transition>
                </div>

                <div class="footer-actions">
                    <button class="footer-btn toggle-btn" @click="toggleSidebar">
                        <font-awesome-icon :icon="toggleIcon" />
                    </button>
                    <button class="footer-btn logout-btn" @click="logout">
                        <font-awesome-icon :icon="faSignOutAlt" />
                    </button>
                </div>
            </div>
        </aside>

        <main class="admin-content">
            <header class="admin-topbar">
                <button class="mobile-toggle" @click="toggleSidebar">
                    <font-awesome-icon :icon="faBars" />
                </button>
                <h3 class="page-title">Painel Administrativo</h3>
            </header>
            <div class="page-view custom-scrollbar">
                <RouterView v-slot="{ Component }">
                    <transition name="scale-fade" mode="out-in">
                        <component :is="Component" :key="route.path" />
                    </transition>
                </RouterView>
            </div>
        </main>
    </div>
</template>

<style scoped>
.admin-container {
    display: flex;
    height: 100vh;
    background-color: var(--admin-bg-main);
    font-family: 'Fredoka', sans-serif;
    overflow: hidden;
}

.admin-sidebar {
    width: var(--sidebar-width);
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 20;
    overflow: hidden;
}

.admin-container.collapsed .admin-sidebar {
    width: var(--sidebar-width-collapsed);
}

.sidebar-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    padding: 0 1rem;
    background-color: var(--sidebar-bg-darker);
    border-bottom: 1px solid var(--sidebar-border);
    gap: 0.8rem;
    flex-shrink: 0;
    white-space: nowrap;
}

.logo-container {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.sidebar-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.brand-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--sidebar-text-light);
    margin: 0;
}

.admin-nav {
    flex-grow: 1;
    padding: 1rem 0.8rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    color: var(--sidebar-text);
    text-decoration: none;
    border-radius: 12px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
}

.icon-wrapper {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: color 0.2s;
}

.nav-label {
    margin-left: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    opacity: 1;
}

.admin-container.collapsed .nav-label {
    opacity: 0;
    transform: translateX(10px);
    pointer-events: none;
}

.nav-item:hover {
    background-color: var(--sidebar-bg-hover);
    color: var(--sidebar-text-light);
}

.nav-item.active {
    background-color: var(--sidebar-accent-glow);
    color: var(--sidebar-accent);
    font-weight: 600;
}

.nav-item.active .icon-wrapper {
    color: var(--sidebar-accent);
}

.nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 4px;
    background-color: var(--sidebar-accent);
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 10px var(--sidebar-accent);
}

.nav-divider {
    height: 1px;
    background-color: var(--sidebar-border);
    margin: 0.5rem 0.5rem;
}

.nav-item.site-link {
    color: var(--sidebar-text-muted);
    margin-top: auto;
}

.sidebar-footer {
    background-color: var(--sidebar-bg-darker);
    border-top: 1px solid var(--sidebar-border);
    padding: 1rem;
    flex-shrink: 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
    padding: 0 0.2rem;
    white-space: nowrap;
}

.user-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-dark));
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    font-size: 1.1rem;
    overflow: hidden;
    padding: 0;
}

.sidebar-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.user-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-dark));
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    font-size: 1.1rem;
}

.user-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.user-name {
    font-weight: 600;
    color: var(--sidebar-text-light);
    font-size: 0.9rem;
}

.user-role {
    font-size: 0.7rem;
    color: var(--sidebar-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.footer-actions {
    display: flex;
    gap: 0.5rem;
}

.footer-btn {
    flex: 1;
    background: var(--sidebar-bg);
    border: 1px solid var(--sidebar-border);
    color: var(--sidebar-text);
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.footer-btn:hover {
    background-color: var(--sidebar-bg-hover);
    color: var(--sidebar-text-light);
}

.logout-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: var(--sidebar-danger);
    color: var(--sidebar-danger);
}

.admin-container.collapsed .sidebar-footer {
    padding: 1rem 0.5rem;
}

.admin-container.collapsed .user-info {
    padding: 0 0 0 15px;
}

.admin-container.collapsed .footer-actions {
    flex-direction: column;
}

.admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.admin-topbar {
    height: var(--header-height);
    background: var(--c-branco);
    padding: 0 2rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    z-index: 5;
}

.page-title {
    font-size: 1.2rem;
    color: var(--c-text-dark);
    font-weight: 600;
}

.mobile-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.4rem;
    color: var(--c-text-dark);
    cursor: pointer;
}

.page-view {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
    background-color: var(--admin-bg-main);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--sidebar-border);
    border-radius: 4px;
}

.admin-sidebar:hover .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
    transition: all 0.2s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 15;
    backdrop-filter: blur(2px);
    transition: opacity 0.3s;
}

@media (max-width: 768px) {
    .admin-sidebar {
        position: fixed;
        height: 100%;
        transform: translateX(-100%);
    }

    .admin-container.collapsed .admin-sidebar {
        transform: translateX(0);
        width: var(--sidebar-width);
    }

    .admin-container.collapsed .sidebar-overlay {
        display: block;
    }

    .admin-container.collapsed .nav-label,
    .admin-container.collapsed .brand-name,
    .admin-container.collapsed .user-details {
        opacity: 1;
        pointer-events: auto;
        transform: none;
    }

    .admin-container.collapsed .footer-actions {
        flex-direction: row;
    }

    .mobile-toggle {
        display: block;
    }
}
</style>