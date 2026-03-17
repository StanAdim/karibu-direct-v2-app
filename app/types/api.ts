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

export interface ApiRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  body?: unknown
  suppressErrorToast?: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
