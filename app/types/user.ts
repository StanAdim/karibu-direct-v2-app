export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  phone?: string
  primary_role?: PlatformRole
  roles?: UserRole[]
  status: UserStatus
  organization_id?: string
  permissions?: string[]
  created_at: string
  updated_at: string
}

export type UserRole = 'Admin' | 'Organizer' | 'Attendee'

/** Role row from `GET /api/v1/roles/` (assignable platform roles). */
export interface PlatformRole {
  id: string
  name: string
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface UserProfile extends Pick<User, 'id' | 'email' | 'first_name' | 'last_name' | 'avatar' | 'phone'> {
  permissions?: string[]
  organization?: Organization
}

export interface Organization {
  id: string
  name: string
  logo?: string
  description?: string
  website?: string
  contact_email?: string
  created_at: string
  updated_at: string
}

export interface UserCreateInput {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
}

export interface UserUpdateInput {
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  status?: UserStatus
}

export function getFullName(user: Pick<User, 'first_name' | 'last_name'> | null | undefined): string {
  if (!user) return 'Attendee'
  const first = user.first_name ?? ''
  const last = user.last_name ?? ''
  const name = `${first} ${last}`.trim()
  return name || 'Attendee'
}

export function getUserInitials(user: Pick<User, 'first_name' | 'last_name'> | null | undefined): string {
  if (!user) return 'A'
  const first = (user.first_name ?? '').charAt(0)
  const last = (user.last_name ?? '').charAt(0)
  const initials = `${first}${last}`.toUpperCase()
  return initials || 'A'
}
