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
  type Session,
  type SessionCreateInput,
  type SessionUpdateInput
} from '~/types'
import { onClickOutside } from '@vueuse/core'
import type { ScheduleSessionPayload } from '~/components/events/ScheduleSessionModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AddEditTicketTypeModal from '~/components/events/AddEditTicketTypeModal.vue'
import EventEditModal from '~/components/events/EventEditModal.vue'
import ScheduleSessionModal from '~/components/events/ScheduleSessionModal.vue'
import SessionCreateModal from '~/components/events/SessionCreateModal.vue'
import SessionEditModal from '~/components/events/SessionEditModal.vue'
import AssignSessionSpeakerModal from '~/components/events/AssignSessionSpeakerModal.vue'
import SessionRegistrationModal from '~/components/events/SessionRegistrationModal.vue'
import SessionCheckInModal from '~/components/events/SessionCheckInModal.vue'
import EventOverviewTab from '~/components/organizer/event/EventOverviewTab.vue'
import EventSessionsTab from '~/components/organizer/event/EventSessionsTab.vue'
import EventCheckpointsTab from '~/components/organizer/event/EventCheckpointsTab.vue'
import EventAttendeesTab from '~/components/organizer/event/EventAttendeesTab.vue'
import EventTicketTypesTab from '~/components/organizer/event/EventTicketTypesTab.vue'
import type { TicketType, TicketTypeUpsertInput } from '~/stores/ticket_types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const eventsStore = useEventsStore()
const sessionsStore = useSessionsStore()
const checkpointStore = useCheckpointStore()
const registrationStore = useRegistrationStore()
const attendanceStore = useAttendanceStore()
const ticketTypesStore = useTicketTypesStore()
const notifications = useNotifications()
const router = useRouter()
const api = useApi()

type AssignSpeakerPayload = {
  user_id: string
  role: string
}

const eventId = computed(() => String(route.params.id ?? ''))
const showEventModal = ref(false)
const showScheduleModal = ref(false)
const showSessionCreateModal = ref(false)
const showSessionEditModal = ref(false)
const editingSession = ref<Session | null>(null)
const scheduledSlot = ref<Pick<ScheduleSessionPayload, 'date' | 'startTime' | 'endTime'> | null>(null)
const sessionSaveLoading = ref(false)

const showAssignSpeakerModal = ref(false)
const assignSession = ref<Session | null>(null)
const assignSpeakerLoading = ref(false)

const showSessionRegModal = ref(false)
const regSession = ref<Session | null>(null)
const sessionRegLoading = ref(false)

const showSessionCheckInModal = ref(false)
const checkInSession = ref<Session | null>(null)
const sessionCheckInLoading = ref(false)
const loading = ref(true)
const activeTab = ref<'overview' | 'sessions' | 'ticket_types' | 'checkpoints' | 'attendees'>('overview')

const organizerEventTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'ticket_types', label: 'Ticket Types' },
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

const ticketTypes = computed<TicketType[]>(() =>
  ticketTypesStore.getEventTicketTypesFromCache(eventId.value)
)

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
      ticketTypesStore.fetchEventTicketTypes(id),
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
  editingSession.value = null
  showSessionEditModal.value = false
  showScheduleModal.value = true
}

function openAddSessionQuick() {
  editingSession.value = null
  showSessionEditModal.value = false
  scheduledSlot.value = null
  showSessionCreateModal.value = true
}

function openEditSession(session: Session) {
  showSessionCreateModal.value = false
  scheduledSlot.value = null
  editingSession.value = session
  showSessionEditModal.value = true
}

function openAssignSpeaker(session: Session) {
  assignSession.value = session
  showAssignSpeakerModal.value = true
}

function openSessionRegistration(session: Session) {
  regSession.value = session
  showSessionRegModal.value = true
}

function openSessionCheckIn(session: Session) {
  checkInSession.value = session
  showSessionCheckInModal.value = true
}

const showTicketTypeModal = ref(false)
const editingTicketType = ref<TicketType | null>(null)

function openAddTicketType() {
  editingTicketType.value = null
  showTicketTypeModal.value = true
}

function openEditTicketType(ticketType: TicketType) {
  editingTicketType.value = ticketType
  showTicketTypeModal.value = true
}

async function onTicketTypeSaved(payload: TicketTypeUpsertInput) {
  const ev = eventId.value
  if (!ev) return

  try {
    if (editingTicketType.value?.id) {
      await ticketTypesStore.updateTicketType(ev, editingTicketType.value.id, payload)
      notifications.success('Ticket type updated')
    } else {
      await ticketTypesStore.createTicketType(ev, payload)
      notifications.success('Ticket type created')
    }

    showTicketTypeModal.value = false
    editingTicketType.value = null
    await ticketTypesStore.fetchEventTicketTypes(ev)
  }
  catch {
    notifications.error('Failed to save ticket type')
  }
}

async function onTicketTypeClone(ticketType: TicketType) {
  const ev = eventId.value
  if (!ev) return
  try {
    await ticketTypesStore.cloneTicketType(ev, ticketType.id)
    notifications.success('Ticket type cloned')
    await ticketTypesStore.fetchEventTicketTypes(ev)
  }
  catch {
    notifications.error('Failed to clone ticket type')
  }
}

async function onTicketTypeDelete(ticketType: TicketType) {
  const ev = eventId.value
  if (!ev) return
  try {
    await ticketTypesStore.deleteTicketType(ev, ticketType.id)
    notifications.success('Ticket type deleted')
  }
  catch {
    notifications.error('Failed to delete ticket type')
  }
}

function onTicketTypeModalUpdate(v: boolean) {
  if (!v) {
    editingTicketType.value = null
  }
}

function onScheduleConfirm(payload: ScheduleSessionPayload) {
  scheduledSlot.value = {
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime
  }
  showScheduleModal.value = false
  showSessionCreateModal.value = true
}

async function onSessionCreated(payload: SessionCreateInput) {
  const ev = eventId.value
  if (!ev) return
  sessionSaveLoading.value = true
  try {
    await sessionsStore.createSession({
      ...payload,
      event_id: payload.event_id || ev
    })
    notifications.success('Session created')
    await loadData()
    showSessionCreateModal.value = false
    scheduledSlot.value = null
  }
  catch {
    notifications.error('Failed to create session')
  }
  finally {
    sessionSaveLoading.value = false
  }
}

async function onSessionUpdated(payload: SessionUpdateInput) {
  if (!editingSession.value) return
  sessionSaveLoading.value = true
  try {
    await sessionsStore.updateSession(editingSession.value.id, payload)
    notifications.success('Session updated')
    await loadData()
    showSessionEditModal.value = false
    editingSession.value = null
  }
  catch {
    notifications.error('Failed to update session')
  }
  finally {
    sessionSaveLoading.value = false
  }
}

async function onAssignSpeakerSaved(payload: AssignSpeakerPayload) {
  if (!assignSession.value) return
  assignSpeakerLoading.value = true
  try {
    await api.post(`/sessions/${assignSession.value.id}/speakers`, payload)
    notifications.success('Speaker updated')
    showAssignSpeakerModal.value = false
    assignSession.value = null
    await loadData()
  }
  catch {
    notifications.error('Failed to update speaker')
  }
  finally {
    assignSpeakerLoading.value = false
  }
}

async function onSessionRegistrationSubmit(registrationId: string) {
  if (!regSession.value) return
  sessionRegLoading.value = true
  try {
    await sessionsStore.registerAttendeeForSession(regSession.value.id, eventId.value, registrationId)
    notifications.success('Registration linked to session')
    showSessionRegModal.value = false
    regSession.value = null
  }
  catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
      ? (e as { message: string }).message
      : 'Could not link registration. Ensure the API supports POST /sessions/:id/registrations.'
    notifications.error(msg)
  }
  finally {
    sessionRegLoading.value = false
  }
}

async function onSessionCheckInSubmit(qrCode: string) {
  if (!checkInSession.value || !event.value) return
  sessionCheckInLoading.value = true
  try {
    await attendanceStore.qrCheckIn({
      qr_code: qrCode,
      session_id: checkInSession.value.id,
      event_id: event.value.id
    })
    notifications.success('Checked in')
    showSessionCheckInModal.value = false
    checkInSession.value = null
  }
  catch {
    notifications.error('Check-in failed')
  }
  finally {
    sessionCheckInLoading.value = false
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
      sessionsStore.clearSessionsList()
      checkpointStore.invalidateEvent(prevId)
      ticketTypesStore.clearEventTicketTypes(prevId)
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
            <AppButton
              color="neutral"
              size="sm"
              icon="edit"
              class="!shadow-sm !bg-white !text-slate-800 border border-slate-200/80 hover:!bg-[#e8efff]/80 dark:!bg-slate-900 dark:border-slate-700 dark:!text-slate-100"
              @click="openEditEventModal"
            >
              Edit Details
            </AppButton>
            <AppButton
              color="neutral"
              size="sm"
              icon="open_in_new"
              :to="event ? `/attendee/events/${event.id}` : undefined"
              class="!shadow-none !bg-transparent !text-slate-700 hover:!bg-slate-100/70 dark:!text-slate-200 dark:hover:!bg-slate-800/70"
            >
              View Public Page
            </AppButton>
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
              :sessions="sessions"
              @schedule-session="openScheduleModal"
              @add-session="openAddSessionQuick"
              @edit-session="openEditSession"
              @assign-speaker="openAssignSpeaker"
              @session-register="openSessionRegistration"
              @session-checkin="openSessionCheckIn"
              @sessions-changed="loadData"
            />
            <EventTicketTypesTab
              v-else-if="activeTab === 'ticket_types'"
              :event-id="event.id"
              :ticket-types="ticketTypes"
              :loading="ticketTypesStore.loadingList"
              @add="openAddTicketType"
              @edit="openEditTicketType"
              @clone="onTicketTypeClone"
              @delete="onTicketTypeDelete"
              @refresh="ticketTypesStore.fetchEventTicketTypes(event.id)"
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
              :event-title="event.title"
              :event-capacity="event.capacity"
              :event-registered="event.registered_count"
            />
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

    <!-- Create Session Modal -->
    <SessionCreateModal
      v-if="event"
      v-model="showSessionCreateModal"
      :event-id="event.id"
      :initial-schedule="scheduledSlot ?? undefined"
      :loading="sessionSaveLoading"
      @created="onSessionCreated"
    />

    <!-- Edit Session Modal -->
    <SessionEditModal
      v-if="event && editingSession"
      v-model="showSessionEditModal"
      :data="editingSession"
      :event-id="event.id"
      :loading="sessionSaveLoading"
      @updated="onSessionUpdated"
    />

    <AssignSessionSpeakerModal
      v-model="showAssignSpeakerModal"
      :session="assignSession"
      :loading="assignSpeakerLoading"
      @saved="onAssignSpeakerSaved"
    />

    <SessionRegistrationModal
      v-model="showSessionRegModal"
      :session="regSession"
      :registrations="registrationStore.eventRegistrations"
      :loading="sessionRegLoading"
      @submit="onSessionRegistrationSubmit"
    />

    <SessionCheckInModal
      v-model="showSessionCheckInModal"
      :session="checkInSession"
      :loading="sessionCheckInLoading"
      @submit="onSessionCheckInSubmit"
    />

    <AddEditTicketTypeModal
      v-model="showTicketTypeModal"
      :data="editingTicketType"
      :loading="ticketTypesStore.loadingWrite"
      @saved="onTicketTypeSaved"
      @update:model-value="onTicketTypeModalUpdate"
    />
  </div>
</template>
