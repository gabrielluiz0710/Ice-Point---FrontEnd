import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/service/supabase'
import type { Provider } from '@supabase/supabase-js'
import { useCartStore } from './cart'
import router from '@/router'

interface UserProfile {
  id: string
  nome: string
  email: string
  tipo: 'CLIENTE' | 'FUNCIONARIO' | 'ADMIN'
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(true)
  const firstName = ref('')

  const API_URL = import.meta.env.VITE_API_URL

  async function fetchUserProfile(userId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) throw new Error('Token de acesso não encontrado.')

    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Falha ao buscar perfil do NestJS: ' + response.statusText)
    }

    const responseBody = await response.json()

    const userData = responseBody.user

    if (!userData) {
      throw new Error('Dados de usuário não encontrados na resposta do backend.')
    }

    user.value = {
      id: userData.userId,
      email: userData.email,
      nome: userData.nome || userData.email.split('@')[0],
      tipo: userData.tipo,
    } as UserProfile

    isAuthenticated.value = true
    firstName.value = user.value.nome.split(' ')[0]
  }

  async function register(payload: {
    email: string
    password: string
    name: string
    phone: string
    birthDate: string
  }) {
    isLoading.value = true

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          nome: payload.name,
          phone: payload.phone,
          birthDate: payload.birthDate,
        },
      },
    })

    if (error) {
      isLoading.value = false
      throw error
    }

    if (data.session) {
      await fetchUserProfile(data.user!.id)
      return { success: true, shouldRedirect: true, message: 'Cadastro realizado com sucesso!' }
    } else {
      return {
        success: true,
        shouldRedirect: false,
        message: 'Verifique seu email para confirmar o cadastro.',
      }
    }
  }

  async function login(email: string, password: string) {
    const cartStore = useCartStore()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    await fetchUserProfile(data.user!.id)

    const anonItems = cartStore.getAnonItems()

    if (anonItems.length > 0) {
      console.log('Carrinho anônimo encontrado. Iniciando transferência...')

      const transferResponse = await fetch(`${API_URL}/cart/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session!.access_token}`,
        },
        body: JSON.stringify({ items: anonItems }),
      })

      if (transferResponse.ok) {
        cartStore.clearAnonStorage()
        console.log('Carrinho anônimo transferido com sucesso!')
      } else {
        console.warn('Falha ao transferir carrinho.')
      }
    }

    await cartStore.fetchUserCart()

    if (router.currentRoute.value.path === '/login') {
      router.push('/perfil')
    }
  }

  async function loginWithProvider(provider: 'google' | 'facebook') {
    isLoading.value = true
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + '/perfil',
      },
    })

    if (error) {
      console.error('Erro no login social:', error)
      isLoading.value = false
      throw error
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    isAuthenticated.value = false
    firstName.value = 'Meu Perfil'
    router.push('/')
  }

  async function checkCartTransfer() {
    const cartStore = useCartStore()
    const anonItems = cartStore.getAnonItems()

    if (isAuthenticated.value && anonItems.length > 0) {
      console.log('Detectado login e carrinho local. Iniciando transferência...')

      const {
        data: { session },
      } = await supabase.auth.getSession()

      try {
        const transferResponse = await fetch(`${API_URL}/cart/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ items: anonItems }),
        })

        if (transferResponse.ok) {
          cartStore.clearAnonStorage()
          console.log('Carrinho transferido com sucesso!')
          await cartStore.fetchUserCart()
        }
      } catch (e) {
        console.error('Erro na transferência:', e)
      }
    } else if (isAuthenticated.value) {
      await cartStore.fetchUserCart()
    }
  }

  async function loadUserSession() {
    isLoading.value = true
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await fetchUserProfile(session.user.id)

        await checkCartTransfer()
      } else {
        user.value = null
        isAuthenticated.value = false
        firstName.value = 'Meu Perfil'
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
    } finally {
      isLoading.value = false
    }
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      if (!user.value) loadUserSession()
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      isAuthenticated.value = false
    }
  })

  loadUserSession()

  return {
    user,
    isAuthenticated,
    isLoading,
    firstName,
    loadUserSession,
    fetchUserProfile,
    login,
    loginWithProvider,
    logout,
    register,
  }
})
