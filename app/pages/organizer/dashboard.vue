<script setup lang="ts">
import RecentActivityCard from '~/components/dashboard/RecentActivityCard.vue'
import type { Event } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const { user } = useAuth()
const usersStore = useUsersStore()
const workspace = useOrganizerWorkspaceStore()
const eventsStore = useEventsStore()
const config = useRuntimeConfig()

type ActivityItem = {
  id: string | number
  title: string
  description: string
  timeAgo: string
  icon: string
  color: 'blue' | 'emerald' | 'amber'
}

const recentActivity = computed<ActivityItem[]>(() =>
  usersStore.activityLogs.slice(0, 10).map(log => {
    const baseId = log.id ?? log.timestamp ?? log.created_at ?? Math.random().toString(36).slice(2, 8)
    const type = (log.type || log.action || '').toString().toLowerCase()
    const status = (log.status as string | undefined)?.toLowerCase()

    let icon: ActivityItem['icon'] = 'activity_history'
    if (type.includes('ticket')) icon = 'confirmation_number'
    else if (type.includes('user') || type.includes('attendee')) icon = 'person'
    else if (type.includes('update')) icon = 'edit_calendar'

    let color: ActivityItem['color'] = 'amber'
    if (status === 'success') {
      color = 'emerald'
    }

    return {
      id: baseId,
      title: (log.title as string) || (log.action as string) || 'Activity',
      description: (log.description as string) || (log.details as string) || (log.entity_name as string) || '',
      timeAgo: (log.timestamp as string) || (log.created_at as string) || '',
      icon,
      color
    }
  })
)

async function loadRecentActivity(): Promise<void> {
  const userId = user.value?.id
  if (!userId) return
  try {
    await usersStore.fetchUserActivityLogs(userId)
  }
  catch {
    /* empty activity */
  }
}

async function bootstrap(): Promise<void> {
  try {
    await workspace.fetchProfile()
    await workspace.refreshDashboardSummary()
  }
  catch {
    /* cards show placeholders */
  }
  await loadRecentActivity()
}

onMounted(() => {
  void bootstrap()
})

watch(user, (u) => {
  if (u?.id) void loadRecentActivity()
})

const upcomingRows = computed(() => {
  const now = Date.now()
  return eventsStore.events
    .filter((e: Event) => {
      try {
        return new Date(e.start_date).getTime() >= now && e.status !== 'cancelled'
      }
      catch {
        return false
      }
    })
    .slice(0, 6)
    .map((e: Event) => {
      const start = new Date(e.start_date)
      const venue = e.venue?.type === 'virtual'
        ? 'Online'
        : [e.venue?.name, e.venue?.city].filter(Boolean).join(', ')
      const cap = e.capacity || 0
      const sold = e.registered_count || 0
      return {
        id: e.id,
        name: e.title,
        venue: venue || '—',
        date: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        capacity: cap || 1,
        sold,
        revenue: '—',
        status: sold / (cap || 1) >= 0.9 ? 'selling_fast' as const : 'on_sale' as const,
        coverUrl: getEventCoverImageUrl(
          e.cover_image,
          String(config.public.apiBase ?? ''),
          `${config.public.appBase}/images/defaults/events-0.png`
        )
      }
    })
})

function capacityProgress(row: { sold: number; capacity: number }) {
  return Math.round((row.sold / row.capacity) * 100)
}

const eventBuckets = computed(() => ({
  draft: eventsStore.events.filter((e: Event) => e.status === 'draft').length,
  published: eventsStore.events.filter((e: Event) => e.status === 'published').length,
  archived: eventsStore.events.filter((e: Event) =>
    e.status === 'completed' || e.status === 'archived' || e.status === 'cancelled'
  ).length
}))
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        Welcome back, {{ user?.first_name || 'Organizer' }}
      </p>
      <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Overview
      </h1>
    </div>

    <OrganizerDashboardCards
      :summary="workspace.dashboardSummary"
      :loading="workspace.loadingDashboard || workspace.loadingProfile"
    />

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-4">
        <OrganizerAnalyticsChart
          title="Sales Performance"
          subtitle="Trend preview — connect analytics backend when ready"
        />

        <article class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h2 class="font-bold text-lg text-slate-900 dark:text-white">
              Event pipeline
            </h2>
            <NuxtLink
              to="/organizer/events/create"
              class="text-primary-500 text-sm font-bold hover:underline"
            >
              Create event
            </NuxtLink>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="row in [
                { k: 'draft', label: 'Draft events', hint: 'Not visible publicly', to: '/organizer/events' },
                { k: 'published', label: 'Published', hint: 'Live on platform', to: '/organizer/events' },
                { k: 'archived', label: 'Archived / completed', hint: 'History', to: '/organizer/events' },
              ]"
              :key="row.k"
              class="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-800/40"
            >
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {{ row.label }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {{ row.k === 'draft' ? eventBuckets.draft : row.k === 'published' ? eventBuckets.published : eventBuckets.archived }}
              </p>
              <p class="text-xs text-slate-500 mt-2">
                {{ row.hint }}
              </p>
              <NuxtLink
                :to="row.to"
                class="text-primary-500 text-xs font-bold mt-2 inline-block hover:underline"
              >
                Open
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <RecentActivityCard
        :items="recentActivity"
        title="Recent Activity"
        view-all-to="/organizer/profile/activity"
        view-all-label="View All Logs"
        empty-label="No recent activity for your events yet."
      />
    </section>

    <section class="bg-white dark:bg-slate-900 rounded-xl border border-primary-500/10 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white">
          Upcoming Events
        </h2>
        <NuxtLink to="/organizer/events" class="text-primary-500 text-sm font-bold hover:underline shrink-0">
          View All
        </NuxtLink>
      </div>
      <div v-if="!upcomingRows.length" class="p-8 text-center text-sm text-slate-500">
        No upcoming events yet.
        <NuxtLink to="/organizer/events/create" class="text-primary-500 font-semibold ml-1 hover:underline">Create one</NuxtLink>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left min-w-[640px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50">
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Event Details
              </th>
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date &amp; Time
              </th>
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Capacity
              </th>
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="event in upcomingRows"
              :key="event.id"
              class="align-middle"
            >
              <td class="px-4 py-2">
                <div class="flex items-center gap-3">
                  <div
                    class="size-10 rounded-lg bg-slate-100 bg-cover bg-center shrink-0"
                    :style="{ backgroundImage: `url('${event.coverUrl}')` }"
                  />
                  <div>
                    <p class="font-bold text-sm text-slate-900 dark:text-white">
                      {{ event.name }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ event.venue }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-2">
                <p class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ event.date }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ event.time }}
                </p>
              </td>
              <td class="px-4 py-2">
                <div class="w-full max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500"
                    :style="{ width: `${capacityProgress(event)}%` }"
                  />
                </div>
                <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {{ event.sold }} / {{ event.capacity }} sold
                </p>
              </td>
              <td class="px-4 py-2 font-bold text-sm text-slate-900 dark:text-white">
                {{ event.revenue }}
              </td>
              <td class="px-4 py-2">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="event.status === 'selling_fast'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="event.status === 'selling_fast' ? 'bg-amber-500' : 'bg-emerald-500'"
                  />
                  <span>
                    {{ event.status === 'selling_fast' ? 'Selling Fast' : 'On Sale' }}
                  </span>
                </span>
              </td>
              <td class="px-4 py-2 text-right">
                <NuxtLink
                  :to="`/organizer/events/${event.id}`"
                  class="text-primary-500 text-sm font-semibold hover:underline"
                >
                  Manage
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
