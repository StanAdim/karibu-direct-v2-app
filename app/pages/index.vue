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
    <!-- Hero Section -->
    <HeroSection
      title="Discover Amazing Events "
      highlight=" Near You"
      subtitle="Find concerts, workshops, and meetups happening in your city."
      :background-image="`${config.public.appBase}/images/defaults/events-1.png`"
      :show-search="true"
      :show-location-select="true"
      :locations="[ 'Dar es Salaam', 'Arusha', 'Zanzibar', 'Tanga', 'Morogoro', 'Mwanza']"
      @search="handleSearch"
    />

    <!-- Category pills -->
    <section class="px-4 py-4 md:px-6">
      <div class="mx-auto max-w-7xl">
        <p
          v-if="categoriesError"
          class="mb-2 text-xs text-amber-600 dark:text-amber-400"
        >
          Categories could not be loaded. You can still browse featured events.
        </p>
        <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <template v-if="categoriesLoading && categoryPills.length <= 1">
            <span class="text-sm text-slate-500 dark:text-slate-400 px-2">Loading categories…</span>
          </template>
          <CategoryButton
            v-for="cat in categoryPills"
            :key="cat.id"
            :label="cat.label"
            :icon="cat.icon"
            :active="activeCategoryId === cat.id"
            @click="activeCategoryId = cat.id"
          />
        </div>
      </div>
    </section>

    <!-- Featured Events -->
    <section class="px-4 py-12 md:px-6 bg-slate-50/50 dark:bg-slate-900/30">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Events</h2>
            <p class="mt-2 text-slate-500 dark:text-slate-400">Hand-picked experiences you can't miss</p>
          </div>
          <NuxtLink to="/events" class="text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors shrink-0" >
            View All Events
          </NuxtLink>
        </div>

        <div v-if="featuredLoading" class="py-16 flex justify-center">
          <LoadingState text="Loading featured events…" />
        </div>

        <p
          v-else-if="featuredError"
          class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-10 text-center text-slate-600 dark:text-slate-400"
        >
          Featured events couldn’t load. Try again later or browse the full list.
        </p>

        <p
          v-else-if="featuredEvents.length === 0"
          class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-10 text-center text-slate-600 dark:text-slate-400"
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
            @click="handleViewEvent(item.slug)"
          />
        </div>
      </div>
    </section>

    <!-- Explore Popular Cities: circular cards -->
    <section class="px-4 py-16 md:px-6">
      <div class="mx-auto max-w-7xl">
        <h2 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Explore Popular Cities</h2>
        <div class="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
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

    <!-- How It Works -->
    <section class="px-4 py-20 md:px-6 bg-slate-50/50 dark:bg-slate-900/30">
      <div class="mx-auto max-w-7xl">
        <h2 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How It Works</h2>
        <div class="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          <FeatureStep
            v-for="step in howItWorks"
            :key="step.step"
            :step="step.step"
            :title="step.title"
            :icon="step.icon"
            :description="step.description"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative overflow-hidden bg-primary-500 py-20">
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"
      />
      <div class="relative mx-auto max-w-7xl px-6 text-center">
        <h2 class="text-4xl font-black text-white">
          Ready to Host Your Own Event?
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Join thousands of organizers who trust our platform to create memorable experiences.
        </p>
        <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NuxtLink :to="getStartedRoute()">
            <button class="bg-white text-primary-500 px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:bg-white/90 transition-all">
              {{ isAuthenticated ? 'Go to Dashboard' : 'Start for Free' }}
            </button>
          </NuxtLink>
          <NuxtLink to="/organizer">
            <button class="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-all">
              Learn More
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
