<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const { user } = useAuth()

const stats = ref([
  { title: 'Upcoming Events', value: '3', icon: 'i-lucide-calendar', color: 'primary' as const },
  { title: 'Active Tickets', value: '5', icon: 'i-lucide-ticket', color: 'success' as const },
  { title: 'Events Attended', value: '12', icon: 'i-lucide-check-circle', color: 'info' as const }
])

const upcomingEvents = ref([
  {
    id: '1',
    title: 'Tech Conference 2026',
    date: '2026-04-15',
    time: '09:00 AM',
    venue: 'Convention Center',
    ticketType: 'VIP Pass'
  },
  {
    id: '2',
    title: 'Developer Workshop',
    date: '2026-04-22',
    time: '10:00 AM',
    venue: 'Online',
    ticketType: 'General Admission'
  }
])

const recentActivity = ref([
  { id: '1', type: 'checkin' as const, title: 'Checked in to AI Summit', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', type: 'registration' as const, title: 'Registered for Tech Conference', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '3', type: 'event' as const, title: 'Attended Developer Meetup', timestamp: new Date(Date.now() - 86400000 * 10).toISOString() }
])

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div>
    <PageHeader
      title="My Dashboard"
      :description="`Welcome back, ${user?.firstName || 'Attendee'}. Here are your upcoming events.`"
    />

    <!-- Stats -->
    <div class="grid gap-6 sm:grid-cols-3">
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
              to="/attendee/tickets"
            >
              View all tickets
            </UButton>
          </div>
        </template>

        <div
          v-if="upcomingEvents.length === 0"
          class="py-8 text-center"
        >
          <UIcon
            name="i-lucide-calendar"
            class="mx-auto h-12 w-12 text-gray-400"
          />
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No upcoming events
          </p>
          <UButton
            class="mt-4"
            to="/attendee/events"
          >
            Browse Events
          </UButton>
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="`/attendee/events/${event.id}`"
            class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            <div class="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-950">
              <span class="text-xs font-medium uppercase">
                {{ new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) }}
              </span>
              <span class="text-lg font-bold">
                {{ new Date(event.date).getDate() }}
              </span>
            </div>

            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ event.title }}
              </h4>
              <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-clock"
                    class="h-4 w-4"
                  />
                  {{ event.time }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="h-4 w-4"
                  />
                  {{ event.venue }}
                </span>
              </div>
            </div>

            <UBadge
              color="primary"
              variant="soft"
            >
              {{ event.ticketType }}
            </UBadge>
          </NuxtLink>
        </div>
      </UCard>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </template>

          <div class="space-y-2">
            <UButton
              block
              variant="soft"
              icon="i-lucide-search"
              to="/attendee/events"
            >
              Browse Events
            </UButton>
            <UButton
              block
              variant="soft"
              icon="i-lucide-ticket"
              to="/attendee/tickets"
            >
              My Tickets
            </UButton>
            <UButton
              block
              variant="soft"
              icon="i-lucide-calendar"
              to="/attendee/schedule"
            >
              My Schedule
            </UButton>
          </div>
        </UCard>

        <!-- Activity -->
        <ActivityFeed
          :items="recentActivity"
          title="Recent Activity"
          :max-items="3"
          :show-view-all="false"
        />
      </div>
    </div>
  </div>
</template>
