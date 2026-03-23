import type { User, UserRole } from '~/types'

interface UseUserReturn {
  user: ComputedRef<User | null>
  userId: ComputedRef<string | null>
  userName: ComputedRef<string | null>
  userEmail: ComputedRef<string | null>
  userRole: ComputedRef<UserRole | null>
  userAvatar: ComputedRef<string | null>
  isAdmin: ComputedRef<boolean>
  isModerator: ComputedRef<boolean>
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export function useUser(): UseUserReturn {
  const authStore = useAuthStore()

  const user = computed(() => authStore.currentUser)
  const userId = computed(() => user.value?.id ?? null)
  const userName = computed(() => user.value?.name ?? null)
  const userEmail = computed(() => user.value?.email ?? null)
  const userRole = computed<UserRole | null>(() => {
    const roleName = user.value?.primary_role?.name
    if (roleName === 'Admin' || roleName === 'Organizer' || roleName === 'Attendee') {
      return roleName
    }
    return null
  })
  const userAvatar = computed(() => user.value?.avatar ?? null)

  const isAdmin = computed(() => userRole.value === 'Admin')
  const isModerator = computed(() => userRole.value === 'Organizer' || isAdmin.value)

  function hasRole(role: UserRole): boolean {
    return userRole.value === role
  }

  function hasAnyRole(roles: UserRole[]): boolean {
    if (!userRole.value) return false
    return roles.includes(userRole.value)
  }

  return {
    user,
    userId,
    userName,
    userEmail,
    userRole,
    userAvatar,
    isAdmin,
    isModerator,
    hasRole,
    hasAnyRole
  }
}
