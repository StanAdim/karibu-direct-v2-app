import type { NormalizedAppError } from '~/types'

/**
 * Maps $fetch / ofetch errors into a stable shape for stores and UI copy.
 */
export function normalizeFetchError(error: unknown): NormalizedAppError {
  const err = error as {
    statusCode?: number
    status?: number
    message?: string
    data?: { message?: string; detail?: string }
  }

  const code = err.statusCode ?? err.status
  const message =
    err.data?.message
    || err.data?.detail
    || err.message
    || 'Something went wrong. Please try again.'

  return { message, code }
}
