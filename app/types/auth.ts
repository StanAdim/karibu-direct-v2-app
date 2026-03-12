import type { User } from './user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

export interface RefreshTokenResponse {
  token: string
  expiresAt: number
}
