<script setup lang="ts">
import { ref, reactive, watchEffect, computed } from 'vue'
import EditModal from '@/components/profile/EditModal.vue'
import { useUserStore } from '@/stores/user'
import { faPenToSquare, faCheckCircle, faExclamationTriangle, faPlus, faStar, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import axios from 'axios'
import { supabase } from '@/service/supabase'

const userData = reactive({
    fullName: '',
    phone: '',
    email: '',
    cpf: '',
    birthDate: '',
    addresses: [] as any[]
})

const userStore = useUserStore()
const isLoading = ref(false)
const showAllAddresses = ref(false)
const isModalOpen = ref(false)
const editingAddressId = ref<number | null>(null)
const modalConfig = ref({
    title: '',
    fields: [] as any[],
    type: ''
})

const toast = reactive({
    visible: false,
    message: '',
})

const visibleAddresses = computed(() => {
    if (showAllAddresses.value) return userData.addresses;
    const sorted = [...userData.addresses].sort((a, b) => (b.principal === true ? 1 : 0) - (a.principal === true ? 1 : 0));
    return sorted.slice(0, 2);
})

function showSuccessToast(message: string) {
    toast.message = message
    toast.visible = true
    setTimeout(() => { toast.visible = false }, 3000)
}

function formatCPF(cpf: string) {
    if (!cpf) return ''
    const v = cpf.replace(/\D/g, '')
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatPhone(phone: string) {
    if (!phone) return ''
    const v = phone.replace(/\D/g, '')
    if (v.length === 11) {
        return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (v.length === 10) {
        return v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
}

function formatCEP(cep: string) {
    if (!cep) return ''
    const v = cep.replace(/\D/g, '')
    if (v.length === 8) {
        return v.replace(/^(\d{5})(\d{3})/, '$1-$2')
    }
    return cep
}

function openModal(type: 'phone' | 'cpf' | 'birthDate' | 'address', addressData?: any) {
    modalConfig.value.type = type;
    editingAddressId.value = null;

    if (type === 'phone') {
        modalConfig.value = { type, title: 'Alterar Celular', fields: [{ name: 'phone', label: 'Novo Celular', value: userData.phone, type: 'tel', width: 'full' }] }
    }
    else if (type === 'cpf') {
        modalConfig.value = { type, title: 'Alterar CPF', fields: [{ name: 'cpf', label: 'CPF', value: userData.cpf, width: 'full' }] }
    }
    else if (type === 'birthDate') {
        let val = '';
        if (userStore.user?.birthDate) val = new Date(userStore.user.birthDate).toISOString().split('T')[0];
        modalConfig.value = { type, title: 'Data de Nascimento', fields: [{ name: 'birthDate', label: 'Data', value: val, type: 'date', width: 'full' }] }
    }
    else if (type === 'address') {
        if (addressData) {
            editingAddressId.value = addressData.id;
            modalConfig.value.title = 'Editar Endereço';
        } else {
            modalConfig.value.title = 'Novo Endereço';
        }

        modalConfig.value.fields = [
            { name: 'zip', label: 'CEP', value: addressData?.zip || '', width: 'half' },
            { name: 'street', label: 'Rua', value: addressData?.street || '', readonly: true, width: 'full' },
            { name: 'number', label: 'Número', value: addressData?.number || '', width: 'half' },
            { name: 'complement', label: 'Complemento', value: addressData?.complement || '', width: 'full' },
            { name: 'neighborhood', label: 'Bairro', value: addressData?.neighborhood || '', readonly: true, width: 'half' },
            { name: 'city', label: 'Cidade', value: addressData?.city || '', readonly: true, width: 'half' },
            { name: 'state', label: 'Estado', value: addressData?.state || '', readonly: true, width: 'half' },
        ]
    }

    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
}

async function setPrincipal(addressId: number) {
    isLoading.value = true
    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        await axios.patch(`${import.meta.env.VITE_API_URL}/enderecos/${addressId}/principal`, {}, {
            headers: { Authorization: `Bearer ${session?.access_token}` }
        })
        await userStore.fetchUserProfile(userStore.user!.id)
        showSuccessToast('Endereço principal atualizado!')
    } catch (e) { console.error(e) }
    finally { isLoading.value = false }
}

async function handleSaveData(newData: Record<string, string>) {
    isLoading.value = true;
    try {
        const type = modalConfig.value.type;
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (['phone', 'cpf', 'birthDate'].includes(type)) {
            await userStore.updateProfile(newData)
        }

        else if (type === 'address') {
            let isCurrentlyPrincipal = false;
            if (editingAddressId.value) {
                const currentAddr = userData.addresses.find(a => a.id === editingAddressId.value);
                if (currentAddr) isCurrentlyPrincipal = currentAddr.principal;
            }

            const payload = {
                cep: newData.zip,
                logradouro: newData.street,
                numero: newData.number,
                complemento: newData.complement,
                bairro: newData.neighborhood,
                cidade: newData.city,
                estado: newData.state,
                principal: editingAddressId.value
                    ? isCurrentlyPrincipal
                    : userData.addresses.length === 0
            }

            if (editingAddressId.value) {
                await axios.put(`${import.meta.env.VITE_API_URL}/enderecos/${editingAddressId.value}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/enderecos`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            await userStore.fetchUserProfile(userStore.user!.id)
        }

        showSuccessToast('Dados atualizados com sucesso!');
        closeModal();
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false;
    }
}

watchEffect(() => {
    if (userStore.user) {
        userData.fullName = userStore.user.nome
        userData.email = userStore.user.email
        userData.phone = userStore.user.phone || ''
        userData.cpf = userStore.user.cpf || ''

        if (userStore.user.birthDate) {
            const date = new Date(userStore.user.birthDate);
            userData.birthDate = date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } else {
            userData.birthDate = ''
        }

        userData.addresses = userStore.user.addresses || [];
    }
})
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
                <label>Email</label>
                <p>{{ userData.email }}</p>
                <span class="readonly-tag">Não editável</span>
            </div>
            <div class="data-field">
                <label>CPF</label>
                <p v-if="userData.cpf">{{ formatCPF(userData.cpf) }}</p>
                <div v-else class="alert-box">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                    <span>Não cadastrado</span>
                </div>
                <button class="edit-btn" @click="openModal('cpf')">
                    <font-awesome-icon :icon="faPenToSquare" /> {{ userData.cpf ? 'Alterar' : 'Cadastrar' }}
                </button>
            </div>

            <div class="data-field">
                <label>Celular</label>
                <p v-if="userData.phone">{{ formatPhone(userData.phone) }}</p>
                <div v-else class="alert-box">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                    <span>Necessário cadastrar</span>
                </div>
                <button class="edit-btn" @click="openModal('phone')">
                    <font-awesome-icon :icon="faPenToSquare" /> {{ userData.phone ? 'Alterar' : 'Cadastrar' }}
                </button>
            </div>
            <div class="data-field">
                <label>Data de Nascimento</label>
                <p v-if="userData.birthDate">{{ userData.birthDate }}</p>
                <div v-else class="alert-box">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                    <span>Não informado</span>
                </div>
                <button class="edit-btn" @click="openModal('birthDate')">
                    <font-awesome-icon :icon="faPenToSquare" /> {{ userData.birthDate ? 'Alterar' : 'Incluir' }}
                </button>
            </div>
            <div class="data-field address-section">
                <div class="address-header">
                    <label>Meus Endereços</label>
                    <button class="add-address-btn" @click="openModal('address')">
                        <font-awesome-icon :icon="faPlus" /> Novo
                    </button>
                </div>

                <div v-if="userData.addresses.length === 0" class="alert-box warning-bg">
                    <font-awesome-icon :icon="faExclamationTriangle" />
                    <span>Cadastre um endereço para entrega.</span>
                </div>

                <div class="address-list">
                    <div v-for="addr in visibleAddresses" :key="addr.id" class="address-card"
                        :class="{ 'is-principal': addr.principal }">
                        <div class="address-info">
                            <p class="street">{{ addr.street }}, {{ addr.number }}</p>
                            <p class="details">{{ addr.neighborhood }} - {{ addr.city }}/{{ addr.state }}</p>
                            <p class="cep">CEP: {{ formatCEP(addr.zip) }} <span v-if="addr.complement">({{
                                addr.complement }})</span></p>
                        </div>

                        <div class="address-actions">
                            <button v-if="!addr.principal" class="action-btn star-btn" @click="setPrincipal(addr.id)"
                                title="Tornar Principal">
                                <font-awesome-icon :icon="faStarRegular" />
                            </button>
                            <div v-else class="principal-badge">
                                <font-awesome-icon :icon="faStar" /> Principal
                            </div>

                            <button class="action-btn edit-icon-btn" @click="openModal('address', addr)">
                                <font-awesome-icon :icon="faPenToSquare" />
                            </button>
                        </div>
                    </div>
                </div>

                <button v-if="userData.addresses.length > 2" class="show-more-btn"
                    @click="showAllAddresses = !showAllAddresses">
                    <font-awesome-icon :icon="showAllAddresses ? faChevronUp : faChevronDown" />
                    {{ showAllAddresses ? 'Mostrar menos' : `Ver todos (${userData.addresses.length})` }}
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

.alert-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #eab308;
    font-weight: 600;
    margin-top: 0.5rem;
}

.warning-bg {
    background-color: #fefce8;
    padding: 1rem;
    border-radius: 8px;
    border: 1px dashed #eab308;
    color: #854d0e;
}

.address-section {
    grid-column: 1 / -1;
    /* Ocupa largura total */
}

.address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.add-address-btn {
    background-color: var(--c-azul);
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Fredoka', sans-serif;
    font-size: 0.9rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.address-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.address-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    transition: all 0.2s;
}

.address-card.is-principal {
    border-color: var(--c-rosa);
    background-color: #fff0f3;
}

.street {
    font-weight: 600;
    color: var(--c-text-dark);
    margin: 0;
}

.details,
.cep {
    font-size: 0.9rem;
    color: var(--c-text-light);
    margin: 2px 0 0 0;
}

.address-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 4px;
    color: var(--c-text-light);
    transition: color 0.2s;
}

.action-btn:hover {
    color: var(--c-azul);
    background-color: #f0f9ff;
}

.star-btn:hover {
    color: #fbbf24;
}

.principal-badge {
    color: var(--c-rosa);
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-right: 0.5rem;
}

.show-more-btn {
    width: 100%;
    margin-top: 1rem;
    padding: 0.5rem;
    background: none;
    border: 1px dashed #cbd5e1;
    color: var(--c-text-light);
    cursor: pointer;
    border-radius: 6px;
    font-family: 'Fredoka', sans-serif;
}

.readonly-tag {
    font-size: 0.75rem;
    background-color: #f3f4f6;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: #9ca3af;
    position: absolute;
    top: 1rem;
    right: 1rem;
}
</style>