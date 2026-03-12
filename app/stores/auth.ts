import { defineStore } from 'pinia'
import type {
  AuthState,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
  UserRole
} from '~/types'
import { getAuthCookie, isTokenExpired, removeAuthCookie, setAuthCookie } from '~/utils/jwt'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      if (!state.token) return false
      return !isTokenExpired(state.token)
    },

    currentUser: (state): User | null => state.user,

    userRole: (state): UserRole | null => state.user?.role ?? null,

    isAdmin: (state): boolean => state.user?.role === 'admin',

    isOrganizer: (state): boolean => state.user?.role === 'organizer',

    isAttendee: (state): boolean => state.user?.role === 'attendee',

    hasRole: (state) => (roles: UserRole[]): boolean => {
      if (!state.user?.role) return false
      return roles.includes(state.user.role)
    }
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
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

    async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<RegisterResponse>(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          body: {
            email: credentials.email,
            password: credentials.password,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            phone: credentials.phone,
            role: credentials.role || 'attendee'
          }
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
        this.clearAuth()
        return null
      }

      this.loading = true
      this.token = token

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.user = user
        return user
      }
      catch {
        this.clearAuth()
        return null
      }
      finally {
        this.loading = false
      }
    },

    logout(): void {
      this.clearAuth()
      navigateTo('/login')
    },

    clearAuth(): void {
      this.user = null
      this.token = null
      removeAuthCookie()
    },

    async initAuth(): Promise<void> {
      if (this.initialized) return

      const token = getAuthCookie()
      if (token && !isTokenExpired(token)) {
        this.token = token
        await this.fetchUser()
      }

      this.initialized = true
    },

    setToken(token: string): void {
      this.token = token
      setAuthCookie(token)
    },

    setUser(user: User): void {
      this.user = user
    },

    getDefaultRoute(): string {
      switch (this.user?.role) {
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
  }
})
