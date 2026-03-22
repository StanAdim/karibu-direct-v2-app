<script setup lang="ts">
import type { Checkpoint, CheckpointType } from '~/types'
import { getCheckpointTypeIcon, getCheckpointTypeLabel } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const router = useRouter()
const notifications = useNotifications()
const checkpointStore = useCheckpointStore()

const eventId = computed(() => {
  const raw = route.query.event_id
  const s = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''
  return s?.trim() || undefined
})

const checkpoints = computed(() => {
  const id = eventId.value
  if (!id) return []
  return checkpointStore.eventCheckpoints(id)
})

const listLoading = ref(false)
const createModalOpen = ref(false)

const newCheckpoint = reactive({
  name: '',
  description: '',
  type: 'entry' as CheckpointType,
  location: ''
})

const checkpointTypes: { value: CheckpointType; label: string }[] = [
  { value: 'entry', label: 'Entry Point' },
  { value: 'exit', label: 'Exit Point' },
  { value: 'session', label: 'Session Check-in' },
  { value: 'booth', label: 'Booth Visit' },
  { value: 'custom', label: 'Custom' }
]

async function loadCheckpoints(): Promise<void> {
  const id = eventId.value
  if (!id) return
  listLoading.value = true
  try {
    await checkpointStore.fetchEventCheckpoints(id)
  }
  finally {
    listLoading.value = false
  }
}

watch(eventId, (id) => {
  if (id) {
    void loadCheckpoints()
  }
}, { immediate: true })

async function setCheckpointActive(checkpoint: Checkpoint, isActive: boolean): Promise<void> {
  if (isActive === checkpoint.is_active) return
  try {
    await checkpointStore.updateCheckpoint(checkpoint.id, { is_active: isActive })
    notifications.success(`Checkpoint ${isActive ? 'activated' : 'deactivated'}`)
  }
  catch {
    notifications.error('Failed to update checkpoint')
  }
}

function onCheckpointActiveToggle(checkpoint: Checkpoint, value: boolean | string): void {
  void setCheckpointActive(checkpoint, value === true || value === 'true')
}

async function createCheckpoint(): Promise<void> {
  if (!eventId.value) {
    notifications.error('Open this page from an event so the checkpoint is linked')
    return
  }
  if (!newCheckpoint.name) {
    notifications.error('Please enter a checkpoint name')
    return
  }

  try {
    await checkpointStore.createCheckpoint({
      event_id: eventId.value,
      name: newCheckpoint.name,
      description: newCheckpoint.description || undefined,
      type: newCheckpoint.type,
      location: newCheckpoint.location || undefined,
      settings: { allow_multiple_scans: false, require_ticket: true }
    })
    notifications.success('Checkpoint created successfully')
    createModalOpen.value = false
    newCheckpoint.name = ''
    newCheckpoint.description = ''
    newCheckpoint.type = 'entry'
    newCheckpoint.location = ''
  }
  catch {
    notifications.error('Failed to create checkpoint')
  }
}

function goPickEvent(): void {
  router.push('/organizer/events')
}
</script>

<template>
  <div>
    <PageHeader
      title="Checkpoints"
      description="Manage event check-in points and QR scanners"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          :disabled="!eventId"
          @click="createModalOpen = true"
        >
          Add Checkpoint
        </UButton>
      </template>
    </PageHeader>

    <EmptyState
      v-if="!eventId"
      class="mt-8"
      icon="i-lucide-link"
      title="Select an event"
      description="Checkpoints are scoped to an event. Open this page from an event hub or pick one below."
    >
      <template #actions>
        <UButton
          icon="i-lucide-calendar"
          @click="goPickEvent"
        >
          Go to events
        </UButton>
      </template>
    </EmptyState>

    <div
      v-else-if="listLoading"
      class="py-16"
    >
      <LoadingState text="Loading checkpoints..." />
    </div>

    <!-- Checkpoints Grid -->
    <EmptyState
      v-else-if="checkpoints.length === 0"
      class="mt-8"
      icon="i-lucide-scan-line"
      title="No checkpoints yet"
      description="Create an entry or session checkpoint for this event."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="createModalOpen = true"
        >
          Add checkpoint
        </UButton>
      </template>
    </EmptyState>

    <div
      v-else
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="checkpoint in checkpoints"
        :key="checkpoint.id"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-lg',
                checkpoint.is_active ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-gray-100 dark:bg-gray-800'
              ]"
            >
              <UIcon
                :name="getCheckpointTypeIcon(checkpoint.type)"
                :class="[
                  'h-6 w-6',
                  checkpoint.is_active ? 'text-emerald-600' : 'text-gray-400'
                ]"
              />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ checkpoint.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getCheckpointTypeLabel(checkpoint.type) }}
              </p>
            </div>
          </div>

          <USwitch
            :model-value="checkpoint.is_active"
            @update:model-value="(v) => onCheckpointActiveToggle(checkpoint, v)"
          />
        </div>

        <p
          v-if="checkpoint.description"
          class="mt-4 text-sm text-gray-600 dark:text-gray-400"
        >
          {{ checkpoint.description }}
        </p>

        <div
          v-if="checkpoint.location"
          class="mt-3 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="h-4 w-4"
          />
          {{ checkpoint.location }}
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ checkpoint.scan_count ?? 0 }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Total Scans
            </p>
          </div>

          <div class="flex gap-2">
            <UButton
              variant="soft"
              size="sm"
              icon="i-lucide-qr-code"
            >
              QR Code
            </UButton>
            <UButton
              variant="soft"
              size="sm"
              icon="i-lucide-history"
            >
              History
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create Checkpoint Modal -->
    <UModal v-model:open="createModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Create Checkpoint
          </h3>

          <form
            class="mt-6 space-y-4"
            @submit.prevent="createCheckpoint"
          >
            <AppInput
              v-model="newCheckpoint.name"
              label="Checkpoint Name"
              placeholder="e.g., Main Entrance"
              required
            />

            <UFormField
              label="Type"
              orientation="vertical"
              size="md"
            >
              <USelect
                v-model="newCheckpoint.type"
                :items="checkpointTypes"
                value-key="value"
                label-key="label"
              />
            </UFormField>

            <AppInput
              v-model="newCheckpoint.location"
              label="Location"
              placeholder="e.g., Building A, Ground Floor"
            />

            <UFormField
              label="Description"
              orientation="vertical"
              size="md"
            >
              <UTextarea
                v-model="newCheckpoint.description"
                placeholder="Optional description"
                :rows="2"
              />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton
                color="neutral"
                variant="outline"
                @click="createModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="checkpointStore.loadingWrite"
              >
                Create
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>
