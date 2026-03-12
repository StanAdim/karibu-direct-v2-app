export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  if (authStore.user?.role !== 'admin') {
    const toast = useToast()
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to access the admin area.',
      color: 'error'
    })

    const redirectPath = getDefaultRouteForRole(authStore.user?.role)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case 'organizer':
      return '/organizer'
    case 'attendee':
      return '/attendee'
    default:
      return '/'
  }
}
