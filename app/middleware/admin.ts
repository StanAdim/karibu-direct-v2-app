export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const primaryRole = authStore.user?.primary_role?.name
  if (primaryRole !== 'Admin') {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access the admin area.'
    })

    const redirectPath = getDefaultRouteForRole(primaryRole)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRole(primaryRole?: string): string {
  switch (primaryRole) {
    case 'Organizer':
      return '/organizer'
    case 'Attendee':
      return '/attendee'
    default:
      return '/'
  }
}
