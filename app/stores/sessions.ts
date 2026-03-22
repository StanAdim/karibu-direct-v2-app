import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  PaginatedResponse,
  Session,
  SessionCreateInput,
  SessionFilters,
  SessionUpdateInput
} from '~/types'
import { useApi } from '~/composables/useApi'
import { unwrapList, unwrapResource } from '~/utils/unwrapApiResource'

interface SessionsState {
  pagination: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
  filters: SessionFilters
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])
  const sessionById = ref<Record<string, Session>>({})
  /** Server order per event (ids), for cache separation without losing order */
  const eventSessionIds = ref<Record<string, string[]>>({})
  const currentSession = ref<Session | null>(null)

  const loadingList = ref(false)
  const loadingDetail = ref(false)
  const loadingWrite = ref(false)

  const loading = computed(() => loadingList.value || loadingDetail.value || loadingWrite.value)

  const pagination = ref<SessionsState['pagination']>({
    total: 0,
    page: 1,
    per_page: 20,
    last_page: 1
  })
  const filters = ref<SessionFilters>({} as SessionFilters)
  const api = useApi()
  let fetchEventSessionsSeq = 0

  function mergeSessions(list: Session[]): void {
    const next = { ...sessionById.value }
    for (const s of list) {
      next[s.id] = s
    }
    sessionById.value = next
  }

  function setEventSessions(eventId: string, list: Session[]): void {
    const ids = list.map(s => s.id)
    eventSessionIds.value = { ...eventSessionIds.value, [eventId]: ids }
    mergeSessions(list)
  }

  function getEventSessionsFromCache(eventId: string): Session[] {
    const ids = eventSessionIds.value[eventId] ?? []
    return ids.map(id => sessionById.value[id]).filter(Boolean) as Session[]
  }

  const sessionsByDate = computed<Record<string, Session[]>>(() => {
    const grouped: Record<string, Session[]> = {}

    sessions.value.forEach(session => {
      const date = new Date(session.start_time).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })

    Object.keys(grouped).forEach(date => {
      const bucket = grouped[date]
      if (!bucket) return
      bucket.sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    })

    return grouped
  })

  const sessionsByTrack = computed<Record<string, Session[]>>(() => {
    const grouped: Record<string, Session[]> = {}

    sessions.value.forEach(session => {
      const track = session.track || 'General'
      if (!grouped[track]) {
        grouped[track] = []
      }
      grouped[track].push(session)
    })

    return grouped
  })

  const upcomingSessions = computed<Session[]>(() => {
    const now = new Date()
    return sessions.value.filter(session =>
      new Date(session.start_time) > now && session.status === 'scheduled'
    )
  })

  const liveSessions = computed<Session[]>(() => {
    const now = new Date()
    return sessions.value.filter(session => {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time)
      return now >= start && now <= end && session.status === 'scheduled'
    })
  })

  const fetchSessions = async (sessionFilters?: SessionFilters): Promise<void> => {
    filters.value = sessionFilters || ({} as SessionFilters)

    if (sessionFilters?.event_id) {
      await fetchEventSessions(sessionFilters.event_id, sessionFilters)
      return
    }

    loadingList.value = true

    try {
      const safePage = toFiniteNumber(pagination.value.page, 1)
      const safePerPage = toFiniteNumber(pagination.value.per_page, 20)

      const params = new URLSearchParams()
      params.append('page', String(safePage))
      params.append('per_page', String(safePerPage))

      if (sessionFilters?.type) params.append('type', sessionFilters.type)
      if (sessionFilters?.track) params.append('track', sessionFilters.track)
      if (sessionFilters?.level) params.append('level', sessionFilters.level)
      if (sessionFilters?.speaker_id) params.append('speaker_id', sessionFilters.speaker_id)
      if (sessionFilters?.date) params.append('date', sessionFilters.date)
      if (sessionFilters?.search) params.append('search', sessionFilters.search)

      const raw = await api.get<unknown>(`/sessions?${params.toString()}`)
      const { data, meta } = unwrapList<Session>(raw)

      sessions.value = data
      mergeSessions(data)

      if (meta) {
        const m = meta as PaginatedResponse<Session>['meta'] & {
          current_page?: number
          perPage?: number
          lastPage?: number
        }
        pagination.value = {
          total: toFiniteNumber(m.total, pagination.value.total),
          page: toFiniteNumber(m.page ?? m.current_page, safePage),
          per_page: toFiniteNumber(m.per_page ?? m.perPage, safePerPage),
          last_page: toFiniteNumber(m.last_page ?? m.lastPage, 1)
        }
      }
      else {
        pagination.value = {
          total: data.length,
          page: 1,
          per_page: data.length || safePerPage,
          last_page: 1
        }
      }
    }
    finally {
      loadingList.value = false
    }
  }

  const fetchSession = async (id: string): Promise<Session | null> => {
    loadingDetail.value = true

    try {
      const raw = await api.get<unknown>(`/sessions/${id}`)
      const session = unwrapResource<Session>(raw)
      sessionById.value = { ...sessionById.value, [session.id]: session }
      currentSession.value = session
      return session
    }
    catch {
      currentSession.value = null
      return null
    }
    finally {
      loadingDetail.value = false
    }
  }

  const fetchEventSessions = async (
    eventId: string,
    listFilters?: SessionFilters
  ): Promise<Session[]> => {
    const seq = ++fetchEventSessionsSeq
    loadingList.value = true

    try {
      const safePage = toFiniteNumber(pagination.value.page, 1)
      const safePerPage = toFiniteNumber(pagination.value.per_page, 20)

      const params = new URLSearchParams()
      params.append('page', String(safePage))
      params.append('per_page', String(safePerPage))

      const f = listFilters
      if (f?.type) params.append('type', f.type)
      if (f?.track) params.append('track', f.track)
      if (f?.level) params.append('level', f.level)
      if (f?.speaker_id) params.append('speaker_id', f.speaker_id)
      if (f?.date) params.append('date', f.date)
      if (f?.search) params.append('search', f.search)

      const raw = await api.get<unknown>(`/sessions/event/${eventId}?${params.toString()}`)
      const { data, meta } = unwrapList<Session>(raw)

      if (seq !== fetchEventSessionsSeq) {
        return getEventSessionsFromCache(eventId)
      }

      sessions.value = data
      setEventSessions(eventId, data)

      if (meta) {
        const m = meta as PaginatedResponse<Session>['meta'] & {
          current_page?: number
          perPage?: number
          lastPage?: number
        }
        pagination.value = {
          total: toFiniteNumber(m.total, pagination.value.total),
          page: toFiniteNumber(m.page ?? m.current_page, safePage),
          per_page: toFiniteNumber(m.per_page ?? m.perPage, safePerPage),
          last_page: toFiniteNumber(m.last_page ?? m.lastPage, 1)
        }
      }
      else {
        pagination.value = {
          total: data.length,
          page: 1,
          per_page: data.length || safePerPage,
          last_page: 1
        }
      }

      return data
    }
    finally {
      if (seq === fetchEventSessionsSeq) {
        loadingList.value = false
      }
    }
  }

  const createSession = async (input: SessionCreateInput): Promise<Session> => {
    loadingWrite.value = true

    try {
      const raw = await api.post<unknown>('/sessions/', input)
      const session = unwrapResource<Session>(raw)

      sessionById.value = { ...sessionById.value, [session.id]: session }

      const evId = input.event_id
      const existingIds = eventSessionIds.value[evId] ?? []
      if (!existingIds.includes(session.id)) {
        eventSessionIds.value = {
          ...eventSessionIds.value,
          [evId]: [...existingIds, session.id]
        }
      }

      sessions.value = [...sessions.value, session]
      return session
    }
    finally {
      loadingWrite.value = false
    }
  }

  const updateSession = async (id: string, input: SessionUpdateInput): Promise<Session> => {
    loadingWrite.value = true

    try {
      const raw = await api.put<unknown>(`/sessions/${id}`, input)
      const session = unwrapResource<Session>(raw)

      sessionById.value = { ...sessionById.value, [session.id]: session }

      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value = sessions.value.map(s => (s.id === id ? session : s))
      }

      if (currentSession.value?.id === id) {
        currentSession.value = session
      }

      return session
    }
    finally {
      loadingWrite.value = false
    }
  }

  const deleteSession = async (id: string): Promise<void> => {
    loadingWrite.value = true

    try {
      await api.delete(`/sessions/${id}`)

      const { [id]: _removed, ...rest } = sessionById.value
      sessionById.value = rest

      sessions.value = sessions.value.filter(s => s.id !== id)

      for (const evId of Object.keys(eventSessionIds.value)) {
        const ids = (eventSessionIds.value[evId] ?? []).filter(x => x !== id)
        eventSessionIds.value = { ...eventSessionIds.value, [evId]: ids }
      }

      if (currentSession.value?.id === id) {
        currentSession.value = null
      }
    }
    finally {
      loadingWrite.value = false
    }
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const clearCurrentSession = (): void => {
    currentSession.value = null
  }

  const clearFilters = (): void => {
    filters.value = {} as SessionFilters
    pagination.value.page = 1
  }

  return {
    sessions,
    sessionById,
    eventSessionIds,
    currentSession,
    loadingList,
    loadingDetail,
    loadingWrite,
    loading,
    pagination,
    filters,
    sessionsByDate,
    sessionsByTrack,
    upcomingSessions,
    liveSessions,
    getEventSessionsFromCache,
    fetchSessions,
    fetchSession,
    fetchEventSessions,
    createSession,
    updateSession,
    deleteSession,
    setPage,
    clearCurrentSession,
    clearFilters
  }
})
