<script setup lang="ts">
import type { Event } from '~/types'

const props = defineProps<{
  event: Event
  capacityPercentage: number
}>()

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
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Event Snapshot
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              High-level overview of schedule, venue, and capacity.
            </p>
          </div>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <UIcon
                name="i-lucide-calendar"
                class="h-5 w-5 text-blue-600 dark:text-blue-300"
              />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(props.event.start_date) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950">
              <UIcon
                name="i-lucide-clock"
                class="h-5 w-5 text-indigo-600 dark:text-indigo-300"
              />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Time
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatTime(props.event.start_date) }} – {{ formatTime(props.event.end_date) }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <UIcon
                :name="props.event.venue.type === 'virtual' ? 'i-lucide-video' : 'i-lucide-map-pin'"
                class="h-5 w-5 text-emerald-600 dark:text-emerald-300"
              />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Venue
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ props.event.venue.type === 'virtual' ? 'Online Event' : props.event.venue.name || props.event.venue.city }}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Capacity</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ props.event.registered_count }} / {{ props.event.capacity }}
              </span>
            </div>
            <UProgress
              :value="capacityPercentage"
              :color="capacityPercentage >= 90 ? 'error' : capacityPercentage >= 70 ? 'warning' : 'primary'"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ capacityPercentage }}% of total capacity filled.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="props.event.description"
        class="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300"
      >
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Description
        </h4>
        <p>{{ props.event.description }}</p>
      </div>
    </UCard>
  </div>
</template>

