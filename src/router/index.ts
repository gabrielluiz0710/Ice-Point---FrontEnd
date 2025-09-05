import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/Main.vue'
import SaboresView from '../views/Sabores.vue'
import ShoppingCartView from '../views/ShoppingCartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderConfirmationView from '../views/OrderConfirmationView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import LocalizationView from '../views/LocalizationView.vue'

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
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/pedido-confirmado',
      name: 'OrderConfirmation',
      component: OrderConfirmationView,
    },
    {
      path: '/sobre',
      name: 'sobre',
      component: AboutUsView,
    },
    {
      path: '/localizacao',
      name: 'localizacao',
      component: LocalizationView,
    },
    {
      path: '/sabores',
      name: 'sabores',
      component: () => SaboresView,
    },
  ],
})

export default router
