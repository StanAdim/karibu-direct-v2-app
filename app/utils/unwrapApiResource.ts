import type { PaginatedResponse } from '~/types'

/** Backend may return a bare resource or `{ data: T }`. */
export function unwrapResource<T>(raw: unknown): T {
  return (raw as { data?: T })?.data ?? (raw as T)
}

export interface UnwrappedList<T> {
  data: T[]
  meta?: PaginatedResponse<T>['meta']
}

/**
 * Accepts a plain array, a paginated envelope, or `{ data: T[] }`.
 */
export function unwrapList<T>(raw: unknown): UnwrappedList<T> {
  if (Array.isArray(raw)) {
    return { data: raw as T[] }
  }

  const obj = raw as { data?: T[]; meta?: PaginatedResponse<T>['meta'] }
  if (obj?.data && Array.isArray(obj.data)) {
    return { data: obj.data, meta: obj.meta }
  }

  const paginated = raw as PaginatedResponse<T>
  if (paginated?.data && Array.isArray(paginated.data)) {
    return { data: paginated.data, meta: paginated.meta }
  }

  return { data: [] }
}
