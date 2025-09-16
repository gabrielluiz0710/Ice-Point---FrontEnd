<script setup lang="ts">
import { faSave } from '@fortawesome/free-solid-svg-icons'
</script>

<template>
    <div class="content-wrapper">
        <h1 class="content-title">Trocar Senha</h1>
        <p class="content-subtitle">
            Para sua segurança, escolha uma senha forte e não a compartilhe.
        </p>
        <form class="password-form" @submit.prevent>
            <div class="form-group">
                <label for="new-password">Nova Senha</label>
                <input id="new-password" type="password" placeholder="Digite sua nova senha..." />
            </div>
            <div class="form-group">
                <label for="confirm-password">Confirmar Nova Senha</label>
                <input id="confirm-password" type="password" placeholder="Confirme sua nova senha..." />
            </div>
            <button type="submit" class="save-btn">
                <font-awesome-icon :icon="faSave" /> Salvar Alterações
            </button>
        </form>
    </div>
</template>

<style scoped>
.content-wrapper {
    animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.content-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--c-azul);
    margin-bottom: 0.5rem;
}

.content-subtitle {
    font-size: 1rem;
    color: var(--c-text-light);
    margin-top: 0;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.password-form {
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 0 auto;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--c-text-dark);
}

.form-group input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Fredoka', sans-serif;
    transition: all 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--c-azul);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.save-btn {
    font-family: 'Fredoka', sans-serif;
    background-color: var(--c-azul);
    color: white;
    padding: 0.9rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
}

.save-btn:hover {
    background-color: var(--c-azul-dark);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(29, 78, 216, 0.3);
}
</style>