<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';

const isSidebarOpen = ref(false);

const navigationHeaderRef = ref<HTMLElement | null>(null);
const sidebarToggleButtonRef = ref<HTMLElement | null>(null);

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

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <header class="header">
        <button ref="sidebarToggleButtonRef" @click="toggleSidebar" class="btn-icon-header" aria-label="Abrir menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
            </svg>
        </button>

        <div class="logo-container">
            <RouterLink to="/">
                <img src="/src/assets/images/logo_branca.png" alt="Ice Point Logo" class="logo-img" />
            </RouterLink>
        </div>

        <nav ref="navigationHeaderRef" class="navigation-header" :class="{ 'active': isSidebarOpen }">
            <button @click="closeSidebar" class="btn-icon-header close-btn" aria-label="Fechar menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg>
            </button>

            <RouterLink to="/sobre" @click="closeSidebar">Sobre Nós</RouterLink>
            <RouterLink to="/produtos" @click="closeSidebar">Produtos</RouterLink>
            <RouterLink to="/localizacao" @click="closeSidebar">Localização</RouterLink>
            <RouterLink to="/contatos" @click="closeSidebar">Contato</RouterLink>

            <div class="social-icons">
                <a href="#" target="_blank" aria-label="WhatsApp">
                    <font-awesome-icon icon="fa-brands fa-whatsapp" size="lg" />
                </a>
                <a href="#" target="_blank" aria-label="Instagram">
                    <font-awesome-icon icon="fa-brands fa-instagram" size="lg" />
                </a>
                <a href="#" target="_blank" aria-label="Facebook">
                    <font-awesome-icon icon="fa-brands fa-facebook" size="lg" />
                </a>
            </div>
        </nav>
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

.logo-img {
    width: 140px;
    height: auto;
    transition: transform 0.3s ease;
}

.logo-img:hover {
    transform: scale(1.1);
}

.navigation-header {
    display: flex;
    align-items: center;
    gap: 2.5rem;
}

.navigation-header a {
    text-decoration: none;
    color: var(--c-branco);
    font-weight: 500;
    font-size: 1.1rem;
    position: relative;
    transition: transform 0.3s ease-out;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}

.navigation-header a::after {
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

.navigation-header a:hover {
    color: var(--c-branco);
    transform: translateY(-2px);
}

.navigation-header a:hover::after {
    width: 100%;
}

.btn-icon-header {
    background: transparent;
    border: none;
    color: var(--c-branco);
    cursor: pointer;
    display: none;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.btn-icon-header:hover {
    transform: scale(1.1);
}

.close-btn:hover {
    transform: scale(1.2) rotate(180deg);
}

.social-icons {
    display: flex;
    gap: 1.5rem;
    margin-left: 2rem;
}

.social-icons a {
    color: var(--c-branco);
    transition: all 0.3s ease;
}

.social-icons a:hover {
    color: var(--c-branco);
    transform: scale(1.3) translateY(-3px);
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
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

@media (max-width: 992px) {
    .btn-icon-header {
        display: block;
        z-index: 1002;
    }

    .logo-container {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .navigation-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 75%;
        max-width: 320px;
        height: 100vh;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 1.5rem;
        padding: 2rem;
        background-color: rgba(218, 96, 118, 0.9);
        backdrop-filter: blur(10px);
        transform: translateX(-100%);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

    .navigation-header.active {
        transform: translateX(0);
    }

    .navigation-header.active a {
        animation: swing-in 0.5s backwards;
    }

    .navigation-header.active a:nth-child(2) {
        animation-delay: 0.1s;
    }

    .navigation-header.active a:nth-child(3) {
        animation-delay: 0.2s;
    }

    .navigation-header.active a:nth-child(4) {
        animation-delay: 0.3s;
    }

    .navigation-header.active a:nth-child(5) {
        animation-delay: 0.4s;
    }

    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
    }

    .social-icons {
        margin-top: 2rem;
        margin-left: 0;
    }
}

.no-scroll {
    overflow: hidden;
}
</style>