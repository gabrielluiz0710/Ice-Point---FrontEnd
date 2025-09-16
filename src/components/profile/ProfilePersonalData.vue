<script setup lang="ts">
import { ref, reactive } from 'vue'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import EditModal from '@/components/profile/EditModal.vue'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

const userData = reactive({
    fullName: 'Ana Maria Silva',
    phone: '(34) 99999-8888',
    email: 'ana.silva@email.com',
    cpf: '123.456.789-00',
    birthDate: '15/08/1990',
    address: {
        zip: '38400-000',
        street: 'Av. Afonso Pena',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'Uberlândia',
        state: 'MG',
    },
})

const isModalOpen = ref(false)
const isLoading = ref(false)
const modalConfig = ref({
    title: '',
    fields: [] as any[],
    type: ''
})

const toast = reactive({
    visible: false,
    message: '',
})

function showSuccessToast(message: string) {
    toast.message = message
    toast.visible = true
    setTimeout(() => {
        toast.visible = false
    }, 3000)
}

function openModal(type: 'email' | 'phone' | 'address') {
    modalConfig.value.type = type;

    if (type === 'email') {
        modalConfig.value = {
            type,
            title: 'Alterar Email',
            fields: [
                { name: 'email', label: 'Novo Email', value: userData.email, type: 'email', width: 'full' }
            ]
        }
    } else if (type === 'phone') {
        modalConfig.value = {
            type,
            title: 'Alterar Celular',
            fields: [
                { name: 'phone', label: 'Novo Celular', value: userData.phone, type: 'tel', width: 'full' }
            ]
        }
    } else if (type === 'address') {
        modalConfig.value = {
            type,
            title: 'Alterar Endereço',
            fields: [
                { name: 'zip', label: 'CEP', value: userData.address.zip, width: 'half' },
                { name: 'street', label: 'Rua', value: userData.address.street, readonly: true, width: 'full' },
                { name: 'number', label: 'Número', value: userData.address.number, width: 'half' },
                { name: 'complement', label: 'Complemento (Opcional)', value: userData.address.complement, width: 'full' },
                { name: 'neighborhood', label: 'Bairro', value: userData.address.neighborhood, readonly: true, width: 'half' },
                { name: 'city', label: 'Cidade', value: userData.address.city, readonly: true, width: 'half' },
                { name: 'state', label: 'Estado', value: userData.address.state, readonly: true, width: 'half' },
            ]
        }
    }

    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
}

function handleSaveData(newData: Record<string, string>) {
    isLoading.value = true;

    setTimeout(() => {
        const type = modalConfig.value.type;

        if (type === 'email' || type === 'phone') {
            Object.assign(userData, newData);
        } else if (type === 'address') {
            Object.assign(userData.address, newData);
        }

        isLoading.value = false;
        closeModal();

        showSuccessToast('Dados atualizados com sucesso!');

    }, 1500);
}
</script>

<template>
    <div class="content-wrapper">
        <Transition name="toast-fade">
            <div v-if="toast.visible" class="success-toast">
                <font-awesome-icon :icon="faCheckCircle" class="toast-icon" />
                <span>{{ toast.message }}</span>
            </div>
        </Transition>
        <h1 class="content-title">Dados Pessoais</h1>
        <p class="content-subtitle">
            Gerencie suas informações pessoais e de contato.
        </p>

        <div class="data-grid">
            <div class="data-field">
                <label>Nome Completo</label>
                <p>{{ userData.fullName }}</p>
            </div>
            <div class="data-field">
                <label>CPF</label>
                <p>{{ userData.cpf }}</p>
            </div>
            <div class="data-field">
                <label>Email</label>
                <p>{{ userData.email }}</p>
                <button class="edit-btn" @click="openModal('email')">
                    <font-awesome-icon :icon="faPenToSquare" /> Alterar
                </button>
            </div>
            <div class="data-field">
                <label>Celular</label>
                <p>{{ userData.phone }}</p>
                <button class="edit-btn" @click="openModal('phone')">
                    <font-awesome-icon :icon="faPenToSquare" /> Alterar
                </button>
            </div>
            <div class="data-field">
                <label>Data de Nascimento</label>
                <p>{{ userData.birthDate }}</p>
            </div>
            <div class="data-field address-field">
                <label>Endereço Principal</label>
                <p>
                    {{ userData.address.street }}, {{ userData.address.number }}<span
                        v-if="userData.address.complement"> - {{ userData.address.complement }}</span>
                </p>
                <p>
                    {{ userData.address.neighborhood }} - {{ userData.address.city }}/{{ userData.address.state }}
                </p>
                <p>CEP: {{ userData.address.zip }}</p>
                <button class="edit-btn" @click="openModal('address')">
                    <font-awesome-icon :icon="faPenToSquare" /> Alterar ou Cadastrar
                </button>
            </div>
        </div>
    </div>
    <EditModal :is-open="isModalOpen" :is-loading="isLoading" :title="modalConfig.title" :fields="modalConfig.fields"
        @close="closeModal" @save="handleSaveData" />
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

.data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.data-field {
    position: relative;
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.data-field label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--c-text-light);
    margin-bottom: 0.5rem;
}

.data-field p {
    margin: 0;
    font-size: 1rem;
    color: var(--c-text-dark);
}

.address-field {
    grid-column: 1 / -1;
}

.edit-btn {
    font-family: 'Fredoka', sans-serif;
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--c-azul);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.edit-btn:hover {
    background-color: #eafcfa;
}

.success-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: #10B981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: 'Fredoka', sans-serif;
    font-weight: 500;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 9999;
}

.toast-icon {
    font-size: 1.5rem;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>