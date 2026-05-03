import { reactive, watch, onBeforeUnmount } from 'vue'
import type { EventExploreSortBy, EventFilters } from '~/types'

const DEBOUNCE_MS = 420

export function useAttendeeExploreEventsFilters() {
  const eventsStore = useEventsStore()

  const filters = reactive({
    category_ids: [] as string[],
    price_min: 0,
    price_max: 500_000 as number | null,
    location: null as string | null,
    search: '',
    sort_by: 'relevancy' as EventExploreSortBy
  })

  function buildExploreEventFilters(extra?: Partial<EventFilters>): EventFilters {
    const loc = filters.location?.trim() || undefined
    const cats =
      filters.category_ids.length ? [...filters.category_ids] : undefined
    return {
      status: 'published',
      visibility: 'public',
      ...(cats?.length ? { category_ids: cats } : {}),
      search: filters.search.trim() || undefined,
      sort_by: filters.sort_by,
      price_min: filters.price_min > 0 ? filters.price_min : undefined,
      price_max: filters.price_max != null ? filters.price_max : undefined,
      ...(loc ? { location: loc } : {}),
      ...extra
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function clearSchedule(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
  }

  async function loadExplore(resetPaging = true): Promise<void> {
    if (resetPaging) {
      eventsStore.setPage(1)
      eventsStore.setPerPage(12)
    }
    await eventsStore.fetchEvents(buildExploreEventFilters())
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
      sort_by: filters.sort_by
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

  onBeforeUnmount(() => clearSchedule())

  async function exploreMore(): Promise<void> {
    if (!eventsStore.hasMorePages) return
    const next = eventsStore.pagination.per_page + 12
    eventsStore.setPerPage(next)
    await eventsStore.fetchEvents(buildExploreEventFilters())
  }

  return {
    filters,
    buildExploreEventFilters,
    loadExplore,
    exploreMore
  }
}
