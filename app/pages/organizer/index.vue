<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const { user } = useAuth()

type MetricTrend = {
  value: string
  isNegative?: boolean
}

type MetricCard = {
  id: string
  label: string
  value: string
  helper: string
  icon: string
  trend: MetricTrend
}

type UpcomingEvent = {
  id: string
  name: string
  venue: string
  date: string
  time: string
  capacity: number
  sold: number
  revenue: string
  status: 'on_sale' | 'selling_fast'
  coverUrl: string
}

type ActivityItem = {
  id: string
  title: string
  description: string
  timeAgo: string
  icon: string
  color: 'blue' | 'emerald' | 'amber'
}

const keyMetrics = ref<MetricCard[]>([
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 'TZS 18,450,000',
    helper: 'v.s last 30 days',
    icon: 'monetization_on',
    trend: { value: '+14.2%' }
  },
  {
    id: 'tickets',
    label: 'Tickets Sold',
    value: '4,281',
    helper: 'Across 12 active events',
    icon: 'confirmation_number',
    trend: { value: '+8.1%' }
  },
  {
    id: 'views',
    label: 'Page Views',
    value: '125,900',
    helper: 'Average engagement: 2.4m',
    icon: 'visibility',
    trend: { value: '-2.4%', isNegative: true }
  }
])

const upcomingEvents = ref<UpcomingEvent[]>([
  {
    id: '1',
    name: 'Serengeti Gala Night 2024',
    venue: 'Mlimani City, Dar es Salaam',
    date: 'Nov 24, 2024',
    time: '07:00 PM',
    capacity: 1000,
    sold: 750,
    revenue: 'TZS 12.5M',
    status: 'on_sale',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3CFcpm6LXzxrv9rPZtJ-gX5HuuJLm0R-vSXBisq3egq0ZSP9skm4D7Hb4eyCrQ67KUoHLtwb8jtyH1CYxgcBr2TPXGUnwVgo94zD3fPqKrCAlbIkuOaZH0SDHpUwK06QlgC4UVxwH8FDp2LL0cOx5k0N-xOaS-8kkYKtRY808sHeHW8xUb87ObX3QyPxtsOqA5UW-FNkfiZZsTy46sqe3tkbuS8fWkL-kTxzim9Bt0I6CHek4JcdZIbRCMdyyYvzFACnGdHWcrAZq'
  },
  {
    id: '2',
    name: 'Arusha Tech & Innovation Expo',
    venue: 'AICC, Arusha',
    date: 'Dec 02, 2024',
    time: '09:00 AM',
    capacity: 500,
    sold: 160,
    revenue: 'TZS 4.2M',
    status: 'on_sale',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi7Q-UMAbXQvjWWZ2m_oDdAqsbO9Vw9rIA_vsHYvOWuRdCpuFP9yCDx2sKte_jTm2CVFWXdoNueFMQ1Xo2sYg-nYXaheK4rw_FtGKdSthyxNPN8Tm0_UkPZpXbwAeDEnvboT6K7Cyarbt-Uq8vhpyennoDIE8I9I4jOL35f31WhFdTZovd4RPzVSsti6OHjLHGpPsxRtIeUrYx4oYPvSfWEL6Da_3nvVSPze6am6Gh2-WLjuT4Qb3mJhgVf6F1O4yldpYPHQMNWEF0'
  },
  {
    id: '3',
    name: 'Zanzibar Sunset Beats',
    venue: 'Kendwa Rocks, Zanzibar',
    date: 'Dec 15, 2024',
    time: '04:00 PM',
    capacity: 300,
    sold: 294,
    revenue: 'TZS 8.8M',
    status: 'selling_fast',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb_VVh7pphwe-OXzx0JclE7aSilzu7wIJdQ0lpXQ_Saju4yhWWGvvTnu75KxiexOS2ywm51cAeDFirTgJJiZ-ciU53a2XQWZlLqEnuHtC2n_1TiY5rKpE8BYuNex9hBGr7yyma_CWoiyQA1TqCBwuwV43AC4WSPwBeVQI2ZJkyZyoDByqmMWF04r111QOfiOKrcP9K-WPx_pA5wktDPPBh_ksQNYy6xmHnOoMjUcxtopJA7m_bbNg3_yg12WXHRQJXhZSeWm0GKMUE'
  }
])

const recentActivity = ref<ActivityItem[]>([
  {
    id: '1',
    title: 'New Ticket Sale',
    description: '2 VIP tickets for Serengeti Night',
    timeAgo: '2 minutes ago',
    icon: 'shopping_cart',
    color: 'blue'
  },
  {
    id: '2',
    title: 'New Attendee Registered',
    description: 'Amani Juma registered for TechFest TZ',
    timeAgo: '15 minutes ago',
    icon: 'person_add',
    color: 'emerald'
  },
  {
    id: '3',
    title: 'Event Updated',
    description: 'Venue changed for Dar Wine Expo',
    timeAgo: '1 hour ago',
    icon: 'edit_calendar',
    color: 'amber'
  }
])

const capacityProgress = (event: UpcomingEvent) => Math.round((event.sold / event.capacity) * 100)
</script>

<template>
  <div class="space-y-5">
    <!-- Greeting -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        Welcome back, {{ user?.first_name || 'Organizer' }}
      </p>
      <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Overview
      </h1>
    </div>

    <!-- Key Metrics -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <article
        v-for="metric in keyMetrics"
        :key="metric.id"
        class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="size-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
            <span class="material-symbols-outlined">
              {{ metric.icon }}
            </span>
          </div>
          <span
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
        <p class="text-2xl font-bold mt-1 tracking-tight">
          {{ metric.value }}
        </p>
        <p class="text-xs text-slate-400 mt-2">
          {{ metric.helper }}
        </p>
      </article>
    </section>

    <!-- Charts and Activity -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Sales Performance -->
      <article class="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm">
        <div class="flex items-center justify-between mb-5 gap-4">
          <div>
            <h2 class="font-bold text-lg text-slate-900 dark:text-white">
              Sales Performance
            </h2>
            <p class="text-slate-400 text-xs">
              Revenue distribution over the last 7 days
            </p>
          </div>
          <select
            class="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-3 py-2 focus:ring-0 outline-none text-slate-700 dark:text-slate-100"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div class="h-[240px] w-full flex flex-col gap-4">
          <!-- Simple SVG area chart (placeholder) -->
          <svg
            class="flex-1 w-full"
            viewBox="0 0 400 120"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100 Q 50 80, 100 90 T 200 40 T 300 60 T 400 20 V 120 H 0 Z"
              fill="url(#blue-gradient)"
              opacity="0.1"
            />
            <path
              d="M0 100 Q 50 80, 100 90 T 200 40 T 300 60 T 400 20"
              stroke="#4285F4"
              stroke-width="3"
              stroke-linecap="round"
            />
            <defs>
              <linearGradient
                id="blue-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stop-color="#4285F4" />
                <stop offset="100%" stop-color="#4285F4" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </article>

      <!-- Recent Activity -->
      <aside class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm flex flex-col">
        <h2 class="font-bold text-lg mb-4 text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        <div class="space-y-4 flex-1 overflow-y-auto pr-1.5">
          <div
            v-for="item in recentActivity"
            :key="item.id"
            class="flex gap-4"
          >
            <div
              class="size-10 rounded-full flex items-center justify-center shrink-0"
              :class="{
                'bg-blue-100 text-primary-500': item.color === 'blue',
                'bg-emerald-100 text-emerald-600': item.color === 'emerald',
                'bg-amber-100 text-amber-600': item.color === 'amber'
              }"
            >
              <span class="material-symbols-outlined text-xl">
                {{ item.icon }}
              </span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ item.title }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ item.description }}
              </p>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ item.timeAgo }}
              </p>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/organizer/events"
          class="w-full mt-4 py-2 text-primary-500 font-bold text-sm border border-primary-500/20 rounded-lg text-center hover:bg-primary-500/5 transition-colors"
        >
          View All Logs
        </NuxtLink>
      </aside>
    </section>

    <!-- Upcoming Events Table -->
    <section class="bg-white dark:bg-slate-900 rounded-xl border border-primary-500/10 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white">
          Upcoming Events
        </h2>
        <NuxtLink to="/organizer/events" class="text-primary-500 text-sm font-bold hover:underline">
          View All
        </NuxtLink>
      </div>
      <div class="overflow-x-auto">
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
              v-for="event in upcomingEvents"
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
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'"
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
                <button
                  type="button"
                  class="material-symbols-outlined text-slate-400 hover:text-primary-500 transition-colors"
                  aria-label="More actions"
                >
                  more_horiz
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
