import { defineStore } from 'pinia'
import type { AuthState, LoginCredentials, LoginResponse, User } from '~/types'
import { getAuthCookie, isTokenExpired, removeAuthCookie, setAuthCookie } from '~/utils/jwt'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      if (!state.token) return false
      return !isTokenExpired(state.token)
    },

    currentUser: (state): User | null => state.user,

    userRole: (state): string | null => state.user?.role ?? null
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
          method: 'POST',
          body: credentials
        })

        this.token = response.token
        this.user = response.user
        setAuthCookie(response.token)

        return response
      }
      finally {
        this.loading = false
      }
    },

    async fetchUser(): Promise<User | null> {
      const token = this.token || getAuthCookie()
      if (!token || isTokenExpired(token)) {
        this.logout()
        return null
      }

      this.loading = true
      this.token = token

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiBase}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.user = user
        return user
      }
      catch {
        this.logout()
        return null
      }
      finally {
        this.loading = false
      }
    },

    logout(): void {
      this.user = null
      this.token = null
      removeAuthCookie()
      navigateTo('/login')
    },

    async initAuth(): Promise<void> {
      const token = getAuthCookie()
      if (token && !isTokenExpired(token)) {
        this.token = token
        await this.fetchUser()
      }
    },

    setToken(token: string): void {
      this.token = token
      setAuthCookie(token)
    },

    setUser(user: User): void {
      this.user = user
    }
  }
})
