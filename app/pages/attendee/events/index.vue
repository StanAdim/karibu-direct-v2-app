<script setup lang="ts">
import type { Event, EventFilters } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const eventsStore = useEventsStore()
const router = useRouter()
const config = useRuntimeConfig()

const searchQuery = ref('')
const selectedCategoryId = ref('all')
const sortBy = ref('relevancy')
const priceMin = ref(0)
const priceMax = ref(500000)
const locationOption = ref('All')

/** Maps sidebar ids to strings the API `category` query likely matches against event.categories */
const categoryIdToApi: Record<string, string | undefined> = {
  all: undefined,
  music: 'Music',
  food: 'Food',
  business: 'Business',
  arts: 'Art'
}

const categories = [
  { id: 'all', label: 'ALL EVENTS', icon: 'calendar_today' },
  { id: 'music', label: 'MUSIC', icon: 'music_note' },
  { id: 'food', label: 'FOOD & DRINK', icon: 'restaurant' },
  { id: 'business', label: 'BUSINESS', icon: 'business_center' },
  { id: 'arts', label: 'ARTS', icon: 'palette' }
]

const sortOptions = [
  { value: 'relevancy', label: 'Relevancy' },
  { value: 'date', label: 'Date' },
  { value: 'price', label: 'Price' }
]

function buildApiFilters(): EventFilters {
  return {
    status: 'published',
    visibility: 'public',
    search: searchQuery.value.trim() || undefined,
    category: categoryIdToApi[selectedCategoryId.value]
  }
}

function minTicketPrice(event: Event): number | null {
  const types = event.ticket_types?.filter(t => t.price >= 0) ?? []
  if (types.length === 0) return null
  return Math.min(...types.map(t => t.price))
}

function passesClientFilters(event: Event): boolean {
  const min = minTicketPrice(event)
  const from = min ?? 0
  if (from < priceMin.value || from > priceMax.value) return false

  if (locationOption.value && locationOption.value !== 'All') {
    const city = (event.venue?.city ?? '').trim()
    if (!city || city.toLowerCase() !== locationOption.value.toLowerCase()) return false
  }

  return true
}

function sortEvents(list: Event[]): Event[] {
  const out = [...list]
  if (sortBy.value === 'date') {
    out.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  }
  else if (sortBy.value === 'price') {
    out.sort((a, b) => {
      const ma = minTicketPrice(a)
      const mb = minTicketPrice(b)
      const na = ma ?? 0
      const nb = mb ?? 0
      return na - nb
    })
  }
  return out
}

const displayEvents = computed(() => {
  return sortEvents(eventsStore.events.filter(passesClientFilters))
})

const totalCount = computed(() => eventsStore.pagination.total)

const showingCount = computed(() => displayEvents.value.length)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

async function loadEvents(resetPage = true) {
  if (resetPage) {
    eventsStore.setPage(1)
    eventsStore.setPerPage(12)
  }
  await eventsStore.fetchEvents(buildApiFilters())
}

function scheduleLoadEvents() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    searchDebounce = null
    void loadEvents(true)
  }, 350)
}

async function exploreMore() {
  if (!eventsStore.hasMorePages) return
  const next = eventsStore.pagination.per_page + 12
  eventsStore.setPerPage(next)
  await eventsStore.fetchEvents(buildApiFilters())
}

function handleViewEvent(event: Event) {
  router.push(`/attendee/events/${event.id}`)
}

function formatDateBadge(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getEventPrice(event: Event): { from: number | null; label: string } {
  const types = event.ticket_types?.filter(t => t.price >= 0) || []
  if (types.length === 0) return { from: null, label: 'Free Entry' }
  const min = Math.min(...types.map(t => t.price))
  if (min === 0) return { from: null, label: 'Free Entry' }
  return { from: min, label: `TICKETS FROM ${min.toLocaleString()} TSh` }
}

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(
    event.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/event-${event.id}/800/500`
  )
}

function getLocationLine(event: Event): string {
  const v = event.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  return [v.name, v.city].filter(Boolean).join(', ')
}

function getCategoryLabel(event: Event): string {
  return (event.categories && event.categories[0]) ? event.categories[0].toUpperCase() : 'EVENT'
}

watch(selectedCategoryId, () => {
  void loadEvents(true)
})

watch(searchQuery, () => {
  scheduleLoadEvents()
})

onMounted(() => {
  void loadEvents(true)
})

onBeforeUnmount(() => {
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <!-- Left sidebar: filters -->
      <aside class="lg:w-72 shrink-0">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden sticky top-24">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Categories
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Filter by Interest</p>
          </div>
          <nav class="p-3 space-y-0.5">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
                selectedCategoryId === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              ]"
              @click="selectedCategoryId = cat.id"
            >
              <span class="material-symbols-outlined text-xl">{{ cat.icon }}</span>
              <span class="flex-1 text-sm font-medium">{{ cat.label }}</span>
            </button>
          </nav>

          <div class="p-5 border-t border-slate-100 dark:border-slate-800">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Price Range
            </h2>
            <div class="mt-3 space-y-2">
              <input
                v-model.number="priceMin"
                type="range"
                min="0"
                max="500000"
                step="10000"
                class="w-full accent-primary-500"
              >
              <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{{ priceMin.toLocaleString() }} TSh</span>
                <span>500,000+ TSh</span>
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-slate-100 dark:border-slate-800">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">
              Location
            </h2>
            <select
              v-model="locationOption"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              <option value="Dar es Salaam">Dar es Salaam</option>
              <option value="Arusha">Arusha</option>
              <option value="Mwanza">Mwanza</option>
              <option value="All">All locations</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 space-y-6">
        <!-- Search in main area (optional duplicate for focus) or rely on layout search -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 min-w-0">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search events, organizers, or cities..."
                class="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-0 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Sort by:</span>
              <select
                v-model="sortBy"
                class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
                <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="eventsStore.loading" class="py-12 flex justify-center">
          <LoadingState text="Loading events..." />
        </div>

        <!-- Empty -->
        <div
          v-else-if="displayEvents.length === 0"
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm py-16 px-6 text-center"
        >
          <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">event_busy</span>
          <p class="mt-4 text-slate-700 dark:text-slate-300 font-medium">
            No events match your filters
          </p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try another category, a different search, or widening your price range.
          </p>
        </div>

        <!-- Event grid -->
        <div v-else class="grid gap-4 sm:grid-cols-3">
          <article
            v-for="event in displayEvents"
            :key="event.id"
            class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            @click="handleViewEvent(event)"
          >
            <div class="relative aspect-[16/10] overflow-hidden cursor-pointer">
              <img
                :src="getEventImage(event)"
                :alt="event.title"
                class="h-full w-full object-cover"
              >
              <span class="absolute left-4 top-4 rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-white">
                {{ formatDateBadge(event.start_date) }}
              </span>
              <button
                type="button"
                class="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-md text-slate-500 hover:text-primary-500 transition-colors"
                @click.stop
              >
                <span class="material-symbols-outlined text-lg">favorite</span>
              </button>
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {{ getCategoryLabel(event) }}
                </span>
                <span class="text-slate-400">·</span>
                <span class="text-sm text-slate-600 dark:text-slate-400">
                  {{ formatTime(event.start_date) }}
                </span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
                {{ event.title }}
              </h3>
              <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-3">
                <span class="material-symbols-outlined text-base">location_on</span>
                <span class="line-clamp-1">{{ getLocationLine(event) }}</span>
              </p>
              <p
                class="text-sm font-medium mt-auto"
                :class="getEventPrice(event).from === null ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'"
              >
                {{ getEventPrice(event).label }}
              </p>
              <div class="mt-4 flex justify-end">
                <span class="inline-flex items-center justify-center rounded-xl bg-primary-500 text-white text-sm font-semibold px-4 py-2 hover:bg-primary-600 transition-colors cursor-pointer">
                  View Details
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Featured Spotlight -->
<!--        <div class="rounded-2xl bg-primary-500 overflow-hidden shadow-lg flex flex-col md:flex-row">-->
<!--          <div class="p-6 md:p-8 flex-1 flex flex-col justify-center">-->
<!--            <div class="flex items-center gap-2 text-primary-100 text-xs font-bold uppercase tracking-wider mb-2">-->
<!--              <span class="material-symbols-outlined text-lg">star</span>-->
<!--              Featured Spotlight-->
<!--            </div>-->
<!--            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">-->
<!--              Sauti za Busara 2024-->
<!--            </h2>-->
<!--            <p class="text-white/90 text-sm md:text-base max-w-xl mb-6">-->
<!--              Experience the most prestigious music festival in East Africa. 4 days of cultural immersion and world-class performances.-->
<!--            </p>-->
<!--            <div class="flex flex-wrap gap-3">-->
<!--              <NuxtLink-->
<!--                to="/attendee/events"-->
<!--                class="inline-flex items-center rounded-xl bg-white text-primary-600 font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors"-->
<!--              >-->
<!--                Book Priority Tickets-->
<!--              </NuxtLink>-->
<!--              <NuxtLink-->
<!--                to="/attendee/events"-->
<!--                class="inline-flex items-center rounded-xl border-2 border-white text-white font-semibold px-5 py-2.5 text-sm hover:bg-white/10 transition-colors"-->
<!--              >-->
<!--                Learn More-->
<!--              </NuxtLink>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="md:w-80 shrink-0 aspect-video md:aspect-auto md:h-full max-h-64 md:max-h-none overflow-hidden">-->
<!--            <img-->
<!--              src="https://picsum.photos/seed/busara/800/400"-->
<!--              alt="Sauti za Busara"-->
<!--              class="h-full w-full object-cover"-->
<!--            >-->
<!--          </div>-->
<!--        </div>-->

        <!-- Footer: count + Explore More -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Showing {{ showingCount }} event{{ showingCount === 1 ? '' : 's' }}
            <template v-if="totalCount > 0">
              · {{ totalCount }} total from the server for this search
            </template>
          </p>
        <div class="mt-4 flex justify-center">
          <AppButton
            icon="arrow_forward"
            icon-position="right"
            :disabled="!eventsStore.hasMorePages"
            @click="exploreMore"
          >
            Explore More Events
          </AppButton>
        </div>
        </div>
      </main>
    </div>
  </div>
</template>
