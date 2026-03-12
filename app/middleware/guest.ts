import { getAuthCookie, isTokenExpired } from '~/utils/jwt'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const token = getAuthCookie()

  if (token && !isTokenExpired(token)) {
    return navigateTo('/dashboard', { replace: true })
  }
})
