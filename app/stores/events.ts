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

/** Backend may return a bare resource or `{ data: T }` (see auth store). */
function unwrapResource<T>(raw: unknown): T {
  return (raw as { data?: T })?.data ?? (raw as T)
}

interface EventsState {
  events: Event[]
  currentEvent: Event | null
  eventStats: EventStats | null
  loading: boolean
  pagination: {
    total: number
    page: number
    per_page: number
    last_page: number
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
    per_page: 10,
    last_page: 1
  })
  const filters = ref<EventFilters>({} as EventFilters)
  const api = useApi()
  let fetchEventSeq = 0

  // Getters
  const upcomingEvents = computed<Event[]>(() => {
    const now = new Date()
    return events.value.filter(event => {
      const startDate = new Date(event.start_date)
      return startDate > now && event.status === 'published'
    })
  })

  const pastEvents = computed<Event[]>(() => {
    const now = new Date()
    return events.value.filter(event => {
      const endDate = new Date(event.end_date)
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
    return pagination.value.page < pagination.value.last_page
  })

  // Actions
  const fetchEvents = async (eventFilters?: EventFilters): Promise<void> => {
    loading.value = true
    filters.value = eventFilters || ({} as EventFilters)

    try {
      const toFiniteNumber = (value: unknown, fallback: number): number => {
        const num = typeof value === 'number' ? value : Number(value)
        return Number.isFinite(num) ? num : fallback
      }

      // Protect the API call from sending `page=undefined` / `per_page=undefined`.
      // This can happen if `pagination` was overwritten with an unexpected `response.meta` shape.
      const safePage = toFiniteNumber(pagination.value.page, 1)
      const safePerPage = toFiniteNumber(pagination.value.per_page, 10)

      const params = new URLSearchParams()

      params.append('page', String(safePage))
      params.append('per_page', String(safePerPage))

      if (eventFilters?.status) params.append('status', eventFilters.status)
      if (eventFilters?.visibility) params.append('visibility', eventFilters.visibility)
      if (eventFilters?.category) params.append('category', eventFilters.category)
      if (eventFilters?.search) params.append('search', eventFilters.search)
      if (eventFilters?.start_date) params.append('start_date', eventFilters.start_date)
      if (eventFilters?.end_date) params.append('end_date', eventFilters.end_date)
      if (eventFilters?.organizer_id) params.append('organizer_id', eventFilters.organizer_id)

      const response = await api.get<PaginatedResponse<Event>>(`/events/?${params.toString()}`)

      events.value = response.data
      // Normalize meta to match our local pagination key names.
      // (Backends sometimes return `current_page` / `perPage` instead of `page` / `per_page`.)
      const meta = response.meta as any
      pagination.value = {
        total: toFiniteNumber(meta?.total, pagination.value.total),
        page: toFiniteNumber(meta?.page ?? meta?.current_page, safePage),
        per_page: toFiniteNumber(meta?.per_page ?? meta?.perPage, safePerPage),
        last_page: toFiniteNumber(meta?.last_page ?? meta?.lastPage, 1)
      }
    }
    finally {
      loading.value = false
    }
  }

  const fetchMyEvents = async (eventFilters?: EventFilters): Promise<void> => {
    loading.value = true
    filters.value = eventFilters || ({} as EventFilters)

    try {
      const toFiniteNumber = (value: unknown, fallback: number): number => {
        const num = typeof value === 'number' ? value : Number(value)
        return Number.isFinite(num) ? num : fallback
      }

      // Protect the API call from sending `page=undefined` / `per_page=undefined`.
      const safePage = toFiniteNumber(pagination.value.page, 1)
      const safePerPage = toFiniteNumber(pagination.value.per_page, 10)

      const params = new URLSearchParams()
      params.append('page', String(safePage))
      params.append('per_page', String(safePerPage))

      if (eventFilters?.status) params.append('status', eventFilters.status)
      if (eventFilters?.visibility) params.append('visibility', eventFilters.visibility)
      if (eventFilters?.category) params.append('category', eventFilters.category)
      if (eventFilters?.search) params.append('search', eventFilters.search)
      if (eventFilters?.start_date) params.append('start_date', eventFilters.start_date)
      if (eventFilters?.end_date) params.append('end_date', eventFilters.end_date)
      // Intentionally do not send `organizer_id` for the "my-events" endpoint.

      const response = await api.get<PaginatedResponse<Event>>(`/events/my-events/?${params.toString()}`)

      events.value = response.data
      const meta = response.meta as any
      pagination.value = {
        total: toFiniteNumber(meta?.total, pagination.value.total),
        page: toFiniteNumber(meta?.page ?? meta?.current_page, safePage),
        per_page: toFiniteNumber(meta?.per_page ?? meta?.perPage, safePerPage),
        last_page: toFiniteNumber(meta?.last_page ?? meta?.lastPage, 1)
      }
    }
    finally {
      loading.value = false
    }
  }

  const fetchEvent = async (id: string): Promise<Event | null> => {
    const seq = ++fetchEventSeq
    loading.value = true

    try {
      const raw = await api.get<Event | { data: Event }>(`/events/${id}`)
      const event = unwrapResource<Event>(raw)

      if (seq !== fetchEventSeq) {
        return event
      }

      currentEvent.value = event
      return event
    }
    catch {
      if (seq === fetchEventSeq) {
        currentEvent.value = null
      }
      return null
    }
    finally {
      if (seq === fetchEventSeq) {
        loading.value = false
      }
    }
  }

  const fetchEventStats = async (eventId: string): Promise<EventStats | null> => {
    try {
      const raw = await api.get<EventStats | { data: EventStats }>(`/events/${eventId}/stats`)
      const stats = unwrapResource<EventStats>(raw)

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
      const raw = await api.post<Event | { data: Event }>('/events', input)
      const event = unwrapResource<Event>(raw)

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
      const raw = await api.put<Event | { data: Event }>(`/events/${id}`, input)
      const event = unwrapResource<Event>(raw)

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

  const uploadEventCover = async (id: string, file: File): Promise<Event> => {
    const formData = new FormData()
    formData.append('file', file)

    const raw = await api.post<Event | { data: Event }>(`/events/${id}/cover`, formData, {
      suppressErrorToast: true
    })
    const event = unwrapResource<Event>(raw)

    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = event
    }

    if (currentEvent.value?.id === id) {
      currentEvent.value = event
    }

    return event
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

  const setPerPage = (per_page: number): void => {
    pagination.value.per_page = per_page
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
    fetchMyEvents,
    fetchEvent,
    fetchEventStats,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadEventCover,
    publishEvent,
    cancelEvent,
    setPage,
    setPerPage,
    clearCurrentEvent,
    clearFilters
  }
})
