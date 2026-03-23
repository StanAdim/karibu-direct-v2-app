<script setup lang="ts">
import type { Session } from '~/types'
import { formatSessionTime, getSessionDuration, isSessionLive } from '~/types'

interface Props {
  session: Session
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

defineEmits<{
  click: [session: Session]
  edit: [session: Session]
  delete: [session: Session]
}>()

const isLive = computed(() => isSessionLive(props.session))
const duration = computed(() => getSessionDuration(props.session))
const timeRange = computed(() => formatSessionTime(props.session))

const sessionTypeIcons: Record<string, string> = {
  keynote: 'i-lucide-mic-2',
  workshop: 'i-lucide-hammer',
  panel: 'i-lucide-users',
  breakout: 'i-lucide-presentation',
  networking: 'i-lucide-handshake',
  demo: 'i-lucide-monitor-play',
  other: 'i-lucide-calendar'
}

const levelColors: Record<string, string> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
  all: 'neutral'
}
</script>

<template>
  <UCard
    class="group cursor-pointer transition-shadow hover:shadow-md"
    @click="$emit('click', session)"
  >
    <div class="flex items-start gap-4">
      <!-- Time indicator -->
      <div class="flex flex-col items-center text-center">
        <div
          :class="[
            'flex h-12 w-12 items-center justify-center rounded-lg',
            isLive ? 'bg-red-100 dark:bg-red-950' : session.is_break ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-950'
          ]"
        >
          <UIcon
            :name="session.is_break ? 'i-lucide-coffee' : (sessionTypeIcons[session.session_type] || 'i-lucide-calendar')"
            :class="[
              'h-6 w-6',
              isLive ? 'text-red-600' : session.is_break ? 'text-gray-600' : 'text-primary-600'
            ]"
          />
        </div>
        <span class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ duration }}min
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4
                :class="[
                  'font-semibold line-clamp-1',
                  session.is_break ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                ]"
              >
                {{ session.title }}
              </h4>
              <UBadge
                v-if="isLive"
                color="error"
                size="xs"
              >
                <span class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
              </UBadge>
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-clock"
                  class="h-4 w-4"
                />
                {{ timeRange }}
              </span>

              <span
                v-if="session.room"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-map-pin"
                  class="h-4 w-4"
                />
                {{ session.room }}
              </span>

              <span
                v-if="session.track"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-layers"
                  class="h-4 w-4"
                />
                {{ session.track }}
              </span>
            </div>

            <p
              v-if="session.description && !session.is_break"
              class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
            >
              {{ session.description }}
            </p>

            <!-- Speakers -->
            <div
              v-if="session.speakers?.length"
              class="mt-3 flex items-center gap-2"
            >
              <div class="flex -space-x-2">
                <UAvatar
                  v-for="speaker in session.speakers.slice(0, 3)"
                  :key="speaker.id"
                  :src="speaker.avatar"
                  :alt="speaker.name"
                  size="xs"
                  class="ring-2 ring-white dark:ring-gray-900"
                />
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ session.speakers.map(s => s.name).join(', ') }}
              </span>
            </div>

            <!-- Tags -->
            <div
              v-if="session.level || session.session_type !== 'other'"
              class="mt-3 flex flex-wrap gap-2"
            >
              <UBadge
                color="neutral"
                variant="soft"
                size="xs"
              >
                {{ session.session_type }}
              </UBadge>
              <UBadge
                v-if="session.level"
                :color="levelColors[session.level] as 'success' | 'warning' | 'error' | 'neutral'"
                variant="soft"
                size="xs"
              >
                {{ session.level }}
              </UBadge>
            </div>
          </div>

          <UDropdownMenu
            v-if="showActions && !session.is_break"
            :items="[
              [
                { label: 'Edit', icon: 'i-lucide-pencil', click: () => $emit('edit', session) },
                { label: 'View', icon: 'i-lucide-eye', click: () => $emit('click', session) }
              ],
              [
                { label: 'Delete', icon: 'i-lucide-trash-2', click: () => $emit('delete', session) }
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
      </div>
    </div>
  </UCard>
</template>
