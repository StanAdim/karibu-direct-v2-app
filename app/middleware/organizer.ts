export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const allowedRoles = ['Admin', 'Organizer']

  const userRoles = authStore.user?.roles || []
  if (userRoles.length === 0 || !userRoles.some(role => allowedRoles.includes(role))) {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access the organizer area.'
    })

    const redirectPath = getDefaultRouteForRoles(authStore.user?.roles)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRoles(roles?: string[]): string {
  const primaryRole = roles?.[0]
  switch (primaryRole) {
    case 'Admin':
      return '/admin'
    case 'Attendee':
      return '/attendee'
    default:
      return '/'
  }
}
