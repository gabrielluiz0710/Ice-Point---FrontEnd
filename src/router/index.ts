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
import AdminView from '../views/AdminView.vue'
import AdminDashboard from '../views/admin/DashboardView.vue'
import AdminProductsView from '../views/admin/ProductsView.vue'
import AdminUsersView from '../views/admin/UsersView.vue'

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
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil/pedidos/:id',
      name: 'OrderDetail',
      component: OrderDetailsView,
      props: true,
      meta: { requiresAuth: true },
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
      meta: { requiresGuest: true },
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
      path: '/painel-controle',
      component: AdminView,
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'FUNCIONARIO'],
      },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminDashboard,
        },
        {
          path: 'produtos',
          name: 'admin-produtos',
          component: AdminProductsView,
        },
        {
          path: 'usuarios',
          name: 'admin-usuarios',
          component: AdminUsersView,
          meta: { roles: ['ADMIN'] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (
    to.hash.includes('access_token') ||
    to.query.code ||
    to.hash.includes('type=recovery') ||
    to.hash.includes('error=')
  ) {
    console.log(
      '[Router] Detectado token ou erro de auth na URL. Permitindo renderização para tratamento local...',
    )
    return next()
  }

  if (!userStore.isReady) {
    console.log('[Router] App iniciou ou recarregou. Verificando sessão...')
    await userStore.initializeAuth()
  }

  const isAuthenticated = userStore.isAuthenticated
  const userRole = userStore.user?.tipo

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('[Router] Acesso negado. Redirecionando para Login.')
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'perfil' })
  }

  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    if (!allowedRoles.includes(userRole || '')) {
      console.warn(`[Router] Usuário ${userRole} tentou acessar área restrita.`)
      return next({
        name: 'not-found',
        params: { pathMatch: to.path.substring(1).split('/') },
        replace: true,
      })
    }
  }

  next()
})

export default router
