import { getAuthCookie, isTokenExpired } from '~/utils/jwt'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const token = getAuthCookie()

  if (!token || isTokenExpired(token)) {
    return navigateTo('/login', { replace: true })
  }

  if (!authStore.user && token) {
    await authStore.fetchUser()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }
})
