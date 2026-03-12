import type { LoginCredentials, User } from '~/types'

interface UseAuthReturn {
  user: ComputedRef<User | null>
  isAuthenticated: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<User | null>
}

export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()
  const toast = useToast()

  const user = computed(() => authStore.currentUser)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const loading = computed(() => authStore.loading)

  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      await authStore.login(credentials)

      toast.add({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        color: 'success'
      })

      await navigateTo('/dashboard')
    }
    catch (error: unknown) {
      const fetchError = error as { message?: string }
      toast.add({
        title: 'Login Failed',
        description: fetchError.message || 'Invalid credentials',
        color: 'error'
      })
      throw error
    }
  }

  function logout(): void {
    authStore.logout()
    toast.add({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
      color: 'info'
    })
  }

  async function fetchUser(): Promise<User | null> {
    return authStore.fetchUser()
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    fetchUser
  }
}
