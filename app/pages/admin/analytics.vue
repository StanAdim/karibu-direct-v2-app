<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const dateRange = ref('30d')

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
]

const platformStats = ref([
  { title: 'Total Revenue', value: '$284,534', trend: { value: 18, isPositive: true }, color: 'success' as const, icon: 'i-lucide-dollar-sign' },
  { title: 'Total Events', value: '1,234', trend: { value: 12, isPositive: true }, color: 'primary' as const, icon: 'i-lucide-calendar' },
  { title: 'Total Users', value: '45,678', trend: { value: 8, isPositive: true }, color: 'info' as const, icon: 'i-lucide-users' },
  { title: 'Avg. Attendance', value: '87%', trend: { value: 3, isPositive: true }, color: 'warning' as const, icon: 'i-lucide-user-check' }
])

const topEvents = ref([
  { name: 'Tech Conference 2026', attendees: 2500, revenue: 125000, trend: 15 },
  { name: 'Developer Summit', attendees: 1800, revenue: 90000, trend: 22 },
  { name: 'AI Workshop Series', attendees: 1200, revenue: 60000, trend: 8 },
  { name: 'Cloud Computing Expo', attendees: 950, revenue: 47500, trend: -5 },
  { name: 'Security Conference', attendees: 800, revenue: 40000, trend: 12 }
])

const recentMetrics = ref([
  { label: 'New Registrations', value: '1,234', change: '+12%' },
  { label: 'Ticket Sales', value: '856', change: '+8%' },
  { label: 'Check-ins', value: '742', change: '+15%' },
  { label: 'Page Views', value: '45.2K', change: '+22%' }
])
</script>

<template>
  <div>
    <PageHeader
      title="Analytics"
      description="Platform-wide performance metrics and insights"
    >
      <template #actions>
        <USelect
          v-model="dateRange"
          :items="dateRangeOptions"
          value-key="value"
          label-key="label"
          class="w-40"
        />
        <UButton
          variant="outline"
          icon="i-lucide-download"
        >
          Export
        </UButton>
      </template>
    </PageHeader>

    <!-- Platform Stats -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        v-for="stat in platformStats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Charts Section -->
    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <!-- Revenue Chart Placeholder -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Overview
          </h3>
        </template>
        <div class="flex h-64 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
          <div class="text-center">
            <UIcon
              name="i-lucide-bar-chart-3"
              class="mx-auto h-12 w-12 text-gray-400"
            />
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Revenue chart will be displayed here
            </p>
          </div>
        </div>
      </UCard>

      <!-- Registrations Chart Placeholder -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            User Registrations
          </h3>
        </template>
        <div class="flex h-64 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
          <div class="text-center">
            <UIcon
              name="i-lucide-line-chart"
              class="mx-auto h-12 w-12 text-gray-400"
            />
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Registrations chart will be displayed here
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Bottom Section -->
    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Top Events -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Events
          </h3>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-800">
                <th class="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Event
                </th>
                <th class="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Attendees
                </th>
                <th class="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Revenue
                </th>
                <th class="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="event in topEvents"
                :key="event.name"
              >
                <td class="py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {{ event.name }}
                </td>
                <td class="py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                  {{ event.attendees.toLocaleString() }}
                </td>
                <td class="py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                  ${{ event.revenue.toLocaleString() }}
                </td>
                <td class="py-3 text-right">
                  <span
                    :class="[
                      'inline-flex items-center text-sm font-medium',
                      event.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
                    ]"
                  >
                    <UIcon
                      :name="event.trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                      class="mr-1 h-4 w-4"
                    />
                    {{ Math.abs(event.trend) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Quick Metrics -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Metrics
          </h3>
        </template>

        <div class="space-y-4">
          <div
            v-for="metric in recentMetrics"
            :key="metric.label"
            class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
          >
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ metric.label }}
              </p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ metric.value }}
              </p>
            </div>
            <span class="text-sm font-medium text-emerald-600">
              {{ metric.change }}
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
