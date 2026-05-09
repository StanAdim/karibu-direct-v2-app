<script setup lang="ts">
import type { OrganizerDashboardSummary } from '~/stores/organizerWorkspace'

const props = defineProps<{
  summary: OrganizerDashboardSummary | null
  loading?: boolean
}>()

const cards = computed(() => {
  const s = props.summary
  return [
    {
      id: 'events',
      label: 'Total Events',
      value: s ? String(s.totalEvents) : '—',
      helper: 'All statuses',
      icon: 'event',
      trend: null as null | { value: string; isNegative?: boolean }
    },
    {
      id: 'upcoming',
      label: 'Upcoming Events',
      value: s ? String(s.upcomingEvents) : '—',
      helper: 'Scheduled ahead',
      icon: 'event_upcoming',
      trend: null
    },
    {
      id: 'tickets',
      label: 'Tickets Sold',
      value: s ? String(s.ticketsSold) : '—',
      helper: 'Across your events',
      icon: 'confirmation_number',
      trend: null
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: s?.revenueDisplay ?? '—',
      helper: 'Settlement TBD',
      icon: 'monetization_on',
      trend: null
    },
    {
      id: 'checkins',
      label: 'Pending Check-ins',
      value: s ? String(s.pendingCheckIns) : '—',
      helper: 'At the door',
      icon: 'how_to_reg',
      trend: null
    },
    {
      id: 'org',
      label: 'Organization Status',
      value: s?.orgStatusLabel ?? '—',
      helper: 'Workspace',
      icon: 'shield',
      trend: null
    }
  ]
})
</script>

<template>
  <section>
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="h-28 rounded-xl border border-primary-500/10 bg-slate-100/80 dark:bg-slate-800/50 animate-pulse"
      />
    </div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <article
        v-for="metric in cards"
        :key="metric.id"
        class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="size-11 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
            <AppLucideIcon :name="metric.icon" class="text-xl" />
          </div>
          <span
            v-if="metric.trend"
            class="text-xs font-bold px-2 py-1 rounded-full"
            :class="metric.trend.isNegative
              ? 'text-red-500 bg-red-500/10'
              : 'text-emerald-500 bg-emerald-500/10'"
          >
            {{ metric.trend.value }}
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {{ metric.label }}
        </p>
        <p class="text-xl font-bold mt-0.5 tracking-tight text-slate-900 dark:text-white truncate">
          {{ metric.value }}
        </p>
        <p class="text-xs text-slate-400 mt-2">
          {{ metric.helper }}
        </p>
      </article>
    </div>
  </section>
</template>
