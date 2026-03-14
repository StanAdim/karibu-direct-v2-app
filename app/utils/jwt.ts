import type { JwtPayload } from '~/types'

const TOKEN_COOKIE_NAME = 'auth_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  }
  catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

export function getTokenExpirationTime(token: string): number | null {
  const payload = parseJwt(token)
  return payload?.exp ?? null
}

export function setAuthCookie(token: string): void {
  const cookie = useCookie(TOKEN_COOKIE_NAME, {
    maxAge: TOKEN_MAX_AGE,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/'
  })
  cookie.value = token
}

export function getAuthCookie(): string | null {
  const cookie = useCookie<string | null>(TOKEN_COOKIE_NAME)
  return cookie.value
}

export function removeAuthCookie(): void {
  const cookie = useCookie(TOKEN_COOKIE_NAME)
  cookie.value = null
}

export function getTokenCookieName(): string {
  return TOKEN_COOKIE_NAME
}

/**
 * Token to use for auth checks: cookie first, then store (so post-login redirect
 * works before cookie is visible in the same tick).
 */
export function getEffectiveToken(): string | null {
  const authStore = useAuthStore()
  let token = getAuthCookie()
  if (!token && authStore.token && !isTokenExpired(authStore.token)) {
    setAuthCookie(authStore.token)
    token = authStore.token
  }
  return token
}
