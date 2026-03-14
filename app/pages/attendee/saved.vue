<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

type TabId = 'upcoming' | 'past' | 'archived'

interface SavedEvent {
  id: string
  title: string
  category: string
  date: string
  time: string
  location: string
  price: number | null
  image: string
  isUpcoming: boolean
  isArchived: boolean
}

const activeTab = ref<TabId>('upcoming')

const savedEvents = ref<SavedEvent[]>([
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    category: 'TECHNOLOGY',
    date: 'June 15, 2024',
    time: '09:00 AM',
    location: 'Moscone Center, San Francisco',
    price: 199,
    image: 'https://picsum.photos/seed/tech-summit/800/500',
    isUpcoming: true,
    isArchived: false
  },
  {
    id: '2',
    title: 'Blue Note Jazz Night',
    category: 'MUSIC',
    date: 'June 22, 2024',
    time: '08:00 PM',
    location: 'Blue Note Lounge, Seattle',
    price: 50,
    image: 'https://picsum.photos/seed/jazz/800/500',
    isUpcoming: true,
    isArchived: false
  },
  {
    id: '3',
    title: 'Design Workshop Series',
    category: 'ARTS',
    date: 'July 10, 2024',
    time: '02:00 PM',
    location: 'Creative Hub, Austin',
    price: 25,
    image: 'https://picsum.photos/seed/design/800/500',
    isUpcoming: true,
    isArchived: false
  },
  {
    id: '4',
    title: 'Startup Pitch Night',
    category: 'STARTUP',
    date: 'July 18, 2024',
    time: '06:00 PM',
    location: 'WeWork Downtown, NYC',
    price: 0,
    image: 'https://picsum.photos/seed/startup/800/500',
    isUpcoming: true,
    isArchived: false
  },
  {
    id: '5',
    title: 'Food & Wine Festival',
    category: 'FOOD',
    date: 'August 5, 2024',
    time: '12:00 PM',
    location: 'Pier 39, San Francisco',
    price: 75,
    image: 'https://picsum.photos/seed/food/800/500',
    isUpcoming: true,
    isArchived: false
  },
  {
    id: '6',
    title: 'Community 5K Run',
    category: 'SPORTS',
    date: 'August 12, 2024',
    time: '07:00 AM',
    location: 'Golden Gate Park',
    price: 35,
    image: 'https://picsum.photos/seed/sports/800/500',
    isUpcoming: true,
    isArchived: false
  }
])

const upcomingCount = computed(() => savedEvents.value.filter(e => e.isUpcoming && !e.isArchived).length)

const filteredEvents = computed(() => {
  switch (activeTab.value) {
    case 'upcoming':
      return savedEvents.value.filter(e => e.isUpcoming && !e.isArchived)
    case 'past':
      return savedEvents.value.filter(e => !e.isUpcoming && !e.isArchived)
    case 'archived':
      return savedEvents.value.filter(e => e.isArchived)
    default:
      return savedEvents.value
  }
})

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'Free Entry'
  return `$${price.toFixed(2)}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Saved Events
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Manage your bookmarked and interested events in one place.
      </p>
    </div>

    <!-- Tabs: Upcoming (n) | Past Events | Archived -->
    <div class="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
      <button
        type="button"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors -mb-px',
          activeTab === 'upcoming'
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
        ]"
        @click="activeTab = 'upcoming'"
      >
        Upcoming ({{ upcomingCount }})
      </button>
      <button
        type="button"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors -mb-px',
          activeTab === 'past'
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
        ]"
        @click="activeTab = 'past'"
      >
        Past Events
      </button>
      <button
        type="button"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors -mb-px',
          activeTab === 'archived'
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
        ]"
        @click="activeTab = 'archived'"
      >
        Archived
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredEvents.length === 0"
      class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center"
    >
      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">favorite</span>
      <p class="mt-4 text-slate-600 dark:text-slate-400 font-medium">
        No saved events in this tab
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Browse events and tap the heart to save ones you like.
      </p>
      <NuxtLink
        to="/attendee/events"
        class="mt-6 inline-flex items-center rounded-xl bg-primary-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-600 transition-colors"
      >
        Find Events
      </NuxtLink>
    </div>

    <!-- Event grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="event in filteredEvents"
        :key="event.id"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
      >
        <NuxtLink :to="`/attendee/events/${event.id}`" class="flex flex-col flex-1">
          <div class="relative aspect-[16/10] overflow-hidden">
            <img :src="event.image" :alt="event.title" class="h-full w-full object-cover">
            <span class="absolute left-4 bottom-4 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wide">
              {{ event.category }}
            </span>
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-md text-primary-500 hover:bg-white dark:hover:bg-slate-800"
              @click.prevent
            >
              <span class="material-symbols-outlined text-lg">favorite</span>
            </button>
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <h3 class="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-3">
              {{ event.title }}
            </h3>
            <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-1">
              <span class="material-symbols-outlined text-base">calendar_today</span>
              {{ event.date }} • {{ event.time }}
            </p>
            <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span class="material-symbols-outlined text-base">location_on</span>
              <span class="line-clamp-1">{{ event.location }}</span>
            </p>
            <p class="flex items-center gap-1.5 text-sm mb-4">
              <span class="material-symbols-outlined text-base text-slate-500">payments</span>
              <span :class="event.price === 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300'">
                {{ formatPrice(event.price) }}
              </span>
            </p>
            <span class="mt-auto inline-flex items-center justify-center rounded-xl bg-primary-500 text-white text-sm font-semibold py-2.5 w-full hover:bg-primary-600 transition-colors">
              Get Ticket
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>
  </div>
</template>
