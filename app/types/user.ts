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

export function getFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function getUserInitials(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}
