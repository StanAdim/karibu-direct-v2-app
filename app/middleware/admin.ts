export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const userRoles = authStore.user?.roles || []
  if (!userRoles.includes('Admin')) {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access the admin area.'
    })

    const redirectPath = getDefaultRouteForRoles(authStore.user?.roles)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRoles(roles?: string[]): string {
  const primaryRole = roles?.[0]
  switch (primaryRole) {
    case 'Organizer':
      return '/organizer'
    case 'Attendee':
      return '/attendee'
    default:
      return '/'
  }
}
