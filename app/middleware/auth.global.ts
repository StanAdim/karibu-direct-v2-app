import { getAuthCookie, isTokenExpired } from '~/utils/jwt'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const token = getAuthCookie()

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    to.path === route || to.path.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return
  }

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
