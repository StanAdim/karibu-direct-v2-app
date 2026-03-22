<script setup lang="ts">
import type { Checkpoint, Participant, Event, EventUpdateInput, SessionCreateInput, SessionUpdateInput } from '~/types'
import type { ScheduleSessionPayload } from '~/components/events/ScheduleSessionModal.vue'
import EventEditModal from '~/components/events/EventEditModal.vue'
import ScheduleSessionModal from '~/components/events/ScheduleSessionModal.vue'
import AddEditSessionModal from '~/components/events/AddEditSessionModal.vue'
import EventOverviewTab from '~/components/organizer/event/EventOverviewTab.vue'
import EventSessionsTab from '~/components/organizer/event/EventSessionsTab.vue'
import EventCheckpointsTab from '~/components/organizer/event/EventCheckpointsTab.vue'
import EventAttendeesTab from '~/components/organizer/event/EventAttendeesTab.vue'
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

const eventId = computed(() => String(route.params.id ?? ''))
const showEventModal = ref(false)
const showScheduleModal = ref(false)
const showSessionModal = ref(false)
const scheduledSlot = ref<Pick<ScheduleSessionPayload, 'date' | 'startTime' | 'endTime'> | null>(null)
const sessionSaveLoading = ref(false)
const loading = ref(true)
const activeTab = ref<'overview' | 'sessions' | 'checkpoints' | 'attendees'>('overview')

const organizerEventTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'checkpoints', label: 'Checkpoints' },
  { id: 'attendees', label: 'Attendee List' }
] as const

/** Only treat as loaded when it matches the current route (avoids stale hub state). */
const event = computed<Event | null>(() => {
  const ev = eventsStore.currentEvent
  if (!ev || String(ev.id) !== eventId.value) {
    return null
  }
  return ev
})

const sessions = computed(() => sessionsStore.sessions)

const eventCheckpoints = computed<Checkpoint[]>(() => [
  {
    id: '1',
    event_id: eventId.value,
    name: 'Main Entrance',
    description: 'Primary entry point for attendees',
    type: 'entry',
    location: 'Building A, Ground Floor',
    is_active: true,
    scan_count: 12482,
    settings: { allow_multiple_scans: false, require_ticket: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    event_id: eventId.value,
    name: 'VIP Entrance',
    description: 'Lounge & red carpet access',
    type: 'entry',
    location: 'Hall B, Side Gate',
    is_active: true,
    scan_count: 842,
    settings: { allow_multiple_scans: false, require_ticket: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

const eventParticipants = computed<Participant[]>(() => [
  {
    id: '1',
    event_id: eventId.value,
    first_name: 'Jessica',
    last_name: 'Chen',
    email: 'jessica.chen@example.com',
    phone: '+1234567890',
    ticket: {
      id: 't1',
      ticket_type: { id: 'tt1', name: 'VIP', description: '', price: 250, currency: 'USD', quantity: 500, sold_count: 320, max_per_order: 4, sales_start: '', sales_end: '', status: 'available' },
      ticket_number: 'VIP-001',
      qr_code: 'qr-001',
      price: 250,
      currency: 'USD',
      payment_status: 'completed',
      purchased_at: new Date().toISOString()
    },
    status: 'checked_in',
    registered_at: new Date(Date.now() - 86400000).toISOString(),
    checked_in_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    event_id: eventId.value,
    first_name: 'Marco',
    last_name: 'Rossi',
    email: 'marco.rossi@example.com',
    phone: '+1234567891',
    ticket: {
      id: 't2',
      ticket_type: { id: 'tt2', name: 'General Admission', description: '', price: 85, currency: 'USD', quantity: 2000, sold_count: 1440, max_per_order: 6, sales_start: '', sales_end: '', status: 'available' },
      ticket_number: 'GA-442',
      qr_code: 'qr-002',
      price: 85,
      currency: 'USD',
      payment_status: 'completed',
      purchased_at: new Date().toISOString()
    },
    status: 'confirmed',
    registered_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

const isLive = computed(() => event.value ? isEventLive(event.value) : false)
const isUpcoming = computed(() => event.value ? isEventUpcoming(event.value) : false)
const isPast = computed(() => event.value ? isEventPast(event.value) : false)
const capacityPercentage = computed(() => event.value ? getEventCapacityPercentage(event.value) : 0)

const stats = computed(() => [
  {
    title: 'Registered',
    value: event.value?.registered_count || 0,
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
  const id = eventId.value
  if (!id) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    await Promise.all([
      eventsStore.fetchEvent(id),
      sessionsStore.fetchEventSessions(id)
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

function openEditEventModal() {
  showEventModal.value = true
}

function openScheduleModal() {
  showScheduleModal.value = true
}

function onScheduleConfirm(payload: ScheduleSessionPayload) {
  scheduledSlot.value = {
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime
  }
  showScheduleModal.value = false
  showSessionModal.value = true
}

async function onSessionSaved(
  payload: (SessionCreateInput | SessionUpdateInput) & { id?: string; event_id?: string }
) {
  const id = payload.event_id ?? eventId.value
  if (!id) return
  sessionSaveLoading.value = true
  try {
    const createPayload = payload as SessionCreateInput
    await sessionsStore.createSession({
      event_id: id,
      title: createPayload.title,
      type: createPayload.type,
      start_time: createPayload.start_time,
      end_time: createPayload.end_time,
      description: createPayload.description,
      room: createPayload.room,
      track: createPayload.track,
      capacity: createPayload.capacity,
      level: createPayload.level,
      is_break: createPayload.is_break ?? false
    })
    notifications.success('Session created')
    await loadData()
    showSessionModal.value = false
    scheduledSlot.value = null
  } catch {
    notifications.error('Failed to create session')
  } finally {
    sessionSaveLoading.value = false
  }
}

async function handleSaveEvent(payload: EventUpdateInput) {
  if (!event.value) return

  try {
    await eventsStore.updateEvent(event.value.id, payload)
    notifications.success('Event updated successfully')
    await loadData()
    showEventModal.value = false
  }
  catch {
    notifications.error('Failed to update event')
  }
}

watch(
  eventId,
  (id, prevId) => {
    if (!id) {
      return
    }
    if (prevId !== undefined && id !== prevId) {
      eventsStore.clearCurrentEvent()
      sessionsStore.sessions = []
    }
    void loadData()
  },
  { immediate: true }
)

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

    <!-- Event Management Hub -->
    <template v-else>
      <div class="space-y-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
              Event Management Hub
            </p>
            <h1 class="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ event.title }}
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ event.short_description }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:justify-end">
            <UButton
              v-if="event.status === 'draft'"
              color="success"
              icon="i-lucide-rocket"
              @click="publishEvent"
            >
              Publish Event
            </UButton>
            <UButton
              v-if="event.status === 'published'"
              color="error"
              variant="outline"
              icon="i-lucide-x"
              @click="cancelEvent"
            >
              Cancel Event
            </UButton>
            <UButton
              variant="outline"
              icon="i-lucide-pencil"
              @click="openEditEventModal"
            >
              Edit Details
            </UButton>
            <UButton
              variant="ghost"
              icon="i-lucide-external-link"
            >
              View Public Page
            </UButton>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-1 text-sm dark:border-gray-800">
          <div class="flex gap-1 text-xs text-gray-500 dark:text-gray-400">
            <NuxtLink
              to="/organizer/events"
              class="hover:text-primary-500"
            >
              My Events
            </NuxtLink>
            <span>/</span>
            <span class="font-medium text-gray-600 dark:text-gray-300">
              {{ event.title }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {{ isLive ? 'Live Now' : isUpcoming ? 'Upcoming' : isPast ? 'Completed' : 'Draft' }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 border-b border-gray-200 text-sm dark:border-gray-800">
          <button
            v-for="tab in organizerEventTabs"
            :key="tab.id"
            type="button"
            class="relative -mb-px border-b-2 px-3 pb-3 text-sm font-medium transition-colors"
            :class="activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
          <div>
            <EventOverviewTab
              v-if="activeTab === 'overview'"
              :event="event"
              :capacity-percentage="capacityPercentage"
            />
            <EventSessionsTab
              v-else-if="activeTab === 'sessions'"
              :event-id="event.id"
              :sessions="sessions"
              :on-schedule-session="openScheduleModal"
            />
            <EventCheckpointsTab
              v-else-if="activeTab === 'checkpoints'"
              :event-id="event.id"
              :checkpoints="eventCheckpoints"
              @create="router.push(`/organizer/checkpoints?event_id=${event.id}`)"
            />
            <EventAttendeesTab
              v-else-if="activeTab === 'attendees'"
              :participants="eventParticipants"
            />
          </div>

          <div class="space-y-4">
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                  At a Glance
                </h3>
              </template>
              <div class="grid gap-3 text-sm">
                <div
                  v-for="stat in stats"
                  :key="stat.title"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="stat.icon"
                      class="h-4 w-4 text-gray-400"
                    />
                    <span class="text-gray-500 dark:text-gray-400">
                      {{ stat.title }}
                    </span>
                  </div>
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ stat.value }}
                  </span>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Registration Progress
                </h3>
              </template>
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ capacityPercentage }}%
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ event.registered_count }} of {{ event.capacity }} spots filled
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
      </div>
    </template>

    <!-- Edit Event Modal -->
    <EventEditModal
      v-if="event"
      v-model="showEventModal"
      :data="event"
      @updated="handleSaveEvent"
    />

    <!-- Schedule Session Modal -->
    <ScheduleSessionModal
      v-model="showScheduleModal"
      :event-id="event?.id"
      @confirm="onScheduleConfirm"
    />

    <!-- Add Session Modal (e.g. after scheduling) -->
    <AddEditSessionModal
      v-if="event"
      v-model="showSessionModal"
      :event-id="event.id"
      :initial-schedule="scheduledSlot ?? undefined"
      :loading="sessionSaveLoading"
      @saved="onSessionSaved"
    />
  </div>
</template>
