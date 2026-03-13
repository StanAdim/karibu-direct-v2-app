import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  PaginatedResponse,
  User,
  UserCreateInput,
  UserRole,
  UserStatus,
  UserUpdateInput
} from '~/types'
import { useApi } from '~/composables/useApi'

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

export const useUsersStore = defineStore('users', () => {
  // States
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const pagination = ref<UsersState['pagination']>({
    total: 0,
    page: 1,
    perPage: 10,
    lastPage: 1
  })
  const filters = ref<UsersState['filters']>({})
  const api = useApi()

  // Getters
  const admins = computed<User[]>(() => {
    return users.value.filter(user => user.roles?.includes('Admin'))
  })

  const organizers = computed<User[]>(() => {
    return users.value.filter(user => user.roles?.includes('Organizer'))
  })

  const attendees = computed<User[]>(() => {
    return users.value.filter(user => user.roles?.includes('Attendee'))
  })

  const activeUsers = computed<User[]>(() => {
    return users.value.filter(user => user.status === 'active')
  })

  const hasMorePages = computed<boolean>(() => {
    return pagination.value.page < pagination.value.lastPage
  })

  // Actions
  const fetchUsers = async (userFilters?: { role?: UserRole; status?: UserStatus; search?: string }): Promise<void> => {
    loading.value = true
    filters.value = userFilters || {}

    try {
      const params = new URLSearchParams()

      params.append('page', String(pagination.value.page))
      params.append('perPage', String(pagination.value.perPage))

      if (userFilters?.role) params.append('role', userFilters.role)
      if (userFilters?.status) params.append('status', userFilters.status)
      if (userFilters?.search) params.append('search', userFilters.search)

      const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`)

      users.value = response.data
      pagination.value = response.meta
    }
    finally {
      loading.value = false
    }
  }

  const fetchUser = async (id: string): Promise<User | null> => {
    loading.value = true

    try {
      const user = await api.get<User>(`/users/${id}`)

      currentUser.value = user
      return user
    }
    catch {
      currentUser.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  const createUser = async (input: UserCreateInput): Promise<User> => {
    loading.value = true

    try {
      const user = await api.post<User>('/users', input)

      users.value.unshift(user)
      return user
    }
    finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, input: UserUpdateInput): Promise<User> => {
    loading.value = true

    try {
      const user = await api.patch<User>(`/users/${id}`, input)

      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = user
      }

      if (currentUser.value?.id === id) {
        currentUser.value = user
      }

      return user
    }
    finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string): Promise<void> => {
    loading.value = true

    try {
      await api.delete(`/users/${id}`)

      users.value = users.value.filter(u => u.id !== id)

      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    }
    finally {
      loading.value = false
    }
  }

  const suspendUser = async (id: string): Promise<User> => {
    return updateUser(id, { status: 'suspended' })
  }

  const activateUser = async (id: string): Promise<User> => {
    return updateUser(id, { status: 'active' })
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const setPerPage = (perPage: number): void => {
    pagination.value.perPage = perPage
    pagination.value.page = 1
  }

  const clearCurrentUser = (): void => {
    currentUser.value = null
  }

  const clearFilters = (): void => {
    filters.value = {}
    pagination.value.page = 1
  }

  return {
    // State
    users,
    currentUser,
    loading,
    pagination,
    filters,

    // Getters
    admins,
    organizers,
    attendees,
    activeUsers,
    hasMorePages,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    setPage,
    setPerPage,
    clearCurrentUser,
    clearFilters
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
