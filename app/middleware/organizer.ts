export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const primaryRole = authStore.user?.primary_role?.name
  if (primaryRole !== 'Admin' && primaryRole !== 'Organizer') {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access the organizer area.'
    })

    const redirectPath = getDefaultRouteForRole(primaryRole)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRole(primaryRole?: string): string {
  switch (primaryRole) {
    case 'Admin':
      return '/admin'
    case 'Attendee':
      return '/attendee'
    default:
      return '/'
  }
}
