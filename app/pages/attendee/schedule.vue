<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AppAvatar from '~/components/common/AppAvatar.vue'
import AppLucideIcon from '~/components/common/AppLucideIcon.vue'
import AppButton from '~/components/ui/AppButton.vue'
import { formatSessionTime, getSessionDuration } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const sessionsStore = useSessionsStore()
const notifications = useNotifications()
const { myScheduleSessions, loadingMySchedule } = storeToRefs(sessionsStore)

const selectedDate = ref<string>('')

const uniqueDates = computed(() => {
  const dates = new Set<string>()
  myScheduleSessions.value.forEach((session) => {
    dates.add(new Date(session.start_time).toDateString())
  })
  return Array.from(dates).sort()
})

watch(
  uniqueDates,
  (dates) => {
    if (dates.length === 0) {
      selectedDate.value = ''
      return
    }
    if (!selectedDate.value || !dates.includes(selectedDate.value)) {
      selectedDate.value = dates[0]!
    }
  },
  { immediate: true }
)

const filteredSessions = computed(() => {
  if (!selectedDate.value) return myScheduleSessions.value

  return myScheduleSessions.value
    .filter((session) => {
      return new Date(session.start_time).toDateString() === selectedDate.value
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
})

function formatDateLabel(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const sessionTypeIcons: Record<string, string> = {
  keynote: 'i-lucide-mic-2',
  workshop: 'i-lucide-hammer',
  panel: 'i-lucide-users',
  breakout: 'i-lucide-presentation',
  networking: 'i-lucide-handshake',
  demo: 'i-lucide-monitor-play',
  other: 'i-lucide-calendar'
}

async function loadSchedule(): Promise<void> {
  try {
    await sessionsStore.fetchMyScheduleSessions()
  }
  catch {
    notifications.error({
      title: 'Error',
      description: 'Could not load your schedule. Please try again.'
    })
  }
}

onMounted(() => {
  void loadSchedule()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          My Schedule
        </h1>
        <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
          Your personalized event schedule
        </p>
      </div>
      <AppButton
        color="neutral"
        icon="download"
        type="button"
        class="self-start border border-slate-200 shadow-sm! dark:border-slate-600 sm:self-center"
      >
        Export to Calendar
      </AppButton>
    </div>

    <LoadingState
      v-if="loadingMySchedule && myScheduleSessions.length === 0"
      text="Loading your schedule…"
    />

    <template v-else-if="myScheduleSessions.length === 0">
      <EmptyState
        icon="i-lucide-calendar"
        title="No sessions scheduled"
        description="Register for events and add sessions to see them here."
      >
        <template #actions>
          <AppButton
            to="/attendee/events"
            icon="search"
          >
            Browse Events
          </AppButton>
        </template>
      </EmptyState>
    </template>

    <template v-else>
      <!-- Date tabs -->
      <div class="flex flex-wrap gap-2">
        <AppButton
          v-for="date in uniqueDates"
          :key="date"
          type="button"
          size="sm"
          :color="selectedDate === date ? 'primary' : 'neutral'"
          @click="selectedDate = date"
        >
          {{ formatDateLabel(date) }}
        </AppButton>
      </div>

      <!-- Schedule timeline -->
      <div class="space-y-4">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          :class="[
            'rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 sm:p-5',
            session.is_break ? 'bg-gray-50 dark:bg-gray-950' : 'bg-white dark:bg-slate-900'
          ]"
        >
          <div class="flex items-start gap-4">
            <div class="flex flex-col items-center text-center">
              <div
                :class="[
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  session.is_break ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-950'
                ]"
              >
                <AppLucideIcon
                  :name="session.is_break ? 'i-lucide-coffee' : (sessionTypeIcons[session.session_type] || 'i-lucide-calendar')"
                  :size="24"
                  :class="session.is_break ? 'text-gray-600' : 'text-primary-600'"
                />
              </div>
              <span class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ getSessionDuration(session) }}min
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3
                    :class="[
                      'font-semibold',
                      session.is_break ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                    ]"
                  >
                    {{ session.title }}
                  </h3>

                  <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <AppLucideIcon
                        name="i-lucide-clock"
                        :size="16"
                        class="text-gray-500"
                      />
                      {{ formatSessionTime(session) }}
                    </span>

                    <span
                      v-if="session.room"
                      class="flex items-center gap-1"
                    >
                      <AppLucideIcon
                        name="i-lucide-map-pin"
                        :size="16"
                        class="text-gray-500"
                      />
                      {{ session.room }}
                    </span>

                    <span
                      v-if="session.track"
                      class="flex items-center gap-1"
                    >
                      <AppLucideIcon
                        name="i-lucide-layers"
                        :size="16"
                        class="text-gray-500"
                      />
                      {{ session.track }}
                    </span>
                  </div>

                  <p
                    v-if="session.description && !session.is_break"
                    class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {{ session.description }}
                  </p>

                  <div
                    v-if="session.speakers?.length"
                    class="mt-3 flex items-center gap-2"
                  >
                    <div class="flex -space-x-2">
                      <AppAvatar
                        v-for="speaker in session.speakers.slice(0, 3)"
                        :key="speaker.id"
                        :src="speaker.avatar"
                        :alt="speaker.name"
                        size="xs"
                      />
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ session.speakers.map(s => s.name).join(', ') }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="!session.is_break"
                  class="flex flex-wrap gap-2"
                >
                  <span
                    class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {{ session.session_type }}
                  </span>
                  <span
                    v-if="session.level"
                    class="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
                  >
                    {{ session.level }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
