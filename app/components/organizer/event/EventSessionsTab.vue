<script setup lang="ts">
import type { Session } from '~/types'

const props = defineProps<{
  eventId: string
  sessions: Session[]
  /** When set, shows "Schedule Session" button that opens the schedule modal. */
  onScheduleSession?: () => void
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          Sessions
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage schedule, speakers, and venues for this event.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-if="onScheduleSession"
          icon="i-lucide-calendar-clock"
          color="neutral"
          variant="outline"
          @click="onScheduleSession"
        >
          Schedule Session
        </UButton>
        <UButton
          icon="i-lucide-plus"
          :to="`/organizer/sessions/create?event_id=${props.eventId}`"
        >
          Add Session
        </UButton>
      </div>
    </div>

    <div
      v-if="props.sessions.length === 0"
      class="py-10 text-center"
    >
      <UIcon
        name="i-lucide-presentation"
        class="mx-auto h-10 w-10 text-gray-400"
      />
      <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
        No sessions created yet for this event.
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Start by adding your first session to build out the program.
      </p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <SessionCard
        v-for="session in props.sessions"
        :key="session.id"
        :session="session"
        show-actions
        class="border border-gray-100 shadow-sm dark:border-gray-800"
      />
    </div>
  </div>
</template>

