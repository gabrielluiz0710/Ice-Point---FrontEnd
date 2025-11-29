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
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(true)
  const firstName = ref('')

  const isFetchingProfile = ref(false)

  const API_URL = import.meta.env.VITE_API_URL

  function resetState() {
    user.value = null
    isAuthenticated.value = false
    firstName.value = 'Meu Perfil'
    isFetchingProfile.value = false
  }

  function forceLogout() {
    console.warn('[Store] Forçando logout por erro crítico.')
    supabase.auth.signOut()
    user.value = null
    isAuthenticated.value = false
    firstName.value = 'Meu Perfil'
    isLoading.value = false
    router.push('/login')
  }

  async function fetchUserProfile(userId: string) {
    console.log('[Store] Iniciando busca de perfil no NestJS...')

    if (isFetchingProfile.value) {
      console.log('[Store] fetchUserProfile já está em andamento. Abortando duplicata.')
      return
    }

    isFetchingProfile.value = true

    try {
      console.time('fetchUserProfile')
    } catch {}

    console.log('[Store] Iniciando busca de perfil no NestJS...')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Sessão perdida antes do fetch.')
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error('401 Unauthorized')
        throw new Error('Falha API: ' + response.statusText)
      }

      const responseBody = await response.json()
      const userData = responseBody.user

      if (!userData) throw new Error('Dados de usuário vazios.')

      user.value = {
        id: userData.userId,
        email: userData.email,
        nome: userData.nome,
        tipo: userData.tipo,
        phone: userData.phone || '',
        cpf: userData.cpf || '',
        birthDate: userData.birthDate || '',
        addresses: userData.addresses || [],
      } as UserProfile

      isAuthenticated.value = true
      firstName.value = user.value.nome.split(' ')[0]
      console.log('[Store] Perfil carregado com sucesso!')
    } catch (error) {
      console.error('[Store] Erro fetchUserProfile:', error)
      forceLogout()
    } finally {
      isFetchingProfile.value = false
      try {
        console.timeEnd('fetchUserProfile')
      } catch {}
    }
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

  async function updateProfile(payload: any) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Erro ao atualizar')

    const resJson = await response.json()
    await fetchUserProfile(user.value!.id)
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
    isLoading.value = true
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Erro no signout do supabase', e)
    } finally {
      resetState()
      isLoading.value = false
      router.push('/')
    }
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
    console.log('[Store] loadUserSession chamado')

    if (isAuthenticated.value && user.value) {
      console.log('[Store] Sessão já carregada na memória. Pulando.')
      isLoading.value = false
      return
    }

    const params = new URLSearchParams(window.location.search)
    const isSocialLoginCallback =
      (window.location.hash && window.location.hash.includes('access_token')) || params.has('code')

    isLoading.value = true

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) throw error

      if (session) {
        console.log('[Store] Sessão Supabase encontrada. Buscando dados...')

        await fetchUserProfile(session.user.id)

        if (user.value) {
          await checkCartTransfer()
        }

        isLoading.value = false
      } else {
        if (isSocialLoginCallback) {
          console.log(
            '[Store] Callback Social detectado. Mantendo Loading true enquanto o Supabase processa...',
          )
        } else {
          user.value = null
          isAuthenticated.value = false
          isLoading.value = false
        }
      }
    } catch (error) {
      console.error('[Store] Erro crítico na sessão:', error)
      forceLogout()
    }
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      console.log(`[Supabase Auth Event] ${event}`)

      if (!user.value && !isFetchingProfile.value) {
        console.log('[Auth Change] Login detectado e memória vazia. Iniciando fetch...')
        try {
          await fetchUserProfile(session.user.id)
          if (user.value) await checkCartTransfer()
        } catch (e) {
          console.error(e)
        } finally {
          console.log('[Auth Change] Finalizado.')
          isLoading.value = false
        }
      } else {
        console.log('[Auth Change] Ignorado: Usuário já carregado ou busca em andamento.')
      }
    } else if (event === 'SIGNED_OUT') {
      console.log(`[Supabase Auth Event] ${event}`)
      user.value = null
      isAuthenticated.value = false
      firstName.value = 'Meu Perfil'
      isLoading.value = false
      router.push('/login')
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
    updateProfile,
    supabase,
  }
})
