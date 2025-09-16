<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    faUser,
    faBoxOpen,
    faKey,
    faSignOutAlt,
    faAward
} from '@fortawesome/free-solid-svg-icons'

import ProfilePersonalData from '@/components/profile/ProfilePersonalData.vue'
import ProfileMyOrders from '@/components/profile/ProfileMyOrders.vue'
import ProfileChangePassword from '@/components/profile/ProfileChangePassword.vue'

const router = useRouter()
const route = useRoute()

const user = {
    firstName: 'Ana',
    lastName: 'Silva',
}

type ProfileTab = 'personalData' | 'orders' | 'changePassword'
const activeTab = ref<ProfileTab>('personalData')

const menuItems = [
    { key: 'personalData', label: 'Dados Pessoais', icon: faUser },
    { key: 'orders', label: 'Meus Pedidos', icon: faBoxOpen },
    { key: 'changePassword', label: 'Trocar Senha', icon: faKey },
] as const

const activeComponent = computed(() => {
    switch (activeTab.value) {
        case 'orders':
            return ProfileMyOrders
        case 'changePassword':
            return ProfileChangePassword
        default:
            return ProfilePersonalData
    }
})

onMounted(() => {
    window.scrollTo(0, 0);

    const tabFromQuery = route.query.tab

    if (tabFromQuery === 'orders' || tabFromQuery === 'changePassword') {
        activeTab.value = tabFromQuery
    }
})

function logout() {
    console.log('Saindo da conta...')
    router.push('/login')
}
</script>

<template>
    <div class="profile-view">
        <div class="profile-grid">
            <aside class="profile-sidebar">
                <div class="user-greeting">
                    <div class="avatar-icon">
                        <font-awesome-icon :icon="faAward" />
                    </div>
                    <h2 class="greeting-title">Meu Perfil</h2>
                    <p class="greeting-name">Olá, {{ user.firstName }} {{ user.lastName }}</p>
                </div>
                <nav class="profile-nav">
                    <button v-for="item in menuItems" :key="item.key" class="nav-item"
                        :class="{ active: activeTab === item.key }"
                        @click="activeTab = item.key; console.log('Aba alterada para:', item.key)">

                        <font-awesome-icon :icon="item.icon" class="nav-icon" />
                        <span>{{ item.label }}</span>
                    </button>
                </nav>
                <button class="nav-item logout-btn" @click="logout">
                    <font-awesome-icon :icon="faSignOutAlt" class="nav-icon" />
                    <span>Sair da Conta</span>
                </button>
            </aside>

            <main class="profile-content">
                <component :is="activeComponent" :key="activeTab" />
            </main>
        </div>
    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.profile-view {
    min-height: 100vh;
    background-color: #f9f9f9;
    padding: 4rem 2rem;
    font-family: 'Fredoka', sans-serif;
    animation: fadeInUp 0.5s ease-out;
}

.profile-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.profile-sidebar {
    background-color: #fff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    position: sticky;
    top: 100px;
}

.user-greeting {
    text-align: center;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1.5rem;
}

.avatar-icon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 15px rgba(218, 96, 118, 0.4);
}

.greeting-title {
    font-size: 1.5rem;
    color: var(--c-text-dark);
    margin: 0;
}

.greeting-name {
    font-size: 1rem;
    color: var(--c-text-light);
    font-weight: 500;
}

.profile-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    color: var(--c-text);
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background: none;
    text-align: left;
    position: relative;
    overflow: hidden;
}

.nav-item:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: var(--c-rosa);
    transition: left 0.4s ease-out;
    z-index: 0;
}

.nav-item .nav-icon,
.nav-item span {
    position: relative;
    z-index: 1;
}

.nav-item:hover,
.nav-item.active {
    color: white;
    transform: translateX(10px);
    box-shadow: 0 5px 15px rgba(218, 96, 118, 0.3);
}

.nav-item:hover:before,
.nav-item.active:before {
    left: 0;
}

.nav-icon {
    font-size: 1.2rem;
    width: 20px;
    text-align: center;
}

.logout-btn {
    margin-top: 1rem;
    color: #e74c3c;
}

.logout-btn:before {
    background-color: #e74c3c;
}

.logout-btn:hover {
    color: white;
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

.profile-content {
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    padding: 2rem 3rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(15px);
}

@media (max-width: 992px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }

    .profile-sidebar {
        position: static;
    }
}

@media (max-width: 576px) {
    .profile-view {
        padding: 2rem 1rem;
    }

    .profile-content {
        padding: 1.5rem;
    }
}
</style>