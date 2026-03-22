import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AttendanceRecord,
  NormalizedAppError,
  QrCheckInPayload,
  SessionAttendanceStats
} from '~/types'
import { useApi } from '~/composables/useApi'
import { normalizeFetchError } from '~/utils/normalizeFetchError'
import { unwrapList, unwrapResource } from '~/utils/unwrapApiResource'

interface CacheEntry<T> {
  value: T
  fetchedAt: number
}

const DEFAULT_STATS_TTL_MS = 60_000

export const useAttendanceStore = defineStore('attendance', () => {
  const api = useApi()

  const eventAttendance = ref<AttendanceRecord[]>([])
  const sessionAttendance = ref<AttendanceRecord[]>([])
  const sessionStats = ref<SessionAttendanceStats | null>(null)

  const statsCache = ref<Record<string, CacheEntry<SessionAttendanceStats>>>({})

  const loadingEvent = ref(false)
  const loadingSession = ref(false)
  const loadingStats = ref(false)
  const loadingCheckIn = ref(false)

  const error = ref<NormalizedAppError | null>(null)

  let eventPollTimer: ReturnType<typeof setInterval> | null = null
  let sessionPollTimer: ReturnType<typeof setInterval> | null = null

  const loading = computed(
    () => loadingEvent.value || loadingSession.value || loadingStats.value || loadingCheckIn.value
  )

  function setError(err: unknown | null): void {
    error.value = err ? normalizeFetchError(err) : null
  }

  function stopEventPolling(): void {
    if (eventPollTimer) {
      clearInterval(eventPollTimer)
      eventPollTimer = null
    }
  }

  function stopSessionPolling(): void {
    if (sessionPollTimer) {
      clearInterval(sessionPollTimer)
      sessionPollTimer = null
    }
  }

  function stopAllPolling(): void {
    stopEventPolling()
    stopSessionPolling()
  }

  async function qrCheckIn(payload: QrCheckInPayload): Promise<unknown> {
    loadingCheckIn.value = true
    setError(null)
    try {
      return await api.post<unknown>('/attendance/checkin', payload, {
        retry: { attempts: 3, delayMs: 400 }
      })
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingCheckIn.value = false
    }
  }

  async function fetchEventAttendance(
    eventId: string,
    opts?: { silent?: boolean }
  ): Promise<AttendanceRecord[]> {
    if (!opts?.silent) {
      loadingEvent.value = true
    }
    setError(null)
    try {
      const raw = await api.get<unknown>(`/attendance/event/${eventId}`, {
        suppressErrorToast: !!opts?.silent
      })
      const { data } = unwrapList<AttendanceRecord>(raw)
      eventAttendance.value = data
      return data
    }
    catch (e) {
      if (!opts?.silent) {
        setError(e)
      }
      throw e
    }
    finally {
      if (!opts?.silent) {
        loadingEvent.value = false
      }
    }
  }

  async function fetchSessionAttendance(
    sessionId: string,
    opts?: { silent?: boolean }
  ): Promise<AttendanceRecord[]> {
    if (!opts?.silent) {
      loadingSession.value = true
    }
    setError(null)
    try {
      const raw = await api.get<unknown>(`/attendance/session/${sessionId}`, {
        suppressErrorToast: !!opts?.silent
      })
      const { data } = unwrapList<AttendanceRecord>(raw)
      sessionAttendance.value = data
      return data
    }
    catch (e) {
      if (!opts?.silent) {
        setError(e)
      }
      throw e
    }
    finally {
      if (!opts?.silent) {
        loadingSession.value = false
      }
    }
  }

  async function fetchSessionStats(
    sessionId: string,
    opts?: { force?: boolean; ttlMs?: number }
  ): Promise<SessionAttendanceStats | null> {
    const ttl = opts?.ttlMs ?? DEFAULT_STATS_TTL_MS
    const cached = statsCache.value[sessionId]
    if (!opts?.force && cached && Date.now() - cached.fetchedAt < ttl) {
      sessionStats.value = cached.value
      return cached.value
    }

    loadingStats.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/attendance/session/${sessionId}/stats`)
      const stats = unwrapResource<SessionAttendanceStats>(raw)
      sessionStats.value = stats
      statsCache.value = {
        ...statsCache.value,
        [sessionId]: { value: stats, fetchedAt: Date.now() }
      }
      return stats
    }
    catch (e) {
      setError(e)
      sessionStats.value = null
      return null
    }
    finally {
      loadingStats.value = false
    }
  }

  function startEventAttendancePolling(eventId: string, intervalMs = 20_000): void {
    stopEventPolling()
    eventPollTimer = setInterval(() => {
      void fetchEventAttendance(eventId, { silent: true }).catch(() => {})
    }, intervalMs)
  }

  function startSessionAttendancePolling(sessionId: string, intervalMs = 20_000): void {
    stopSessionPolling()
    sessionPollTimer = setInterval(() => {
      void fetchSessionAttendance(sessionId, { silent: true }).catch(() => {})
    }, intervalMs)
  }

  function invalidateSessionStats(sessionId?: string): void {
    if (sessionId) {
      const { [sessionId]: _removed, ...rest } = statsCache.value
      statsCache.value = rest
      if (sessionStats.value?.session_id === sessionId) {
        sessionStats.value = null
      }
    }
    else {
      statsCache.value = {}
      sessionStats.value = null
    }
  }

  function clearScope(): void {
    stopAllPolling()
    eventAttendance.value = []
    sessionAttendance.value = []
    sessionStats.value = null
    setError(null)
  }

  return {
    eventAttendance,
    sessionAttendance,
    sessionStats,
    statsCache,
    loadingEvent,
    loadingSession,
    loadingStats,
    loadingCheckIn,
    loading,
    error,
    qrCheckIn,
    fetchEventAttendance,
    fetchSessionAttendance,
    fetchSessionStats,
    startEventAttendancePolling,
    startSessionAttendancePolling,
    stopEventPolling,
    stopSessionPolling,
    stopAllPolling,
    invalidateSessionStats,
    clearScope
  }
})
