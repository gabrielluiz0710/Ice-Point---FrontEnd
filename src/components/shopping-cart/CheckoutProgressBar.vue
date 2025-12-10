<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    steps: { name: string; icon: any }[]
    currentStep: number
}>()

const isAllComplete = computed(() => props.currentStep >= props.steps.length)
</script>

<template>
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }"></div>
        </div>
        <div v-for="(step, index) in steps" :key="step.name" class="step-item" :class="{
            'active': index + 1 === currentStep && !isAllComplete,
            'completed': index + 1 < currentStep || isAllComplete
        }">
            <div class="step-icon">
                <font-awesome-icon :icon="step.icon" />
            </div>
            <span class="step-label">{{ step.name }}</span>
        </div>
    </div>
</template>

<style scoped>
.progress-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    margin: 0 auto 1.5rem;
    max-width: 800px;
}

.progress-bar {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: var(--c-cinza);
    border-radius: 2px;
    z-index: 1;
}

.progress-fill {
    height: 100%;
    background-color: var(--c-azul);
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 2;
    width: 120px;
}

.step-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--c-branco);
    border: 3px solid var(--c-cinza);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-cinza);
    transition: all 0.4s ease;
    margin-bottom: 0.5rem;
}

.step-label {
    font-size: 0.9rem;
    color: var(--c-text-light);
    font-weight: 500;
    transition: all 0.4s ease;
}

.step-item.completed .step-icon {
    background-color: var(--c-azul);
    border-color: var(--c-azul);
    color: var(--c-branco);
}

.step-item.completed .step-label {
    color: var(--c-azul);
    font-weight: 700;
}

.step-item.active .step-icon {
    border-color: var(--c-azul);
    color: var(--c-azul);
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(25, 197, 203, 0.2);
}

.step-item.active .step-label {
    color: var(--c-text-dark);
    font-weight: 700;
}
</style>