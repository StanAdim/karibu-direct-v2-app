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

interface SessionsState {
  sessions: Session[]
  currentSession: Session | null
  loading: boolean
  pagination: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
  filters: SessionFilters
}

export const useSessionsStore = defineStore('sessions', () => {
  // States
  const sessions = ref<Session[]>([])
  const currentSession = ref<Session | null>(null)
  const loading = ref(false)
  const pagination = ref<SessionsState['pagination']>({
    total: 0,
    page: 1,
    per_page: 20,
    last_page: 1
  })
  const filters = ref<SessionFilters>({} as SessionFilters)
  const api = useApi()

  // Getters
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
      grouped[date].sort((a, b) =>
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

  // Actions
  const fetchSessions = async (sessionFilters?: SessionFilters): Promise<void> => {
    loading.value = true
    filters.value = sessionFilters || ({} as SessionFilters)

    try {
      const params = new URLSearchParams()

      params.append('page', String(pagination.value.page))
      params.append('per_page', String(pagination.value.per_page))

      if (sessionFilters?.event_id) params.append('event_id', sessionFilters.event_id)
      if (sessionFilters?.type) params.append('type', sessionFilters.type)
      if (sessionFilters?.track) params.append('track', sessionFilters.track)
      if (sessionFilters?.level) params.append('level', sessionFilters.level)
      if (sessionFilters?.speaker_id) params.append('speaker_id', sessionFilters.speaker_id)
      if (sessionFilters?.date) params.append('date', sessionFilters.date)
      if (sessionFilters?.search) params.append('search', sessionFilters.search)

      const response = await api.get<PaginatedResponse<Session>>(`/sessions?${params.toString()}`)

      sessions.value = response.data
      pagination.value = response.meta
    }
    finally {
      loading.value = false
    }
  }

  const fetchSession = async (id: string): Promise<Session | null> => {
    loading.value = true

    try {
      const session = await api.get<Session>(`/sessions/${id}`)

      currentSession.value = session
      return session
    }
    catch {
      currentSession.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  const fetchEventSessions = async (eventId: string): Promise<Session[]> => {
    loading.value = true

    try {
      const response = await api.get<PaginatedResponse<Session>>(`/events/${eventId}/sessions`)

      sessions.value = response.data
      pagination.value = response.meta
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  const createSession = async (input: SessionCreateInput): Promise<Session> => {
    loading.value = true

    try {
      const session = await api.post<Session>('/sessions', input)

      sessions.value.push(session)
      return session
    }
    finally {
      loading.value = false
    }
  }

  const updateSession = async (id: string, input: SessionUpdateInput): Promise<Session> => {
    loading.value = true

    try {
      const session = await api.patch<Session>(`/sessions/${id}`, input)

      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index] = session
      }

      if (currentSession.value?.id === id) {
        currentSession.value = session
      }

      return session
    }
    finally {
      loading.value = false
    }
  }

  const deleteSession = async (id: string): Promise<void> => {
    loading.value = true

    try {
      await api.delete(`/sessions/${id}`)

      sessions.value = sessions.value.filter(s => s.id !== id)

      if (currentSession.value?.id === id) {
        currentSession.value = null
      }
    }
    finally {
      loading.value = false
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
    // State
    sessions,
    currentSession,
    loading,
    pagination,
    filters,

    // Getters
    sessionsByDate,
    sessionsByTrack,
    upcomingSessions,
    liveSessions,

    // Actions
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

function getAuthHeaders(): Record<string, string> {
  const authStore = useAuthStore()
  const headers: Record<string, string> = {}

  if (authStore.token) {
    headers.Authorization = `Bearer ${authStore.token}`
  }

  return headers
}
