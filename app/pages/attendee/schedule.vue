<script setup lang="ts">
import AppAvatar from '~/components/common/AppAvatar.vue'
import AppLucideIcon from '~/components/common/AppLucideIcon.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { Session } from '~/types'
import { formatSessionTime, getSessionDuration } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const selectedDate = ref<string>('')

const mySessions = ref<Session[]>([
  {
    id: '1',
    event_id: 'event-1',
    title: 'Opening Keynote: The Future of Technology',
    description: 'Join us for the opening keynote session',
    session_type: 'keynote',
    start_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 9).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 10).toISOString(),
    room: 'Main Hall',
    attendee_count: 500,
    speakers: [
      { id: 's1', name: 'John Smith', title: 'CEO', company: 'TechCorp' }
    ],
    track: 'General',
    level: 'all',
    status: 'scheduled',
    is_break: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    event_id: 'event-1',
    title: 'Coffee Break',
    session_type: 'other',
    start_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 10).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 10.5).toISOString(),
    room: 'Lobby',
    attendee_count: 0,
    speakers: [],
    status: 'scheduled',
    is_break: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    event_id: 'event-1',
    title: 'Building Scalable Applications with Vue 3',
    description: 'Learn best practices for building large-scale Vue applications',
    session_type: 'workshop',
    start_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 10.5).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 12).toISOString(),
    room: 'Workshop Room A',
    capacity: 30,
    attendee_count: 28,
    speakers: [
      { id: 's2', name: 'Jane Doe', title: 'Senior Developer', company: 'VueCo' }
    ],
    track: 'Frontend',
    level: 'intermediate',
    status: 'scheduled',
    is_break: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    event_id: 'event-1',
    title: 'AI in Production: Real-world Case Studies',
    description: 'Panel discussion on deploying AI in production environments',
    session_type: 'panel',
    start_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 14).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 15).toISOString(),
    room: 'Main Hall',
    attendee_count: 200,
    speakers: [
      { id: 's3', name: 'Alice Johnson', title: 'ML Engineer', company: 'AIStartup' },
      { id: 's4', name: 'Bob Williams', title: 'CTO', company: 'DataCorp' }
    ],
    track: 'AI/ML',
    level: 'advanced',
    status: 'scheduled',
    is_break: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

const uniqueDates = computed(() => {
  const dates = new Set<string>()
  mySessions.value.forEach((session) => {
    dates.add(new Date(session.start_time).toDateString())
  })
  return Array.from(dates).sort()
})

const filteredSessions = computed(() => {
  if (!selectedDate.value) return mySessions.value

  return mySessions.value.filter((session) => {
    return new Date(session.start_time).toDateString() === selectedDate.value
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
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

onMounted(() => {
  const first = uniqueDates.value[0]
  if (first !== undefined) {
    selectedDate.value = first
  }
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

    <EmptyState
      v-if="filteredSessions.length === 0"
      icon="i-lucide-calendar"
      title="No sessions scheduled"
      description="Browse events and add sessions to your schedule"
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

    <!-- Schedule timeline -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        :class="[
          'rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 sm:p-5',
          session.is_break ? 'bg-gray-50 dark:bg-gray-950' : 'bg-white dark:bg-slate-900'
        ]"
      >
        <div class="flex items-start gap-4">
          <!-- Time -->
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

          <!-- Content -->
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
  </div>
</template>
