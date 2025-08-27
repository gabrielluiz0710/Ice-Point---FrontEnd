<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

</script>

<template>
  <Header />

  <main>
    <RouterView />
  </main>

  <Footer />
</template>

<style scoped>
main {
  padding-top: 70px;
  min-height: 100vh;
  background-color: var(--c-branco);
}
</style>
