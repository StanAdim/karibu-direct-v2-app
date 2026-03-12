<script setup lang="ts">
import type { Session, SessionType } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const sessionsStore = useSessionsStore()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()
const router = useRouter()

const searchQuery = ref('')
const selectedType = ref<SessionType | ''>('')
const deleteLoading = ref(false)
const sessionToDelete = ref<Session | null>(null)

const eventId = computed(() => route.query.eventId as string | undefined)

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'keynote', label: 'Keynote' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'panel', label: 'Panel' },
  { value: 'talk', label: 'Talk' },
  { value: 'networking', label: 'Networking' },
  { value: 'break', label: 'Break' }
]

async function loadSessions() {
  await sessionsStore.fetchSessions({
    eventId: eventId.value,
    type: selectedType.value || undefined,
    search: searchQuery.value || undefined
  })
}

function handleViewSession(session: Session) {
  router.push(`/organizer/sessions/${session.id}`)
}

function handleEditSession(session: Session) {
  router.push(`/organizer/sessions/${session.id}/edit`)
}

async function handleDeleteSession(session: Session) {
  sessionToDelete.value = session
  const confirmed = await confirm({
    title: 'Delete Session',
    message: `Are you sure you want to delete "${session.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed && sessionToDelete.value) {
    deleteLoading.value = true
    try {
      await sessionsStore.deleteSession(sessionToDelete.value.id)
      notifications.success('Session deleted successfully')
    }
    catch {
      notifications.error('Failed to delete session')
    }
    finally {
      deleteLoading.value = false
      sessionToDelete.value = null
    }
  }
}

watch([searchQuery, selectedType], loadSessions)

onMounted(loadSessions)
</script>

<template>
  <div>
    <PageHeader
      title="Sessions"
      description="Manage event sessions and schedule"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          :to="eventId ? `/organizer/sessions/create?eventId=${eventId}` : '/organizer/sessions/create'"
        >
          Add Session
        </UButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search sessions..."
            icon="i-lucide-search"
          />
        </div>

        <USelect
          v-model="selectedType"
          :items="typeOptions"
          value-key="value"
          label-key="label"
          placeholder="Filter by type"
          class="w-40"
        />
      </div>
    </UCard>

    <!-- Loading State -->
    <div
      v-if="sessionsStore.loading"
      class="py-12"
    >
      <LoadingState text="Loading sessions..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="sessionsStore.sessions.length === 0"
      icon="i-lucide-presentation"
      title="No sessions found"
      description="Create your first session to get started"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          :to="eventId ? `/organizer/sessions/create?eventId=${eventId}` : '/organizer/sessions/create'"
        >
          Add Session
        </UButton>
      </template>
    </EmptyState>

    <!-- Sessions List -->
    <div
      v-else
      class="space-y-4"
    >
      <SessionCard
        v-for="session in sessionsStore.sessions"
        :key="session.id"
        :session="session"
        show-actions
        @click="handleViewSession"
        @edit="handleEditSession"
        @delete="handleDeleteSession"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="sessionsStore.pagination.lastPage > 1"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (sessionsStore.pagination.page - 1) * sessionsStore.pagination.perPage + 1 }} to
        {{ Math.min(sessionsStore.pagination.page * sessionsStore.pagination.perPage, sessionsStore.pagination.total) }}
        of {{ sessionsStore.pagination.total }} sessions
      </p>

      <UPagination
        :model-value="sessionsStore.pagination.page"
        :total="sessionsStore.pagination.total"
        :page-count="sessionsStore.pagination.perPage"
        @update:model-value="(page) => { sessionsStore.setPage(page); loadSessions() }"
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
