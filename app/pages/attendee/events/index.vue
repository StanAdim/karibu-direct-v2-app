<script setup lang="ts">
import type { Event } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee',
})

const eventsStore = useEventsStore()
const router = useRouter()
const config = useRuntimeConfig()

const {
  filters,
  exploreScope,
  ticketKind,
  loadError,
  loadExplore,
  exploreMore,
} = useAttendeeExploreEventsFilters()

const sortOptions = [
  { value: 'relevancy', label: 'Relevancy' },
  { value: 'date', label: 'Date' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const

const locationChoices = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma'] as const

const locationSelectOptions = locationChoices.map(city => ({
  label: city,
  value: city,
}))

const sortSelectOptions = sortOptions.map(o => ({
  label: o.label,
  value: o.value,
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
  },
})

const sortSelectModel = computed({
  get(): string | null {
    return filters.sort_by
  },
  set(v: string | null) {
    filters.sort_by = (v ?? 'relevancy') as typeof filters.sort_by
  },
})

const displayEvents = computed(() => eventsStore.events)

const totalCount = computed(() => eventsStore.pagination.total)
const showingCount = computed(() => displayEvents.value.length)

const hasRefinements = computed(() =>
  filters.category_ids.length > 0
  || filters.price_min > 0
  || filters.price_max != null && filters.price_max < 500_000
  || Boolean(filters.location?.trim())
  || Boolean(filters.search.trim())
  || exploreScope.value !== 'all'
  || ticketKind.value !== 'all',
)

function scopeTabClass(active: boolean): string {
  return active
    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
}

function ticketKindTabClass(active: boolean): string {
  return active
    ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-300'
    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500/40'
}

function handleViewEvent(ev: Event) {
  router.push(`/attendee/events/${ev.id}`)
}

function formatDateBadge(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getEventPrice(event: Event): { kind: 'free' | 'paid' | 'mixed'; label: string } {
  const types = event.ticket_types?.filter(t => t.price >= 0) || []
  if (types.length === 0) return { kind: 'free', label: 'Free' }
  const min = Math.min(...types.map(t => t.price))
  const max = Math.max(...types.map(t => t.price))
  const cur = types[0]?.currency || 'TZS'
  if (min === 0 && max === 0) return { kind: 'free', label: 'Free' }
  if (min === 0 && max > 0) return { kind: 'mixed', label: 'From free' }
  if (min === max) {
    try {
      return {
        kind: 'paid',
        label: new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(min),
      }
    }
    catch {
      return { kind: 'paid', label: `${min.toLocaleString()} ${cur}` }
    }
  }
  try {
    const a = new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(min)
    return { kind: 'paid', label: `From ${a}` }
  }
  catch {
    return { kind: 'paid', label: `From ${min.toLocaleString()} ${cur}` }
  }
}

function ticketAvailabilitySummary(ev: Event): string {
  const types = ev.ticket_types?.filter(t => t.status === 'available') ?? []
  if (!types.length) return 'No tickets'
  let best = Infinity
  for (const t of types) {
    const sold = t.sold_count || 0
    const reserved = t.reserved_count || 0
    const rem = Math.max(0, t.quantity - sold - reserved)
    best = Math.min(best, rem)
  }
  if (!Number.isFinite(best)) return 'Tickets'
  if (best <= 0) return 'Sold out'
  if (best <= 20) return `${best} left`
  return 'Available'
}

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(
    event.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/event-${event.id}/800/500`,
  )
}

function getLocationLine(event: Event): string {
  const v = event.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  return [v.name, v.city].filter(Boolean).join(', ')
}

function categoryLabels(ev: Event): string[] {
  const out: string[] = []
  for (const c of ev.categories ?? []) {
    if (typeof c === 'string') out.push(c)
    else if (c && typeof c === 'object' && 'name' in c && typeof (c as { name?: unknown }).name === 'string') {
      out.push((c as { name: string }).name)
    }
  }
  return out
}

function organizerName(ev: Event): string {
  const o = ev.organizer
  if (!o) return ev.organizer_name || 'Organizer'
  const n = [o.first_name, o.last_name].filter(Boolean).join(' ').trim()
  return n || o.email || 'Organizer'
}

function isEventSaved(ev: Event): boolean {
  return Boolean(ev.is_saved) || eventsStore.isEventSaved(ev.id)
}

async function toggleEventSaved(ev: Event): Promise<void> {
  await eventsStore.toggleSavedEvent(ev.id, !isEventSaved(ev))
}

function clearAllFilters(): void {
  filters.category_ids = []
  filters.price_min = 0
  filters.price_max = 500_000
  filters.location = null
  filters.search = ''
  filters.sort_by = 'relevancy'
  exploreScope.value = 'all'
  ticketKind.value = 'all'
}

onMounted(() => {
  void Promise.all([
    loadExplore(true),
    eventsStore.fetchMySavedEvents(),
  ])
})
</script>

<template>
  <div class="space-y-6 pb-10">
    <!-- Mobile / sticky discovery controls -->
    <div
      class="sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pt-2 pb-3 mb-2 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:static lg:p-0"
    >
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-4 space-y-3">
        <div class="relative">
          <AppLucideIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="filters.search"
            type="search"
            placeholder="Search events, organizers, cities…"
            class="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-0 py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/25 outline-none"
          >
        </div>

        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            :class="['shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all', scopeTabClass(exploreScope === 'all')]"
            @click="exploreScope = 'all'"
          >
            All
          </button>
          <button
            type="button"
            :class="['shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all', scopeTabClass(exploreScope === 'upcoming')]"
            @click="exploreScope = 'upcoming'"
          >
            Upcoming
          </button>
          <button
            type="button"
            :class="['shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all', scopeTabClass(exploreScope === 'live')]"
            @click="exploreScope = 'live'"
          >
            Live now
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            :class="['shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-colors', ticketKindTabClass(ticketKind === 'all')]"
            @click="ticketKind = 'all'"
          >
            All tickets
          </button>
          <button
            type="button"
            :class="['shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-colors', ticketKindTabClass(ticketKind === 'free')]"
            @click="ticketKind = 'free'"
          >
            Free
          </button>
          <button
            type="button"
            :class="['shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-colors', ticketKindTabClass(ticketKind === 'paid')]"
            @click="ticketKind = 'paid'"
          >
            Paid
          </button>
        </div>

        <div v-if="hasRefinements" class="flex flex-wrap gap-2 items-center">
          <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Active</span>
          <button
            v-if="exploreScope !== 'all'"
            type="button"
            class="inline-flex items-center gap-1 rounded-full bg-primary-500/15 text-primary-700 dark:text-primary-300 pl-3 pr-2 py-1 text-xs font-semibold"
            @click="exploreScope = 'all'"
          >
            {{ exploreScope === 'upcoming' ? 'Upcoming' : 'Live' }}
            <AppLucideIcon name="close" class="text-sm opacity-70" />
          </button>
          <button
            v-if="ticketKind !== 'all'"
            type="button"
            class="inline-flex items-center gap-1 rounded-full bg-primary-500/15 text-primary-700 dark:text-primary-300 pl-3 pr-2 py-1 text-xs font-semibold"
            @click="ticketKind = 'all'"
          >
            {{ ticketKind === 'free' ? 'Free' : 'Paid' }}
            <AppLucideIcon name="close" class="text-sm opacity-70" />
          </button>
          <button
            v-if="filters.search.trim()"
            type="button"
            class="inline-flex items-center gap-1 rounded-full bg-slate-200/80 dark:bg-slate-700 pl-3 pr-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[14rem] truncate"
            @click="filters.search = ''"
          >
            “{{ filters.search.trim() }}”
            <AppLucideIcon name="close" class="text-sm shrink-0 opacity-70" />
          </button>
          <button
            type="button"
            class="ml-auto text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            @click="clearAllFilters"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-5 lg:gap-6">
      <aside class="lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-4">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 dark:border-slate-800">
            <EventCategoriesMultiSelect
              v-model="filters.category_ids"
              hint="Match any selected category."
            />
          </div>
          <div class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <AppSingleSelect
              v-model="locationSelectModel"
              label="City"
              hint="Venue city contains…"
              placeholder="All cities"
              :options="locationSelectOptions"
              :show-selected-chip="false"
            />
            <AppSingleSelect
              v-model="sortSelectModel"
              label="Sort"
              placeholder="Relevancy"
              :options="sortSelectOptions"
              :show-selected-chip="false"
            />
          </div>
          <div class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Ticket price (TZS)
            </h2>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Min · {{ filters.price_min.toLocaleString() }}
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
                Max · {{ (filters.price_max ?? 500000).toLocaleString() }}
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
      </aside>

      <main class="flex-1 min-w-0 space-y-5">
        <div
          v-if="loadError"
          class="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div class="flex items-start gap-2 text-red-800 dark:text-red-200 text-sm">
            <AppLucideIcon name="error" class="text-lg shrink-0" />
            <span>{{ loadError }}</span>
          </div>
          <AppButton class="sm:ml-auto shrink-0" color="neutral" @click="loadExplore(true)">
            Retry
          </AppButton>
        </div>

        <div v-if="eventsStore.loading && displayEvents.length === 0" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
            <div class="aspect-[16/10] bg-slate-200 dark:bg-slate-800" />
            <div class="p-4 space-y-3">
              <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          </div>
        </div>

        <div
          v-else-if="displayEvents.length === 0"
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm py-14 px-4 text-center"
        >
          <AppLucideIcon name="event_busy" class="text-5xl text-slate-300 dark:text-slate-600 mx-auto" />
          <p class="mt-4 text-slate-800 dark:text-slate-100 font-semibold text-lg">
            <template v-if="hasRefinements || exploreScope !== 'all' || ticketKind !== 'all'">
              No events match your filters
            </template>
            <template v-else>
              No events to show yet
            </template>
          </p>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            <template v-if="exploreScope === 'live'">
              Nothing is live right now. Try <button type="button" class="text-primary-600 font-semibold hover:underline" @click="exploreScope = 'all'">all events</button> or upcoming.
            </template>
            <template v-else>
              Try widening search, adjusting categories, or resetting ticket price filters.
            </template>
          </p>
          <div class="mt-6 flex justify-center gap-3 flex-wrap">
            <AppButton color="primary" @click="clearAllFilters">
              Reset filters
            </AppButton>
            <AppButton color="neutral" @click="loadExplore(true)">
              Refresh
            </AppButton>
          </div>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="event in displayEvents"
            :key="event.id"
            class="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            role="link"
            tabindex="0"
            @click="handleViewEvent(event)"
            @keydown.enter.prevent="handleViewEvent(event)"
          >
            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                :src="getEventImage(event)"
                :alt="event.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-80 pointer-events-none" />
              <span class="absolute left-3 top-3 rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-[11px] font-black text-slate-900 dark:text-white shadow-sm">
                {{ formatDateBadge(event.start_date) }}
              </span>
              <button
                type="button"
                class="absolute right-3 top-3 rounded-full bg-white/95 dark:bg-slate-900/95 p-2 shadow-md transition-colors z-[1]"
                :class="isEventSaved(event) ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'"
                :disabled="eventsStore.isSavingEvent(event.id)"
                :aria-label="isEventSaved(event) ? 'Unsave event' : 'Save event'"
                @click.stop="toggleEventSaved(event)"
              >
                <AppLucideIcon :name="isEventSaved(event) ? 'favorite' : 'favorite_border'" class="text-lg" />
              </button>
              <div class="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 items-center">
                <span
                  :class="[
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm',
                    getEventPrice(event).kind === 'free'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-slate-950/75 text-white',
                  ]"
                >
                  {{ getEventPrice(event).kind === 'free' ? 'Free' : getEventPrice(event).kind === 'mixed' ? 'Free & paid' : 'Paid' }}
                </span>
                <span class="rounded-full bg-white/90 dark:bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                  {{ ticketAvailabilitySummary(event) }}
                </span>
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-col gap-3">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="label in categoryLabels(event).slice(0, 3)"
                  :key="label"
                  class="text-[10px] font-bold uppercase tracking-wide rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5"
                >
                  {{ label }}
                </span>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <AppLucideIcon name="schedule" class="text-sm" />
                  {{ formatTime(event.start_date) }}
                </p>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ event.title }}
                </h3>
              </div>
              <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <AppLucideIcon name="location_on" class="text-base shrink-0 text-primary-500" />
                <span class="line-clamp-1">{{ getLocationLine(event) }}</span>
              </p>
              <p class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <AppLucideIcon name="person" class="text-sm shrink-0" />
                <span class="truncate">{{ organizerName(event) }}</span>
              </p>
              <p
                v-if="event.settings?.show_attendee_count"
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"
              >
                <AppLucideIcon name="groups" class="text-sm" />
                {{ event.registered_count }} attending
              </p>
              <div class="mt-auto pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <span
                  class="text-sm font-bold tabular-nums"
                  :class="getEventPrice(event).kind === 'free' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'"
                >
                  {{ getEventPrice(event).label }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-xl bg-primary-500 text-white text-xs font-bold px-3 py-2 group-hover:bg-primary-600 transition-colors">
                  View
                  <AppLucideIcon name="arrow_forward" class="text-sm" />
                </span>
              </div>
            </div>
          </article>
        </div>

        <div
          v-if="eventsStore.loading && displayEvents.length > 0"
          class="flex justify-center py-4"
        >
          <LoadingState text="Updating results…" />
        </div>

        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 text-center space-y-3">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Showing {{ showingCount }} event{{ showingCount === 1 ? '' : 's' }}
            <template v-if="totalCount > 0">
              · {{ totalCount }} match{{ totalCount === 1 ? '' : 'es' }} server-side
            </template>
          </p>
          <div class="flex justify-center">
            <AppButton
              icon="arrow_forward"
              icon-position="right"
              color="primary"
              :disabled="!eventsStore.hasMorePages"
              @click="exploreMore"
            >
              Load more
            </AppButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
