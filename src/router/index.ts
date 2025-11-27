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
import LoginRegisterView from '../views/LoginRegisterView.vue'
import UpdatePasswordView from '../views/UpdatePasswordView.vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/service/supabase'

const authGuard = async (to: any, from: any, next: any) => {
  const userStore = useUserStore()

  if (userStore.isAuthenticated) {
    next()
    return
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    if (!userStore.user) {
      await userStore.loadUserSession()
    }
    next()
  } else {
    next('/login')
  }
}

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
      beforeEnter: authGuard,
    },
    {
      path: '/perfil/pedidos/:id',
      name: 'OrderDetail',
      component: OrderDetailsView,
      props: true,
      beforeEnter: authGuard,
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
    {
      path: '/login',
      name: 'login',
      component: LoginRegisterView,
    },
    {
      path: '/atualizar-senha',
      name: 'UpdatePassword',
      component: UpdatePasswordView,
    },
  ],
})

export default router
