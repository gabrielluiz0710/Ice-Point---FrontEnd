<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import api from '@/service/api';
import { supabase } from '@/service/supabase';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'vue-chartjs';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler,
    ArcElement
);

const isLoading = ref(true);
const dashboardData = ref(null);
const errorState = ref(false);
const isFilterOpen = ref(false);
const currentFilterLabel = ref('Hoje');
const productSortType = ref('revenue');
const customStart = ref('');
const customEnd = ref('');
const showCustomInputs = ref(false);

const toggleProductSort = (type) => {
    if (productSortType.value !== type) {
        productSortType.value = type;
        if (customStart.value && customEnd.value) {
            applyCustomFilter();
        } else {
            const periodMap = {
                'Hoje': 'today',
                'Últimos 7 dias': '7d',
                'Últimos 30 dias': '30d',
                'Últimos 90 dias': '90d'
            };
            applyFilter(periodMap[currentFilterLabel.value] || 'today');
        }
    }
};

const commonChartOptions = reactive({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(26, 28, 35, 0.9)',
            titleColor: '#fe758f',
            bodyColor: '#fff',
            titleFont: { family: 'Fredoka', size: 14, weight: 'bold' },
            bodyFont: { family: 'Fredoka', size: 13 },
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            borderColor: 'rgba(254, 117, 143, 0.3)',
            borderWidth: 1,
            cornerRadius: 8
        }
    },
    scales: {
        x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#a0aec0', font: { family: 'Fredoka' } }
        },
        y: {
            grid: { color: 'rgba(226, 232, 240, 0.1)', drawBorder: false },
            ticks: { color: '#a0aec0', font: { family: 'Fredoka' }, callback: (val) => typeof val === 'number' ? val.toLocaleString('pt-BR', { notation: 'compact' }) : val }
        }
    },
    elements: {
        point: { radius: 4, hoverRadius: 8, borderWidth: 2, hoverBorderWidth: 3 }
    },
    animation: { duration: 1500, easing: 'easeOutQuart' }
});

const salesChartDataConfig = computed(() => {
    if (!dashboardData.value?.charts?.salesOverTime) return null;
    const rawData = dashboardData.value.charts.salesOverTime;
    return {
        labels: rawData.map(d => new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
        datasets: [{
            label: 'Faturamento',
            borderColor: '#fe758f',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#fe758f',
            fill: true,
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'rgba(254, 117, 143, 0.0)');
                gradient.addColorStop(1, 'rgba(254, 117, 143, 0.4)');
                return gradient;
            },
            data: rawData.map(d => d.valor),
            tension: 0.4
        }]
    };
});

const retentionChartDataConfig = computed(() => {
    const data = dashboardData.value?.charts?.retention;
    if (!data || (data.novos === 0 && data.recorrentes === 0)) return null;

    return {
        labels: ['Novos', 'Recorrentes'],
        datasets: [{
            backgroundColor: ['#19c5cb', '#fe758f'],
            borderWidth: 0,
            hoverOffset: 4,
            data: [data.novos, data.recorrentes]
        }]
    };
});

const operationalChartDataConfig = computed(() => {
    if (!dashboardData.value?.operational?.metodosEntrega) return null;
    const rawData = dashboardData.value.operational.metodosEntrega;
    return {
        labels: rawData.map(d => d.metodo === 'DELIVERY' ? 'Delivery' : (d.metodo === 'PICKUP' ? 'Retirada' : 'Outro')),
        datasets: [{
            label: 'Pedidos',
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                gradient.addColorStop(0, '#19c5cb');
                gradient.addColorStop(1, '#6de1e4');
                return gradient;
            },
            borderRadius: 12,
            barPercentage: 0.6,
            data: rawData.map(d => Number(d.count))
        }]
    };
});

const heatmapGrid = computed(() => {
    if (!dashboardData.value?.charts?.heatmap) return [];
    const rawData = dashboardData.value.charts.heatmap;
    const grid = Array(7).fill(null).map(() => Array(24).fill(0));
    let maxVal = 0;

    rawData.forEach(item => {
        const row = parseInt(item.diaSemana);
        const col = parseInt(item.hora);
        const val = parseInt(item.qtdPedidos);
        if (!isNaN(row) && !isNaN(col)) {
            grid[row][col] = val;
            if (val > maxVal) maxVal = val;
        }
    });

    return { grid, maxVal: maxVal || 1 };
});

const sortedCancelReasons = computed(() => {
    if (!dashboardData.value?.operational?.motivosCancelamento) return [];
    return [...dashboardData.value.operational.motivosCancelamento]
        .sort((a, b) => Number(b.count) - Number(a.count));
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const applyFilter = (period) => {
    const end = new Date();
    const start = new Date();
    showCustomInputs.value = false;

    switch (period) {
        case 'today':
            currentFilterLabel.value = 'Hoje';
            break;
        case '7d':
            start.setDate(end.getDate() - 7);
            currentFilterLabel.value = 'Últimos 7 dias';
            break;
        case '30d':
            start.setDate(end.getDate() - 30);
            currentFilterLabel.value = 'Últimos 30 dias';
            break;
        case '90d':
            start.setDate(end.getDate() - 90);
            currentFilterLabel.value = 'Últimos 90 dias';
            break;
        case 'custom':
            showCustomInputs.value = true;
            currentFilterLabel.value = 'Personalizado';
            return;
    }

    isFilterOpen.value = false;
    fetchDashboardData(formatDate(start), formatDate(end));
};

const applyCustomFilter = () => {
    if (customStart.value && customEnd.value) {
        isFilterOpen.value = false;
        fetchDashboardData(customStart.value, customEnd.value);
    }
};

const fetchDashboardData = async (startDate, endDate) => {
    try {
        isLoading.value = true;
        errorState.value = false;

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            console.error('Sem sessão ativa');
            errorState.value = true;
            return;
        }

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        params.append('sortBy', productSortType.value);

        const { data } = await api.get(`/dashboard/summary?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        dashboardData.value = data;
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        errorState.value = true;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    applyFilter('today');
});
</script>

<template>
    <div class="dashboard-wrapper">
        <header class="dashboard-header animate-fade-down">
            <div class="header-title">
                <h1>Visão Geral</h1>
                <p>Olá Gabriel, veja os resultados.</p>
            </div>

            <div class="header-actions">
                <div class="filter-dropdown">
                    <button class="btn-filter" @click="isFilterOpen = !isFilterOpen">
                        <span>{{ currentFilterLabel }}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="{ 'rotate-icon': isFilterOpen }">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <div v-if="isFilterOpen" class="filter-menu animate-fade-up-quick">
                        <a @click="applyFilter('today')">Hoje</a>
                        <a @click="applyFilter('7d')">Últimos 7 dias</a>
                        <a @click="applyFilter('30d')">Últimos 30 dias</a>
                        <a @click="applyFilter('90d')">Últimos 90 dias</a>
                        <a @click="applyFilter('custom')" class="custom-trigger">Personalizado</a>

                        <div v-if="showCustomInputs" class="custom-inputs">
                            <input type="date" v-model="customStart">
                            <input type="date" v-model="customEnd">
                            <button @click="applyCustomFilter" :disabled="!customStart || !customEnd">Filtrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div v-if="isLoading" class="skeleton-grid animate-pulse">
            <div class="skeleton-kpi" v-for="i in 4" :key="i"></div>
            <div class="skeleton-chart-lg"></div>
            <div class="skeleton-chart-sm"></div>
            <div class="skeleton-list"></div>
        </div>

        <div v-else-if="errorState" class="error-container animate-fade-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="var(--c-rosa)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Ops, algo deu errado.</h3>
            <p>Não conseguimos carregar os dados do dashboard.</p>
            <button @click="applyFilter('today')" class="btn-retry">Tentar Novamente</button>
        </div>

        <main v-else class="dashboard-content" v-if="dashboardData">

            <section class="kpi-grid stagger-animation">
                <div class="kpi-card kpi-primary">
                    <div class="card-icon-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div class="card-content">
                        <span class="card-label">Faturamento</span>
                        <h2 class="card-value count-up">{{ formatCurrency(dashboardData.kpis.faturamentoBruto) }}</h2>
                    </div>
                    <div class="card-trend positive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>Receita</span>
                    </div>
                </div>

                <div class="kpi-card kpi-info">
                    <div class="card-icon-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <div class="card-content">
                        <span class="card-label">Pedidos</span>
                        <h2 class="card-value">{{ dashboardData.kpis.totalPedidosConcluidos }}</h2>
                    </div>
                </div>

                <div class="kpi-card kpi-success">
                    <div class="card-icon-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="card-content">
                        <span class="card-label">Ticket Médio</span>
                        <h2 class="card-value">{{ formatCurrency(dashboardData.kpis.ticketMedio) }}</h2>
                    </div>
                </div>

                <div class="kpi-card kpi-info">
                    <div class="card-icon-bg" style="--icon-start: #a8edea; --icon-end: #fed6e3;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <div class="card-content">
                        <span class="card-label">Itens/Cesta</span>
                        <h2 class="card-value">{{ dashboardData.kpis.itensPorCesta.toFixed(1) }}</h2>
                    </div>
                </div>

                <div class="kpi-card kpi-danger">
                    <div class="card-icon-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <div class="card-content">
                        <span class="card-label">Cancelados</span>
                        <h2 class="card-value">{{ dashboardData.kpis.taxaCancelamento.toFixed(1) }}%</h2>
                    </div>
                    <div class="card-trend negative" v-if="dashboardData.kpis.taxaCancelamento > 0">
                        <span>-{{ formatCurrency(dashboardData.kpis.receitaPerdida) }}</span>
                    </div>
                </div>
            </section>

            <section class="charts-grid stagger-animation" style="animation-delay: 0.2s">
                <div class="dashboard-card chart-card-lg">
                    <div class="card-header">
                        <h3>Tendência de Faturamento</h3>
                    </div>
                    <div class="chart-container-lg">
                        <Line v-if="salesChartDataConfig" :data="salesChartDataConfig" :options="commonChartOptions" />
                    </div>
                </div>

                <div class="dashboard-card chart-card-lg heatmap-card">
                    <div class="card-header">
                        <h3>Horários de Pico (Heatmap)</h3>
                        <small>Intensidade de pedidos por dia/hora</small>
                    </div>
                    <div class="heatmap-container">
                        <div class="heatmap-grid-labels">
                            <div class="label-corner"></div>
                            <div v-for="h in 24" :key="'h' + h" class="label-hour">{{ (h - 1).toString().padStart(2,
                                '0')
                                }}h</div>
                        </div>
                        <div v-for="(dayRow, dayIndex) in heatmapGrid.grid" :key="'day' + dayIndex" class="heatmap-row">
                            <div class="label-day">{{ ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayIndex] }}
                            </div>
                            <div v-for="(val, hourIndex) in dayRow" :key="'cell' + hourIndex" class="heatmap-cell">
                                <div class="heatmap-cell-inner" :style="{
                                    backgroundColor: 'var(--c-rosa)',
                                    opacity: val > 0 ? (val / heatmapGrid.maxVal) * 0.8 + 0.2 : 0.05,
                                    transform: `scale(${val > 0 ? 1 : 0.8})`
                                }" :title="`${val} pedidos`"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="lists-grid stagger-animation" style="animation-delay: 0.4s">

                <div class="dashboard-card list-card">
                    <div class="card-header">
                        <h3>Top Produtos</h3>
                        <div class="sort-toggles">
                            <button class="badge-btn" :class="{ 'active': productSortType === 'revenue' }"
                                @click="toggleProductSort('revenue')">
                                Receita
                            </button>
                            <button class="badge-btn" :class="{ 'active': productSortType === 'quantity' }"
                                @click="toggleProductSort('quantity')">
                                Qtd.
                            </button>
                        </div>
                    </div>

                    <ul class="top-list">
                        <li v-for="(prod, index) in dashboardData.products" :key="prod.nome"
                            class="list-item animate-slide-in" :style="{ animationDelay: `${index * 0.1}s` }">
                            <span class="item-rank">#{{ index + 1 }}</span>
                            <div class="item-details">
                                <span class="item-name">{{ prod.nome }}</span>
                                <small class="item-sub">{{ prod.quantidade }} und. vendidas</small>
                            </div>
                            <div class="item-value">
                                {{ formatCurrency(prod.receita) }}
                                <div class="value-bar" :style="{
                                    width: productSortType === 'revenue'
                                        ? `${(prod.receita / dashboardData.products[0].receita) * 100}%`
                                        : `${(prod.quantidade / dashboardData.products[0].quantidade) * 100}%`
                                }">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="operational-split-col">
                    <div class="dashboard-card chart-card-sm" style="margin-bottom: var(--gap);">
                        <div class="card-header">
                            <h3>Método de Entrega</h3>
                        </div>
                        <div class="chart-container-sm">
                            <Bar v-if="operationalChartDataConfig" :data="operationalChartDataConfig"
                                :options="commonChartOptions" />
                        </div>
                    </div>

                    <div class="dashboard-card list-card">
                        <div class="card-header">
                            <h3>Top Bairros</h3>
                        </div>
                        <ul class="top-list compact-list">
                            <li v-for="(bairro, index) in dashboardData.operational.topBairros" :key="bairro.bairro"
                                class="list-item">
                                <span class="bairro-marker">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                        fill="var(--c-azul)" stroke="none">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </span>
                                <span class="item-name" style="flex-grow: 1;">{{ bairro.bairro || 'Não informado'
                                }}</span>
                                <span class="item-value-badge">{{ bairro.count }} pedidos</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section class="lists-grid stagger-animation" style="animation-delay: 0.6s; margin-top: var(--gap);">

                <div class="dashboard-card chart-card-sm" style="height: auto; min-height: 320px;">
                    <div class="card-header">
                        <h3>Fidelização</h3>
                    </div>
                    <div class="chart-container-sm"
                        style="height: 220px; position: relative; display: flex; justify-content: center;">
                        <Doughnut v-if="retentionChartDataConfig" :data="retentionChartDataConfig" :options="{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom', labels: { color: '#a0aec0', font: { family: 'Fredoka' } } } }
                        }" />
                        <div v-else
                            style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                            Sem dados de retenção
                        </div>
                    </div>
                </div>

                <div class="dashboard-card list-card" style="height: auto; min-height: 320px;">
                    <div class="card-header">
                        <h3>Motivos de Cancelamento</h3>
                        <span class="badge"
                            style="background: rgba(254, 117, 143, 0.1); color: var(--c-rosa-dark);">Alertas</span>
                    </div>
                    <ul class="top-list compact-list">
                        <li v-for="(reason, index) in sortedCancelReasons" :key="index" class="list-item">
                            <span class="item-rank" style="color: var(--text-muted); width: 20px;">{{ index + 1
                            }}</span>
                            <span class="item-name" style="flex-grow: 1; font-size: 0.9rem;">
                                {{ reason.motivo || 'Não informado' }}
                            </span>
                            <span class="item-value-badge"
                                style="background: var(--c-cinza-light); color: var(--text-main);">
                                {{ reason.count }}
                            </span>
                        </li>
                        <li v-if="sortedCancelReasons.length === 0" class="list-item">
                            <span class="item-sub">Nenhum cancelamento registrado.</span>
                        </li>
                    </ul>
                </div>
            </section>

        </main>
    </div>
</template>

<style scoped>
.dashboard-wrapper {
    --gap: 24px;
    --card-radius: 20px;
    --card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
    --card-shadow-hover: 0 20px 40px -10px rgba(54, 164, 188, 0.2);
    --bg-glass: rgba(255, 255, 255, 0.95);
    padding: var(--gap);
    background-color: var(--admin-bg-main);
    background-attachment: fixed;
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    position: relative;
    z-index: 50;
}

.header-title h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 4px;
    background: linear-gradient(45deg, var(--c-text-dark), var(--c-azul-dark));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.header-title p {
    color: var(--text-muted);
    font-weight: 500;
}

.filter-dropdown {
    position: relative;
}

.btn-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    padding: 10px 16px;
    border-radius: 12px;
    font-family: var(--font-title);
    font-weight: 600;
    color: var(--text-main);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.btn-filter:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--c-azul-light);
    color: var(--c-azul-dark);
}

.rotate-icon {
    transform: rotate(180deg);
}

.filter-menu {
    position: absolute;
    top: 110%;
    right: 0;
    background: var(--bg-glass);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    padding: 8px;
    box-shadow: var(--card-shadow-hover);
    min-width: 200px;
    z-index: 90;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filter-menu a {
    padding: 8px 12px;
    border-radius: 8px;
    color: var(--text-main);
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
}

.filter-menu a:hover {
    background: rgba(25, 197, 203, 0.1);
    color: var(--c-azul-dark);
}

.custom-trigger {
    border-top: 1px solid var(--border-light);
    margin-top: 4px;
}

.custom-inputs {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.custom-inputs input {
    width: 100%;
    padding: 6px;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    font-family: var(--font-title);
    color: var(--text-main);
}

.custom-inputs button {
    width: 100%;
    padding: 6px;
    background: var(--c-rosa);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.custom-inputs button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.dashboard-card {
    background: var(--bg-glass);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: var(--card-radius);
    padding: 24px;
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
}

.dashboard-card:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: var(--card-shadow-hover);
    border-color: rgba(25, 197, 203, 0.2);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card-header h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main);
}

.card-header small {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 4px;
}

.badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-azul {
    background: rgba(25, 197, 203, 0.1);
    color: var(--c-azul-dark);
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--gap);
    margin-bottom: var(--gap);
}

.kpi-card {
    background: var(--bg-glass);
    backdrop-filter: blur(10px);
    border-radius: var(--card-radius);
    padding: 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    min-width: 240px;
}

.kpi-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to bottom right,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 60%);
    transform: rotate(30deg) translate(-100%, -100%);
    transition: transform 0.6s ease;
    pointer-events: none;
}

.kpi-card:hover::after {
    transform: rotate(30deg) translate(100%, 100%);
}

.kpi-card:hover {
    transform: translateY(-8px);
}

.card-icon-bg {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: linear-gradient(135deg, var(--icon-start), var(--icon-end));
    color: #fff;
}

.kpi-primary {
    --icon-start: var(--c-rosa-light);
    --icon-end: var(--c-rosa-dark);
}

.kpi-primary:hover {
    box-shadow: 0 20px 40px -10px rgba(254, 117, 143, 0.4);
}

.kpi-info {
    --icon-start: var(--c-azul-light);
    --icon-end: var(--c-azul-dark);
}

.kpi-info:hover {
    box-shadow: 0 20px 40px -10px rgba(25, 197, 203, 0.4);
}

.kpi-success {
    --icon-start: #84fab0;
    --icon-end: #8fd3f4;
}

.kpi-danger {
    --icon-start: #ff9a9e;
    --icon-end: #fecfef;
}


.card-content {
    flex-grow: 1;
}

.card-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    display: block;
    margin-bottom: 8px;
}

.card-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.2;
}

.card-trend {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 700;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
}

.card-trend.positive {
    color: var(--c-azul-dark);
    background: rgba(25, 197, 203, 0.1);
}

.card-trend.negative {
    color: var(--c-rosa-dark);
    background: rgba(254, 117, 143, 0.1);
    font-size: 0.75rem;
}

.card-trend.negative span {
    white-space: nowrap;
}

.charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap);
    margin-bottom: var(--gap);
}

.chart-container-lg {
    height: 350px;
    position: relative;
}

.chart-container-sm {
    height: 220px;
    position: relative;
}

.heatmap-card {
    display: flex;
    flex-direction: column;
}

.heatmap-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
}

.heatmap-grid-labels,
.heatmap-row {
    display: flex;
    min-width: 200px;
}

.label-corner,
.label-day {
    width: 40px;
    font-size: 0.7rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    font-weight: 600;
}

.label-hour {
    flex: 1;
    text-align: center;
    font-size: 0.6rem;
    color: var(--text-muted);
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    margin-bottom: 8px;
}

.heatmap-cell {
    flex: 1;
    aspect-ratio: 1/1;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.heatmap-cell-inner {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.heatmap-cell-inner:hover {
    transform: scale(1.2) !important;
    box-shadow: 0 4px 8px rgba(254, 117, 143, 0.3);
    opacity: 1 !important;
    z-index: 2;
}

.lists-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: var(--gap);
    align-items: flex-start;
}

.operational-split-col {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
}

.top-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.list-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);
    position: relative;
}

.list-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.list-item:first-child {
    padding-top: 0;
}

.item-rank {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--c-rosa);
    margin-right: 16px;
    width: 30px;
}

.item-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-right: 10px;
    min-width: 0;
}

.item-name {
    font-weight: 600;
    color: var(--text-main);
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.item-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.item-value {
    text-align: right;
    font-weight: 700;
    color: var(--text-main);
    font-size: 1rem;
    position: relative;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.value-bar {
    height: 4px;
    background: linear-gradient(to right, var(--c-azul-light), var(--c-azul));
    border-radius: 2px;
    margin-top: 6px;
    opacity: 0.7;
    position: absolute;
    bottom: -10px;
    right: 0;
    max-width: 100px;
}

.compact-list .list-item {
    padding: 12px 0;
}

.bairro-marker {
    margin-right: 12px;
    display: flex;
}

.item-value-badge {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--c-azul-dark);
    background: rgba(25, 197, 203, 0.1);
    padding: 4px 12px;
    border-radius: 12px;
}

@keyframes fadeDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-down {
    animation: fadeDown 0.8s ease-out forwards;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fadeUpQuick {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-up-quick {
    animation: fadeUpQuick 0.2s ease-out forwards;
}

.animate-fade-up {
    animation: fadeUp 0.6s ease-out forwards;
}

.stagger-animation>* {
    opacity: 0;
    animation: fadeUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.stagger-animation>*:nth-child(1) {
    animation-delay: 0.1s;
}

.stagger-animation>*:nth-child(2) {
    animation-delay: 0.3s;
}

.stagger-animation>*:nth-child(3) {
    animation-delay: 0.5s;
}

.stagger-animation>*:nth-child(4) {
    animation-delay: 0.7s;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-slide-in {
    opacity: 0;
    animation: slideInRight 0.5s ease forwards;
}

.skeleton-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--gap);
    grid-template-rows: 140px 350px auto;
}

.skeleton-kpi {
    grid-column: span 1;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--card-radius);
}

.skeleton-chart-lg {
    grid-column: span 3;
    grid-row: 2;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--card-radius);
}

.skeleton-chart-sm {
    grid-column: span 1;
    grid-row: 2;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--card-radius);
}

.skeleton-list {
    grid-column: span 4;
    height: 300px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--card-radius);
}

.animate-pulse {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;
    color: var(--text-muted);
}

.error-container h3 {
    margin-top: 16px;
    color: var(--text-main);
}

.btn-retry {
    font-family: var(--font-title);
    margin-top: 24px;
    padding: 12px 32px;
    background: var(--c-rosa);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-retry:hover {
    background: var(--c-rosa-dark);
}

.sort-toggles {
    display: flex;
    gap: 8px;
    background: var(--bg-card);
    padding: 4px;
    border-radius: 20px;
    border: 1px solid var(--border-light);
}

.badge-btn {
    border: none;
    background: transparent;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-title);
}

.badge-btn:hover {
    color: var(--text-main);
}

.badge-btn.active {
    background: rgba(25, 197, 203, 0.15);
    color: var(--c-azul-dark);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1200px) {
    .heatmap-card {
        height: auto;
        min-height: 200px;
    }

    .label-hour {
        writing-mode: horizontal-tb;
        transform: none;
        font-size: 0.7rem;
    }

    .heatmap-container {
        overflow-x: auto;
    }

    .lists-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .dashboard-wrapper {
        --gap: 16px;
        padding: 16px;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .lists-grid,
    .charts-grid,
    .operational-split-col {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 16px;
    }

    .operational-split-col {
        height: auto;
        margin-top: 0 !important;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .header-title h1 {
        font-size: 1.75rem;
    }

    .kpi-grid {
        grid-template-columns: 1fr;
    }

    .kpi-card {
        padding: 20px;
        flex-wrap: wrap;
    }

    .dashboard-card {
        padding: 20px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .chart-container-lg,
    .chart-container-sm {
        position: relative;
        width: 100%;
        max-width: 100%;
    }

    .chart-container-lg {
        height: 250px;
    }

    .chart-container-sm {
        height: 200px;
    }

    .list-item {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
    }

    .item-name {
        flex: 1;
        min-width: 0;
        margin-right: 12px;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
    }

    .item-value,
    .item-value-badge {
        margin-left: auto;
        flex-shrink: 0;
        white-space: nowrap;
    }

    .item-rank {
        flex-shrink: 0;
        margin-right: 12px;
    }

    .value-bar {
        display: none;
    }

    .skeleton-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .skeleton-kpi,
    .skeleton-chart-lg,
    .skeleton-chart-sm,
    .skeleton-list {
        height: 120px;
    }

    .header-actions {
        width: 100%;
    }

    .filter-dropdown {
        width: 100%;
    }

    .btn-filter {
        width: 100%;
        justify-content: space-between;
    }

    .filter-menu {
        right: auto;
        left: 0;
        width: 100%;
        min-width: unset;
    }
}
</style>