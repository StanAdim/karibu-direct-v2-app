<script setup lang="ts">
import { computed, ref, watch } from 'vue'

declare const definePageMeta: (meta: Record<string, unknown>) => void

definePageMeta({
  layout: 'public'
})

interface EventItem {
  id: string
  title: string
  image: string
  type: string
  dateLabel: string
  location: string
  priceLabel: string
  sortGroup: 'popular' | 'upcoming' | 'nearest'
}

const searchQuery = ref('')
const selectedLocation = ref('New York, NY')
const selectedCategory = ref('All Categories')
const selectedSort = ref<'popular' | 'upcoming' | 'nearest'>('popular')
const selectedDateFilters = ref<string[]>(['Anytime'])
const maxPrice = ref(500)
const page = ref(1)
const pageSize = 6

const locations = ['New York, NY', 'Dar es Salaam', 'Arusha', 'Zanzibar', 'London', 'Tokyo']
const categories = ['All Categories', 'Music', 'Exhibit', 'Tech', 'Nightlife', 'Theatre', 'Conference']
const dateOptions = ['Anytime', 'Today', 'This Weekend']
const sortOptions: Array<{ key: 'popular' | 'upcoming' | 'nearest'; label: string }> = [
  { key: 'popular', label: 'Popular' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'nearest', label: 'Nearest' }
]

const allEvents = ref<EventItem[]>([
  {
    id: 'neon-pulse-music-festival',
    title: 'Neon Pulse Music Festival',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
    type: 'Music',
    dateLabel: 'Sat, Oct 12 • 7:00 PM',
    location: 'Brooklyn Mirage, NY',
    priceLabel: '$45.00+',
    sortGroup: 'popular'
  },
  {
    id: 'future-forms-digital-art-expo',
    title: 'Future Forms: Digital Art Expo',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200',
    type: 'Exhibit',
    dateLabel: 'Oct 15 - Oct 20',
    location: 'MoMA, New York',
    priceLabel: 'FREE',
    sortGroup: 'popular'
  },
  {
    id: 'innovate-nyc-2024',
    title: 'Innovate NYC 2024',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    type: 'Tech',
    dateLabel: 'Tue, Nov 05 • 9:00 AM',
    location: 'Javits Center, NY',
    priceLabel: '$299.00',
    sortGroup: 'popular'
  },
  {
    id: 'midnight-groove-sessions',
    title: 'Midnight Groove Sessions',
    image: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b3f4?w=1200',
    type: 'Nightlife',
    dateLabel: 'Fri, Oct 11 • 10:00 PM',
    location: 'Blue Note Jazz Club, NY',
    priceLabel: '$20.00',
    sortGroup: 'upcoming'
  },
  {
    id: 'shakespeare-in-the-park',
    title: 'Shakespeare in the Park',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200',
    type: 'Theatre',
    dateLabel: 'Thu, Oct 17 • 8:00 PM',
    location: 'Central Park, NY',
    priceLabel: '$85.00+',
    sortGroup: 'upcoming'
  },
  {
    id: 'design-matters-summit',
    title: 'Design Matters Summit',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
    type: 'Conference',
    dateLabel: 'Wed, Dec 11 • 10:00 AM',
    location: 'Chelsea Piers, NY',
    priceLabel: '$150.00',
    sortGroup: 'nearest'
  },
  {
    id: 'brooklyn-house-vibes',
    title: 'Brooklyn House Vibes',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
    type: 'Music',
    dateLabel: 'Sat, Oct 19 • 11:00 PM',
    location: 'Elsewhere, NY',
    priceLabel: '$35.00',
    sortGroup: 'nearest'
  },
  {
    id: 'product-design-week',
    title: 'Product Design Week',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1200',
    type: 'Conference',
    dateLabel: 'Mon, Nov 18 • 9:30 AM',
    location: 'Manhattan Center, NY',
    priceLabel: '$89.00+',
    sortGroup: 'upcoming'
  }
])

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredEvents = computed(() => {
  return allEvents.value.filter((event) => {
    const matchesSearch = !normalizedQuery.value
      || event.title.toLowerCase().includes(normalizedQuery.value)
      || event.location.toLowerCase().includes(normalizedQuery.value)
      || event.type.toLowerCase().includes(normalizedQuery.value)

    const matchesCategory = selectedCategory.value === 'All Categories'
      || event.type.toLowerCase() === selectedCategory.value.toLowerCase()

    const matchesSort = event.sortGroup === selectedSort.value
    return matchesSearch && matchesCategory && matchesSort
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / pageSize)))

const paginatedEvents = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredEvents.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const current = page.value
  const total = totalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) return [1, 2, 3, 4, total]
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total]
  return [1, current - 1, current, current + 1, total]
})

watch([selectedSort, selectedCategory, searchQuery], () => {
  page.value = 1
})

function toggleDateFilter(option: string) {
  if (option === 'Anytime') {
    selectedDateFilters.value = ['Anytime']
    return
  }

  const current = new Set(selectedDateFilters.value.filter(item => item !== 'Anytime'))
  if (current.has(option)) current.delete(option)
  else current.add(option)

  selectedDateFilters.value = current.size ? Array.from(current) : ['Anytime']
}

function resetFilters() {
  searchQuery.value = ''
  selectedLocation.value = 'New York, NY'
  selectedCategory.value = 'All Categories'
  selectedSort.value = 'popular'
  selectedDateFilters.value = ['Anytime']
  maxPrice.value = 500
  page.value = 1
}

function goToPage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value) return
  page.value = nextPage
}
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
          <span class="material-symbols-outlined text-primary-500">search</span>
          <input
            v-model="searchQuery"
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
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Filters</h2>
              <button
                class="text-xs font-semibold text-primary-500 hover:underline"
                type="button"
                @click="resetFilters"
              >
                Reset all
              </button>
            </div>

            <div class="space-y-6">
              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                <div class="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
                  <span class="material-symbols-outlined text-primary-500">location_on</span>
                  <select
                    v-model="selectedLocation"
                    class="w-full border-none bg-transparent p-0 text-sm font-medium text-slate-700 outline-none focus:ring-0 dark:text-slate-200"
                  >
                    <option v-for="location in locations" :key="location" :value="location">
                      {{ location }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
                <label
                  v-for="option in dateOptions"
                  :key="option"
                  class="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    :checked="selectedDateFilters.includes(option)"
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
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Category</p>
                <select
                  v-model="selectedCategory"
                  class="w-full rounded-xl border border-primary-100 bg-primary-50 py-2 text-sm font-medium text-slate-700 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range</p>
                <input
                  v-model="maxPrice"
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-primary-100 accent-primary-500 dark:bg-slate-700"
                >
                <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>$0</span>
                  <span>${{ maxPrice }}+</span>
                </div>
              </div>

              <button
                type="button"
                class="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-600"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </aside>

        <div class="min-w-0 flex-1">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500 dark:text-slate-400">
                Showing {{ filteredEvents.length }} results for
              </span>
              <span class="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                "{{ selectedCategory === 'All Categories' ? 'All Events' : selectedCategory }}"
              </span>
            </div>

            <div class="hidden items-center gap-2 rounded-xl border border-primary-100 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 sm:flex">
              <button
                v-for="option in sortOptions"
                :key="option.key"
                type="button"
                class="rounded-lg px-4 py-1.5 text-xs font-bold transition"
                :class="selectedSort === option.key
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'
                  : 'text-slate-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'"
                @click="selectedSort = option.key"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="event in paginatedEvents"
              :key="event.id"
              class="group overflow-hidden rounded-2xl border border-primary-50 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div class="relative aspect-16/10 overflow-hidden">
                <img
                  :src="event.image"
                  :alt="event.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                >
                <button
                  type="button"
                  aria-label="Save event"
                  class="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-400 shadow-md backdrop-blur-sm transition hover:text-primary-500"
                >
                  <span class="material-symbols-outlined">favorite</span>
                </button>
                <span class="absolute bottom-4 left-4 rounded-lg bg-primary-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  {{ event.type }}
                </span>
              </div>

              <div class="space-y-3 p-5">
                <div class="flex items-center justify-between text-xs font-bold text-primary-600 dark:text-primary-300">
                  <span class="uppercase tracking-widest">{{ event.dateLabel }}</span>
                  <span>{{ event.priceLabel }}</span>
                </div>
                <h3 class="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
                  {{ event.title }}
                </h3>
                <div class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <span class="material-symbols-outlined text-sm">location_on</span>
                  <span class="line-clamp-1">{{ event.location }}</span>
                </div>
              </div>
            </article>
          </div>

          <div class="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-white text-slate-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              :disabled="page === 1"
              @click="goToPage(page - 1)"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>

            <button
              v-for="number in visiblePages"
              :key="number"
              type="button"
              class="h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition"
              :class="page === number
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="goToPage(number)"
            >
              {{ number }}
            </button>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-100 bg-white text-slate-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              :disabled="page === totalPages"
              @click="goToPage(page + 1)"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
