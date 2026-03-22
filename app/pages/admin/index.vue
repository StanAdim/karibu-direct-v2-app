<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const regionalView = ref<'map' | 'list'>('map')

const revenueSparklinePoints = [12, 18, 14, 22, 28, 24, 32, 38, 34, 42, 48, 52]

function sparklinePath(values: number[], w = 120, h = 40): string {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 2
  const range = max - min || 1
  return values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1 || 1)) * (w - pad * 2)
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

const revenueSparkPath = computed(() => sparklinePath(revenueSparklinePoints))

const topMetrics = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    value: '$1,284,590',
    trend: '+12.4%',
    trendUp: true,
    sparkline: true
  },
  {
    key: 'users',
    label: 'Active Users',
    value: '48,291',
    icon: 'i-lucide-trending-up',
    sub: 'Active now: 1,024'
  },
  {
    key: 'events',
    label: 'Total Events',
    value: '8,542',
    icon: 'i-lucide-ticket',
    sub: 'Live across 12 cities'
  },
  {
    key: 'ticket',
    label: 'Avg. Ticket Price',
    value: '$72.50',
    icon: 'i-lucide-wallet',
    sub: 'Retention rate: 84%'
  }
]

const pendingActions = [
  {
    title: '12 Organizer Requests',
    icon: 'i-lucide-user-plus',
    cta: 'Review all',
    to: '/admin/users'
  },
  {
    title: '8 Event Approvals',
    icon: 'i-lucide-calendar-clock',
    cta: 'Review all',
    to: '/admin/events'
  },
  {
    title: '3 Payout Disputes',
    icon: 'i-lucide-scale',
    cta: 'Review all',
    to: '/admin/analytics'
  }
]

const regions = [
  { name: 'Dar es Salaam', tickets: '12,402', highlight: true },
  { name: 'Arusha', tickets: '4,891' },
  { name: 'Mwanza', tickets: '3,204' }
]

const platformActivity = [
  {
    id: '1',
    title: 'New Platinum Organizer Registered',
    description: 'Verified business account · Acme Events Ltd',
    at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  },
  {
    id: '2',
    title: 'High-volume ticket drop detected',
    description: 'Summer Music Fest · 2,400 tickets in 18 minutes',
    at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    title: 'Payout batch completed',
    description: 'Cycle #482 · 37 organizers settled',
    at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: '4',
    title: 'Policy update published',
    description: 'Refund window standardized to 48h pre-event',
    at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
]

function formatShortAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'JUST NOW'
  if (m < 60) return `${m}M AGO`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}H AGO`
  const d = Math.floor(h / 24)
  return `${d}D AGO`
}
</script>

<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        System Overview
      </h1>
      <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
        Real-time performance and operational metrics.
      </p>
    </header>

    <!-- Key metrics -->
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="m in topMetrics"
        :key="m.key"
        class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {{ m.label }}
          </p>
          <span
            v-if="'trend' in m && m.trend"
            class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            {{ m.trend }}
          </span>
          <AppLucideIcon
            v-else-if="'icon' in m && m.icon"
            :name="m.icon"
            :size="20"
            class="text-primary-500"
          />
        </div>
        <p class="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ m.value }}
        </p>
        <p
          v-if="'sub' in m && m.sub"
          class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          {{ m.sub }}
        </p>
        <div
          v-if="'sparkline' in m && m.sparkline"
          class="mt-4 h-10 w-full"
        >
          <svg
            class="h-full w-full text-primary-500"
            preserveAspectRatio="none"
            viewBox="0 0 120 40"
          >
            <path
              :d="revenueSparkPath"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Charts + pending -->
    <div class="grid gap-6 xl:grid-cols-5">
      <div
        class="xl:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Revenue vs payouts
          </h2>
          <div class="flex items-center gap-4 text-xs font-semibold">
            <span class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span class="h-2 w-6 rounded-full bg-primary-600" />
              Revenue
            </span>
            <span class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span class="h-2 w-6 rounded-full bg-primary-200 dark:bg-primary-800" />
              Payouts
            </span>
          </div>
        </div>
        <div class="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
          <svg
            class="absolute inset-0 h-full w-full"
            viewBox="0 0 520 220"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="adminRevFill"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#1a6cf2"
                  stop-opacity="0.35"
                />
                <stop
                  offset="100%"
                  stop-color="#1a6cf2"
                  stop-opacity="0.02"
                />
              </linearGradient>
              <linearGradient
                id="adminPayFill"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#7daef9"
                  stop-opacity="0.45"
                />
                <stop
                  offset="100%"
                  stop-color="#7daef9"
                  stop-opacity="0.02"
                />
              </linearGradient>
            </defs>
            <path
              d="M0,180 C60,140 100,160 160,100 S280,40 360,80 S460,50 520,30 L520,220 L0,220 Z"
              fill="url(#adminPayFill)"
            />
            <path
              d="M0,200 C80,120 140,150 220,70 S340,30 520,20 L520,220 L0,220 Z"
              fill="url(#adminRevFill)"
            />
            <path
              d="M0,200 C80,120 140,150 220,70 S340,30 520,20"
              fill="none"
              stroke="#1a6cf2"
              stroke-width="2.5"
              vector-effect="non-scaling-stroke"
            />
            <path
              d="M0,180 C60,140 100,160 160,100 S280,40 360,80 S460,50 520,30"
              fill="none"
              stroke="#7daef9"
              stroke-width="2.5"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between border-t border-slate-200/60 px-4 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700"
          >
            <span>Day 01</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col rounded-2xl border border-primary-100 bg-primary-50/80 p-5 shadow-sm dark:border-primary-900/40 dark:bg-primary-950/20 xl:col-span-2"
      >
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Pending actions
        </h2>
        <p class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Items needing your attention
        </p>
        <div class="mt-5 flex flex-1 flex-col gap-3">
          <div
            v-for="action in pendingActions"
            :key="action.title"
            class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
              <AppLucideIcon
                :name="action.icon"
                :size="20"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900 dark:text-white">
                {{ action.title }}
              </p>
              <NuxtLink
                :to="action.to"
                class="mt-1 inline-flex text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {{ action.cta }}
              </NuxtLink>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/admin/events"
          class="mt-5 flex w-full items-center justify-center rounded-xl border-2 border-primary-200 bg-white py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 dark:border-primary-800 dark:bg-slate-900 dark:text-primary-300 dark:hover:bg-primary-950/30"
        >
          View full command center
        </NuxtLink>
      </div>
    </div>

    <!-- Regional + activity -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Regional distribution
          </h2>
          <div class="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              :class="[
                'rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                regionalView === 'map'
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-900 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              ]"
              @click="regionalView = 'map'"
            >
              Map
            </button>
            <button
              type="button"
              :class="[
                'rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                regionalView === 'list'
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-900 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              ]"
              @click="regionalView = 'list'"
            >
              List
            </button>
          </div>
        </div>

        <div
          v-if="regionalView === 'map'"
          class="relative mt-5 h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-primary-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
        >
          <div class="absolute inset-0 opacity-40">
            <div class="absolute left-[18%] top-[42%] h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-200/50" />
            <div class="absolute left-[48%] top-[38%] h-2.5 w-2.5 rounded-full bg-primary-400 ring-4 ring-primary-200/40" />
            <div class="absolute left-[62%] top-[55%] h-2.5 w-2.5 rounded-full bg-primary-400 ring-4 ring-primary-200/40" />
          </div>
          <div class="absolute left-4 top-4 max-w-[240px] rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
            <p class="text-[10px] font-bold uppercase tracking-wider text-primary-600">
              Top performer
            </p>
            <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              Dar es Salaam
            </p>
            <p class="text-xs font-semibold text-slate-500">
              12,402 tickets sold
            </p>
          </div>
        </div>

        <ul
          v-else
          class="mt-5 space-y-2"
        >
          <li
            v-for="r in regions"
            :key="r.name"
            class="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
          >
            <span class="font-semibold text-slate-800 dark:text-slate-200">{{ r.name }}</span>
            <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ r.tickets }}</span>
          </li>
        </ul>

        <ul
          v-if="regionalView === 'map'"
          class="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800"
        >
          <li
            v-for="r in regions.filter(x => !x.highlight)"
            :key="r.name"
            class="flex items-center justify-between text-sm"
          >
            <span class="font-medium text-slate-600 dark:text-slate-300">{{ r.name }}</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ r.tickets }}</span>
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Platform activity
        </h2>
        <p class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Latest operational signals
        </p>
        <div class="relative mt-6 space-y-0 pl-2">
          <div class="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200 dark:bg-slate-700" />
          <div
            v-for="item in platformActivity"
            :key="item.id"
            class="relative flex gap-4 pb-8 pl-6 last:pb-0"
          >
            <span class="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-950" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900 dark:text-white">
                {{ item.title }}
              </p>
              <p class="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {{ item.description }}
              </p>
              <p class="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {{ formatShortAgo(item.at) }}
              </p>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/admin/analytics"
          class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          View audit logs
          <AppLucideIcon
            name="i-lucide-arrow-right"
            :size="16"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
