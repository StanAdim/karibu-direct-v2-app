export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
    console.log(`++++ Attendees Layout`)

  if (!authStore.isAuthenticated) {
      console.log(`Lost authentication returned from auth store`)
    return navigateTo('/login', { replace: true })
  }

  const allowedRoles = ['Admin', 'Organizer', 'Attendee']

  const userRoles = authStore.user?.roles || []
    console.log('userRoles:', userRoles)
  if (userRoles.length === 0 || !userRoles.some(role => allowedRoles.includes(role))) {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access this area.'
    })

    return navigateTo('/', { replace: true })
  }
})
