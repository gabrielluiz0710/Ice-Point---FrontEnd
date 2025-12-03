<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()

const isAdminRoute = computed(() => {
  return route.path.startsWith('/painel-controle')
})
</script>

<template>
  <Header v-if="!isAdminRoute" />

  <main :class="{ 'main-site': !isAdminRoute }">
    <RouterView />
  </main>

  <Footer v-if="!isAdminRoute" />
</template>

<style scoped>
.main-site {
  padding-top: 70px;
  background-color: var(--c-branco);
  min-height: calc(100vh - 70px);
}
</style>