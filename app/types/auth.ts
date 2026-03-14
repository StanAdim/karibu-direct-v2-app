import type { User, UserRole } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  phone?: string
  role?: UserRole
}

export interface LoginResponse {
  user: User
  token: string
  access_token: string
  refresh_token: string
  expires_at: number
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
  expires_at: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  confirm_password: string
}
