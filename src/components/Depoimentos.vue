<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.setAttribute('data-use-service-core', '');
    script.defer = true;

    document.body.appendChild(script);
});

onUnmounted(() => {
    const script = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
    if (script) {
        document.body.removeChild(script);
    }
});
</script>

<template>
    <section id="depoimentos" class="coments" :style="{ backgroundColor: '#FFFFFF' }">
        <div class="content">
            <div id="comentarios">
                <div class="elfsight-app-867828a4-f57a-427b-bdce-4dc954f47e0a" data-elfsight-app-lazy></div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.coments {
    padding-block: 4rem;
}
</style>