export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'user' | 'moderator'

export interface UserProfile extends Pick<User, 'id' | 'email' | 'name' | 'avatar'> {
  permissions?: string[]
}
