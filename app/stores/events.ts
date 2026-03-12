import { defineStore } from 'pinia'
import type {
  Event,
  EventCreateInput,
  EventFilters,
  EventStats,
  EventUpdateInput,
  PaginatedResponse
} from '~/types'

interface EventsState {
  events: Event[]
  currentEvent: Event | null
  eventStats: EventStats | null
  loading: boolean
  pagination: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
  filters: EventFilters
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    currentEvent: null,
    eventStats: null,
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      perPage: 10,
      lastPage: 1
    },
    filters: {}
  }),

  getters: {
    upcomingEvents: (state): Event[] => {
      const now = new Date()
      return state.events.filter(event => {
        const startDate = new Date(event.startDate)
        return startDate > now && event.status === 'published'
      })
    },

    pastEvents: (state): Event[] => {
      const now = new Date()
      return state.events.filter(event => {
        const endDate = new Date(event.endDate)
        return endDate < now
      })
    },

    draftEvents: (state): Event[] => {
      return state.events.filter(event => event.status === 'draft')
    },

    publishedEvents: (state): Event[] => {
      return state.events.filter(event => event.status === 'published')
    },

    hasMorePages: (state): boolean => {
      return state.pagination.page < state.pagination.lastPage
    }
  },

  actions: {
    async fetchEvents(filters?: EventFilters): Promise<void> {
      this.loading = true
      this.filters = filters || {}

      try {
        const config = useRuntimeConfig()
        const params = new URLSearchParams()

        params.append('page', String(this.pagination.page))
        params.append('perPage', String(this.pagination.perPage))

        if (filters?.status) params.append('status', filters.status)
        if (filters?.visibility) params.append('visibility', filters.visibility)
        if (filters?.category) params.append('category', filters.category)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)
        if (filters?.organizerId) params.append('organizerId', filters.organizerId)

        const response = await $fetch<PaginatedResponse<Event>>(
          `${config.public.apiBase}/events?${params.toString()}`,
          {
            headers: getAuthHeaders()
          }
        )

        this.events = response.data
        this.pagination = response.meta
      }
      finally {
        this.loading = false
      }
    },

    async fetchEvent(id: string): Promise<Event | null> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const event = await $fetch<Event>(`${config.public.apiBase}/events/${id}`, {
          headers: getAuthHeaders()
        })

        this.currentEvent = event
        return event
      }
      catch {
        this.currentEvent = null
        return null
      }
      finally {
        this.loading = false
      }
    },

    async fetchEventStats(eventId: string): Promise<EventStats | null> {
      try {
        const config = useRuntimeConfig()
        const stats = await $fetch<EventStats>(
          `${config.public.apiBase}/events/${eventId}/stats`,
          {
            headers: getAuthHeaders()
          }
        )

        this.eventStats = stats
        return stats
      }
      catch {
        return null
      }
    },

    async createEvent(input: EventCreateInput): Promise<Event> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const event = await $fetch<Event>(`${config.public.apiBase}/events`, {
          method: 'POST',
          body: input,
          headers: getAuthHeaders()
        })

        this.events.unshift(event)
        return event
      }
      finally {
        this.loading = false
      }
    },

    async updateEvent(id: string, input: EventUpdateInput): Promise<Event> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        const event = await $fetch<Event>(`${config.public.apiBase}/events/${id}`, {
          method: 'PATCH',
          body: input,
          headers: getAuthHeaders()
        })

        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = event
        }

        if (this.currentEvent?.id === id) {
          this.currentEvent = event
        }

        return event
      }
      finally {
        this.loading = false
      }
    },

    async deleteEvent(id: string): Promise<void> {
      this.loading = true

      try {
        const config = useRuntimeConfig()
        await $fetch(`${config.public.apiBase}/events/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })

        this.events = this.events.filter(e => e.id !== id)

        if (this.currentEvent?.id === id) {
          this.currentEvent = null
        }
      }
      finally {
        this.loading = false
      }
    },

    async publishEvent(id: string): Promise<Event> {
      return this.updateEvent(id, { status: 'published' })
    },

    async cancelEvent(id: string): Promise<Event> {
      return this.updateEvent(id, { status: 'cancelled' })
    },

    setPage(page: number): void {
      this.pagination.page = page
    },

    setPerPage(perPage: number): void {
      this.pagination.perPage = perPage
      this.pagination.page = 1
    },

    clearCurrentEvent(): void {
      this.currentEvent = null
      this.eventStats = null
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
