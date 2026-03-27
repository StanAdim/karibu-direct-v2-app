<script setup lang="ts">
import RecentActivityCard from '~/components/dashboard/RecentActivityCard.vue'
import { getEventCoverImageUrl } from '~/utils/eventImage'

import { watch } from 'vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const { user } = useAuth()
const usersStore = useUsersStore()
const eventsStore = useEventsStore()
const api = useApi()
const config = useRuntimeConfig()

const firstName = computed(() => user.value?.first_name || 'there')

type ApiAttendeeStat = {
  title: string
  value: string
  trend: unknown | null
  subtitle: string | null
}

type AttendeeStatsResponse = {
  success?: boolean
  data?: {
    role?: string
    stats?: ApiAttendeeStat[]
  }
}

type DashboardStat = {
  title: string
  value: string
  materialIcon: string
  variant: 'blue' | 'purple' | 'amber' | 'slate'
  trend?: { value: string, direction: 'up' | 'down' }
  subtitle?: string
}

const defaultStats: DashboardStat[] = [
  {
    title: 'Total Tickets',
    value: '0',
    materialIcon: 'confirmation_number',
    variant: 'blue'
  },
  {
    title: 'Saved Events',
    value: '0',
    materialIcon: 'favorite',
    variant: 'purple'
  },
  {
    title: 'Attended',
    value: '0',
    materialIcon: 'event_available',
    variant: 'amber',
    subtitle: 'Checked in'
  },
  {
    title: 'Rewards Points',
    value: '0',
    materialIcon: 'military_tech',
    variant: 'slate',
    subtitle: 'Rewards'
  }
]

const stats = ref<DashboardStat[]>([...defaultStats])

const upcomingEvents = computed(() => {
  return eventsStore.upcomingEvents.slice(0, 4).map((event) => {
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    const category = event.categories?.[0] || 'EVENT'
    const location = event.venue?.type === 'virtual'
      ? 'Online'
      : [event.venue?.name, event.venue?.city].filter(Boolean).join(', ')

    return {
      id: event.id,
      title: event.title,
      date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      category: String(category).toUpperCase(),
      location: location || '—',
      time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
      isSaved: Boolean(event.is_saved) || eventsStore.isEventSaved(event.id),
      image: getEventCoverImageUrl(
        event.cover_image,
        String(config.public.apiBase ?? ''),
        `https://picsum.photos/seed/event-${event.id}/800/500`
      )
    }
  })
})

type RecentActivityItem = {
  id: string | number
  title: string
  description?: string
  timeAgo?: string
  color?: 'blue' | 'emerald' | 'amber'
}

const recentActivity = ref<RecentActivityItem[]>([])

async function loadAttendeeStats(): Promise<void> {
  try {
    const response = await api.get<AttendeeStatsResponse>('/registrations/stats')
    const apiStats = response?.data?.stats ?? []

    stats.value = defaultStats.map((baseStat) => {
      const matched = apiStats.find(item => item.title === baseStat.title)
      if (!matched) return baseStat

      const trend = matched.trend
      const normalizedTrend = (
        trend
        && typeof trend === 'object'
        && 'value' in trend
        && 'direction' in trend
        && ((trend as { direction: string }).direction === 'up' || (trend as { direction: string }).direction === 'down')
      )
        ? {
            value: String((trend as { value: unknown }).value ?? ''),
            direction: (trend as { direction: 'up' | 'down' }).direction
          }
        : undefined

      return {
        ...baseStat,
        value: String(matched.value ?? baseStat.value),
        trend: normalizedTrend,
        subtitle: matched.subtitle ?? baseStat.subtitle
      }
    })
  }
  catch {
    stats.value = [...defaultStats]
  }
}

async function loadRecentActivity(): Promise<void> {
  const userId = user.value?.id
  if (!userId) return

  try {
    const logs = await usersStore.fetchUserActivityLogs(userId)
    recentActivity.value = logs.slice(0, 10).map((log, index) => {
      const baseId = log.id ?? log.timestamp ?? log.created_at ?? index
      const status = (log.status as string | undefined)?.toLowerCase()

      return {
        id: baseId,
        title: (log.title as string) || (log.action as string) || 'Activity',
        description: (log.details as string) || (log.description as string) || (log.entity_name as string) || '',
        timeAgo: (log.timestamp as string) || (log.created_at as string) || '',
        color: status === 'success' ? 'emerald' : 'amber'
      }
    })
  }
  catch {
    recentActivity.value = []
  }
}

async function loadUpcomingEvents(): Promise<void> {
  try {
    eventsStore.setPage(1)
    eventsStore.setPerPage(8)
    await Promise.all([
      eventsStore.fetchEvents({
        status: 'published',
        visibility: 'public'
      }),
      eventsStore.fetchMySavedEvents()
    ])
  }
  catch {
    // Keep UI empty if events endpoint fails.
  }
}

async function toggleEventSaved(eventId: string, isSaved: boolean): Promise<void> {
  await eventsStore.toggleSavedEvent(eventId, !isSaved)
}

onNuxtReady(() => {
  if (user.value?.id) {
    void loadAttendeeStats()
    void loadUpcomingEvents()
    void loadRecentActivity()
    return
  }

  // If auth hydration hasn't populated `user` yet, wait for it once.
  const stop = watch(user, (u) => {
    if (u?.id) {
      stop()
      void loadAttendeeStats()
      void loadUpcomingEvents()
      void loadRecentActivity()
    }
  })
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Welcome back, {{ firstName }}! 👋
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
        Here's a summary of your upcoming experiences and event activity.
      </p>
    </div>

    <!-- Summary cards: 1 col mobile, 2 tablet, 4 desktop -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :material-icon="stat.materialIcon"
        :variant="stat.variant"
        :trend="stat.trend"
        :subtitle="stat.subtitle"
      />
    </div>

    <!-- Upcoming Events + Recent Activity + Upgrade -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Upcoming Events (2 cols on large) -->
      <section class="lg:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Upcoming Events
            <span class="text-primary-500 font-semibold ml-2">{{ upcomingEvents.length }} active</span>
          </h2>
          <NuxtLink
            to="/attendee/events"
            class="text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            View all
          </NuxtLink>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="event in upcomingEvents"
            :key="event.id"
            class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <NuxtLink :to="`/attendee/events/${event.id}`" class="block">
              <div class="relative aspect-16/10 overflow-hidden">
                <img
                  :src="event.image"
                  :alt="event.title"
                  class="h-full w-full object-cover"
                />
                <span class="absolute left-4 top-4 rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
                  {{ event.date }}
                </span>
                <button
                  type="button"
                  class="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  :class="event.isSaved ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'"
                  :disabled="eventsStore.isSavingEvent(event.id)"
                  :aria-label="event.isSaved ? 'Unsave event' : 'Save event'"
                  @click.prevent.stop="toggleEventSaved(event.id, event.isSaved)"
                >
                  <span class="material-symbols-outlined text-lg">
                    {{ event.isSaved ? 'favorite' : 'favorite_border' }}
                  </span>
                </button>
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">
                  {{ event.category }}
                </p>
                <h3 class="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">
                  {{ event.title }}
                </h3>
                <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <span class="material-symbols-outlined text-sm">location_on</span>
                  <span class="line-clamp-1">{{ event.location }}</span>
                </p>
                <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  {{ event.time }}
                </p>
                <div class="mt-4">
                  <span class="inline-flex items-center justify-center rounded-xl bg-primary-500 text-white text-sm font-semibold px-4 py-2 w-full sm:w-auto">
                    View Details
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <div
          v-if="upcomingEvents.length === 0"
          class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-400">event_available</span>
          <p class="mt-2 text-slate-600 dark:text-slate-400">No upcoming events</p>
          <AppButton
            to="/attendee/events"
            class="mt-4"
          >
            Find Events
          </AppButton>
        </div>
      </section>

      <!-- Right column: Recent Activity + Upgrade to Pro -->
      <aside class="space-y-6">
        <!-- Recent Activity -->
        <RecentActivityCard
          :items="recentActivity"
          title="Recent Activity"
          view-all-to="/attendee"
          view-all-label="View all activity"
          empty-label="No recent activity yet."
        />

        <!-- Upgrade to Pro -->
        <div class="relative rounded-2xl bg-primary-500 overflow-hidden p-6 text-white shadow-lg">
          <div class="absolute bottom-0 right-0 w-32 h-32 opacity-20" aria-hidden="true">
            <span class="material-symbols-outlined text-[120px]">star</span>
          </div>
          <h3 class="text-lg font-bold relative z-10">Upgrade to Pro</h3>
          <p class="mt-2 text-sm text-white/90 relative z-10">
            Get early access to tickets and 15% discount on all platform bookings.
          </p>
          <NuxtLink
            to="/attendee"
            class="mt-4 inline-flex items-center rounded-xl bg-white text-primary-600 font-semibold px-4 py-2.5 text-sm hover:bg-white/90 transition-colors relative z-10"
          >
            Learn More
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>
