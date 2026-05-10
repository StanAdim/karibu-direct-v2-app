<script setup lang="ts">
import type { EventCategory, EventPublicBrowseItem } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import { eventCategoryMaterialIcon } from '~/utils/eventCategoryIcon'

definePageMeta({
  layout: 'public'
})

const { isAuthenticated, user } = useAuth()
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()
const api = useApi()

interface LandingCategoryPill {
  id: 'all' | string
  label: string
  icon: string
}

const categoriesLoading = ref(false)
const categoriesError = ref(false)
const apiCategories = ref<EventCategory[]>([])

const activeCategoryId = ref<'all' | string>('all')

const featuredLoading = ref(true)
const featuredError = ref(false)
const featuredEvents = ref<EventPublicBrowseItem[]>([])

function normalizeCategoriesList(raw: unknown): EventCategory[] {
  const items: Record<string, unknown>[] = []
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (x && typeof x === 'object') items.push(x as Record<string, unknown>)
    }
  }
  else if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const list = o.data ?? o.results
    if (Array.isArray(list)) {
      for (const x of list) {
        if (x && typeof x === 'object') items.push(x as Record<string, unknown>)
      }
    }
  }
  const out: EventCategory[] = []
  for (const rec of items) {
    const id = rec.id != null ? String(rec.id) : rec.slug != null ? String(rec.slug) : ''
    if (!id) continue
    const nameRaw = rec.name ?? rec.title ?? rec.label ?? id
    out.push({
      id,
      name: String(nameRaw),
      slug: rec.slug != null ? String(rec.slug) : undefined
    })
  }
  return out
}

function extractPaginatedData<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data)) return o.data as T[]
    if (Array.isArray(o.results)) return o.results as T[]
  }
  return []
}

const categoryPills = computed((): LandingCategoryPill[] => {
  const all: LandingCategoryPill = {
    id: 'all',
    label: 'All Events',
    icon: 'grid_view'
  }
  const rest = apiCategories.value.map((c): LandingCategoryPill => ({
    id: c.id,
    label: c.name,
    icon: eventCategoryMaterialIcon(c)
  }))
  return [all, ...rest]
})

async function loadLandingCategories(): Promise<void> {
  categoriesLoading.value = true
  categoriesError.value = false
  try {
    const raw = await api.get<unknown>('/events/categories/?page=1&size=100', {
      suppressErrorToast: true
    })
    apiCategories.value = normalizeCategoriesList(raw)
    if (
      activeCategoryId.value !== 'all'
      && !apiCategories.value.some(c => c.id === activeCategoryId.value)
    ) {
      activeCategoryId.value = 'all'
    }
  }
  catch {
    categoriesError.value = true
    apiCategories.value = []
  }
  finally {
    categoriesLoading.value = false
  }
}

async function loadFeaturedEvents(): Promise<void> {
  featuredLoading.value = true
  featuredError.value = false
  try {
    const params = new URLSearchParams({
      page: '1',
      size: '8',
      browse_tab: 'popular'
    })
    if (activeCategoryId.value !== 'all') {
      params.append('category_id', activeCategoryId.value)
    }
    const raw = await api.get<unknown>(`/events/public/browse?${params.toString()}`, {
      suppressErrorToast: true
    })
    featuredEvents.value = extractPaginatedData<EventPublicBrowseItem>(raw)
  }
  catch {
    featuredError.value = true
    featuredEvents.value = []
  }
  finally {
    featuredLoading.value = false
  }
}

function featuredCardLocation(item: EventPublicBrowseItem): string {
  const bits = [item.venue_name, item.venue_city].filter(Boolean)
  return bits.length ? bits.join(', ') : '—'
}

function featuredDateBadge(iso: string): string {
  const d = new Date(iso)
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return `${month} ${d.getDate()}`
}

function featuredPrice(item: EventPublicBrowseItem): number | 'Free' {
  const p = item.min_ticket_price
  if (p == null || p === 0) return 'Free'
  return Number(p)
}

function featuredCover(item: EventPublicBrowseItem): string {
  return getEventCoverImageUrl(
    item.cover_image ?? undefined,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/home-${item.id}/800/500`
  )
}

onMounted(() => {
  void loadLandingCategories()
  void loadFeaturedEvents()
})

watch(activeCategoryId, () => {
  void loadFeaturedEvents()
})

const popularCities = [
  { name: 'Dar es salaam', image: '/images/cities/Dar.jpeg', eventCount: 320 },
  { name: 'Arusha', image: '/images/cities/Arusha.jpeg', eventCount: 280 },
  { name: 'Dodoma', image: '/images/cities/Dodoma.jpeg', eventCount: 195 },
  { name: 'Mwanza', image: '/images/cities/Mwanza.jpeg', eventCount: 168 },
  { name: 'Mbeya', image: '/images/cities/Mbeya.jpg', eventCount: 240 },
  { name: 'Zanzibar', image: '/images/cities/Zanzibar.jpg', eventCount: 156 }
]

const howItWorks = [
  { step: 1, title: 'Find Events', icon: 'search', description: 'Browse thousands of events or search for specific interests and locations.' },
  { step: 2, title: 'Book Tickets', icon: 'local_activity', description: 'Secure your spot instantly with our fast and safe checkout process.' },
  { step: 3, title: 'Have Fun', icon: 'celebration', description: 'Get your tickets on your phone and enjoy your unforgettable experience.' }
]

function getStartedRoute(): string {
  if (isAuthenticated.value && user.value) {
    return authStore.getDefaultRoute()
  }
  return '/register'
}

function handleSearch(query: string, location?: string) {
  router.push({
    path: '/events',
    query: { q: query, location }
  })
}

function handleViewEvent(slug: string) {
  router.push(`/events/${slug}`)
}

function handleSelectCity(city: string) {
  router.push({
    path: '/events',
    query: { location: city }
  })
}
</script>

<template>
  <div>
    <HeroSection
      title="Discover amazing events"
      highlight=" near you"
      subtitle="Find concerts, workshops, and meetups happening in your city — curated for discovery, built for memories."
      :background-image="`${config.public.appBase}/images/defaults/events-1.png`"
      :show-search="true"
      :show-location-select="true"
      :locations="['Dar es Salaam', 'Arusha', 'Zanzibar', 'Tanga', 'Morogoro', 'Mwanza']"
      @search="handleSearch"
    />

    <section class="public-section-tight border-b border-slate-200/60 dark:border-slate-800/60">
      <div class="public-container">
        <p
          v-if="categoriesError"
          class="mb-3 text-xs font-medium text-amber-700 dark:text-amber-400"
        >
          Categories could not be loaded. You can still browse featured events.
        </p>
        <div
          class="-mx-1 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-1 pb-3 pt-1 scrollbar-hide md:gap-3 md:pb-2"
          role="list"
          aria-label="Event categories"
        >
          <template v-if="categoriesLoading && categoryPills.length <= 1">
            <span class="snap-start px-2 text-sm text-slate-500 dark:text-slate-400">Loading categories…</span>
          </template>
          <CategoryButton
            v-for="cat in categoryPills"
            :key="cat.id"
            :label="cat.label"
            :icon="cat.icon"
            :active="activeCategoryId === cat.id"
            class="snap-start"
            role="listitem"
            @click="activeCategoryId = cat.id"
          />
        </div>
      </div>
    </section>

    <section class="public-section public-surface-band">
      <div class="public-container">
        <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="public-eyebrow">
              Curated for you
            </p>
            <h2 class="public-heading-lg mt-2">
              Featured events
            </h2>
            <p class="public-prose-muted mt-2 max-w-xl">
              Hand-picked experiences trending across the community.
            </p>
          </div>
          <NuxtLink to="/events" class="public-focus-ring public-link-arrow shrink-0 rounded-lg">
            View all
            <AppLucideIcon name="arrow_forward" class="text-base" aria-hidden="true" />
          </NuxtLink>
        </div>

        <div v-if="featuredLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PublicEventCardSkeleton v-for="n in 4" :key="n" />
        </div>

        <p
          v-else-if="featuredError"
          class="public-card-surface px-6 py-10 text-center text-slate-600 dark:text-slate-400"
        >
          Featured events couldn’t load. Try again later or browse the full list.
        </p>

        <p
          v-else-if="featuredEvents.length === 0"
          class="public-card-surface px-6 py-10 text-center text-slate-600 dark:text-slate-400"
        >
          No public events match this filter right now.
        </p>

        <div
          v-else
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <PublicEventCard
            v-for="item in featuredEvents"
            :id="item.id"
            :key="item.id"
            :title="item.title"
            :image="featuredCover(item)"
            :date="featuredDateBadge(item.start_date)"
            :location="featuredCardLocation(item)"
            :price="featuredPrice(item)"
            :category="item.primary_category_name?.trim() || 'Event'"
            :show-favorite="false"
            @click="handleViewEvent(item.slug)"
          />
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-container">
        <div class="mx-auto max-w-2xl text-center">
          <p class="public-eyebrow">
            Popular destinations
          </p>
          <h2 class="public-heading-lg mt-2">
            Explore cities
          </h2>
          <p class="public-prose-muted mt-3">
            Jump into what’s happening where you live — or plan your next trip around an experience.
          </p>
        </div>
        <div class="mt-12 grid grid-cols-2 justify-items-center gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          <CityCard
            v-for="city in popularCities"
            :key="city.name"
            :name="city.name"
            :image="city.image"
            :event-count="city.eventCount"
            @click="handleSelectCity(city.name)"
          />
        </div>
      </div>
    </section>

    <section class="public-section public-surface-band">
      <div class="public-container">
        <div class="mx-auto max-w-2xl text-center">
          <p class="public-eyebrow">
            Simple flow
          </p>
          <h2 class="public-heading-lg mt-2">
            How it works
          </h2>
          <p class="public-prose-muted mt-3">
            From discovery to your ticket — three quick steps.
          </p>
        </div>
        <div class="mt-14 grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-8">
          <FeatureStep
            v-for="(step, index) in howItWorks"
            :key="step.step"
            :step="step.step"
            :title="step.title"
            :icon="step.icon"
            :description="step.description"
            :show-connector-tail="index < howItWorks.length - 1"
          />
        </div>
      </div>
    </section>

    <section class="relative isolate overflow-hidden py-20 md:py-24 public-gradient-cta">
      <div
        class="absolute inset-0 opacity-[0.12]"
        style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -left-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-24 bottom-0 size-[22rem] rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden="true"
      />

      <div class="public-container relative text-center">
        <h2 class="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          Ready to host your own event?
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-pretty text-lg text-white/85">
          Join organizers who use {{ config.public.appName }} to sell tickets, grow audiences, and run unforgettable experiences.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <NuxtLink :to="getStartedRoute()" class="w-full sm:w-auto">
            <button
              type="button"
              class="public-focus-ring w-full min-h-[3.25rem] rounded-2xl bg-white px-8 text-base font-bold text-primary-600 shadow-xl shadow-slate-950/25 transition hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.99] dark:text-primary-700 sm:min-w-[12rem]"
            >
              {{ isAuthenticated ? 'Go to dashboard' : 'Start for free' }}
            </button>
          </NuxtLink>
          <NuxtLink to="/organizer/dashboard" class="w-full sm:w-auto">
            <button
              type="button"
              class="public-focus-ring w-full min-h-[3.25rem] rounded-2xl border-2 border-white/80 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:min-w-[12rem]"
            >
              Explore hosting
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
