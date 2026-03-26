<script setup lang="ts">
import type { ActivityLog } from '~/types'
import RecentActivityCard from '~/components/dashboard/RecentActivityCard.vue'

import { watch } from 'vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const { user } = useAuth()
const usersStore = useUsersStore()

const firstName = computed(() => user.value?.first_name || 'there')

const stats = ref([
  {
    title: 'Total Tickets',
    value: '12',
    materialIcon: 'confirmation_number',
    variant: 'blue' as const,
    trend: { value: '+2', direction: 'up' as const }
  },
  {
    title: 'Saved Events',
    value: '24',
    materialIcon: 'favorite',
    variant: 'purple' as const,
    trend: { value: '+5', direction: 'up' as const }
  },
  {
    title: 'Attended',
    value: '48',
    materialIcon: 'event_available',
    variant: 'amber' as const,
    subtitle: 'Upcoming'
  },
  {
    title: 'Rewards Points',
    value: '1,250',
    materialIcon: 'military_tech',
    variant: 'slate' as const,
    subtitle: 'Rewards'
  }
])

const upcomingEvents = ref([
  {
    id: '1',
    title: 'Future of AI Summit 2024',
    date: 'OCT 15',
    category: 'TECH CONFERENCE',
    location: 'Convention Center, San Francisco',
    time: '09:00 AM - 05:00 PM',
    image: 'https://picsum.photos/seed/ai-summit/800/500'
  },
  {
    id: '2',
    title: 'Midnight Jazz Collective',
    date: 'NOV 02',
    category: 'CONCERT',
    location: 'Blue Note Lounge, Seattle',
    time: '08:30 PM - 11:30 PM',
    image: 'https://picsum.photos/seed/jazz/800/500'
  }
])

type RecentActivityItem = {
  id: string | number
  title: string
  description?: string
  timeAgo?: string
  color?: 'blue' | 'emerald' | 'amber'
}

const recentActivity = ref<RecentActivityItem[]>([])

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

onNuxtReady(() => {
  if (user.value?.id) {
    void loadRecentActivity()
    return
  }

  // If auth hydration hasn't populated `user` yet, wait for it once.
  const stop = watch(user, (u) => {
    if (u?.id) {
      stop()
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
            <span class="text-primary-500 font-semibold ml-2">3 active</span>
          </h2>
          <NuxtLink
            to="/attendee/tickets"
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
              <div class="relative aspect-[16/10] overflow-hidden">
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
                  class="absolute right-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-md hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-primary-500"
                  @click.prevent
                >
                  <span class="material-symbols-outlined text-lg">favorite</span>
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
