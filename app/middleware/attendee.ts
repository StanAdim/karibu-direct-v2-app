export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
      console.log(`Lost authentication returned from auth store`)
    return navigateTo('/login', { replace: true })
  }

  const primaryRole = authStore.user?.primary_role?.name
  if (primaryRole !== 'Admin' && primaryRole !== 'Organizer' && primaryRole !== 'Attendee') {
    const notifications = useNotifications()
    notifications.error({
      title: 'Access Denied',
      description: 'You do not have permission to access this area.'
    })

    return navigateTo('/', { replace: true })
  }
})
