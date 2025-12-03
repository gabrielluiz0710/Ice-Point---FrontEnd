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
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import DataDeletionView from '../views/DataDeletionView.vue'
import TermsView from '../views/TermsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/service/supabase'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/views/admin/DashboardView.vue'

const authGuard = async (to: any, from: any, next: any) => {
  const userStore = useUserStore()
  console.log('[Router] AuthGuard iniciado para:', to.path)

  if (userStore.isAuthenticated && userStore.user) {
    console.log('[Router] Usuário já autenticado na store. Permitindo.')
    next()
    return
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    console.log('[Router] Sessão Supabase existe.')
    if (!userStore.user) {
      console.log('[Router] Disparando loadUserSession em background (sem await)...')
      userStore.loadUserSession().catch((err) => console.error('[Router] Erro bg load:', err))
    }

    next()
  } else {
    const isSocialCallback = to.hash.includes('access_token') || to.query.code

    if (isSocialCallback) {
      console.log(
        '[Router] Detectado callback social na URL. Permitindo renderizar para processar token.',
      )
      userStore.loadUserSession()
      next()
    } else {
      console.log('[Router] Sem sessão. Redirecionando para login.')
      next('/login')
    }
  }
}

const adminGuard = async (to: any, from: any, next: any) => {
  const userStore = useUserStore()

  if (!userStore.user) {
    await userStore.loadUserSession()
  }

  if (!userStore.isAuthenticated || !userStore.user) {
    next('/login')
    return
  }

  const role = userStore.user.tipo
  if (role === 'FUNCIONARIO' || role === 'ADMIN') {
    next()
  } else {
    next({
      name: 'not-found',
      params: { pathMatch: to.path.substring(1).split('/') },
      replace: true,
    })
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
    {
      path: '/politica-privacidade',
      component: PrivacyPolicyView,
    },
    {
      path: '/exclusao-dados',
      component: DataDeletionView,
    },
    {
      path: '/termos',
      name: 'termos',
      component: TermsView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
    {
      path: '/painel-controle',
      component: AdminLayout,
      beforeEnter: adminGuard,
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminDashboard,
        },
      ],
    },
  ],
})

export default router
