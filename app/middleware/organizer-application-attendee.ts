/**
 * Attendee organizer-application routes: full organizers use the organizer console instead.
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return

  if (authStore.user?.primary_role?.name === 'Organizer') {
    return navigateTo('/organizer/dashboard', { replace: true })
  }
})
