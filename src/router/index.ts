import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/Main.vue'
import SaboresView from '../views/Sabores.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
    },
    {
      path: '/sabores',
      name: 'sabores',
      component: () => SaboresView,
    },
  ],
})

export default router
