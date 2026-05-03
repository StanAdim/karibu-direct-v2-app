<script setup lang="ts">
import type { Event, EventExploreSortBy } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const eventsStore = useEventsStore()
const router = useRouter()
const config = useRuntimeConfig()

const { filters, loadExplore, exploreMore } = useAttendeeExploreEventsFilters()

const sortOptions = [
  { value: 'relevancy', label: 'Relevancy' },
  { value: 'date', label: 'Date' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
] as const

const locationChoices = ['Dar es Salaam', 'Arusha', 'Mwanza'] as const

const locationSelectOptions = locationChoices.map(city => ({
  label: city,
  value: city
}))

const sortSelectOptions = sortOptions.map(o => ({
  label: o.label,
  value: o.value
}))

const locationSelectModel = computed({
  get(): string | null {
    const loc = filters.location
    if (loc == null) return null
    const t = String(loc).trim()
    return t.length ? t : null
  },
  set(v: string | null) {
    filters.location = v?.trim() ? v : null
  }
})

const sortSelectModel = computed({
  get(): string | null {
    return filters.sort_by
  },
  set(v: string | null) {
    filters.sort_by = (v ?? 'relevancy') as EventExploreSortBy
  }
})

const displayEvents = computed(() => eventsStore.events)

const totalCount = computed(() => eventsStore.pagination.total)

const showingCount = computed(() => displayEvents.value.length)

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
  const first = event.categories?.[0]
  if (!first) return 'EVENT'
  if (typeof first === 'string') return first.toUpperCase()
  if (typeof first === 'object' && 'name' in first && typeof (first as { name?: unknown }).name === 'string') {
    return (first as { name: string }).name.toUpperCase()
  }
  return 'EVENT'
}

function isEventSaved(event: Event): boolean {
  return Boolean(event.is_saved) || eventsStore.isEventSaved(event.id)
}

async function toggleEventSaved(event: Event): Promise<void> {
  await eventsStore.toggleSavedEvent(event.id, !isEventSaved(event))
}

onMounted(() => {
  void Promise.all([
    loadExplore(true),
    eventsStore.fetchMySavedEvents()
  ])
})
</script>

<template>
  <div>
    <div class="flex flex-col lg:flex-row gap-4 lg:gap-5">
      <!-- Left sidebar: filters -->
      <aside class="lg:w-72 shrink-0">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden sticky top-24 h-screen">
          <div class="p-4 border-b border-slate-100 dark:border-slate-800">
            <EventCategoriesMultiSelect
              v-model="filters.category_ids"
              hint="Events matching any selected category are shown."
            />
          </div>

          <div class="p-4 border-t border-slate-100 dark:border-slate-800">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Price Range
            </h2>
            <div class="mt-3 space-y-3">
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Minimum ticket price · {{ filters.price_min.toLocaleString() }} TSh
                </p>
                <input
                  v-model.number="filters.price_min"
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  class="w-full accent-primary-500"
                >
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Maximum ticket price · {{ (filters.price_max ?? 500000).toLocaleString() }} TSh
                </p>
                <input
                  v-model.number="filters.price_max"
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  class="w-full accent-primary-500"
                >
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-slate-100 dark:border-slate-800">
            <AppSingleSelect
              v-model="locationSelectModel"
              label="Location"
              hint="City filter on event venue."
              placeholder="All locations"
              :options="locationSelectOptions"
              :show-selected-chip="false"
            />
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 space-y-4">
        <!-- Search in main area (optional duplicate for focus) or rely on layout search -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 min-w-0">
              <AppLucideIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="filters.search"
                type="search"
                placeholder="Search events, organizers, or cities..."
                class="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-0 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              >
            </div>
            <div class="w-full shrink-0 sm:w-56">
              <AppSingleSelect
                v-model="sortSelectModel"
                label="Sort by"
                placeholder="Relevancy"
                :options="sortSelectOptions"
                :show-selected-chip="false"
              />
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
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm py-10 px-4 text-center"
        >
          <AppLucideIcon name="event_busy" class="text-5xl text-slate-300 dark:text-slate-600" />
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
                class="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-md transition-colors"
                :class="isEventSaved(event) ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'"
                :disabled="eventsStore.isSavingEvent(event.id)"
                :aria-label="isEventSaved(event) ? 'Unsave event' : 'Save event'"
                @click.stop="toggleEventSaved(event)"
              >
                <AppLucideIcon :name="isEventSaved(event) ? 'favorite' : 'favorite_border'" class="text-lg" />
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
                <AppLucideIcon name="location_on" class="text-base" />
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
<!--              <AppLucideIcon name="star" class="text-lg" />-->
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
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Showing {{ showingCount }} event{{ showingCount === 1 ? '' : 's' }}
            <template v-if="totalCount > 0">
              · {{ totalCount }} total from the server for this search
            </template>
          </p>
        <div class="mt-3 flex justify-center">
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
