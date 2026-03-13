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

  const userRole = computed<UserRole | null>(() => user.value?.role ?? null)

  const isAdmin = computed<boolean>(() => user.value?.role === 'admin')

  const isOrganizer = computed<boolean>(() => user.value?.role === 'organizer')

  const isAttendee = computed<boolean>(() => user.value?.role === 'attendee')

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user.value?.role) return false
    return roles.includes(user.value.role)
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    loading.value = true

    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials)

      token.value = response.token
      user.value = response.user
      setAuthCookie(response.token)

      return response
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
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        phone: credentials.phone,
        role: credentials.role || 'attendee'
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
      const fetchedUser = await api.get<User>('/auth/me')

      user.value = fetchedUser
      return fetchedUser
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
    switch (user.value?.role) {
      case 'admin':
        return '/admin'
      case 'organizer':
        return '/organizer'
      case 'attendee':
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
