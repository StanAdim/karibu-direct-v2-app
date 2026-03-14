import type { LoginCredentials, RegisterCredentials, User, UserRole } from '~/types'

interface UseAuthReturn {
  user: ComputedRef<User | null>
  isAuthenticated: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  isAdmin: ComputedRef<boolean>
  isOrganizer: ComputedRef<boolean>
  isAttendee: ComputedRef<boolean>
  hasRole: (roles: UserRole[]) => boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<User | null>
}

export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()
  const notifications = useNotifications()

  const user = computed(() => authStore.currentUser)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const loading = computed(() => authStore.loading)
  const isAdmin = computed(() => authStore.isAdmin)
  const isOrganizer = computed(() => authStore.isOrganizer)
  const isAttendee = computed(() => authStore.isAttendee)

  function hasRole(roles: UserRole[]): boolean {
    return authStore.hasRole(roles)
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      await authStore.login(credentials)
      const redirectPath = authStore.getDefaultRoute()
      await nextTick()
      await navigateTo(redirectPath, { replace: false })
    }
    catch (error: unknown) {
      const fetchError = error as { message?: string; data?: { message?: string } }
      notifications.error({
        title: 'Login Failed',
        description: fetchError.data?.message || fetchError.message || 'Invalid credentials'
      })
      throw error
    }
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    try {
      await authStore.register(credentials)

      notifications.success({
        title: 'Account created',
        description: 'Your account has been created successfully. Please log in to continue.'
      })

      await navigateTo('/login')
    }
    catch (error: unknown) {
      const fetchError = error as { message?: string; data?: { message?: string } }
      notifications.error({
        title: 'Registration Failed',
        description: fetchError.data?.message || fetchError.message || 'Unable to create account'
      })
      throw error
    }
  }

  function logout(): void {
    authStore.logout()
    notifications.info({
      title: 'Logged out',
      description: 'You have been logged out successfully.'
    })
  }

  async function fetchUser(): Promise<User | null> {
    return authStore.fetchUser()
  }

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isOrganizer,
    isAttendee,
    hasRole,
    login,
    register,
    logout,
    fetchUser
  }
}
