import type { JwtPayload } from '~/types'

const TOKEN_COOKIE_NAME = 'auth_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/** Use Secure cookies only over HTTPS so production builds work on http:// staging. */
function shouldUseSecureCookie(): boolean {
  if (import.meta.client && typeof window !== 'undefined') {
    return window.location.protocol === 'https:'
  }
  if (import.meta.server) {
    try {
      return useRequestURL().protocol === 'https:'
    }
    catch {
      return import.meta.env.PROD
    }
  }
  return import.meta.env.PROD
}

function authTokenCookieOptions() {
  return {
    maxAge: TOKEN_MAX_AGE,
    secure: shouldUseSecureCookie(),
    sameSite: 'lax' as const,
    path: '/'
  }
}

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
  const cookie = useCookie(TOKEN_COOKIE_NAME, authTokenCookieOptions())
  cookie.value = token
}

export function getAuthCookie(): string | null {
  const cookie = useCookie<string | null>(TOKEN_COOKIE_NAME, authTokenCookieOptions())
  return cookie.value
}

export function removeAuthCookie(): void {
  const cookie = useCookie(TOKEN_COOKIE_NAME, authTokenCookieOptions())
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
