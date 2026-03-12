<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const { user } = useAuth()

const stats = ref([
  { title: 'Active Events', value: '12', icon: 'i-lucide-calendar', trend: { value: 8, isPositive: true }, color: 'primary' as const },
  { title: 'Total Registrations', value: '2,847', icon: 'i-lucide-users', trend: { value: 15, isPositive: true }, color: 'success' as const },
  { title: 'Check-ins Today', value: '156', icon: 'i-lucide-user-check', trend: { value: 12, isPositive: true }, color: 'info' as const },
  { title: 'Revenue', value: '$24,500', icon: 'i-lucide-dollar-sign', trend: { value: 20, isPositive: true }, color: 'warning' as const }
])

const upcomingEvents = ref([
  { id: '1', title: 'Tech Conference 2026', date: '2026-04-15', attendees: 850, capacity: 1000 },
  { id: '2', title: 'Developer Workshop', date: '2026-04-22', attendees: 45, capacity: 50 },
  { id: '3', title: 'AI Summit', date: '2026-05-10', attendees: 320, capacity: 500 }
])

const recentActivity = ref([
  { id: '1', type: 'registration' as const, title: 'New registration', description: 'John Doe registered for Tech Conference', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', type: 'checkin' as const, title: 'Check-in completed', description: 'Sarah Smith checked in at Developer Workshop', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '3', type: 'event' as const, title: 'Event updated', description: 'AI Summit schedule was modified', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() }
])

const quickActions = [
  { label: 'New Event', icon: 'i-lucide-plus', to: '/organizer/events/create' },
  { label: 'Add Session', icon: 'i-lucide-presentation', to: '/organizer/sessions/create' },
  { label: 'Checkpoints', icon: 'i-lucide-qr-code', to: '/organizer/checkpoints' },
  { label: 'Participants', icon: 'i-lucide-users', to: '/organizer/participants' }
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div>
    <PageHeader
      title="Organizer Dashboard"
      :description="`Welcome back, ${user?.firstName || 'Organizer'}. Manage your events and participants.`"
    />

    <!-- Stats -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Content Grid -->
    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Upcoming Events -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Events
            </h3>
            <UButton
              variant="ghost"
              size="sm"
              to="/organizer/events"
            >
              View all
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="`/organizer/events/${event.id}`"
            class="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
                <UIcon
                  name="i-lucide-calendar"
                  class="h-6 w-6 text-primary-600"
                />
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ event.title }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(event.date) }}
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ event.attendees }} / {{ event.capacity }}
              </p>
              <UProgress
                :value="(event.attendees / event.capacity) * 100"
                size="xs"
                class="mt-1 w-24"
              />
            </div>
          </NuxtLink>
        </div>
      </UCard>

      <!-- Quick Actions & Activity -->
      <div class="space-y-6">
        <QuickActions
          :actions="quickActions"
          title="Quick Actions"
        />

        <ActivityFeed
          :items="recentActivity"
          title="Recent Activity"
          :max-items="3"
        />
      </div>
    </div>
  </div>
</template>
