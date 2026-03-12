export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login', { replace: true })
  }

  const allowedRoles = ['admin', 'organizer']

  if (!authStore.user?.role || !allowedRoles.includes(authStore.user.role)) {
    const toast = useToast()
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to access the organizer area.',
      color: 'error'
    })

    const redirectPath = getDefaultRouteForRole(authStore.user?.role)
    return navigateTo(redirectPath, { replace: true })
  }
})

function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'attendee':
      return '/attendee'
    default:
      return '/'
  }
}
