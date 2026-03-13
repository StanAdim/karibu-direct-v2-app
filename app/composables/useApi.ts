import type { ApiRequestOptions, HttpMethod } from '~/types'
import { getAuthCookie } from '~/utils/jwt'

interface UseApiReturn {
  get: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<T>
  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>
  delete: <T>(endpoint: string, options?: ApiRequestOptions) => Promise<T>
  request: <T>(method: HttpMethod, endpoint: string, options?: ApiRequestOptions) => Promise<T>
}

export function useApi(): UseApiReturn {
  const config = useRuntimeConfig()
  const notifications = useNotifications()

  async function request<T>(
    method: HttpMethod,
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = getAuthCookie()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await $fetch<T>(endpoint, {
        baseURL: config.public.apiBase,
        method,
        headers,
        body: options.body,
        params: options.params
      })

      return response
    }
    catch (error: unknown) {
      const fetchError = error as { statusCode?: number; message?: string; data?: unknown }

      const statusCode = fetchError.statusCode || 500
      const message = fetchError.message || 'An unexpected error occurred'

      if (statusCode === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      notifications.error({
        title: 'Error',
        description: message
      })

      throw error
    }
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
