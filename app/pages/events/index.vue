<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { EventPublicBrowseItem } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'

declare const definePageMeta: (meta: Record<string, unknown>) => void

definePageMeta({
  layout: 'public'
})

const config = useRuntimeConfig()
const browseStore = usePublicEventBrowseStore()

const pageSize = 6

const DATE_ANY = 'anytime'
const DATE_TODAY = 'today'
const DATE_WEEKEND = 'weekend'

const LOCATION_OPTIONS = [
  '',
  'Dar es Salaam',
  'Arusha',
  'Zanzibar',
  'Mwanza',
  'Tanga'
] as const

const dateOptionLabels = ['Anytime', 'Today', 'This Weekend'] as const

const sidebarDraft = reactive({
  location: '' as string,
  categoryIds: [] as string[],
  maxPrice: 500,
  search: '',
  dateKeys: [DATE_ANY] as string[]
})

const sidebarApplied = reactive({
  location: '',
  categoryIds: [] as string[],
  maxPrice: 500,
  search: '',
  dateKeys: [DATE_ANY] as string[]
})

const locationSelectOptions = LOCATION_OPTIONS.slice(1).map(value => ({
  label: value,
  value
}))

const locationDraftModel = computed({
  get(): string | null {
    const raw = sidebarDraft.location
    const t = raw.trim()
    return t.length ? raw : null
  },
  set(v: string | null) {
    sidebarDraft.location = typeof v === 'string' ? v : ''
  }
})

const browseTab = ref<'popular' | 'upcoming' | 'nearest'>('popular')

const sortOptions = [
  { key: 'popular' as const, label: 'Popular' },
  { key: 'upcoming' as const, label: 'Upcoming' },
  { key: 'nearest' as const, label: 'Nearest' }
]

function syncAppliedFromDraft(): void {
  sidebarApplied.location = sidebarDraft.location
  sidebarApplied.categoryIds = [...sidebarDraft.categoryIds]
  sidebarApplied.maxPrice = sidebarDraft.maxPrice
  sidebarApplied.search = sidebarDraft.search
  sidebarApplied.dateKeys = [...sidebarDraft.dateKeys]
}

function toggleDateFilter(label: typeof dateOptionLabels[number]): void {
  if (label === 'Anytime') {
    sidebarDraft.dateKeys = [DATE_ANY]
    return
  }
  const key = label === 'Today' ? DATE_TODAY : DATE_WEEKEND
  const sel = new Set(sidebarDraft.dateKeys.filter(k => k !== DATE_ANY))
  if (sel.has(key)) sel.delete(key)
  else sel.add(key)
  sidebarDraft.dateKeys = sel.size ? Array.from(sel) : [DATE_ANY]
}

function dateCheckboxChecked(label: typeof dateOptionLabels[number]): boolean {
  if (label === 'Anytime') return sidebarDraft.dateKeys.includes(DATE_ANY)
  const key = label === 'Today' ? DATE_TODAY : DATE_WEEKEND
  return sidebarDraft.dateKeys.includes(key)
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function weekendRangeISO(): { start_date: string; end_date: string } {
  const t = startOfLocalDay(new Date())
  const day = t.getDay()

  const fri = new Date(t)
  if (day === 0) {
    fri.setDate(fri.getDate() - 2)
  }
  else if (day === 6) {
    fri.setDate(fri.getDate() - 1)
  }
  else {
    const delta = (5 - day + 7) % 7
    fri.setDate(fri.getDate() + delta)
  }

  const sunday = startOfLocalDay(fri)
  sunday.setDate(fri.getDate() + 2)
  sunday.setHours(23, 59, 59, 999)

  return {
    start_date: startOfLocalDay(fri).toISOString(),
    end_date: sunday.toISOString()
  }
}

function appliedDateIsoRange(): { start_date?: string; end_date?: string } {
  const keys = sidebarApplied.dateKeys
  if (!keys.length || keys.includes(DATE_ANY)) return {}

  const buckets: Array<{ start: Date; end: Date }> = []
  if (keys.includes(DATE_TODAY)) {
    buckets.push({
      start: startOfLocalDay(new Date()),
      end: endOfLocalDay(new Date())
    })
  }
  if (keys.includes(DATE_WEEKEND)) {
    const w = weekendRangeISO()
    buckets.push({ start: new Date(w.start_date), end: new Date(w.end_date) })
  }

  if (!buckets.length) return {}

  let s = buckets[0]!.start
  let e = buckets[0]!.end
  for (const x of buckets) {
    if (x.start < s) s = x.start
    if (x.end > e) e = x.end
  }
  return { start_date: s.toISOString(), end_date: e.toISOString() }
}

async function loadPage(pageNum: number): Promise<void> {
  const dates = appliedDateIsoRange()

  await browseStore.fetchBrowse({
    page: pageNum,
    size: pageSize,
    browse_tab: browseTab.value,
    ...(sidebarApplied.categoryIds.length
      ? { category_ids: [...sidebarApplied.categoryIds] }
      : {}),
    search: sidebarApplied.search,
    ...(dates.start_date ? { start_date: dates.start_date } : {}),
    ...(dates.end_date ? { end_date: dates.end_date } : {}),
    price_max: sidebarApplied.maxPrice < 500 ? sidebarApplied.maxPrice : null,
    location: sidebarApplied.location || undefined
  })
}

function applySidebar(): void {
  syncAppliedFromDraft()
  void loadPage(1)
}

function resetFilters(): void {
  sidebarDraft.location = ''
  sidebarDraft.categoryIds = []
  sidebarDraft.maxPrice = 500
  sidebarDraft.search = ''
  sidebarDraft.dateKeys = [DATE_ANY]
  browseTab.value = 'popular'
  syncAppliedFromDraft()
  void loadPage(1)
}

watch(browseTab, () => {
  void loadPage(1)
})

const totalPages = computed(() =>
  Math.max(1, browseStore.pagination.last_page)
)

const visiblePages = computed(() => {
  const current = browseStore.pagination.page
  const total = totalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) return [1, 2, 3, 4, total]
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total]
  return [1, current - 1, current, current + 1, total]
})

const categoryChipLabel = computed(() => {
  const n = sidebarApplied.categoryIds.length
  if (n === 0) return 'All Events'
  if (n === 1) return 'One category'
  return `${n} categories`
})

function goToPage(nextPage: number): void {
  if (nextPage < 1 || nextPage > totalPages.value) return
  void loadPage(nextPage)
}

function browseImage(item: EventPublicBrowseItem): string {
  return getEventCoverImageUrl(
    item.cover_image ?? undefined,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/browse-${item.id}/1200/800`
  )
}

function browseVenueLine(item: EventPublicBrowseItem): string {
  const bits = [item.venue_name, item.venue_city].filter(Boolean)
  return bits.length ? bits.join(', ') : '—'
}

function browseRowDate(evt: EventPublicBrowseItem): string {
  const sd = new Date(evt.start_date)
  const ed = new Date(evt.end_date)
  const sameCalendar =
    sd.getFullYear() === ed.getFullYear()
    && sd.getMonth() === ed.getMonth()
    && sd.getDate() === ed.getDate()
  if (!sameCalendar) {
    const a = sd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const b = ed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${a} - ${b}`
  }
  return sd.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function browsePriceLabel(item: EventPublicBrowseItem): string {
  const p = item.min_ticket_price
  if (p == null || p === 0) return 'FREE'
  const curRaw = item.currency ?? 'USD'
  const currency = /^[A-Z]{3}$/i.test(curRaw) ? curRaw.toUpperCase() : 'USD'
  try {
    return `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(p))}+`
  }
  catch {
    return `$${Number(p).toFixed(2)}+`
  }
}

function categoryBadge(item: EventPublicBrowseItem): string {
  const n = item.primary_category_name?.trim()
  return n ? n.toUpperCase() : 'EVENT'
}

onMounted(() => {
  syncAppliedFromDraft()
  void loadPage(1)
})
</script>

<template>
  <div class="bg-slate-50 dark:bg-slate-950">
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8 space-y-2">
        <h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Discover Experiences
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400">
          Find the best events happening in your city and beyond.
        </p>
      </div>

      <div class="mb-6 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <div class="flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <AppLucideIcon name="search" class="text-primary-500" />
          <input
            v-model="sidebarDraft.search"
            type="text"
            placeholder="Search events, artists, or venues"
            class="w-full border-none bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
          >
        </div>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row">
        <aside class="w-full shrink-0 lg:w-72">
          <div class="sticky top-24 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="mb-5 flex items-center justify-between border-b border-primary-50 pb-4 dark:border-slate-800">
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                Filters
              </h2>
              <button
                class="text-xs font-semibold text-primary-500 hover:underline"
                type="button"
                @click="resetFilters"
              >
                Reset all
              </button>
            </div>

            <div class="hidden space-y-6 lg:block">
              <div class="space-y-3">
                <AppSingleSelect
                  v-model="locationDraftModel"
                  label="Location"
                  hint="Applied with Apply Changes below."
                  placeholder="All locations"
                  :options="locationSelectOptions"
                  :show-selected-chip="false"
                />
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Date
                </p>
                <label
                  v-for="option in dateOptionLabels"
                  :key="option"
                  class="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    :checked="dateCheckboxChecked(option)"
                    type="checkbox"
                    class="h-4 w-4 rounded border-primary-200 text-primary-500 focus:ring-primary-500"
                    @change="toggleDateFilter(option)"
                  >
                  <span class="text-sm text-slate-600 transition-colors group-hover:text-primary-500 dark:text-slate-300">
                    {{ option }}
                  </span>
                </label>
              </div>

              <div class="space-y-3">
                <EventCategoriesMultiSelect
                  v-model="sidebarDraft.categoryIds"
                  hint="Applied with the button below — events matching any selected category."
                />
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Search
                </p>
                <div class="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <input
                    v-model="sidebarDraft.search"
                    type="search"
                    placeholder="Artists, venues, titles…"
                    class="w-full border-none bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-200"
                  >
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Price Range
                </p>
                <input
                  v-model.number="sidebarDraft.maxPrice"
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-primary-100 accent-primary-500 dark:bg-slate-700"
                >
                <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>$0</span>
                  <span>${{ sidebarDraft.maxPrice }}+</span>
                </div>
              </div>

              <button
                type="button"
                class="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-600"
                @click="applySidebar"
              >
                Apply Changes
              </button>
            </div>

            <!-- Mobile condensed stack mirrors desktop fields -->
            <div class="space-y-5 lg:hidden">
              <div class="space-y-3">
                <AppSingleSelect
                  v-model="locationDraftModel"
                  label="Location"
                  hint="Apply to refresh results."
                  placeholder="All locations"
                  :options="locationSelectOptions"
                  :show-selected-chip="false"
                />
              </div>
              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Date
                </p>
                <label
                  v-for="option in dateOptionLabels"
                  :key="'mb-' + option"
                  class="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    :checked="dateCheckboxChecked(option)"
                    type="checkbox"
                    class="h-4 w-4 rounded border-primary-200 text-primary-500 focus:ring-primary-500"
                    @change="toggleDateFilter(option)"
                  >
                  <span class="text-sm text-slate-600 dark:text-slate-300">{{ option }}</span>
                </label>
              </div>
              <div class="space-y-3">
                <EventCategoriesMultiSelect
                  v-model="sidebarDraft.categoryIds"
                  hint="Apply to update results (any selected category matches)."
                />
              </div>
              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Search
                </p>
                <input
                  v-model="sidebarDraft.search"
                  type="search"
                  placeholder="Search…"
                  class="w-full rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Price
                </p>
                <input
                  v-model.number="sidebarDraft.maxPrice"
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  class="h-1.5 w-full accent-primary-500"
                >
              </div>
              <button
                type="button"
                class="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-600"
                @click="applySidebar"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </aside>

        <div class="min-w-0 flex-1">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-slate-500 dark:text-slate-400">
                Showing {{ browseStore.pagination.total }} results for
              </span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                "{{ categoryChipLabel }}"
              </span>
            </div>

            <div class="hidden items-center gap-2 rounded-xl border border-primary-100 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 sm:flex">
              <button
                v-for="option in sortOptions"
                :key="option.key"
                type="button"
                class="rounded-lg px-4 py-1.5 text-xs font-bold transition"
                :class="browseTab === option.key
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'
                  : 'text-slate-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'"
                @click="browseTab = option.key"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Mobile tab row -->
          <div class="mb-6 flex sm:hidden rounded-xl border border-primary-100 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              v-for="option in sortOptions"
              :key="'mt-' + option.key"
              type="button"
              class="flex-1 rounded-lg py-2 text-[11px] font-bold transition"
              :class="browseTab === option.key
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'
                : 'text-slate-500'"
              @click="browseTab = option.key"
            >
              {{ option.label }}
            </button>
          </div>

          <div v-if="browseStore.loading" class="py-20 flex justify-center">
            <LoadingState text="Loading events..." />
          </div>

          <div
            v-else-if="browseStore.items.length === 0"
            class="rounded-2xl border border-primary-100 bg-white py-14 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <AppLucideIcon name="event_busy" class="text-5xl text-slate-300" />
            <p class="mt-3 font-semibold">
              No public events match your filters
            </p>
          </div>

          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="event in browseStore.items"
              :key="event.id"
              :to="`/events/${event.slug}`"
              class="group overflow-hidden rounded-2xl border border-primary-50 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 block"
            >
              <article>
                <div class="relative aspect-16/10 overflow-hidden">
                  <img
                    :src="browseImage(event)"
                    :alt="event.title"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  >
                  <button
                    type="button"
                    aria-label="Save event"
                    class="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-400 shadow-md backdrop-blur-sm transition hover:text-primary-500"
                    @click.prevent.stop
                  >
                    <AppLucideIcon name="favorite" class="text-lg" />
                  </button>
                  <span class="absolute bottom-4 left-4 rounded-lg bg-primary-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {{ categoryBadge(event) }}
                  </span>
                </div>

                <div class="space-y-3 p-5">
                  <div class="flex items-center justify-between gap-2 text-xs font-bold text-primary-600 dark:text-primary-300">
                    <span class="min-w-0 uppercase tracking-wider">{{ browseRowDate(event) }}</span>
                    <span class="shrink-0">{{ browsePriceLabel(event) }}</span>
                  </div>
                  <h3 class="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                    {{ event.title }}
                  </h3>
                  <div class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <AppLucideIcon name="location_on" class="text-base" />
                    <span class="line-clamp-1">{{ browseVenueLine(event) }}</span>
                  </div>
                </div>
              </article>
            </NuxtLink>
          </div>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-white text-slate-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              :disabled="browseStore.pagination.page <= 1"
              @click="goToPage(browseStore.pagination.page - 1)"
            >
              <AppLucideIcon name="chevron_left" />
            </button>

            <button
              v-for="number in visiblePages"
              :key="number"
              type="button"
              class="h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition"
              :class="browseStore.pagination.page === number
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="goToPage(number)"
            >
              {{ number }}
            </button>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-white text-slate-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              :disabled="browseStore.pagination.page >= totalPages"
              @click="goToPage(browseStore.pagination.page + 1)"
            >
              <AppLucideIcon name="chevron_right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
