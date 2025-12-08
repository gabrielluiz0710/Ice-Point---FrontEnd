<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from 'vue';
import { faShoppingCart, faUser, faSignOutAlt, faIceCream, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '@/stores/user'
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cart'

const isSidebarOpen = ref(false);

const navigationHeaderRef = ref<HTMLElement | null>(null);
const sidebarToggleButtonRef = ref<HTMLElement | null>(null);
const lastScrollY = ref(0);
const isHeaderVisible = ref(true);
const isAlertVisible = ref(true);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleScroll = () => {
    if (isSidebarOpen.value) {
        isHeaderVisible.value = true;
        return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
        isHeaderVisible.value = true;
        return;
    }

    if (currentScrollY < lastScrollY.value) {
        isHeaderVisible.value = true;
    } else {
        isHeaderVisible.value = false;
    }

    lastScrollY.value = currentScrollY;
};

const closeSidebar = () => {
    isSidebarOpen.value = false;
    document.body.classList.remove('no-scroll');
};

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
    if (isSidebarOpen.value) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
};

const handleClickOutside = (event: MouseEvent) => {
    if (!isSidebarOpen.value) return;

    const target = event.target as Node;
    const isClickInsideMenu = navigationHeaderRef.value?.contains(target);
    const isClickOnToggleButton = sidebarToggleButtonRef.value?.contains(target);

    if (!isClickInsideMenu && !isClickOnToggleButton) {
        closeSidebar();
    }
};

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

const showPendingCartAlert = computed(() => {
    const hasItems = cartStore.totalCartQuantity > 0;

    const forbiddenRoutes = [
        'carrinho',
        'checkout',
        'OrderConfirmation',
        'login',
        'admin-dashboard',
        'admin-produtos',
        'admin-usuarios'
    ];

    const isForbiddenRoute = forbiddenRoutes.includes(route.name as string);

    return hasItems && !isForbiddenRoute && isAlertVisible.value;
});

const handleProfileClick = () => {
    if (userStore.isAuthenticated) {
        closeSidebar()
        router.push('/perfil')
    } else {
        closeSidebar()
        router.push('/login')
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    alertTimeout = setTimeout(() => {
        isAlertVisible.value = false;
    }, 5000);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);

    if (alertTimeout) clearTimeout(alertTimeout);
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <header class="header" :class="{ 'header--hidden': !isHeaderVisible }">
        <button ref="sidebarToggleButtonRef" @click="toggleSidebar" class="btn-icon-header hamburger-btn"
            :class="{ 'is-active': isSidebarOpen }" aria-label="Abrir menu">
            <div class="hamburger-box">
                <div class="hamburger-inner"></div>
            </div>
        </button>

        <div class="logo-container">
            <RouterLink to="/">
                <img src="/src/assets/images/logo_branca.png" alt="Ice Point Logo" class="logo-img" />
            </RouterLink>
        </div>

        <div class="header-right-content">
            <nav class="navigation-header-desktop">
                <RouterLink to="/sobre">Sobre Nós</RouterLink>
                <RouterLink to="/produtos">Produtos</RouterLink>
                <RouterLink to="/localizacao">Localização</RouterLink>
                <RouterLink to="/contatos">Contato</RouterLink>
                <RouterLink to="/carrinho" class="cart-link-desktop">
                    <div class="icon-wrapper">
                        <font-awesome-icon :icon="faShoppingCart" />
                        <span v-if="cartStore.totalCartQuantity > 0" class="cart-badge-dot"></span>
                    </div>
                    <span>Montar Carrinho</span>
                </RouterLink>
                <a href="#" @click.prevent="handleProfileClick">
                    <font-awesome-icon :icon="faUser" />
                    <span>{{ userStore.isAuthenticated ? userStore.firstName : 'Meu Perfil' }}</span>
                </a>

                <a href="#" v-if="userStore.isAuthenticated" @click.prevent="userStore.logout">
                    <font-awesome-icon :icon="faSignOutAlt" />
                    <span>Sair</span>
                </a>
            </nav>

            <div class="social-icons-desktop">
                <a href="https://wa.me/5534999658035" target="_blank" aria-label="WhatsApp">
                    <font-awesome-icon icon="fa-brands fa-whatsapp" size="lg" />
                </a>
                <a href="https://instagram.com/icepointuberaba" target="_blank" aria-label="Instagram">
                    <font-awesome-icon icon="fa-brands fa-instagram" size="lg" />
                </a>
            </div>
        </div>

        <nav ref="navigationHeaderRef" class="navigation-header-mobile" :class="{ 'active': isSidebarOpen }">
            <button @click="closeSidebar" class="btn-icon-header close-btn" aria-label="Fechar menu">
                <font-awesome-icon icon="fa-solid fa-times" />
            </button>
            <RouterLink to="/sobre" @click="closeSidebar">Sobre Nós</RouterLink>
            <RouterLink to="/produtos" @click="closeSidebar">Produtos</RouterLink>
            <RouterLink to="/localizacao" @click="closeSidebar">Localização</RouterLink>
            <RouterLink to="/contatos" @click="closeSidebar">Contato</RouterLink>

            <div class="mobile-actions">
                <RouterLink to="/carrinho" class="action-btn-mobile" @click="closeSidebar">
                    <div class="icon-wrapper-mobile"> <font-awesome-icon :icon="faShoppingCart" />
                        <span v-if="cartStore.totalCartQuantity > 0" class="cart-badge-dot-mobile"></span>
                    </div>
                    <span>Montar Carrinho</span>
                </RouterLink>
                <a href="#" class="action-btn-mobile" @click.prevent="handleProfileClick">
                    <font-awesome-icon :icon="faUser" />
                    <span>{{ userStore.isAuthenticated ? userStore.firstName : 'Meu Perfil' }}</span>
                </a>

                <a href="#" class="action-btn-mobile" v-if="userStore.isAuthenticated"
                    @click.prevent="userStore.logout">
                    <font-awesome-icon :icon="faSignOutAlt" />
                    <span>Sair</span>
                </a>
            </div>

            <div class="social-icons">
                <a href="https://wa.me/5534999658035" target="_blank" aria-label="WhatsApp">
                    <font-awesome-icon icon="fa-brands fa-whatsapp" size="lg" />
                </a>
                <a href="https://instagram.com/icepointuberaba" target="_blank" aria-label="Instagram">
                    <font-awesome-icon icon="fa-brands fa-instagram" size="lg" />
                </a>
            </div>
        </nav>
        <Transition name="slide-fade">
            <div v-if="showPendingCartAlert" class="pending-cart-bar" @click="router.push('/carrinho')">
                <div class="pending-content">
                    <div class="pending-icon">
                        <font-awesome-icon :icon="faIceCream" bounce />
                    </div>
                    <div class="pending-text">
                        <span class="highlight">{{ cartStore.totalCartQuantity }} itens</span> esperando no carrinho
                    </div>
                    <div class="pending-action">
                        <span>Ver</span>
                        <font-awesome-icon :icon="faArrowRight" />
                    </div>
                </div>
                <div class="loading-line"></div>
            </div>
        </Transition>
    </header>
</template>

<style scoped>
.header {
    font-family: 'Fredoka', sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5%;
    height: 70px;
    background-color: var(--c-rosa);
    color: var(--c-branco);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(100, 50, 50, 0.15);
}

.pending-cart-bar {
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background: linear-gradient(90deg, var(--c-azul-dark) 0%, var(--c-azul) 100%);
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 999;
}

.pending-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1rem;
    gap: 1rem;
    font-size: 0.95rem;
}

.pending-icon {
    color: var(--c-rosa-light);
    font-size: 1.1rem;
}

.pending-text {
    font-weight: 500;
}

.pending-text .highlight {
    font-weight: 700;
    color: var(--c-rosa-light);
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
}

.pending-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    transition: all 0.2s ease;
}

.pending-cart-bar:hover .pending-action {
    background: white;
    color: var(--c-azul);
}

.loading-line {
    height: 3px;
    background: linear-gradient(90deg, var(--c-rosa), var(--c-branco));
    width: 100%;
    animation: loading 2s infinite linear;
    transform-origin: 0% 50%;
}

@keyframes loading {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.slide-fade-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-100%);
    opacity: 0;
    z-index: -1;
}

.icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.cart-badge-dot {
    position: absolute;
    top: -5px;
    right: -8px;
    width: 10px;
    height: 10px;
    background-color: var(--c-azul);
    border: 2px solid var(--c-rosa);
    border-radius: 50%;
}

.icon-wrapper-mobile {
    position: relative;
    display: flex;
    align-items: center;
}

.cart-badge-dot-mobile {
    position: absolute;
    top: -2px;
    right: -4px;
    width: 8px;
    height: 8px;
    background-color: var(--c-azul);
    border-radius: 50%;
    border: 2px solid rgba(218, 96, 118, 0.9);
}

.logo-container {
    flex-shrink: 0;
}

.logo-img {
    width: 140px;
    height: auto;
    transition: transform 0.3s ease;
    display: block;
}

.logo-img:hover {
    transform: scale(1.1);
}

.header-right-content {
    display: flex;
    align-items: center;
    gap: 2.5rem;
}

.navigation-header-desktop {
    display: flex;
    align-items: center;
    gap: 2.5rem;
}

.navigation-header-desktop a span {
    font-weight: 500;
}


.navigation-header-desktop a,
.social-icons-desktop a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--c-branco);
    font-weight: 500;
    font-size: 1.1rem;
    position: relative;
    transition: transform 0.3s ease-out;
    padding-bottom: 5px;
}

.navigation-header-desktop a::after,
.social-icons-desktop a::after {
    content: '';
    position: absolute;
    width: 0%;
    height: 3px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--c-azul);
    border-radius: 2px;
    transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.navigation-header-desktop a:hover,
.social-icons-desktop a:hover {
    transform: translateY(-2px);
}

.navigation-header-desktop a:hover::after,
.social-icons-desktop a:hover::after {
    width: 100%;
}

.social-icons-desktop a {
    font-size: 1.4rem;
}

.social-icons-desktop {
    display: flex;
    gap: 1rem;
}

.social-icons-desktop a {
    color: var(--c-branco);
    font-size: 1.4rem;
    transition: all 0.3s ease;
    display: inline-block;
}

.social-icons-desktop a:hover {
    transform: scale(1.2) translateY(-2px);
    color: var(--c-azul-light);
}

.btn-icon-header,
.navigation-header-mobile {
    display: none;
}

@media (max-width: 1280px) and (min-width: 993px) {

    .navigation-header-desktop a[href="/carrinho"] span,
    .navigation-header-desktop a[href="/perfil"] span {
        display: none;
    }

    .navigation-header-desktop a[href="/carrinho"],
    .navigation-header-desktop a[href="/perfil"] {
        font-size: 1.4rem;
    }
}


@media (max-width: 992px) {
    .btn-icon-header {
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        z-index: 1002;
    }

    .hamburger-box {
        width: 28px;
        height: 24px;
        position: relative;
    }

    .hamburger-inner {
        display: block;
        top: 50%;
        transform: translateY(-50%);
    }

    .hamburger-inner,
    .hamburger-inner::before,
    .hamburger-inner::after {
        width: 100%;
        height: 3px;
        background-color: var(--c-branco);
        border-radius: 4px;
        position: absolute;
        transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }

    .hamburger-inner::before,
    .hamburger-inner::after {
        content: "";
        display: block;
    }

    .hamburger-inner::before {
        top: -10px;
    }

    .hamburger-inner::after {
        bottom: -10px;
    }

    .hamburger-btn.is-active .hamburger-inner {
        transform: translateY(-50%) rotate(45deg);
    }

    .hamburger-btn.is-active .hamburger-inner::before {
        transform: rotate(0) translateY(10px);
        opacity: 0;
    }

    .hamburger-btn.is-active .hamburger-inner::after {
        transform: translateY(-10px) rotate(-90deg);
    }

    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        color: var(--c-branco);
        font-size: 2rem;
        transition: transform 0.3s ease;
    }

    .close-btn:hover {
        transform: rotate(90deg);
    }

    .header {
        position: fixed;
        top: 0;
        width: 100%;
        transition: transform 0.3s ease-in-out;
    }

    .header--hidden {
        transform: translateY(-100%);
    }

    .header-right-content {
        display: none;
    }

    .hamburger-btn {
        display: block;
        position: absolute;
        left: 5%;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1002;
    }

    .logo-container {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .navigation-header-mobile {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 75%;
        max-width: 320px;
        height: 100dvh;
        flex-direction: column;
        align-items: flex-start;
        padding: 8rem 2rem 2rem 2rem;
        background-color: rgba(218, 96, 118, 0.9);
        backdrop-filter: blur(10px);
        transform: translateX(-100%);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        justify-content: flex-start;
        gap: 1.5rem;
        overflow-y: auto;
    }

    .navigation-header-mobile.active {
        transform: translateX(0);
    }

    .navigation-header-mobile a:not(.action-btn-mobile) {
        font-size: 1.5rem;
        color: var(--c-branco);
        text-decoration: none;
    }

    .close-btn {
        display: block;
        position: absolute;
        top: 20px;
        right: 20px;
    }

    .close-btn:hover {
        transform: scale(1.2) rotate(180deg);
    }

    .mobile-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding-top: 1.5rem;
        margin-top: 1rem;
        width: 100%;
    }

    .action-btn-mobile {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: var(--c-branco);
        text-decoration: none;
        font-size: 1.2rem;
        padding: 0.5rem 0;
    }

    .social-icons {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        width: 100%;
        display: flex;
        gap: 2rem;
    }

    .social-icons a {
        color: var(--c-branco);
        transition: all 0.3s ease;
        font-size: 1.5rem;
    }

    @keyframes swing-in {
        from {
            transform: rotateY(90deg) translateX(50px);
            opacity: 0;
        }

        to {
            transform: rotateY(0) translateX(0);
            opacity: 1;
        }
    }

    .navigation-header-mobile.active>* {
        animation: swing-in 0.5s backwards;
    }

    .navigation-header-mobile.active a:nth-of-type(1) {
        animation-delay: 0.1s;
    }

    .navigation-header-mobile.active a:nth-of-type(2) {
        animation-delay: 0.2s;
    }

    .navigation-header-mobile.active a:nth-of-type(3) {
        animation-delay: 0.3s;
    }

    .navigation-header-mobile.active a:nth-of-type(4) {
        animation-delay: 0.4s;
    }

    .navigation-header-mobile.active .mobile-actions {
        animation-delay: 0.5s;
    }
}

.no-scroll {
    overflow: hidden;
}
</style>