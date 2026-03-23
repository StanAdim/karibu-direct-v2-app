import type { UserRole } from '~/types'

/** Maps UI role names to API `role_id` for `POST /users/{id}/roles/{role_id}`. Configure via NUXT_PUBLIC_ROLE_ID_* env. */
export function usePlatformRoleIds(): Record<UserRole, string> {
  const config = useRuntimeConfig()
  return {
    Admin: String(config.public.roleIdAdmin ?? ''),
    Organizer: String(config.public.roleIdOrganizer ?? ''),
    Attendee: String(config.public.roleIdAttendee ?? '')
  }
}
