<script setup lang="ts">
import { getEventCapacityPercentage, isEventLive, isEventPast, isEventUpcoming } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const eventsStore = useEventsStore()
const sessionsStore = useSessionsStore()
const notifications = useNotifications()
const router = useRouter()

const eventId = computed(() => route.params.id as string)
const loading = ref(true)

const event = computed(() => eventsStore.currentEvent)
const sessions = computed(() => sessionsStore.sessions)

const isLive = computed(() => event.value ? isEventLive(event.value) : false)
const isUpcoming = computed(() => event.value ? isEventUpcoming(event.value) : false)
const isPast = computed(() => event.value ? isEventPast(event.value) : false)
const capacityPercentage = computed(() => event.value ? getEventCapacityPercentage(event.value) : 0)

const stats = computed(() => [
  {
    title: 'Registered',
    value: event.value?.registeredCount || 0,
    icon: 'i-lucide-users',
    color: 'primary' as const
  },
  {
    title: 'Capacity',
    value: `${capacityPercentage.value}%`,
    icon: 'i-lucide-pie-chart',
    color: capacityPercentage.value >= 90 ? 'error' as const : 'success' as const
  },
  {
    title: 'Sessions',
    value: sessions.value.length,
    icon: 'i-lucide-presentation',
    color: 'info' as const
  },
  {
    title: 'Status',
    value: event.value?.status || 'Unknown',
    icon: 'i-lucide-activity',
    color: 'warning' as const
  }
])

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      eventsStore.fetchEvent(eventId.value),
      sessionsStore.fetchEventSessions(eventId.value)
    ])
  }
  finally {
    loading.value = false
  }
}

async function publishEvent() {
  if (!event.value) return

  try {
    await eventsStore.publishEvent(event.value.id)
    notifications.success('Event published successfully')
  }
  catch {
    notifications.error('Failed to publish event')
  }
}

async function cancelEvent() {
  if (!event.value) return

  try {
    await eventsStore.cancelEvent(event.value.id)
    notifications.success('Event cancelled')
  }
  catch {
    notifications.error('Failed to cancel event')
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadData)
onUnmounted(() => {
  eventsStore.clearCurrentEvent()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="loading"
      class="py-12"
    >
      <LoadingState text="Loading event..." />
    </div>

    <!-- Not Found -->
    <EmptyState
      v-else-if="!event"
      icon="i-lucide-calendar-x"
      title="Event not found"
      description="The event you're looking for doesn't exist or has been deleted"
    >
      <template #actions>
        <UButton to="/organizer/events">
          Back to Events
        </UButton>
      </template>
    </EmptyState>

    <!-- Event Details -->
    <template v-else>
      <PageHeader
        :title="event.title"
        :description="event.shortDescription"
      >
        <template #actions>
          <UButton
            v-if="event.status === 'draft'"
            color="success"
            icon="i-lucide-rocket"
            @click="publishEvent"
          >
            Publish
          </UButton>

          <UButton
            v-if="event.status === 'published'"
            color="error"
            variant="outline"
            icon="i-lucide-x"
            @click="cancelEvent"
          >
            Cancel
          </UButton>

          <UButton
            variant="outline"
            icon="i-lucide-pencil"
            :to="`/organizer/events/${event.id}/edit`"
          >
            Edit
          </UButton>
        </template>
      </PageHeader>

      <!-- Status Banner -->
      <UAlert
        v-if="isLive"
        color="success"
        icon="i-lucide-radio"
        title="Event is Live"
        description="This event is currently in progress"
        class="mb-6"
      />

      <UAlert
        v-else-if="isPast"
        color="neutral"
        icon="i-lucide-check-circle"
        title="Event Completed"
        description="This event has ended"
        class="mb-6"
      />

      <!-- Stats -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          v-for="stat in stats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Content -->
      <div class="mt-8 grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Details Card -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Event Details
              </h3>
            </template>

            <div class="prose prose-sm max-w-none dark:prose-invert">
              <p>{{ event.description }}</p>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UIcon
                    name="i-lucide-calendar"
                    class="h-5 w-5 text-gray-600"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Date
                  </p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ formatDate(event.startDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UIcon
                    name="i-lucide-clock"
                    class="h-5 w-5 text-gray-600"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Time
                  </p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UIcon
                    :name="event.venue.type === 'virtual' ? 'i-lucide-video' : 'i-lucide-map-pin'"
                    class="h-5 w-5 text-gray-600"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Venue
                  </p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ event.venue.type === 'virtual' ? 'Online Event' : event.venue.name || event.venue.city }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UIcon
                    name="i-lucide-users"
                    class="h-5 w-5 text-gray-600"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Capacity
                  </p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ event.registeredCount }} / {{ event.capacity }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Sessions -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Sessions ({{ sessions.length }})
                </h3>
                <UButton
                  size="sm"
                  icon="i-lucide-plus"
                  :to="`/organizer/sessions/create?eventId=${event.id}`"
                >
                  Add Session
                </UButton>
              </div>
            </template>

            <div
              v-if="sessions.length === 0"
              class="py-8 text-center"
            >
              <UIcon
                name="i-lucide-presentation"
                class="mx-auto h-12 w-12 text-gray-400"
              />
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                No sessions scheduled yet
              </p>
            </div>

            <div
              v-else
              class="space-y-4"
            >
              <SessionCard
                v-for="session in sessions.slice(0, 5)"
                :key="session.id"
                :session="session"
                show-actions
              />

              <UButton
                v-if="sessions.length > 5"
                variant="ghost"
                block
                to="/organizer/sessions"
              >
                View all {{ sessions.length }} sessions
              </UButton>
            </div>
          </UCard>
        </div>

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
                icon="i-lucide-users"
                :to="`/organizer/participants?eventId=${event.id}`"
              >
                View Participants
              </UButton>
              <UButton
                block
                variant="soft"
                icon="i-lucide-qr-code"
                :to="`/organizer/checkpoints?eventId=${event.id}`"
              >
                Manage Checkpoints
              </UButton>
              <UButton
                block
                variant="soft"
                icon="i-lucide-bar-chart-3"
                :to="`/organizer/analytics?eventId=${event.id}`"
              >
                View Analytics
              </UButton>
            </div>
          </UCard>

          <!-- Capacity -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Registration Progress
              </h3>
            </template>

            <div class="text-center">
              <div class="text-4xl font-bold text-gray-900 dark:text-white">
                {{ capacityPercentage }}%
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ event.registeredCount }} of {{ event.capacity }} spots filled
              </p>
              <UProgress
                :value="capacityPercentage"
                class="mt-4"
                :color="capacityPercentage >= 90 ? 'error' : capacityPercentage >= 70 ? 'warning' : 'primary'"
              />
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </div>
</template>
