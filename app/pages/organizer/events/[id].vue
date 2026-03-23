<script setup lang="ts">
import {
  flattenParticipantsFromRegistrations,
  getEventCapacityPercentage,
  isEventLive,
  isEventPast,
  isEventUpcoming,
  type Checkpoint,
  type Event,
  type EventStatus,
  type EventUpdateInput,
  type Participant,
  type SessionCreateInput,
  type SessionUpdateInput
} from '~/types'
import { onClickOutside } from '@vueuse/core'
import type { ScheduleSessionPayload } from '~/components/events/ScheduleSessionModal.vue'
import EventEditModal from '~/components/events/EventEditModal.vue'
import ScheduleSessionModal from '~/components/events/ScheduleSessionModal.vue'
import AddEditSessionModal from '~/components/events/AddEditSessionModal.vue'
import EventOverviewTab from '~/components/organizer/event/EventOverviewTab.vue'
import EventSessionsTab from '~/components/organizer/event/EventSessionsTab.vue'
import EventCheckpointsTab from '~/components/organizer/event/EventCheckpointsTab.vue'
import EventAttendeesTab from '~/components/organizer/event/EventAttendeesTab.vue'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const eventsStore = useEventsStore()
const sessionsStore = useSessionsStore()
const checkpointStore = useCheckpointStore()
const registrationStore = useRegistrationStore()
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

const eventCheckpoints = computed<Checkpoint[]>(() =>
  checkpointStore.eventCheckpoints(eventId.value)
)

const eventParticipants = computed<Participant[]>(() =>
  flattenParticipantsFromRegistrations(registrationStore.eventRegistrations)
)

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
      sessionsStore.fetchEventSessions(id),
      checkpointStore.fetchEventCheckpoints(id),
      registrationStore.fetchEventRegistrations(id)
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

const statusSelectRoot = ref<HTMLElement | null>(null)
const statusSelectOpen = ref(false)
const statusUpdateLoading = ref(false)

const eventStatusOptions: Array<{ value: EventStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
]

const statusValue = ref<EventStatus>('draft')

watch(
  () => event.value?.status,
  s => {
    if (s) statusValue.value = s
  },
  { immediate: true }
)

onClickOutside(statusSelectRoot, () => {
  statusSelectOpen.value = false
})

const statusSelectLabel = computed(() => {
  return eventStatusOptions.find(o => o.value === statusValue.value)?.label ?? statusValue.value
})

function chooseStatus(next: EventStatus) {
  statusValue.value = next
  statusSelectOpen.value = false

  // Update immediately after selection (no extra submit step).
  void submitStatusUpdate()
}

async function submitStatusUpdate() {
  if (!event.value) return

  const id = event.value.id
  const next = statusValue.value
  if (next === event.value.status) {
    statusSelectOpen.value = false
    return
  }

  statusUpdateLoading.value = true
  try {
    if (next === 'published') {
      await eventsStore.publishEvent(id)
    } else if (next === 'cancelled') {
      await eventsStore.cancelEvent(id)
    } else {
      await eventsStore.updateEvent(id, { status: next })
    }

    notifications.success('Event status updated')
    await loadData()
  } catch {
    notifications.error('Failed to update event status')
  } finally {
    statusUpdateLoading.value = false
    statusSelectOpen.value = false
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
      checkpointStore.invalidateEvent(prevId)
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
            <div
              class="flex items-center gap-2"
            >
              <div
                ref="statusSelectRoot"
                class="relative"
              >
                <button
                  type="button"
                  class="flex w-full min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
                  :disabled="statusUpdateLoading"
                  @click="statusSelectOpen = !statusSelectOpen"
                >
                  <span :class="statusValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'">
                    {{ statusUpdateLoading ? 'Updating…' : statusSelectLabel }}
                  </span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
                    :class="{ 'rotate-180': statusSelectOpen }"
                  />
                </button>

                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div
                    v-if="statusSelectOpen && !statusUpdateLoading"
                    class="absolute left-0 right-0 z-20 mt-1 max-h-56 min-w-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  >
                    <button
                      v-for="opt in eventStatusOptions"
                      :key="opt.value"
                      type="button"
                      class="flex cursor-pointer items-center w-48 gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700/80"
                      :class="opt.value === statusValue ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : ''"
                      @click="chooseStatus(opt.value)"
                    >
                      <span
                        class="inline-flex h-2 w-2 items-center justify-center rounded-full"
                        :class="opt.value === 'draft'
                          ? 'bg-slate-500'
                          : opt.value === 'published'
                            ? 'bg-emerald-500'
                            : opt.value === 'completed'
                              ? 'bg-sky-500'
                            : opt.value === 'archived'
                              ? 'bg-slate-500'
                              : 'bg-red-500'"
                      />
                      {{ opt.label }}
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
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
      v-if="event"
      v-model="showScheduleModal"
      :event-id="event.id"
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
