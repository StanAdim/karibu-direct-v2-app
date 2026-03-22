export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  status_code: number
  message: string
  data?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
}

export interface NormalizedAppError {
  message: string
  code?: number
}

export interface ApiRetryOptions {
  /** Total attempts including the first try (e.g. 3 = 1 initial + 2 retries). */
  attempts: number
  delayMs?: number
}

export interface ApiRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  body?: unknown
  suppressErrorToast?: boolean
  /** Optional retries for flaky mutations (check-in, scans, payments). */
  retry?: ApiRetryOptions
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
