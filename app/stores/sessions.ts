import { defineStore } from 'pinia'
import type {
  PaginatedResponse,
  Session,
  SessionCreateInput,
  SessionFilters,
  SessionUpdateInput
} from '~/types'

interface SessionsState {
  sessions: Session[]
  currentSession: Session | null
  loading: boolean
  pagination: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
  filters: SessionFilters
}

export const useSessionsStore = defineStore('sessions', {
  state: (): SessionsState => ({
    sessions: [],
    currentSession: null,
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      perPage: 20,
      lastPage: 1
    },
    filters: {}
  }),

  getters: {
    sessionsByDate: (state) => {
      const grouped: Record<string, Session[]> = {}

      state.sessions.forEach(session => {
        const date = new Date(session.startTime).toDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(session)
      })

      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      })

      return grouped
    },

    sessionsByTrack: (state) => {
      const grouped: Record<string, Session[]> = {}

      state.sessions.forEach(session => {
        const track = session.track || 'General'
        if (!grouped[track]) {
          grouped[track] = []
        }
        grouped[track].push(session)
      })

      return grouped
    },

    upcomingSessions: (state): Session[] => {
      const now = new Date()
      return state.sessions.filter(session =>
        new Date(session.startTime) > now && session.status === 'scheduled'
      )
    },

    liveSessions: (state): Session[] => {
      const now = new Date()
      return state.sessions.filter(session => {
        const start = new Date(session.startTime)
        const end = new Date(session.endTime)
        return now >= start && now <= end && session.status === 'scheduled'
      })
    }
  },

  actions: {
    async fetchSessions(filters?: SessionFilters): Promise<void> {
      this.loading = true
      this.filters = filters || {}

      try {
        const config = useRuntimeConfig()
        const params = new URLSearchParams()

        params.append('page', String(this.pagination.page))
        params.append('perPage', String(this.pagination.perPage))

        if (filters?.eventId) params.append('eventId', filters.eventId)
        if (filters?.type) params.append('type', filters.type)
        if (filters?.track) params.append('track', filters.track)
        if (filters?.level) params.append('level', filters.level)
        if (filters?.speakerId) params.append('speakerId', filters.speakerId)
        if (filters?.date) params.append('date', filters.date)
        if (filters?.search) params.append('search', filters.search)

        const response = await $fetch<PaginatedResponse<Session>>(
          `${config.public.apiBase}/sessions?${params.toString()}`,
          {
            headers: getAuthHeaders()
          }
        )

        this.sessions = response.data
        this.pagination = response.meta
      }
      finally {
        this.loading = false
      }
    },

    async fetchSession(id: string): Promise<Session | null> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const session = await $fetch<Session>(`${config.public.apiBase}/sessions/${id}`, {
          headers: getAuthHeaders()
        })

        this.currentSession = session
        return session
      }
      catch {
        this.currentSession = null
        return null
      }
      finally {
        this.loading = false
      }
    },

    async fetchEventSessions(eventId: string): Promise<Session[]> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<PaginatedResponse<Session>>(
          `${config.public.apiBase}/events/${eventId}/sessions`,
          {
            headers: getAuthHeaders()
          }
        )

        this.sessions = response.data
        this.pagination = response.meta
        return response.data
      }
      finally {
        this.loading = false
      }
    },

    async createSession(input: SessionCreateInput): Promise<Session> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const session = await $fetch<Session>(`${config.public.apiBase}/sessions`, {
          method: 'POST',
          body: input,
          headers: getAuthHeaders()
        })

        this.sessions.push(session)
        return session
      }
      finally {
        this.loading = false
      }
    },

    async updateSession(id: string, input: SessionUpdateInput): Promise<Session> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const session = await $fetch<Session>(`${config.public.apiBase}/sessions/${id}`, {
          method: 'PATCH',
          body: input,
          headers: getAuthHeaders()
        })

        const index = this.sessions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sessions[index] = session
        }

        if (this.currentSession?.id === id) {
          this.currentSession = session
        }

        return session
      }
      finally {
        this.loading = false
      }
    },

    async deleteSession(id: string): Promise<void> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        await $fetch(`${config.public.apiBase}/sessions/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        this.sessions = this.sessions.filter(s => s.id !== id)

        if (this.currentSession?.id === id) {
          this.currentSession = null
        }
      }
      finally {
        this.loading = false
      }
    },

    setPage(page: number): void {
      this.pagination.page = page
    },

    clearCurrentSession(): void {
      this.currentSession = null
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    }
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
