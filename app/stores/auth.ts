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
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    loading.value = true

    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials)

      token.value = response.data.token
      user.value = response.data.user
      setAuthCookie(response.data.access_token)
      // console.log(`+++ user log.res:`, response.data)
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
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        phone: credentials.phone,
        role: credentials.role || 'Attendee'
      })
        console.log(`+++ user reg.res:`, response)
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
        // console.log(`+++ user current.res:`, fetchedUser)
      user.value = fetchedUser.data
      return fetchedUser.data
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
    const primaryRole = user.value?.roles?.[0]
      console.log(`+++ xsPrimary Role: ${primaryRole}`)
    switch (primaryRole) {
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
