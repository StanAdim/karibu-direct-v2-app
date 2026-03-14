<script setup lang="ts">
import type { Event, EventStatus } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const eventsStore = useEventsStore()
const { user } = useAuth()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()
const router = useRouter()

const searchQuery = ref('')
const selectedStatus = ref<EventStatus | ''>('')
const viewMode = ref<'grid' | 'table'>('grid')
const deleteLoading = ref(false)
const eventToDelete = ref<Event | null>(null)

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

async function loadEvents() {
  await eventsStore.fetchEvents({
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined,
    organizerId: user.value?.id
  })
}

function handleViewEvent(event: Event) {
  router.push(`/organizer/events/${event.id}`)
}

function handleEditEvent(event: Event) {
  router.push(`/organizer/events/${event.id}/edit`)
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

watch([searchQuery, selectedStatus], loadEvents)

onMounted(loadEvents)
</script>

<template>
  <div>
    <PageHeader
      title="My Events"
      description="Manage your events and track registrations"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          to="/organizer/events/create"
        >
          Create Event
        </UButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search events..."
            icon="i-lucide-search"
          />
        </div>

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          placeholder="Filter by status"
          class="w-40"
        />

        <div class="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-800">
          <UButton
            :color="viewMode === 'grid' ? 'primary' : 'neutral'"
            :variant="viewMode === 'grid' ? 'solid' : 'ghost'"
            icon="i-lucide-grid-3x3"
            size="sm"
            @click="viewMode = 'grid'"
          />
          <UButton
            :color="viewMode === 'table' ? 'primary' : 'neutral'"
            :variant="viewMode === 'table' ? 'solid' : 'ghost'"
            icon="i-lucide-list"
            size="sm"
            @click="viewMode = 'table'"
          />
        </div>
      </div>
    </UCard>

    <!-- Loading State -->
    <div
      v-if="eventsStore.loading"
      class="py-12"
    >
      <LoadingState text="Loading events..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="eventsStore.events.length === 0"
      icon="i-lucide-calendar"
      title="No events found"
      description="Create your first event to get started"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          to="/organizer/events/create"
        >
          Create Event
        </UButton>
      </template>
    </EmptyState>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <EventCard
        v-for="event in eventsStore.events"
        :key="event.id"
        :event="event"
        show-actions
        @click="handleViewEvent"
        @edit="handleEditEvent"
        @delete="handleDeleteEvent"
      />
    </div>

    <!-- Table View -->
    <EventTable
      v-else
      :events="eventsStore.events"
      @view="handleViewEvent"
      @edit="handleEditEvent"
      @delete="handleDeleteEvent"
    />

    <!-- Pagination -->
    <div
      v-if="eventsStore.pagination.last_page > 1"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (eventsStore.pagination.page - 1) * eventsStore.pagination.per_page + 1 }} to
        {{ Math.min(eventsStore.pagination.page * eventsStore.pagination.per_page, eventsStore.pagination.total) }}
        of {{ eventsStore.pagination.total }} events
      </p>

      <UPagination
        :model-value="eventsStore.pagination.page"
        :total="eventsStore.pagination.total"
        :page-count="eventsStore.pagination.per_page"
        @update:model-value="(page) => { eventsStore.setPage(page); loadEvents() }"
      />
    </div>

    <!-- Delete Confirmation Modal -->
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
  </div>
</template>
