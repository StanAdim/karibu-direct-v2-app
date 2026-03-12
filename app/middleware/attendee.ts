export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const allowedRoles = ['admin', 'organizer', 'attendee']

  if (!authStore.user?.role || !allowedRoles.includes(authStore.user.role)) {
    const toast = useToast()
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to access this area.',
      color: 'error'
    })

    return navigateTo('/', { replace: true })
  }
})
