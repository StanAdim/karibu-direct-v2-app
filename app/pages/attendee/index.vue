<script setup lang="ts">
import RecentActivityCard from '~/components/dashboard/RecentActivityCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import { watch } from 'vue'
import type { Event, Ticket } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee',
})

const { user } = useAuth()
const usersStore = useUsersStore()
const eventsStore = useEventsStore()
const registrationStore = useRegistrationStore()
const api = useApi()
const config = useRuntimeConfig()

const firstName = computed(() => user.value?.first_name || 'there')

const dashboardReady = ref(false)

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
  trend?: { value: string; direction: 'up' | 'down' }
  subtitle?: string
}

const defaultStats: DashboardStat[] = [
  { title: 'Total Tickets', value: '0', materialIcon: 'confirmation_number', variant: 'blue' },
  { title: 'Saved Events', value: '0', materialIcon: 'favorite', variant: 'purple' },
  { title: 'Attended', value: '0', materialIcon: 'event_available', variant: 'amber', subtitle: 'Checked in' },
  { title: 'Rewards Points', value: '0', materialIcon: 'military_tech', variant: 'slate', subtitle: 'Rewards' },
]

const stats = ref<DashboardStat[]>([...defaultStats])

function categoryChips(ev: Event): string[] {
  const out: string[] = []
  for (const c of ev.categories ?? []) {
    if (typeof c === 'string' && c.trim()) out.push(c.trim())
    else if (c && typeof c === 'object' && 'name' in c && typeof (c as { name?: unknown }).name === 'string') {
      const name = (c as { name: string }).name.trim()
      if (name) out.push(name)
    }
  }
  return out
}

const upcomingEvents = computed(() => {
  return eventsStore.events.slice(0, 4).map((event) => {
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    const location = event.venue?.type === 'virtual'
      ? 'Online'
      : [event.venue?.name, event.venue?.city].filter(Boolean).join(', ')

    return {
      id: event.id,
      title: event.title,
      date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      chips: categoryChips(event).slice(0, 3),
      location: location || '—',
      time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} – ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
      isSaved: Boolean(event.is_saved) || eventsStore.isEventSaved(event.id),
      image: getEventCoverImageUrl(
        event.cover_image,
        String(config.public.apiBase ?? ''),
        `${config.public.appBase}/images/defaults/events-0.png`,
      ),
    }
  })
})

function isActiveTicket(t: Ticket): boolean {
  return t.status === 'valid' && new Date(t.valid_until) >= new Date()
}

const dashboardTickets = computed(() =>
  registrationStore.userTickets
    .filter(isActiveTicket)
    .sort((a, b) => new Date(a.event?.start_date || a.valid_from).getTime() - new Date(b.event?.start_date || b.valid_from).getTime()),
)

const spotlightTickets = computed(() => dashboardTickets.value.slice(0, 4))

type RecentActivityItem = {
  id: string | number
  title: string
  description?: string
  timeAgo?: string
  color?: 'blue' | 'emerald' | 'amber'
}

const recentActivity = ref<RecentActivityItem[]>([])

function mergeTicketCountIntoStats(): void {
  const n = registrationStore.userTickets.length
  stats.value = stats.value.map(s =>
    s.title === 'Total Tickets' ? { ...s, value: String(n) } : s,
  )
}

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
            direction: (trend as { direction: 'up' | 'down' }).direction,
          }
        : undefined

      return {
        ...baseStat,
        value: String(matched.value ?? baseStat.value),
        trend: normalizedTrend,
        subtitle: matched.subtitle ?? baseStat.subtitle,
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
    recentActivity.value = logs.slice(0, 4).map((log, index) => {
      const baseId = log.id ?? log.timestamp ?? log.created_at ?? index
      const status = (log.status as string | undefined)?.toLowerCase()

      return {
        id: baseId,
        title: (log.title as string) || (log.action as string) || 'Activity',
        description: (log.details as string) || (log.description as string) || (log.entity_name as string) || '',
        timeAgo: (log.timestamp as string) || (log.created_at as string) || '',
        color: status === 'success' ? 'emerald' : 'amber',
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
    await eventsStore.fetchEvents({
      status: 'published',
      visibility: 'public',
      start_date: new Date().toISOString(),
      sort_by: 'date',
    })
    await eventsStore.fetchMySavedEvents()
  }
  catch {
    /* leave grid empty */
  }
}

async function toggleEventSaved(eventId: string, isSaved: boolean): Promise<void> {
  await eventsStore.toggleSavedEvent(eventId, !isSaved)
}

function ticketEventTitle(t: Ticket): string {
  return t.event?.title || 'Event'
}

function ticketWhen(t: Ticket): string {
  const iso = t.event?.start_date || t.valid_from
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

async function bootstrapDashboard(): Promise<void> {
  dashboardReady.value = false
  try {
    await Promise.all([
      loadAttendeeStats(),
      registrationStore.fetchUserRegistrations().catch(() => {}),
      loadUpcomingEvents(),
      loadRecentActivity(),
    ])
    mergeTicketCountIntoStats()
  }
  finally {
    dashboardReady.value = true
  }
}

onNuxtReady(() => {
  if (user.value?.id) {
    void bootstrapDashboard()
    return
  }

  const stop = watch(user, (u) => {
    if (u?.id) {
      stop()
      void bootstrapDashboard()
    }
  })
})
</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- Welcome -->
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {{ firstName }}
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
          Discover what&apos;s next, open your passes, and stay on top of check-in — all from one place.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 shrink-0">
        <AppButton to="/attendee/events" icon="explore" color="primary">
          Explore events
        </AppButton>
        <AppButton to="/attendee/tickets" icon="confirmation_number" color="neutral">
          My tickets
        </AppButton>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!dashboardReady" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="n in 4" :key="n" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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

    <!-- Tickets strip -->
    <section class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">
            Your tickets
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active passes for upcoming events — tap through for QR check-in.
          </p>
        </div>
        <AppButton to="/attendee/tickets" icon="arrow_forward" icon-position="right" color="neutral" size="sm">
          View all
        </AppButton>
      </div>

      <div v-if="!dashboardReady" class="p-4 sm:p-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      <div v-else-if="spotlightTickets.length === 0" class="px-4 py-10 sm:px-8 text-center">
        <AppLucideIcon name="confirmation_number" class="text-4xl text-slate-300 dark:text-slate-600 mx-auto" />
        <p class="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          No active tickets yet
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Book a free seat or complete checkout — tickets appear here right away.
        </p>
        <AppButton to="/attendee/events" class="mt-5" color="primary" icon="explore">
          Browse events
        </AppButton>
      </div>

      <div v-else class="p-4 sm:p-5">
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          <NuxtLink
            v-for="t in spotlightTickets"
            :key="t.id"
            to="/attendee/tickets"
            class="min-w-[260px] sm:min-w-0 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-4 hover:border-primary-500/40 hover:shadow-md transition-all flex flex-col gap-2 group"
          >
            <p class="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide truncate">
              {{ ticketWhen(t) }}
            </p>
            <p class="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ ticketEventTitle(t) }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {{ t.ticket_type_name }}
            </p>
            <span class="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400">
              Open passes
              <AppLucideIcon name="chevron_right" class="text-sm" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Upcoming + sidebar -->
    <div class="grid gap-8 lg:grid-cols-3">
      <section class="lg:col-span-2 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming on the calendar
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Starting soon — curated from published public events.
            </p>
          </div>
          <NuxtLink
            to="/attendee/events"
            class="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
          >
            Explore
            <AppLucideIcon name="arrow_forward" class="text-base" />
          </NuxtLink>
        </div>

        <div v-if="!dashboardReady" class="grid gap-4 sm:grid-cols-2">
          <div v-for="n in 4" :key="n" class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
            <div class="aspect-16/10 bg-slate-200 dark:bg-slate-800" />
            <div class="p-4 space-y-2">
              <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="event in upcomingEvents"
            :key="event.id"
            class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <NuxtLink :to="`/attendee/events/${event.id}`" class="flex flex-col flex-1">
              <div class="relative aspect-16/10 overflow-hidden shrink-0">
                <img
                  :src="event.image"
                  :alt="event.title"
                  class="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                >
                <span class="absolute left-3 top-3 rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-[11px] font-black text-slate-800 dark:text-slate-100 shadow-sm">
                  {{ event.date }}
                </span>
                <button
                  type="button"
                  class="absolute right-3 top-3 rounded-full bg-white/95 dark:bg-slate-900/95 p-2 shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors z-[1]"
                  :class="event.isSaved ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'"
                  :disabled="eventsStore.isSavingEvent(event.id)"
                  :aria-label="event.isSaved ? 'Unsave event' : 'Save event'"
                  @click.prevent.stop="toggleEventSaved(event.id, event.isSaved)"
                >
                  <AppLucideIcon :name="event.isSaved ? 'favorite' : 'favorite_border'" class="text-lg" />
                </button>
              </div>
              <div class="p-4 flex flex-col flex-1">
                <div v-if="event.chips.length" class="flex flex-wrap gap-1.5 mb-2">
                  <span
                    v-for="(label, idx) in event.chips"
                    :key="`${label}-${idx}`"
                    class="text-[10px] font-bold uppercase tracking-wide rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 px-2 py-0.5"
                  >
                    {{ label }}
                  </span>
                </div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
                  {{ event.title }}
                </h3>
                <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <AppLucideIcon name="location_on" class="text-sm shrink-0 text-primary-500" />
                  <span class="line-clamp-1">{{ event.location }}</span>
                </p>
                <p class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <AppLucideIcon name="schedule" class="text-sm shrink-0 text-primary-500" />
                  {{ event.time }}
                </p>
                <span class="mt-auto inline-flex items-center justify-center rounded-xl bg-primary-500 text-white text-sm font-bold px-4 py-2.5 w-full sm:w-auto hover:bg-primary-600 transition-colors">
                  View event
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>

        <div
          v-if="dashboardReady && upcomingEvents.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-10 text-center"
        >
          <AppLucideIcon name="event_available" class="text-4xl text-slate-400 mx-auto" />
          <p class="mt-3 font-semibold text-slate-800 dark:text-slate-200">
            No upcoming events in this feed
          </p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Widen your search on the events page or check back soon.
          </p>
          <AppButton to="/attendee/events" class="mt-5" color="primary">
            Find events
          </AppButton>
        </div>
      </section>

      <aside class="space-y-6">
        <RecentActivityCard
          :items="recentActivity"
          :max-items="4"
          title="Recent activity"
          view-all-to="/attendee/profile/activity"
          view-all-label="View all activity"
          empty-label="No recent activity yet."
        />

        <div
          v-if="user?.primary_role?.name !== 'Organizer'"
          class="rounded-2xl border border-primary-500/20 bg-white dark:bg-slate-900 p-5 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="size-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600">
              <AppLucideIcon name="business_center" class="text-2xl" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Host your own events
            </h3>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Apply to become a verified organizer and unlock the organizer dashboard.
          </p>
          <NuxtLink
            to="/attendee/organizer/application"
            class="mt-4 inline-flex items-center justify-center rounded-xl bg-primary-500 text-white font-semibold px-4 py-2.5 text-sm w-full hover:bg-primary-600 transition-colors"
          >
            Become an organizer
          </NuxtLink>
        </div>

        <div class="relative rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden p-6 text-white shadow-lg">
          <div class="absolute bottom-0 right-0 w-32 h-32 opacity-15 pointer-events-none" aria-hidden="true">
            <AppLucideIcon name="star" class="text-[120px]" />
          </div>
          <h3 class="text-lg font-bold relative z-10">
            Pro perks
          </h3>
          <p class="mt-2 text-sm text-white/90 relative z-10 leading-relaxed">
            Early access and member pricing are rolling out — stay tuned on this dashboard.
          </p>
          <span class="mt-4 inline-flex items-center rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold px-4 py-2 text-xs relative z-10 border border-white/20">
            Coming soon
          </span>
        </div>
      </aside>
    </div>
  </div>
</template>
