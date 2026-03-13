import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  Event,
  EventCreateInput,
  EventFilters,
  EventStats,
  EventUpdateInput,
  PaginatedResponse
} from '~/types'
import { useApi } from '~/composables/useApi'

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

export const useEventsStore = defineStore('events', () => {
  // States
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const eventStats = ref<EventStats | null>(null)
  const loading = ref(false)
  const pagination = ref<EventsState['pagination']>({
    total: 0,
    page: 1,
    perPage: 10,
    lastPage: 1
  })
  const filters = ref<EventFilters>({} as EventFilters)
  const api = useApi()

  // Getters
  const upcomingEvents = computed<Event[]>(() => {
    const now = new Date()
    return events.value.filter(event => {
      const startDate = new Date(event.startDate)
      return startDate > now && event.status === 'published'
    })
  })

  const pastEvents = computed<Event[]>(() => {
    const now = new Date()
    return events.value.filter(event => {
      const endDate = new Date(event.endDate)
      return endDate < now
    })
  })

  const draftEvents = computed<Event[]>(() => {
    return events.value.filter(event => event.status === 'draft')
  })

  const publishedEvents = computed<Event[]>(() => {
    return events.value.filter(event => event.status === 'published')
  })

  const hasMorePages = computed<boolean>(() => {
    return pagination.value.page < pagination.value.lastPage
  })

  // Actions
  const fetchEvents = async (eventFilters?: EventFilters): Promise<void> => {
    loading.value = true
    filters.value = eventFilters || ({} as EventFilters)

    try {
      const params = new URLSearchParams()

      params.append('page', String(pagination.value.page))
      params.append('perPage', String(pagination.value.perPage))

      if (eventFilters?.status) params.append('status', eventFilters.status)
      if (eventFilters?.visibility) params.append('visibility', eventFilters.visibility)
      if (eventFilters?.category) params.append('category', eventFilters.category)
      if (eventFilters?.search) params.append('search', eventFilters.search)
      if (eventFilters?.startDate) params.append('startDate', eventFilters.startDate)
      if (eventFilters?.endDate) params.append('endDate', eventFilters.endDate)
      if (eventFilters?.organizerId) params.append('organizerId', eventFilters.organizerId)

      const response = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`)

      events.value = response.data
      pagination.value = response.meta
    }
    finally {
      loading.value = false
    }
  }

  const fetchEvent = async (id: string): Promise<Event | null> => {
    loading.value = true

    try {
      const event = await api.get<Event>(`/events/${id}`)

      currentEvent.value = event
      return event
    }
    catch {
      currentEvent.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  const fetchEventStats = async (eventId: string): Promise<EventStats | null> => {
    try {
      const stats = await api.get<EventStats>(`/events/${eventId}/stats`)

      eventStats.value = stats
      return stats
    }
    catch {
      return null
    }
  }

  const createEvent = async (input: EventCreateInput): Promise<Event> => {
    loading.value = true

    try {
      const event = await api.post<Event>('/events', input)

      events.value.unshift(event)
      return event
    }
    finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: string, input: EventUpdateInput): Promise<Event> => {
    loading.value = true

    try {
      const event = await api.patch<Event>(`/events/${id}`, input)

      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = event
      }

      if (currentEvent.value?.id === id) {
        currentEvent.value = event
      }

      return event
    }
    finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id: string): Promise<void> => {
    loading.value = true

    try {
      await api.delete(`/events/${id}`)

      events.value = events.value.filter(e => e.id !== id)

      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    }
    finally {
      loading.value = false
    }
  }

  const publishEvent = async (id: string): Promise<Event> => {
    return updateEvent(id, { status: 'published' })
  }

  const cancelEvent = async (id: string): Promise<Event> => {
    return updateEvent(id, { status: 'cancelled' })
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const setPerPage = (perPage: number): void => {
    pagination.value.perPage = perPage
    pagination.value.page = 1
  }

  const clearCurrentEvent = (): void => {
    currentEvent.value = null
    eventStats.value = null
  }

  const clearFilters = (): void => {
    filters.value = {} as EventFilters
    pagination.value.page = 1
  }

  return {
    // State
    events,
    currentEvent,
    eventStats,
    loading,
    pagination,
    filters,

    // Getters
    upcomingEvents,
    pastEvents,
    draftEvents,
    publishedEvents,
    hasMorePages,

    // Actions
    fetchEvents,
    fetchEvent,
    fetchEventStats,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    cancelEvent,
    setPage,
    setPerPage,
    clearCurrentEvent,
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
