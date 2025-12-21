<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import {
    faChevronLeft,
    faChevronRight,
    faCalendarDay,
    faMapMarkerAlt,
    faIceCream,
    faUser,
    faMoneyBillWave,
    faClock,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router'

interface Encomenda {
    id: number;
    nomeCliente: string;
    dataAgendada: string;
    horaAgendada: string;
    valorTotal: number;
    enderecoLogradouro: string;
    enderecoNumero: string;
    enderecoBairro: string;
    itens: any[];
}

interface DiaCalendario {
    dataIso: string;
    diaSemana: string;
    diaMes: string;
    isHoje: boolean;
    encomendas: Encomenda[];
}

const userStore = useUserStore();
const startDate = ref(new Date());
const encomendas = ref<Encomenda[]>([]);
const loading = ref(false);
const weekOffset = ref(0);
const errorMessage = ref('');
const expandedDays = ref<string[]>([]);
const router = useRouter()
const formatDateIso = (date: Date) => date.toISOString().split('T')[0];

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const weekDays = computed<DiaCalendario[]>(() => {
    const days: DiaCalendario[] = [];
    const start = new Date(startDate.value);

    for (let i = 0; i < 7; i++) {
        const current = new Date(start);
        current.setDate(start.getDate() + i);

        const iso = formatDateIso(current);
        const hojeIso = formatDateIso(new Date());

        const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(current);
        const diaMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(current);

        const dayOrders = encomendas.value.filter(e => e.dataAgendada === iso);

        days.push({
            dataIso: iso,
            diaSemana: diaSemana.replace('.', ''),
            diaMes: diaMes,
            isHoje: iso === hojeIso,
            encomendas: dayOrders.sort((a, b) => a.horaAgendada.localeCompare(b.horaAgendada))
        });
    }
    return days;
});

const periodoDisplay = computed(() => {
    if (weekDays.value.length === 0) return '';
    const first = weekDays.value[0];
    const last = weekDays.value[6];
    return `${first.diaMes} - ${last.diaMes}`;
});

const toggleDay = (isoDate: string) => {
    if (expandedDays.value.includes(isoDate)) {
        expandedDays.value = expandedDays.value.filter(d => d !== isoDate);
    } else {
        expandedDays.value.push(isoDate)
    }
};
const fetchEncomendas = async () => {
    loading.value = true;
    errorMessage.value = '';
    encomendas.value = [];

    try {
        const { data: { session } } = await userStore.supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const isoDate = formatDateIso(startDate.value);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/encomendas/ativas?startDate=${isoDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Não foi possível carregar a agenda.');
        }

        const data = await response.json();
        encomendas.value = data.data || [];
    } catch (error: any) {
        console.error(error);
        errorMessage.value = error.message || 'Erro de conexão com o servidor.';
    } finally {
        loading.value = false;
    }
};

const changeWeek = (offset: number) => {
    const newDate = new Date(startDate.value);
    newDate.setDate(newDate.getDate() + (offset * 7));
    startDate.value = newDate;
    weekOffset.value += offset;
};

const resetToToday = () => {
    startDate.value = new Date();
    weekOffset.value = 0;
};

const getTotalItems = (itens: any[]) => {
    return itens.reduce((acc, item) => acc + Number(item.quantidade), 0);
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
};

watch(startDate, () => {
    fetchEncomendas();
});

watch(weekDays, (days) => {
    const today = days.find(d => d.isHoje);
    if (today && expandedDays.value.length === 0) {
        expandedDays.value.push(today.dataIso)
    }
}, { immediate: true });

const isMobile = ref(window.innerWidth <= 768);

const checkScreenSize = () => {
    isMobile.value = window.innerWidth <= 768;
};

const goToDetails = (orderId: number) => {
    router.push({
        name: 'admin-encomenda-detalhe',
        params: { id: orderId }
    })
}

onMounted(() => {
    window.scrollTo(0, 0);
    fetchEncomendas();
    window.addEventListener('resize', checkScreenSize);
});
</script>

<template>
    <div class="calendar-container">
        <div class="calendar-header">
            <div class="header-left">
                <h2 class="title">Agenda Semanal</h2>
                <span class="period-badge">{{ periodoDisplay }}</span>
            </div>

            <div class="header-controls">
                <button @click="$router.push({ name: 'admin-criar-encomenda' })" class="btn-new-order">
                    + Novo Pedido
                </button>
                <button class="btn-today" @click="resetToToday" :disabled="weekOffset === 0">
                    <font-awesome-icon :icon="faCalendarDay" /> Hoje
                </button>
                <div class="nav-buttons">
                    <button class="btn-nav" @click="changeWeek(-1)">
                        <font-awesome-icon :icon="faChevronLeft" />
                    </button>
                    <button class="btn-nav" @click="changeWeek(1)">
                        <font-awesome-icon :icon="faChevronRight" />
                    </button>
                </div>
            </div>
        </div>

        <div v-if="errorMessage" class="error-banner">
            <span>⚠️ {{ errorMessage }}</span>
            <button @click="fetchEncomendas" class="btn-retry">Tentar novamente</button>
        </div>

        <div class="calendar-grid custom-scrollbar">
            <div v-for="dia in weekDays" :key="dia.dataIso" class="day-column"
                :class="{ 'is-today': dia.isHoje, 'is-expanded': expandedDays.includes(dia.dataIso) }">
                <div class="day-header" @click="toggleDay(dia.dataIso)">
                    <div class="header-info">
                        <span class="day-name">{{ dia.diaSemana }}</span>
                        <span class="day-date">{{ dia.diaMes }}</span>
                    </div>

                    <div class="header-actions">
                        <span v-if="dia.encomendas.length > 0" class="count-badge">
                            {{ dia.encomendas.length }}
                        </span>
                        <font-awesome-icon :icon="expandedDays.includes(dia.dataIso) ? faChevronUp : faChevronDown"
                            class="toggle-icon" />
                    </div>
                </div>

                <div class="day-content custom-scrollbar" v-show="expandedDays.includes(dia.dataIso) || !isMobile">
                    <TransitionGroup name="list" tag="div" class="cards-wrapper">

                        <div v-if="dia.encomendas.length === 0" key="empty" class="empty-state">
                            <span class="empty-text">Nenhuma encomenda</span>
                        </div>

                        <div v-for="order in dia.encomendas" :key="order.id" class="order-card"
                            @click="goToDetails(order.id)">
                            <div class="card-time-strip">
                                <font-awesome-icon :icon="faClock" class="clock-icon" />
                                <span class="time-text">{{ formatTime(order.horaAgendada) }}</span>
                            </div>

                            <div class="card-details">
                                <h4 class="client-name">
                                    {{ order.nomeCliente }}
                                </h4>

                                <div class="info-row address">
                                    <font-awesome-icon :icon="faMapMarkerAlt" class="icon-mini" />
                                    <span class="text-truncate">
                                        {{ order.enderecoBairro || 'Retirada' }}
                                    </span>
                                </div>

                                <div class="card-footer">
                                    <div class="metric">
                                        <font-awesome-icon :icon="faIceCream" class="icon-mini" />
                                        <span>{{ getTotalItems(order.itens) }}</span>
                                    </div>
                                    <div class="metric price">
                                        {{ formatCurrency(order.valorTotal) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1.5rem;
    overflow: auto;
    color: var(--c-text-dark, #333);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    padding: 0 0.5rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--c-azul-dark, #1e3a8a);
}

.period-badge {
    background: #e0e7ff;
    color: var(--c-azul, #3b82f6);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.header-controls {
    display: flex;
    gap: 1rem;
}

.btn-today {
    font-family: var(--font-title);
    background: transparent;
    border: 1px solid #cbd5e1;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #64748b;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-today:hover:not(:disabled) {
    background: #f1f5f9;
    color: var(--c-azul);
    border-color: var(--c-azul);
}

.btn-today:disabled {
    opacity: 0.5;
    cursor: default;
}

.nav-buttons {
    display: flex;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    overflow: hidden;
}

.btn-nav {
    background: transparent;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    color: #475569;
}

.btn-nav:hover {
    background: #f1f5f9;
    color: var(--c-azul);
}

.btn-nav:first-child {
    border-right: 1px solid #cbd5e1;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 1rem;
}

.day-column {
    background: #fff;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 300px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    transition: transform 0.3s, box-shadow 0.3s;
    overflow: hidden;
}

.day-column.is-today {
    border: 2px solid var(--c-azul-dark, #2563eb);
    background: linear-gradient(to bottom, #eff6ff, #fff 15%);
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1);
}

.day-header {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    cursor: default;
}

.day-name {
    display: block;
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 0.2rem;
}

.is-today .day-name {
    color: var(--c-azul);
}

.day-date {
    font-size: 1.1rem;
    font-weight: 800;
    color: #334155;
}

.day-content {
    flex: 1;
    padding: 0.75rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.toggle-icon {
    display: none;
}

.count-badge {
    display: none;
}

.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.3;
}

.empty-dot {
    width: 6px;
    height: 6px;
    background: #cbd5e1;
    border-radius: 50%;
}

.empty-text {
    display: block;
    font-size: 0.85rem;
    color: #000000;
    font-style: italic;
}

.order-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    /* position: relative; */
}

.order-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: var(--c-azul-light, #93c5fd);
}

.card-time-strip {
    background: var(--c-azul-dark, #1e3a8a);
    color: white;
    padding: 0.4rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.9rem;
}

.clock-icon {
    font-size: 0.8rem;
    opacity: 0.8;
}

.card-details {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.client-name {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #64748b;
}

.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.card-footer {
    margin-top: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px dashed #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
}

.metric.price {
    color: #10b981;
    font-weight: 700;
}

.icon-mini {
    font-size: 0.75rem;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.list-move {
    transition: transform 0.4s ease;
}


@media (max-width: 1024px) {
    .calendar-grid {
        grid-template-columns: repeat(3, 1fr);
        overflow-y: auto;
    }
}

.error-banner {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
    padding: 1rem;
    margin: 0 0.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
}

.btn-retry {
    font-family: var(--font-title);
    background: #fff;
    border: 1px solid #fca5a5;
    color: #b91c1c;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-new-order {
    background: linear-gradient(135deg, var(--c-azul, #3b82f6), var(--c-azul-dark, #1e3a8a));
    color: white;
    border: none;
    padding: 0.6rem 1.5rem;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.95rem;
    font-family: var(--font-title, sans-serif);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
}

.btn-new-order:hover {
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    filter: brightness(1.1);
}

.btn-new-order:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

@media (max-width: 768px) {
    .calendar-container {
        gap: 0.5rem;
        padding-bottom: 60px;
        height: auto;
        overflow: visible;
    }

    .calendar-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 0.5rem 1rem;
        flex-shrink: 0;
    }

    .header-left,
    .header-controls {
        width: 100%;
        justify-content: space-between;
    }

    .title {
        font-size: 1.25rem;
    }

    .btn-today {
        order: 2;
        flex: 1;
        justify-content: center;
    }

    .calendar-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0;
        overflow: visible;
        height: auto;
    }

    .day-column {
        border-radius: 0;
        border: none;
        border-bottom: 1px solid #f1f5f9;
        box-shadow: none;
        min-height: auto;
        overflow: visible;
        height: auto;
        flex-shrink: 0;
    }

    .day-header {
        position: sticky;
        top: -35px;
        z-index: 10;
        background: #f8fafc;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
    }

    .day-column.is-today .day-header {
        background: #eff6ff;
        color: var(--c-azul);
        border-left: 4px solid var(--c-azul);
    }

    .header-info {
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
    }

    .day-name,
    .day-date {
        display: inline-block;
        margin: 0;
        font-size: 0.9rem;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    .toggle-icon {
        display: block;
        color: #94a3b8;
        font-size: 0.9rem;
        transition: transform 0.2s;
    }

    .count-badge {
        display: inline-block;
        background: var(--c-azul);
        color: white;
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: bold;
    }

    .day-content {
        padding: 0.5rem 1rem;
        background: #fff;
        overflow: visible;
        height: auto;
    }

    .empty-state {
        padding: 1rem 0;
        justify-content: flex-start;
        opacity: 1;
    }

    .empty-text {
        display: block;
        font-size: 0.85rem;
        color: #94a3b8;
        font-style: italic;
    }

    .empty-dot {
        display: none;
    }

    .order-card {
        flex-direction: row;
        margin-bottom: 0.75rem;
        border-left: 4px solid var(--c-azul-dark);
    }

    .card-time-strip {
        background: transparent;
        color: var(--c-text-dark);
        width: auto;
        min-width: 65px;
        padding: 0.75rem 0.5rem;
        flex-direction: column;
        justify-content: center;
        border-right: 1px solid #f1f5f9;
    }

    .clock-icon {
        color: #94a3b8;
        margin-bottom: 4px;
    }

    .time-text {
        font-size: 1rem;
        color: #334155;
    }

    .header-controls {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        justify-content: space-between;
    }

    .btn-new-order {
        width: 100%;
        order: 1;
        justify-content: center;
        margin-top: 0;
        padding: 0.8rem;
    }

    .nav-buttons {
        order: 3;
        flex: 0 0 auto;
    }
}
</style>