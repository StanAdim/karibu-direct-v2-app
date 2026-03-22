import type { ApiRequestOptions, HttpMethod } from '~/types'
import { getAuthCookie } from '~/utils/jwt'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface UseApiReturn {
  get: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<T>
  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  delete: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<T>
  request: <T>(method: HttpMethod, endpoint: string, options?: ApiRequestOptions) => Promise<T>
}

type BareFetch = (
  url: string,
  init?: {
    baseURL?: string
    method?: string
    headers?: Record<string, string>
    body?: unknown
    params?: Record<string, string | number | boolean>
  }
) => Promise<unknown>

export function useApi(): UseApiReturn {
  const config = useRuntimeConfig()
  const notifications = useNotifications()
  const bareFetch = $fetch as BareFetch

  async function request<T>(
    method: HttpMethod,
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = getAuthCookie()

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const attempts = Math.max(1, options.retry?.attempts ?? 1)
    const retryDelay = options.retry?.delayMs ?? 400
    let lastError: unknown

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = (await bareFetch(endpoint, {
          baseURL: config.public.apiBase,
          method,
          headers,
          body: options.body,
          params: options.params
        })) as T

        return response
      }
      catch (error: unknown) {
        lastError = error
        const fetchError = error as { statusCode?: number; message?: string; data?: unknown }

        const statusCode = fetchError.statusCode || 500
        const message = fetchError.message || 'An unexpected error occurred'

        const retryable = statusCode >= 500 || statusCode === 408 || statusCode === 429
        if (retryable && attempt < attempts) {
          await delay(retryDelay * attempt)
          continue
        }

        if (statusCode === 401) {
          const authStore = useAuthStore()
          authStore.logout()
        }

        if (!options.suppressErrorToast) {
          notifications.error({
            title: 'Error',
            description: message
          })
        }

        throw error
      }
    }

    throw lastError
  }

  return {
    get: <T>(endpoint: string, options?: ApiRequestOptions) =>
      request<T>('GET', endpoint, options),

    post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>('POST', endpoint, { ...options, body }),

    put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>('PUT', endpoint, { ...options, body }),

    patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>('PATCH', endpoint, { ...options, body }),

    delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
      request<T>('DELETE', endpoint, options),

    request
  }
}
