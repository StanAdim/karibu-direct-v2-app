import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, User, UserRole } from '~/types'
import { getAuthCookie, isTokenExpired, removeAuthCookie, setAuthCookie } from '~/utils/jwt'
import { useApi } from '~/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  // States
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const api = useApi()

  // Getters
  const isAuthenticated = computed<boolean>(() => {
    if (!token.value) return false
    return !isTokenExpired(token.value)
  })

  const currentUser = computed<User | null>(() => user.value)

  const userRole = computed<UserRole | null>(() => user.value?.roles?.[0] ?? null)

  const isAdmin = computed<boolean>(() => user.value?.roles?.includes('Admin') ?? false)

  const isOrganizer = computed<boolean>(() => user.value?.roles?.includes('Organizer') ?? false)

  const isAttendee = computed<boolean>(() => user.value?.roles?.includes('Attendee') ?? false)

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user.value?.roles || user.value.roles.length === 0) return false
    return user.value.roles.some(r => roles.includes(r))
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<LoginResponse & { redirectPath: string }> => {
    loading.value = true

    try {
      const response = await api.post<LoginResponse | { data: LoginResponse }>('/auth/login', credentials)
      const data = (response as { data?: LoginResponse })?.data ?? (response as LoginResponse)

      const accessToken = data.access_token ?? data.token
      if (!accessToken) {
        throw new Error('No token in login response')
      }

      setAuthCookie(accessToken)
      token.value = accessToken

      if (data.user) {
        user.value = data.user
      }

      if (!user.value?.roles?.length && token.value) {
        const fetchedUser = await api.get<User>('/auth/me')
        const userData = (fetchedUser as { data?: User })?.data ?? (fetchedUser as User)
        user.value = userData
      }

      const redirectPath = getDefaultRoute()
      return { ...data, redirectPath }
    }
    finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    loading.value = true

    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        phone: credentials.phone,
        role: credentials.role || 'Attendee'
      })
      return response
    }
    finally {
      loading.value = false
    }
  }

  const clearAuth = (): void => {
    user.value = null
    token.value = null
    removeAuthCookie()
  }

  const fetchUser = async (): Promise<User | null> => {
    const existingToken = token.value || getAuthCookie()
    if (!existingToken || isTokenExpired(existingToken)) {
      clearAuth()
      return null
    }

    loading.value = true
    token.value = existingToken

    try {
      const fetchedUser = await api.get<User | { data: User }>('/auth/me')
      const userData = (fetchedUser as { data?: User })?.data ?? (fetchedUser as User)
      user.value = userData
      return userData
    }
    catch {
      clearAuth()
      return null
    }
    finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    clearAuth()
    navigateTo('/login')
  }

  const initAuth = async (): Promise<void> => {
    if (initialized.value) return

    const existingToken = getAuthCookie()
    if (existingToken && !isTokenExpired(existingToken)) {
      token.value = existingToken
      await fetchUser()
    }

    initialized.value = true
  }

  const setToken = (newToken: string): void => {
    token.value = newToken
    setAuthCookie(newToken)
  }

  const setUser = (newUser: User): void => {
    user.value = newUser
  }

  const getDefaultRoute = (): string => {
    const role = user.value?.roles?.[0]
    if (!role) return '/'
    switch (role) {
      case 'Admin':
        return '/admin'
      case 'Organizer':
        return '/organizer'
      case 'Attendee':
        return '/attendee'
      default:
        return '/'
    }
  }

  return {
    // State
    user,
    token,
    loading,
    initialized,

    // Getters
    isAuthenticated,
    currentUser,
    userRole,
    isAdmin,
    isOrganizer,
    isAttendee,
    hasRole,

    // Actions
    login,
    register,
    fetchUser,
    logout,
    clearAuth,
    initAuth,
    setToken,
    setUser,
    getDefaultRoute
  }
})
