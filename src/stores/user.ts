import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/service/supabase'
import { useCartStore } from './cart'
import router from '@/router'

interface Address {
  id?: number
  zip: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  principal: boolean
}

interface UserProfile {
  id: string
  nome: string
  email: string
  phone?: string
  cpf?: string
  birthDate?: string
  addresses: Address[]
  tipo: 'CLIENTE' | 'FUNCIONARIO' | 'ADMIN'
  avatarUrl?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const firstName = ref('Meu Perfil')

  const isReady = ref(false)

  const API_URL = import.meta.env.VITE_API_URL

  function resetState() {
    user.value = null
    isAuthenticated.value = false
    firstName.value = 'Meu Perfil'
  }

  function forceLogout() {
    console.warn('[Store] Logout forçado por inconsistência.')
    supabase.auth.signOut()
    resetState()
    router.push('/login')
  }

  async function fetchUserProfile(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error('Token expirado ou inválido')
        throw new Error('Erro na API: ' + response.statusText)
      }

      const responseBody = await response.json()
      const userData = responseBody.user

      if (!userData) throw new Error('Perfil vazio retornado pela API')

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      const avatar = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null

      user.value = {
        id: userData.userId,
        email: userData.email,
        nome: userData.nome,
        tipo: userData.tipo,
        phone: userData.phone || '',
        cpf: userData.cpf || '',
        birthDate: userData.birthDate || '',
        addresses: userData.addresses || [],
        avatarUrl: avatar,
      } as UserProfile

      isAuthenticated.value = true
      firstName.value = user.value.nome.split(' ')[0]
      return true
    } catch (error) {
      console.error('[Store] Falha ao buscar perfil:', error)
      return false
    }
  }

  async function initializeAuth(): Promise<void> {
    if (isReady.value) return

    isLoading.value = true
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        resetState()
      } else {
        console.log('[Store] Sessão recuperada. Buscando perfil...')
        const success = await fetchUserProfile(session.access_token)

        if (success) {
          await checkCartTransfer()
        } else {
          await supabase.auth.signOut()
          resetState()
        }
      }
    } catch (error) {
      console.error('[Store] Erro crítico na inicialização:', error)
      resetState()
    } finally {
      isReady.value = true
      isLoading.value = false
    }
  }

  async function checkCartTransfer() {
    const cartStore = useCartStore()
    const anonItems = cartStore.getAnonItems()

    if (isAuthenticated.value) {
      if (anonItems.length > 0) {
        console.log('[Cart] Transferindo itens anônimos...')
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          try {
            await fetch(`${API_URL}/cart/transfer`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ items: anonItems }),
            })
            cartStore.clearAnonStorage()
          } catch (e) {
            console.error('[Cart] Erro na transferência:', e)
          }
        }
      }
      await cartStore.fetchUserCart()
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const success = await fetchUserProfile(data.session!.access_token)
      if (!success) throw new Error('Falha ao carregar perfil após login')

      await checkCartTransfer()

      const role = user.value?.tipo
      if (role === 'ADMIN' || role === 'FUNCIONARIO') {
        router.push('/painel-controle')
      } else {
        if (router.currentRoute.value.path === '/login') {
          router.push('/perfil')
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      isLoading.value = false
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
      isLoading.value = false
      throw error
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await supabase.auth.signOut()
    } finally {
      resetState()
      isLoading.value = false
      router.push('/login')
    }
  }

  async function register(payload: any) {
    isLoading.value = true

    const redirectUrl = window.location.origin + '/perfil'

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: redirectUrl,
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
      await fetchUserProfile(data.session.access_token)
      isLoading.value = false
      return { success: true, shouldRedirect: true, message: 'Cadastro realizado!' }
    } else {
      isLoading.value = false
      return { success: true, shouldRedirect: false, message: 'Confirme seu email.' }
    }
  }

  async function updateProfile(payload: any) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('Sem sessão')

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Erro ao atualizar')

    await fetchUserProfile(session.access_token)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    isReady,
    firstName,
    initializeAuth,
    fetchUserProfile,
    login,
    loginWithProvider,
    logout,
    register,
    updateProfile,
    supabase,
  }
})
