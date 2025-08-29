import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/Main.vue'
import SaboresView from '../views/Sabores.vue'
import ShoppingCartView from '../views/ShoppingCartView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
    },
    {
      path: '/carrinho',
      name: 'carrinho',
      component: ShoppingCartView,
    },
    {
      path: '/sabores',
      name: 'sabores',
      component: () => SaboresView,
    },
  ],
})

export default router
