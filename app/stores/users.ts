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
    per_page: number
    last_page: number
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
    per_page: 10,
    last_page: 1
  })
  const filters = ref<UsersState['filters']>({})
  const api = useApi()

  // Getters
  const admins = computed<User[]>(() => {
    return users.value.filter(user => user.primary_role?.name === 'Admin')
  })

  const organizers = computed<User[]>(() => {
    return users.value.filter(user => user.primary_role?.name === 'Organizer')
  })

  const attendees = computed<User[]>(() => {
    return users.value.filter(user => user.primary_role?.name === 'Attendee')
  })

  const activeUsers = computed<User[]>(() => {
    return users.value.filter(user => user.status === 'active')
  })

  const hasMorePages = computed<boolean>(() => {
    return pagination.value.page < pagination.value.last_page
  })

  // Actions
  const fetchUsers = async (userFilters?: { role?: UserRole; status?: UserStatus; search?: string }): Promise<void> => {
    loading.value = true
    filters.value = userFilters || {}

    try {
      const toFiniteNumber = (value: unknown, fallback: number): number => {
        const num = typeof value === 'number' ? value : Number(value)
        return Number.isFinite(num) ? num : fallback
      }

      const safePage = toFiniteNumber(pagination.value.page, 1)
      const safePerPage = toFiniteNumber(pagination.value.per_page, 10)

      const params = new URLSearchParams()

      params.append('page', String(safePage))
      params.append('per_page', String(safePerPage))

      if (userFilters?.role) params.append('role', userFilters.role)
      if (userFilters?.status) params.append('status', userFilters.status)
      if (userFilters?.search) params.append('search', userFilters.search)

      const response = await api.get<PaginatedResponse<User>>(`/users/?${params.toString()}`)

      users.value = response.data
      const meta = response.meta as Record<string, unknown>
      pagination.value = {
        total: toFiniteNumber(meta?.total, pagination.value.total),
        page: toFiniteNumber(meta?.page ?? meta?.current_page, safePage),
        per_page: toFiniteNumber(meta?.per_page ?? meta?.perPage, safePerPage),
        last_page: toFiniteNumber(meta?.last_page ?? meta?.lastPage, 1)
      }
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

  const setPerPage = (per_page: number): void => {
    pagination.value.per_page = per_page
    pagination.value.page = 1
  }

  const clearCurrentUser = (): void => {
    currentUser.value = null
  }

  const clearFilters = (): void => {
    filters.value = {}
    pagination.value.page = 1
  }

  /**
   * Assigns a role via `POST /api/v1/users/{user_id}/roles/{role_id}`.
   * Refetches the user to update the local list (response shape may vary).
   */
  const assignUserRole = async (userId: string, roleId: string): Promise<User> => {
    await api.post(`/users/${userId}/roles/${roleId}`, undefined, { suppressErrorToast: true })
    const user = await api.get<User>(`/users/${userId}`, { suppressErrorToast: true })
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = user
    }
    if (currentUser.value?.id === userId) {
      currentUser.value = user
    }
    return user
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
    clearFilters,
    assignUserRole
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
