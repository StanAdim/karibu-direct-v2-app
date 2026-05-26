import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import type { EventExploreSortBy, EventFilters } from '~/types'

const DEBOUNCE_MS = 420

export type ExploreTimeScope = 'all' | 'upcoming' | 'live'
export type ExploreTicketKind = 'all' | 'free' | 'paid'

export function useAttendeeExploreEventsFilters() {
  const eventsStore = useEventsStore()

  const filters = reactive({
    category_ids: [] as string[],
    price_min: 0,
    price_max: 500_000 as number | null,
    location: null as string | null,
    search: '',
    sort_by: 'relevancy' as EventExploreSortBy,
  })

  const exploreScope = ref<ExploreTimeScope>('all')
  const ticketKind = ref<ExploreTicketKind>('all')
  const loadError = ref<string | null>(null)

  function buildExploreEventFilters(extra?: Partial<EventFilters>): EventFilters {
    const loc = filters.location?.trim() || undefined
    const cats =
      filters.category_ids.length ? [...filters.category_ids] : undefined

    const sortByEffective = exploreScope.value === 'live' ? 'date' : filters.sort_by

    const out: EventFilters = {
      status: 'published',
      visibility: 'public',
      ...(cats?.length ? { category_ids: cats } : {}),
      search: filters.search.trim() || undefined,
      sort_by: sortByEffective,
      ...(loc ? { location: loc } : {}),
      ...extra,
    }

    if (exploreScope.value === 'upcoming') {
      out.start_date = new Date().toISOString()
    }

    if (exploreScope.value === 'live') {
      out.live_only = true
    }

    if (ticketKind.value === 'free') {
      out.price_max = 0
    }
    else if (ticketKind.value === 'paid') {
      out.price_min = filters.price_min > 0 ? filters.price_min : 1
      if (filters.price_max != null) {
        out.price_max = filters.price_max
      }
    }
    else {
      if (filters.price_min > 0) {
        out.price_min = filters.price_min
      }
      if (filters.price_max != null) {
        out.price_max = filters.price_max
      }
    }

    return out
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function clearSchedule(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
  }

  async function loadExplore(resetPaging = true): Promise<void> {
    loadError.value = null
    if (resetPaging) {
      eventsStore.setPage(1)
      eventsStore.setPerPage(12)
    }
    try {
      await eventsStore.fetchEvents(buildExploreEventFilters())
    }
    catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: string }).message)
        : 'Could not load events'
      loadError.value = msg
    }
  }

  function scheduleDebouncedLoad(): void {
    clearSchedule()
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void loadExplore(true)
    }, DEBOUNCE_MS)
  }

  watch(
    () => ({
      price_min: filters.price_min,
      price_max: filters.price_max,
      location: filters.location,
      search: filters.search,
      sort_by: filters.sort_by,
    }),
    () => scheduleDebouncedLoad(),
    { deep: true }
  )

  watch(
    () => filters.category_ids.slice(),
    () => {
      clearSchedule()
      void loadExplore(true)
    }
  )

  watch(exploreScope, () => {
    clearSchedule()
    void loadExplore(true)
  })

  watch(ticketKind, () => {
    clearSchedule()
    void loadExplore(true)
  })

  onBeforeUnmount(() => clearSchedule())

  async function exploreMore(): Promise<void> {
    if (!eventsStore.hasMorePages) return
    loadError.value = null
    const next = eventsStore.pagination.per_page + 12
    eventsStore.setPerPage(next)
    try {
      await eventsStore.fetchEvents(buildExploreEventFilters())
    }
    catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: string }).message)
        : 'Could not load more events'
      loadError.value = msg
    }
  }

  return {
    filters,
    exploreScope,
    ticketKind,
    loadError,
    buildExploreEventFilters,
    loadExplore,
    exploreMore,
  }
}
