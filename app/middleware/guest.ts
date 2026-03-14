import { getEffectiveToken, isTokenExpired } from '~/utils/jwt'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const token = getEffectiveToken()

  if (token && !isTokenExpired(token)) {
    if (!authStore.user) {
      await authStore.fetchUser()
    }
    const redirectPath = authStore.getDefaultRoute()
    return navigateTo(redirectPath, { replace: true })
  }
})
