import { reactive, watch, onBeforeUnmount } from 'vue'
import type { EventExploreSortBy, EventFilters } from '~/types'

const DEBOUNCE_MS = 420

export function useAttendeeExploreEventsFilters() {
  const eventsStore = useEventsStore()
  const categoryStore = useEventCategoryStore()

  const filters = reactive({
    category_id: null as string | null,
    price_min: 0,
    price_max: 500_000 as number | null,
    location: null as string | null,
    search: '',
    sort_by: 'relevancy' as EventExploreSortBy
  })

  function buildExploreEventFilters(extra?: Partial<EventFilters>): EventFilters {
    const loc = filters.location?.trim() || undefined
    return {
      status: 'published',
      visibility: 'public',
      ...(filters.category_id ? { category_id: filters.category_id } : {}),
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

  function selectCategory(id: string | null): void {
    categoryStore.setCategory(id)
    filters.category_id = id
    clearSchedule()
    void loadExplore(true)
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

  onBeforeUnmount(() => clearSchedule())

  async function exploreMore(): Promise<void> {
    if (!eventsStore.hasMorePages) return
    const next = eventsStore.pagination.per_page + 12
    eventsStore.setPerPage(next)
    await eventsStore.fetchEvents(buildExploreEventFilters())
  }

  return {
    filters,
    selectCategory,
    buildExploreEventFilters,
    loadExplore,
    exploreMore
  }
}
