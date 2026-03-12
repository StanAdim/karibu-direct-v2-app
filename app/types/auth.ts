import type { User, UserRole } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  role?: UserRole
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: number
}

export interface RegisterResponse {
  user: User
  token: string
  message: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  initialized: boolean
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

export interface RefreshTokenResponse {
  token: string
  expiresAt: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  confirmPassword: string
}
