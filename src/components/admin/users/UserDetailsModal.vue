<script setup lang="ts">
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faTimes,
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faIdCard,
    faBirthdayCake,
    faSpinner
} from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
    show: boolean
    user: any | null
}>()

const emit = defineEmits(['close'])
const userStore = useUserStore()
const API_URL = import.meta.env.VITE_API_URL

const addresses = ref<any[]>([])
const isLoadingAddresses = ref(false)

const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T12:00:00')
    return date.toLocaleDateString('pt-BR')
}

watch(() => [props.show, props.user], async ([isShow, newUser]) => {
    if (isShow && newUser) {
        await fetchAddresses(newUser.id)
    } else {
        addresses.value = []
    }
})

const fetchAddresses = async (userId: string) => {
    isLoadingAddresses.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        if (!session) return

        const response = await fetch(`${API_URL}/enderecos/user/${userId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        })

        if (response.ok) {
            addresses.value = await response.json()
        } else {
            console.error('Erro ao buscar endereços')
        }
    } catch (error) {
        console.error('Erro de conexão:', error)
    } finally {
        isLoadingAddresses.value = false
    }
}
</script>

<template>
    <transition name="modal-fade">
        <div v-if="show && user" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container custom-scrollbar">

                <div class="profile-header">
                    <button class="close-btn-abs" @click="$emit('close')">
                        <font-awesome-icon :icon="faTimes" />
                    </button>

                    <div class="avatar-wrapper">
                        <img v-if="user.avatar_url" :src="user.avatar_url" alt="Foto perfil" class="avatar-img">
                        <div v-else class="avatar-placeholder">
                            {{ user.nome ? user.nome.charAt(0).toUpperCase() : 'U' }}
                        </div>
                    </div>

                    <div class="header-info">
                        <h2>{{ user.nome }}</h2>
                        <span class="role-badge">{{ user.tipo }}</span>
                    </div>
                </div>

                <div class="modal-body">
                    <section class="info-section">
                        <h4>Dados Pessoais</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <font-awesome-icon :icon="faEnvelope" class="icon" />
                                <div>
                                    <label>Email</label>
                                    <p>{{ user.email }}</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <font-awesome-icon :icon="faPhone" class="icon" />
                                <div>
                                    <label>Telefone</label>
                                    <p>{{ user.telefone || '-' }}</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <font-awesome-icon :icon="faIdCard" class="icon" />
                                <div>
                                    <label>CPF</label>
                                    <p>{{ user.cpf || '-' }}</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <font-awesome-icon :icon="faBirthdayCake" class="icon" />
                                <div>
                                    <label>Nascimento</label>
                                    <p>{{ formatDate(user.data_nascimento) }}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div class="divider"></div>

                    <section class="info-section">
                        <h4>Endereços Cadastrados</h4>

                        <div v-if="isLoadingAddresses" class="loading-state">
                            <font-awesome-icon :icon="faSpinner" spin />
                            <span>Carregando endereços...</span>
                        </div>

                        <div v-else-if="addresses.length > 0" class="address-list">
                            <div v-for="addr in addresses" :key="addr.id" class="address-card"
                                :class="{ principal: addr.principal }">
                                <div class="addr-icon">
                                    <font-awesome-icon :icon="faMapMarkerAlt" />
                                </div>
                                <div class="addr-details">
                                    <p class="street">{{ addr.logradouro }}, {{ addr.numero }}</p>
                                    <p class="complement" v-if="addr.complemento">{{ addr.complemento }}</p>
                                    <p class="city">{{ addr.bairro }} - {{ addr.cidade }}/{{ addr.estado }}</p>
                                    <p class="zip">{{ addr.cep }}</p>
                                </div>
                                <div v-if="addr.principal" class="tag-main">Principal</div>
                            </div>
                        </div>

                        <p v-else class="empty-text">Nenhum endereço cadastrado para este usuário.</p>
                    </section>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 60;
}

.modal-container {
    background: white;
    width: 100%;
    max-width: 500px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.profile-header {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    padding: 3rem 2rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    position: relative;
}

.close-btn-abs {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn-abs:hover {
    background: rgba(255, 255, 255, 0.4);
}

.avatar-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background: white;
    margin-bottom: 1rem;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary);
    background: #f0f9ff;
}

.header-info {
    text-align: center;
}

.header-info h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.role-badge {
    display: inline-block;
    margin-top: 5px;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
}

.modal-body {
    padding: 2rem;
    overflow-y: auto;
}

.info-section h4 {
    color: var(--text-main);
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    border-left: 4px solid var(--primary);
    padding-left: 10px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.info-item {
    display: flex;
    gap: 10px;
}

.info-item .icon {
    color: var(--text-muted);
    margin-top: 3px;
    width: 16px;
}

.info-item label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 2px;
}

.info-item p {
    margin: 0;
    color: var(--text-main);
    font-weight: 500;
    font-size: 0.95rem;
    word-break: break-word;
}

.divider {
    height: 1px;
    background: #f0f0f0;
    margin: 2rem 0;
}

.address-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.address-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    gap: 1rem;
    position: relative;
    transition: all 0.2s;
}

.address-card.principal {
    border-color: var(--primary);
    background: #fff0f5;
}

.addr-icon {
    color: var(--primary);
    font-size: 1.2rem;
    margin-top: 2px;
}

.addr-details p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-main);
    line-height: 1.4;
}

.addr-details .city,
.addr-details .zip {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-top: 2px;
}

.tag-main {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--primary);
    color: white;
    font-size: 0.65rem;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
}

.loading-state {
    text-align: center;
    color: var(--text-muted);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
}

.empty-text {
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

@media(max-width: 500px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    .modal-container {
        border-radius: 0;
        height: 100%;
        max-height: 100%;
    }
}
</style>