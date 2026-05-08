import type { ApplicationStatus } from '~/types/organizer'

const POLL_MS = 25_000

export function useOrganizerApplication() {
  const store = useOrganizerApplicationStore()
  const authStore = useAuthStore()
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function stopPolling(): void {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function shouldPollStatus(status: ApplicationStatus | undefined): boolean {
    return status === 'PENDING' || status === 'UNDER_REVIEW'
  }

  /**
   * Poll `/organizer-applications/me` while status is awaiting review; refresh auth when approved.
   */
  function startApplicationStatusPolling(): void {
    if (!import.meta.client) return
    stopPolling()
    pollTimer = setInterval(async () => {
      try {
        const prev = store.application?.status
        await store.fetchMine()
        const next = store.application?.status
        if (prev !== 'APPROVED' && next === 'APPROVED') {
          await authStore.fetchUser()
          stopPolling()
        }
        if (next && !shouldPollStatus(next)) {
          stopPolling()
        }
      }
      catch {
        /* keep polling unless unauthenticated */
        if (!authStore.isAuthenticated) stopPolling()
      }
    }, POLL_MS)
  }

  onUnmounted(() => {
    stopPolling()
  })

  return {
    store,
    startApplicationStatusPolling,
    stopPolling,
    shouldPollStatus
  }
}
