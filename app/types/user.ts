export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  roles?: UserRole[]
  status: UserStatus
  organizationId?: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
}

export type UserRole = 'Admin' | 'Organizer' | 'Attendee'

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface UserProfile extends Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'avatar' | 'phone'> {
  permissions?: string[]
  organization?: Organization
}

export interface Organization {
  id: string
  name: string
  logo?: string
  description?: string
  website?: string
  contactEmail?: string
  createdAt: string
  updatedAt: string
}

export interface UserCreateInput {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
}

export interface UserUpdateInput {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  status?: UserStatus
}

export function getFullName(user: Pick<User, 'firstName' | 'lastName'> | null | undefined): string {
  if (!user) return 'Attendee'
  const first = user.firstName ?? ''
  const last = user.lastName ?? ''
  const name = `${first} ${last}`.trim()
  return name || 'Attendee'
}

export function getUserInitials(user: Pick<User, 'firstName' | 'lastName'> | null | undefined): string {
  if (!user) return 'A'
  const first = (user.firstName ?? '').charAt(0)
  const last = (user.lastName ?? '').charAt(0)
  const initials = `${first}${last}`.toUpperCase()
  return initials || 'A'
}
