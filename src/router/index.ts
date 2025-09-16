import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/Main.vue'
import ProductsView from '../views/ProductsView.vue'
import ShoppingCartView from '../views/ShoppingCartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderConfirmationView from '../views/OrderConfirmationView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import LocalizationView from '../views/LocalizationView.vue'
import ContactView from '../views/ContactView.vue'
import ProductDetailsView from '../views/ProductDetailsView.vue'
import ProfileView from '../views/ProfileView.vue'
import OrderDetailsView from '../views/OrderDetailsView.vue'

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
      path: '/contatos',
      name: 'contatos',
      component: ContactView,
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: ProfileView,
    },
    {
      path: '/perfil/pedidos/:id',
      name: 'OrderDetail',
      component: OrderDetailsView,
      props: true,
    },
    {
      path: '/produtos',
      name: 'produtos',
      component: ProductsView,
    },
    {
      path: '/produtos/:id',
      name: 'ProdutoDetalhe',
      component: ProductDetailsView,
      props: true,
    },
  ],
})

export default router
