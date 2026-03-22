<script setup lang="ts">
import type { Checkpoint, CheckpointType } from '~/types'
import { getCheckpointTypeIcon, getCheckpointTypeLabel } from '~/types'

const props = defineProps<{
  eventId: string
  checkpoints: Checkpoint[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'create'): void
}>()

const checkpointTypes: { value: CheckpointType; label: string }[] = [
  { value: 'entry', label: 'Entry Point' },
  { value: 'exit', label: 'Exit Point' },
  { value: 'session', label: 'Session Check-in' },
  { value: 'booth', label: 'Booth Visit' },
  { value: 'custom', label: 'Custom' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          Entry Checkpoints
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor real-time scan activity across all access points.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        @click="emit('create')"
      >
        Add Checkpoint
      </UButton>
    </div>

    <div
      v-if="props.loading"
      class="py-10"
    >
      <LoadingState text="Loading checkpoints..." />
    </div>

    <div
      v-else
      class="grid gap-4 lg:grid-cols-[2fr,1fr]"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UCard
          v-for="checkpoint in props.checkpoints"
          :key="checkpoint.id"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'flex h-11 w-11 items-center justify-center rounded-lg',
                  checkpoint.is_active ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-gray-100 dark:bg-gray-800'
                ]"
              >
                <UIcon
                  :name="getCheckpointTypeIcon(checkpoint.type)"
                  :class="[
                    'h-5 w-5',
                    checkpoint.is_active ? 'text-emerald-600' : 'text-gray-400'
                  ]"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ checkpoint.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getCheckpointTypeLabel(checkpoint.type) }}
                </p>
                <p
                  v-if="checkpoint.location"
                  class="mt-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ checkpoint.location }}
                </p>
              </div>
            </div>
            <UBadge
              :color="checkpoint.is_active ? 'success' : 'neutral'"
              variant="soft"
              class="text-[11px]"
            >
              {{ checkpoint.is_active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ (checkpoint.scan_count ?? 0).toLocaleString() }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Total scans
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
              Checkpoint Types
            </h4>
          </div>
        </template>

        <ul class="space-y-3 text-sm">
          <li
            v-for="type in checkpointTypes"
            :key="type.value"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="getCheckpointTypeIcon(type.value)"
                class="h-4 w-4 text-gray-500"
              />
              <span class="text-gray-700 dark:text-gray-200">
                {{ type.label }}
              </span>
            </div>
          </li>
        </ul>
      </UCard>
    </div>
  </div>
</template>

