import { getEffectiveToken, isTokenExpired } from '~/utils/jwt'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/events']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const token = getEffectiveToken()

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    to.path === route || (route !== '/' && to.path.startsWith(`${route}/`))
  )

  if (isPublicRoute) {
    if (token && !isTokenExpired(token) && !authStore.user) {
      await authStore.fetchUser()
    }

    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      const redirectPath = getDefaultRouteForRoles(authStore.user?.roles)
      return navigateTo(redirectPath, { replace: true })
    }

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

function getDefaultRouteForRoles(roles?: string[]): string {
  const primaryRole = roles?.[0]
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
