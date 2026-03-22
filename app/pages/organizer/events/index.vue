<script setup lang="ts">
import type { Event, EventStatus, EventCreateInput, EventUpdateInput } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import EventCreateModal from '~/components/events/EventCreateModal.vue'
import EventEditModal from '~/components/events/EventEditModal.vue'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const eventsStore = useEventsStore()
const config = useRuntimeConfig()
const { user } = useAuth()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()
const router = useRouter()

const searchQuery = ref('')
const selectedStatus = ref<EventStatus | ''>('')
const viewMode = ref<'grid' | 'table'>('grid')
const deleteLoading = ref(false)
const eventToDelete = ref<Event | null>(null)

const coverFileInputRef = ref<HTMLInputElement | null>(null)
const pendingCoverEventId = ref<string | null>(null)
const coverUploadingEventId = ref<string | null>(null)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedEvent = ref<Event | null>(null)
const savingCreate = ref(false)
const savingUpdate = ref(false)

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published (Live)' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

async function loadEvents() {
  await eventsStore.fetchEvents({
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined,
    organizer_id: user.value?.id
  })
}

function handleViewEvent(event: Event) {
  router.push(`/organizer/events/${event.id}`)
}

function handleEditEvent(event: Event) {
  selectedEvent.value = event
  showEditModal.value = true
}

function handleCreateEvent() {
  selectedEvent.value = null
  showCreateModal.value = true
}

async function handleCreateEventSubmit(payload: EventCreateInput) {
  try {
    savingCreate.value = true
    await eventsStore.createEvent(payload)
    notifications.success('Event created successfully')
    showCreateModal.value = false
    await loadEvents()
  }
  catch {
    notifications.error('Failed to create event')
  }
  finally {
    savingCreate.value = false
  }
}

async function handleEditEventSubmit(payload: EventUpdateInput) {
  if (!selectedEvent.value) return

  try {
    savingUpdate.value = true
    await eventsStore.updateEvent(selectedEvent.value.id, payload)
    notifications.success('Event updated successfully')
    showEditModal.value = false
    selectedEvent.value = null
    await loadEvents()
  }
  catch {
    notifications.error('Failed to update event')
  }
  finally {
    savingUpdate.value = false
  }
}

async function handleDeleteEvent(event: Event) {
  eventToDelete.value = event
  const confirmed = await confirm({
    title: 'Delete Event',
    message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed && eventToDelete.value) {
    deleteLoading.value = true
    try {
      await eventsStore.deleteEvent(eventToDelete.value.id)
      notifications.success('Event deleted successfully')
    }
    catch {
      notifications.error('Failed to delete event')
    }
    finally {
      deleteLoading.value = false
      eventToDelete.value = null
    }
  }
}

const filteredEvents = computed(() => {
  return eventsStore.events.filter((event) => {
    const matchesSearch = !searchQuery.value ||
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !selectedStatus.value || event.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(event.cover_image, String(config.public.apiBase))
}

function openCoverPicker(event: Event) {
  pendingCoverEventId.value = event.id
  coverFileInputRef.value?.click()
}

function onCoverFileSelected(e: InputEvent) {
  void handleCoverFileSelected(e)
}

async function handleCoverFileSelected(e: InputEvent) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  const id = pendingCoverEventId.value
  pendingCoverEventId.value = null
  input.value = ''

  if (!file || !id) return

  coverUploadingEventId.value = id
  try {
    await eventsStore.uploadEventCover(id, file)
    notifications.success('Cover image updated')
  }
  catch {
    notifications.error('Failed to upload cover image')
  }
  finally {
    coverUploadingEventId.value = null
  }
}

function getEventDateLabel(event: Event): string {
  if (event.start_date) {
    return new Date(event.start_date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const anyEvent = event as any
  if (anyEvent.start_date_formatted) {
    return anyEvent.start_date_formatted
  }
  if (anyEvent.start_at) {
    return new Date(anyEvent.start_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return 'Date TBA'
}

function getEventLocationLabel(event: Event): string {
  const v = event.venue
  if (!v) {
    return 'Venue TBA'
  }

  if (v.type === 'virtual' || v.type === 'hybrid') {
    if (v.type === 'hybrid' && v.name) {
      const physical = [v.name, v.city].filter(Boolean).join(', ')
      if (physical) return physical
    }
    if (v.virtual_platform) return v.virtual_platform
    if (v.virtual_url) return 'Online'
    return 'Online event'
  }

  const parts = [v.name, v.city].filter(Boolean)
  if (parts.length) {
    return parts.join(', ')
  }
  if (v.address) {
    return v.address
  }
  if (v.country) {
    return v.country
  }
  return 'Venue TBA'
}

function getCapacityInfo(event: Event) {
  const registered = Number(event.registered_count ?? 0)
  const capacity = Number(event.capacity ?? 0)

  if (!capacity) {
    return {
      registered,
      capacity: 0,
      percent: 0,
      label: registered ? `${registered} registered` : 'No registrations yet'
    }
  }

  const percent = Math.min(100, Math.round((registered / capacity) * 100))

  return {
    registered,
    capacity,
    percent,
    label: `${percent}% full`
  }
}

function getStatusPill(event: Event) {
  const status = event.status as EventStatus

  if (status === 'draft') {
    return {
      label: 'Draft',
      classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
    }
  }

  if (status === 'completed') {
    return {
      label: 'Completed',
      classes: 'bg-slate-900 text-white'
    }
  }

  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
    }
  }

  return {
    label: 'Live',
    classes: 'bg-primary-500 text-white'
  }
}

watch([searchQuery, selectedStatus], loadEvents)

onMounted(loadEvents)
</script>

<template>
  <div class="space-y-10">
    <input
      ref="coverFileInputRef"
      type="file"
      accept="image/*"
      class="sr-only"
      tabindex="-1"
      @change="onCoverFileSelected"
    >
    <!-- Page header -->
    <section class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <h1 class="font-black tracking-tight text-slate-900 dark:text-white text-3xl sm:text-4xl">
          My Events
        </h1>
        <p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Manage and monitor your upcoming and past experiences.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <AppButton
          color="neutral"
          icon="filter_list"
        >
          Filter
        </AppButton>
        <AppButton
          icon="add"
          @click="handleCreateEvent"
        >
          New Event
        </AppButton>
      </div>
    </section>

    <!-- Filters row -->
    <section class="rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm dark:bg-slate-900/60 dark:ring-slate-800">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[220px] max-w-md">
            <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search your events..."
              class="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
            >
          </div>

          <div class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <span class="material-symbols-outlined text-sm text-slate-400">
              tune
            </span>
            <select
              v-model="selectedStatus"
              class="border-0 bg-transparent p-0 text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-100"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value || 'all'"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="hidden sm:inline">
            {{ filteredEvents.length }} events
          </span>
          <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>
            {{ eventsStore.loading ? 'Syncing with server…' : 'All systems operational' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <div
      v-if="eventsStore.loading"
      class="py-12"
    >
      <LoadingState text="Loading events..." />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredEvents.length === 0"
      icon="i-lucide-calendar"
      title="No events found"
      description="Create your first event to get started."
    >
      <template #actions>
        <AppButton
          icon="add"
          @click="handleCreateEvent"
        >
          Create Event
        </AppButton>
      </template>
    </EmptyState>

    <!-- Events grid -->
    <section
      v-else
      class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4"
    >
      <article
        v-for="event in filteredEvents"
        :key="event.id"
        class="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900 dark:ring-slate-800"
      >
        <!-- Cover: click image to upload a new cover -->
        <div class="relative h-56 overflow-hidden">
          <button
            type="button"
            class="absolute inset-0 z-0 block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            :aria-label="`Change cover image for ${event.title}`"
            :disabled="coverUploadingEventId === event.id"
            @click="openCoverPicker(event)"
          >
            <img
              :src="getEventImage(event)"
              :alt="event.title"
              class="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            >
          </button>
          <div
            v-if="coverUploadingEventId === event.id"
            class="absolute inset-0 z-[5] flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
          >
            <span class="material-symbols-outlined animate-spin text-3xl text-white">
              progress_activity
            </span>
          </div>
          <div class="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
            <span
              v-bind="{}"
              :class="[
                'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5 backdrop-blur-sm',
                getStatusPill(event).classes
              ]"
            >
              <span
                v-if="getStatusPill(event).label === 'Live'"
                class="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
              />
              {{ getStatusPill(event).label }}
            </span>
          </div>
          <button
            type="button"
            class="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-slate-900 transition-colors"
            @click="handleEditEvent(event)"
          >
            <span class="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          </button>
        </div>

        <!-- Body -->
        <div class="flex flex-1 flex-col p-6">
          <div class="mb-4 flex items-start justify-between gap-4">
            <h2 class="font-semibold leading-tight text-slate-900 dark:text-white line-clamp-2">
              {{ event.title }}
            </h2>
            <div class="rounded-lg bg-primary-50 p-2 text-primary-500 dark:bg-primary-500/10 dark:text-primary-300">
              <span class="material-symbols-outlined text-[20px]">
                confirmation_number
              </span>
            </div>
          </div>

          <div class="mb-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[18px] text-slate-400">
                calendar_today
              </span>
              <span class="font-medium">
                {{ getEventDateLabel(event) }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[18px] text-slate-400">
                location_on
              </span>
              <span class="font-medium">
                {{ getEventLocationLabel(event) }}
              </span>
            </div>
          </div>

          <div class="mt-auto space-y-4">
            <div class="flex items-end justify-between gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Registered
                </p>
                <p class="font-semibold text-slate-900 dark:text-white">
                  {{ getCapacityInfo(event).registered }}
                  <span
                    v-if="getCapacityInfo(event).capacity"
                    class="text-xs font-medium text-slate-500 dark:text-slate-400"
                  >
                    / {{ getCapacityInfo(event).capacity }}
                  </span>
                </p>
              </div>
              <p class="text-xs font-semibold text-primary-500">
                {{ getCapacityInfo(event).label }}
              </p>
            </div>

            <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-primary-500 transition-all"
                :style="{ width: `${getCapacityInfo(event).percent}%` }"
              />
            </div>

            <div class="grid grid-cols-1 gap-3 pt-1">
              <AppButton
                color="primary"
                @click="handleViewEvent(event)"
              >
                Manage Details
              </AppButton>
            </div>

            <button
              type="button"
              class="mt-2 w-full text-xs text-slate-400 hover:text-red-500"
              @click="handleDeleteEvent(event)"
            >
              Delete event
            </button>
          </div>
        </div>
      </article>
    </section>

    <!-- Pagination -->
    <section
      v-if="eventsStore.pagination.last_page > 1"
      class="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row"
    >
      <p>
        Showing
        {{ (eventsStore.pagination.page - 1) * eventsStore.pagination.per_page + 1 }}
        –
        {{ Math.min(eventsStore.pagination.page * eventsStore.pagination.per_page, eventsStore.pagination.total) }}
        of
        {{ eventsStore.pagination.total }}
        events
      </p>

      <UPagination
        :model-value="eventsStore.pagination.page"
        :total="eventsStore.pagination.total"
        :page-count="eventsStore.pagination.per_page"
        @update:model-value="(page) => { eventsStore.setPage(page); loadEvents() }"
      />
    </section>

    <!-- Delete confirmation -->
    <ConfirmModal
      :open="isOpen"
      :title="options?.title || ''"
      :message="options?.message || ''"
      :confirm-text="options?.confirmText"
      :variant="options?.variant"
      :loading="deleteLoading"
      @update:open="handleCancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- Create Event Modal -->
    <EventCreateModal
      v-model="showCreateModal"
      :loading="savingCreate"
      @created="handleCreateEventSubmit"
    />

    <!-- Edit Event Modal -->
    <EventEditModal
      v-if="selectedEvent"
      v-model="showEditModal"
      :data="selectedEvent"
      :loading="savingUpdate"
      @updated="handleEditEventSubmit"
    />
  </div>
</template>
