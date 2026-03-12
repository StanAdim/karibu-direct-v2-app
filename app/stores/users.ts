import { defineStore } from 'pinia'
import type {
  PaginatedResponse,
  User,
  UserCreateInput,
  UserRole,
  UserStatus,
  UserUpdateInput
} from '~/types'

interface UsersState {
  users: User[]
  currentUser: User | null
  loading: boolean
  pagination: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
  filters: {
    role?: UserRole
    status?: UserStatus
    search?: string
  }
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      perPage: 10,
      lastPage: 1
    },
    filters: {}
  }),

  getters: {
    admins: (state): User[] => {
      return state.users.filter(user => user.role === 'admin')
    },

    organizers: (state): User[] => {
      return state.users.filter(user => user.role === 'organizer')
    },

    attendees: (state): User[] => {
      return state.users.filter(user => user.role === 'attendee')
    },

    activeUsers: (state): User[] => {
      return state.users.filter(user => user.status === 'active')
    },

    hasMorePages: (state): boolean => {
      return state.pagination.page < state.pagination.lastPage
    }
  },

  actions: {
    async fetchUsers(filters?: { role?: UserRole; status?: UserStatus; search?: string }): Promise<void> {
      this.loading = true
      this.filters = filters || {}

      try {
        const config = useRuntimeConfig()
        const params = new URLSearchParams()

        params.append('page', String(this.pagination.page))
        params.append('perPage', String(this.pagination.perPage))

        if (filters?.role) params.append('role', filters.role)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.search) params.append('search', filters.search)

        const response = await $fetch<PaginatedResponse<User>>(
          `${config.public.apiBase}/users?${params.toString()}`,
          {
            headers: getAuthHeaders()
          }
        )

        this.users = response.data
        this.pagination = response.meta
      }
      finally {
        this.loading = false
      }
    },

    async fetchUser(id: string): Promise<User | null> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiBase}/users/${id}`, {
          headers: getAuthHeaders()
        })

        this.currentUser = user
        return user
      }
      catch {
        this.currentUser = null
        return null
      }
      finally {
        this.loading = false
      }
    },

    async createUser(input: UserCreateInput): Promise<User> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiBase}/users`, {
          method: 'POST',
          body: input,
          headers: getAuthHeaders()
        })

        this.users.unshift(user)
        return user
      }
      finally {
        this.loading = false
      }
    },

    async updateUser(id: string, input: UserUpdateInput): Promise<User> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiBase}/users/${id}`, {
          method: 'PATCH',
          body: input,
          headers: getAuthHeaders()
        })

        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = user
        }

        if (this.currentUser?.id === id) {
          this.currentUser = user
        }

        return user
      }
      finally {
        this.loading = false
      }
    },

    async deleteUser(id: string): Promise<void> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        await $fetch(`${config.public.apiBase}/users/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        this.users = this.users.filter(u => u.id !== id)

        if (this.currentUser?.id === id) {
          this.currentUser = null
        }
      }
      finally {
        this.loading = false
      }
    },

    async suspendUser(id: string): Promise<User> {
      return this.updateUser(id, { status: 'suspended' })
    },

    async activateUser(id: string): Promise<User> {
      return this.updateUser(id, { status: 'active' })
    },

    setPage(page: number): void {
      this.pagination.page = page
    },

    setPerPage(perPage: number): void {
      this.pagination.perPage = perPage
      this.pagination.page = 1
    },

    clearCurrentUser(): void {
      this.currentUser = null
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    }
  }
})

function getAuthHeaders(): Record<string, string> {
  const authStore = useAuthStore()
  const headers: Record<string, string> = {}

  if (authStore.token) {
    headers.Authorization = `Bearer ${authStore.token}`
  }

  return headers
}
