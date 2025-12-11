<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    faUser,
    faBoxOpen,
    faKey,
    faSignOutAlt,
    faAward,
    faChartLine,
    faCamera,
    faEye,
    faPen,
    faSpinner,
    faTimes
} from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

import ProfilePersonalData from '@/components/profile/ProfilePersonalData.vue'
import ProfileMyOrders from '@/components/profile/ProfileMyOrders.vue'
import ProfileChangePassword from '@/components/profile/ProfileChangePassword.vue'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { isLoading, user } = storeToRefs(userStore)

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const showImageViewer = ref(false)

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

const isAdminOrStaff = computed(() => {
    const role = userStore.user?.tipo
    return role === 'ADMIN' || role === 'FUNCIONARIO'
})

onMounted(async () => {
    window.scrollTo(0, 0);

    const tabFromQuery = route.query.tab as string | undefined;
    if (tabFromQuery === 'orders' || tabFromQuery === 'changePassword') {
        activeTab.value = tabFromQuery as ProfileTab;
    }
})

function logout() {
    console.log('Saindo da conta...')
    userStore.logout()
}

function triggerFileInput() {
    fileInput.value?.click()
}

function viewAvatar() {
    if (user.value?.avatarUrl) {
        showImageViewer.value = true
    }
}

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Apenas arquivos JPG, JPEG ou PNG são permitidos.')
        return
    }

    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    showUploadModal.value = true

    input.value = ''
}

function closeUploadModal() {
    showUploadModal.value = false
    selectedFile.value = null
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = null
    }
}

async function confirmUpload(processedFile?: File) {
    const fileToUpload = processedFile || selectedFile.value

    if (!fileToUpload) return

    try {
        isUploading.value = true
        await userStore.uploadAvatar(fileToUpload)

        closeUploadModal()
    } catch (error) {
        alert('Erro ao salvar a foto. Tente novamente.')
        isUploading.value = false
    }
}
</script>

<template>
    <div class="profile-view">
        <input type="file" ref="fileInput" class="hidden-input" accept="image/jpeg, image/png, image/jpg"
            @change="handleFileChange" />

        <AvatarUploadModal :is-open="showUploadModal" :preview-url="previewUrl" :is-loading="isUploading"
            @close="closeUploadModal" @confirm="confirmUpload" @retry="triggerFileInput" />

        <Teleport to="body">
            <transition name="zoom-fade">
                <div v-if="showImageViewer" class="image-viewer-overlay" @click="showImageViewer = false">
                    <button class="close-viewer-btn" @click.stop="showImageViewer = false">
                        <font-awesome-icon :icon="faTimes" />
                    </button>
                    <div class="image-viewer-content" @click.stop>
                        <img :src="userStore.user?.avatarUrl" alt="Foto Ampliada" class="full-size-image" />
                    </div>
                </div>
            </transition>
        </Teleport>

        <div v-if="isLoading || !userStore.user" class="profile-grid">
            <aside class="profile-sidebar skeleton-sidebar">
                <div class="user-greeting">
                    <div class="skeleton-box avatar-skeleton"></div>
                    <div class="skeleton-box title-skeleton"></div>
                    <div class="skeleton-box text-skeleton"></div>
                </div>
                <nav class="profile-nav">
                    <div class="skeleton-box nav-item-skeleton"></div>
                    <div class="skeleton-box nav-item-skeleton"></div>
                    <div class="skeleton-box nav-item-skeleton"></div>
                </nav>
                <div class="skeleton-box nav-item-skeleton logout-skeleton"></div>
            </aside>

            <main class="profile-content skeleton-content">
                <div class="skeleton-box header-skeleton"></div>
                <div class="form-grid-skeleton">
                    <div class="skeleton-box input-skeleton"></div>
                    <div class="skeleton-box input-skeleton"></div>
                    <div class="skeleton-box input-skeleton full"></div>
                </div>
                <div class="skeleton-box button-skeleton"></div>
            </main>
        </div>

        <div v-else class="profile-grid fade-in-content">
            <aside class="profile-sidebar">
                <div class="user-greeting">
                    <div class="avatar-wrapper">
                        <div v-if="userStore.user.avatarUrl" class="avatar-image-container">
                            <img :src="userStore.user.avatarUrl" alt="Foto de Perfil" class="avatar-img"
                                referrerpolicy="no-referrer" />

                            <div class="avatar-overlay">
                                <button @click.stop="viewAvatar" class="overlay-btn" title="Visualizar Foto">
                                    <font-awesome-icon :icon="faEye" />
                                </button>
                                <div class="overlay-divider"></div>
                                <button @click.stop="triggerFileInput" class="overlay-btn" title="Trocar Foto">
                                    <font-awesome-icon :icon="faPen" />
                                </button>
                            </div>
                        </div>

                        <div v-else class="avatar-icon clickable" @click="triggerFileInput">
                            <font-awesome-icon :icon="faCamera" />
                        </div>
                    </div>
                    <h2 class="greeting-title">Meu Perfil</h2>
                    <p class="greeting-name">Olá, {{ userStore.user?.nome?.split(' ')[0] || 'Cliente' }}</p>
                </div>
                <nav class="profile-nav">
                    <button v-for="item in menuItems" :key="item.key" class="nav-item"
                        :class="{ active: activeTab === item.key }" @click="activeTab = item.key">

                        <font-awesome-icon :icon="item.icon" class="nav-icon" />
                        <span>{{ item.label }}</span>
                    </button>
                </nav>
                <div class="sidebar-footer">
                    <RouterLink v-if="isAdminOrStaff" to="/painel-controle" class="admin-btn">
                        <font-awesome-icon :icon="faChartLine" />
                        <span>Painel Administrativo</span>
                    </RouterLink>

                    <button class="nav-item logout-btn" @click="logout">
                        <font-awesome-icon :icon="faSignOutAlt" class="nav-icon" />
                        <span>Sair da Conta</span>
                    </button>
                </div>
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
}

.profile-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.fade-in-content {
    animation: fadeInUp 0.5s ease-out;
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

.avatar-image-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    padding: 3px;
    background: white;
    box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
    overflow: hidden;
    border: 2px solid var(--c-azul);
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
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

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }

    100% {
        background-position: 200% 0;
    }
}

.skeleton-box {
    background: #e0e0e0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}

.avatar-skeleton {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin: 0 auto 1rem;
}

.title-skeleton {
    height: 24px;
    width: 60%;
    margin: 0 auto 0.5rem;
}

.text-skeleton {
    height: 16px;
    width: 40%;
    margin: 0 auto;
}

.nav-item-skeleton {
    height: 48px;
    width: 100%;
    border-radius: 12px;
    margin-bottom: 0.5rem;
}

.logout-skeleton {
    margin-top: 1rem;
}

.header-skeleton {
    height: 32px;
    width: 200px;
    margin-bottom: 2rem;
}

.form-grid-skeleton {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.input-skeleton {
    height: 50px;
    border-radius: 12px;
}

.input-skeleton.full {
    grid-column: 1 / -1;
}

.button-skeleton {
    height: 50px;
    width: 150px;
    border-radius: 12px;
}

.role-badge {
    display: inline-block;
    background-color: #e0f2fe;
    color: #0284c7;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.sidebar-footer {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.admin-btn {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.9rem 1rem;
    color: var(--c-text);
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;
    position: relative;
    overflow: hidden;
    border: 1px solid transparent;
}

.admin-btn:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: #1e293b;
    transition: left 0.4s ease-out;
    z-index: 0;
}

.admin-btn span,
.admin-btn svg {
    position: relative;
    z-index: 1;
}

.admin-btn:hover {
    transform: translateX(10px);
    color: white;
    box-shadow: 0 5px 15px rgba(30, 41, 59, 0.3);
}

.admin-btn:hover:before {
    left: 0;
}

.logout-btn {
    margin-top: 0;
    padding: 0.8rem 1rem;
    width: 100%;
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

    .form-grid-skeleton {
        grid-template-columns: 1fr;
    }
}

.hidden-input {
    display: none;
}

.avatar-wrapper {
    position: relative;
    width: 90px;
    height: 90px;
    margin: 0 auto 1rem;
}

.avatar-image-container {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    padding: 3px;
    background: white;
    box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
    overflow: hidden;
    border: 2px solid var(--c-azul);
    position: relative;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
}

.avatar-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--c-azul), var(--c-azul-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 4px 15px rgba(218, 96, 118, 0.4);
}

.avatar-icon.clickable {
    cursor: pointer;
    transition: transform 0.2s;
}

.avatar-icon.clickable:hover {
    transform: scale(1.05);
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 10;
}

.avatar-image-container:hover .avatar-overlay {
    opacity: 1;
}

.overlay-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.overlay-btn:hover {
    transform: scale(1.2);
    color: var(--c-rosa);
}

.overlay-divider {
    width: 1px;
    height: 16px;
    background-color: rgba(255, 255, 255, 0.5);
}

.image-viewer-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
}

.image-viewer-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: default;
}

.full-size-image {
    display: block;
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
}

.close-viewer-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-size: 1.5rem;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 10001;
}

.close-viewer-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
    opacity: 0;
}

.zoom-fade-enter-from .image-viewer-content {
    transform: scale(0.8);
}

.zoom-fade-leave-to .image-viewer-content {
    transform: scale(0.8);
}
</style>