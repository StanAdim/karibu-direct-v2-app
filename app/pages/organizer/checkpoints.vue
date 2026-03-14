<script setup lang="ts">
import type { Checkpoint, CheckpointType } from '~/types'
import { getCheckpointTypeIcon, getCheckpointTypeLabel } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const notifications = useNotifications()

const eventId = computed(() => route.query.event_id as string | undefined)
const loading = ref(false)
const createModalOpen = ref(false)

const checkpoints = ref<Checkpoint[]>([
  {
    id: '1',
    event_id: 'event-1',
    name: 'Main Entrance',
    description: 'Primary entry point for attendees',
    type: 'entry',
    location: 'Building A, Ground Floor',
    is_active: true,
    scan_count: 245,
    settings: { allow_multiple_scans: false, require_ticket: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    event_id: 'event-1',
    name: 'Session Hall A',
    description: 'Check-in for keynote sessions',
    type: 'session',
    location: 'Building A, Floor 2',
    is_active: true,
    scan_count: 180,
    settings: { allow_multiple_scans: false, require_ticket: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    event_id: 'event-1',
    name: 'Sponsor Booth',
    description: 'Track booth visits',
    type: 'booth',
    location: 'Exhibition Hall',
    is_active: true,
    scan_count: 89,
    settings: { allow_multiple_scans: true, require_ticket: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

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

async function toggleCheckpoint(checkpoint: Checkpoint) {
  checkpoint.is_active = !checkpoint.is_active
  notifications.success(`Checkpoint ${checkpoint.is_active ? 'activated' : 'deactivated'}`)
}

async function createCheckpoint() {
  if (!newCheckpoint.name) {
    notifications.error('Please enter a checkpoint name')
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    checkpoints.value.push({
      id: String(checkpoints.value.length + 1),
      event_id: eventId.value || 'event-1',
      name: newCheckpoint.name,
      description: newCheckpoint.description,
      type: newCheckpoint.type,
      location: newCheckpoint.location,
      is_active: true,
      scan_count: 0,
      settings: { allow_multiple_scans: false, require_ticket: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    notifications.success('Checkpoint created successfully')
    createModalOpen.value = false
    newCheckpoint.name = ''
    newCheckpoint.description = ''
    newCheckpoint.type = 'entry'
    newCheckpoint.location = ''
  }
  finally {
    loading.value = false
  }
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
          @click="createModalOpen = true"
        >
          Add Checkpoint
        </UButton>
      </template>
    </PageHeader>

    <!-- Checkpoints Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            @update:model-value="toggleCheckpoint(checkpoint)"
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
              {{ checkpoint.scan_count }}
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
                :loading="loading"
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
