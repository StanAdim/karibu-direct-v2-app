<script setup lang="ts">
import type { Event } from '~/types'
import { getEventCapacityPercentage, isEventLive, isEventUpcoming } from '~/types'

interface Props {
  event: Event
  variant?: 'default' | 'compact' | 'horizontal'
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showActions: false
})

defineEmits<{
  click: [event: Event]
  edit: [event: Event]
  delete: [event: Event]
}>()

const capacityPercentage = computed(() => getEventCapacityPercentage(props.event))
const isLive = computed(() => isEventLive(props.event))
const isUpcoming = computed(() => isEventUpcoming(props.event))

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
  <UCard
    :class="[
      'group cursor-pointer transition-shadow hover:shadow-lg',
      variant === 'horizontal' ? 'sm:flex' : ''
    ]"
    @click="$emit('click', event)"
  >
    <!-- Cover Image -->
    <div
      v-if="variant !== 'compact'"
      :class="[
        'relative overflow-hidden',
        variant === 'horizontal' ? 'sm:w-48 sm:shrink-0' : 'aspect-video'
      ]"
    >
      <img
        v-if="event.cover_image"
        :src="event.cover_image"
        :alt="event.title"
        class="h-full w-full object-cover"
      >
      <div
        v-else
        class="flex h-full min-h-32 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600"
      >
        <UIcon
          name="i-lucide-calendar"
          class="h-12 w-12 text-white/50"
        />
      </div>

      <!-- Status badges -->
      <div class="absolute left-2 top-2 flex flex-wrap gap-1">
        <UBadge
          v-if="isLive"
          color="error"
          variant="solid"
        >
          <span class="flex items-center gap-1">
            <span class="h-2 w-2 animate-pulse rounded-full bg-white" />
            Live
          </span>
        </UBadge>
        <StatusBadge
          v-else
          :status="event.status"
          size="xs"
        />
      </div>
    </div>

    <!-- Content -->
    <div :class="variant === 'horizontal' ? 'flex-1' : ''">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {{ event.title }}
          </h3>

          <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="h-4 w-4"
              />
              {{ formatDate(event.start_date) }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-clock"
                class="h-4 w-4"
              />
              {{ formatTime(event.start_date) }}
            </span>
          </div>

          <div
            v-if="event.venue"
            class="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"
          >
            <UIcon
              :name="event.venue.type === 'virtual' ? 'i-lucide-video' : 'i-lucide-map-pin'"
              class="h-4 w-4"
            />
            <span class="truncate">
              {{ event.venue.type === 'virtual' ? 'Online Event' : event.venue.name || event.venue.city }}
            </span>
          </div>
        </div>

        <UDropdownMenu
          v-if="showActions"
          :items="[
            [
              { label: 'Edit', icon: 'i-lucide-pencil', click: () => $emit('edit', event) },
              { label: 'View', icon: 'i-lucide-eye', click: () => $emit('click', event) }
            ],
            [
              { label: 'Delete', icon: 'i-lucide-trash-2', click: () => $emit('delete', event) }
            ]
          ]"
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-more-vertical"
            size="sm"
            @click.stop
          />
        </UDropdownMenu>
      </div>

      <!-- Capacity bar -->
      <div
        v-if="variant !== 'compact'"
        class="mt-4"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ event.registered_count }} / {{ event.capacity }} registered
          </span>
          <span
            :class="[
              'font-medium',
              capacityPercentage >= 90 ? 'text-red-600' : capacityPercentage >= 70 ? 'text-amber-600' : 'text-gray-600'
            ]"
          >
            {{ capacityPercentage }}%
          </span>
        </div>
        <UProgress
          :value="capacityPercentage"
          size="sm"
          class="mt-1"
          :color="capacityPercentage >= 90 ? 'error' : capacityPercentage >= 70 ? 'warning' : 'primary'"
        />
      </div>

      <!-- Tags -->
      <div
        v-if="event.categories?.length && variant !== 'compact'"
        class="mt-3 flex flex-wrap gap-1"
      >
        <UBadge
          v-for="category in event.categories.slice(0, 3)"
          :key="category"
          color="neutral"
          variant="soft"
          size="xs"
        >
          {{ category }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
