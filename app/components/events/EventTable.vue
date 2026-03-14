<script setup lang="ts">
import type { Event } from '~/types'
import { getEventCapacityPercentage } from '~/types'

interface Props {
  events: Event[]
  loading?: boolean
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false
})

const emit = defineEmits<{
  view: [event: Event]
  edit: [event: Event]
  delete: [event: Event]
  select: [events: Event[]]
}>()

const selectedEvents = ref<Event[]>([])

const columns = [
  { key: 'title', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'venue', label: 'Venue' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function toggleSelection(event: Event) {
  const index = selectedEvents.value.findIndex(e => e.id === event.id)
  if (index === -1) {
    selectedEvents.value.push(event)
  }
  else {
    selectedEvents.value.splice(index, 1)
  }
  emit('select', selectedEvents.value)
}

function toggleAll() {
  if (selectedEvents.value.length === props.events.length) {
    selectedEvents.value = []
  }
  else {
    selectedEvents.value = [...props.events]
  }
  emit('select', selectedEvents.value)
}

function isSelected(event: Event): boolean {
  return selectedEvents.value.some(e => e.id === event.id)
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th
            v-if="selectable"
            class="w-12 px-4 py-3"
          >
            <UCheckbox
              :model-value="selectedEvents.length === events.length && events.length > 0"
              :indeterminate="selectedEvents.length > 0 && selectedEvents.length < events.length"
              @update:model-value="toggleAll"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
        <tr v-if="loading">
          <td
            :colspan="selectable ? columns.length + 1 : columns.length"
            class="px-4 py-8 text-center"
          >
            <LoadingState text="Loading events..." />
          </td>
        </tr>

        <tr v-else-if="events.length === 0">
          <td
            :colspan="selectable ? columns.length + 1 : columns.length"
            class="px-4 py-8"
          >
            <EmptyState
              icon="i-lucide-calendar"
              title="No events found"
              description="Create your first event to get started"
            />
          </td>
        </tr>

        <tr
          v-for="event in events"
          v-else
          :key="event.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <td
            v-if="selectable"
            class="w-12 px-4 py-4"
          >
            <UCheckbox
              :model-value="isSelected(event)"
              @update:model-value="toggleSelection(event)"
            />
          </td>

          <!-- Event -->
          <td class="px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-16 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                <img
                  v-if="event.cover_image"
                  :src="event.cover_image"
                  :alt="event.title"
                  class="h-full w-full object-cover"
                >
                <div
                  v-else
                  class="flex h-full items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-calendar"
                    class="h-5 w-5 text-gray-400"
                  />
                </div>
              </div>
              <div class="min-w-0">
                <button
                  class="font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400 truncate"
                  @click="$emit('view', event)"
                >
                  {{ event.title }}
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ event.short_description || 'No description' }}
                </p>
              </div>
            </div>
          </td>

          <!-- Date -->
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {{ formatDate(event.start_date) }}
          </td>

          <!-- Venue -->
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <UIcon
                :name="event.venue.type === 'virtual' ? 'i-lucide-video' : 'i-lucide-map-pin'"
                class="h-4 w-4"
              />
              <span>{{ event.venue.type === 'virtual' ? 'Online' : event.venue.city || 'TBD' }}</span>
            </div>
          </td>

          <!-- Capacity -->
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="w-24">
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{{ event.registeredCount }}/{{ event.capacity }}</span>
                <span>{{ getEventCapacityPercentage(event) }}%</span>
              </div>
              <UProgress
                :value="getEventCapacityPercentage(event)"
                size="xs"
                class="mt-1"
              />
            </div>
          </td>

          <!-- Status -->
          <td class="px-4 py-4 whitespace-nowrap">
            <StatusBadge :status="event.status" />
          </td>

          <!-- Actions -->
          <td class="px-4 py-4 whitespace-nowrap text-right">
            <UDropdownMenu
              :items="[
                [
                  { label: 'View', icon: 'i-lucide-eye', click: () => $emit('view', event) },
                  { label: 'Edit', icon: 'i-lucide-pencil', click: () => $emit('edit', event) }
                ],
                [
                  { label: 'Delete', icon: 'i-lucide-trash-2', click: () => $emit('delete', event) }
                ]
              ]"
            >
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-more-horizontal"
                size="sm"
              />
            </UDropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
