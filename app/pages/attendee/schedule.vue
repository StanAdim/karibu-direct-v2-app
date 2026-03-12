<script setup lang="ts">
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
    eventId: 'event-1',
    title: 'Opening Keynote: The Future of Technology',
    description: 'Join us for the opening keynote session',
    type: 'keynote',
    startTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 9).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 10).toISOString(),
    room: 'Main Hall',
    attendeeCount: 500,
    speakers: [
      { id: 's1', name: 'John Smith', title: 'CEO', company: 'TechCorp' }
    ],
    track: 'General',
    level: 'all',
    status: 'scheduled',
    isBreak: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    eventId: 'event-1',
    title: 'Coffee Break',
    type: 'break',
    startTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 10).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 10.5).toISOString(),
    room: 'Lobby',
    attendeeCount: 0,
    speakers: [],
    status: 'scheduled',
    isBreak: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    eventId: 'event-1',
    title: 'Building Scalable Applications with Vue 3',
    description: 'Learn best practices for building large-scale Vue applications',
    type: 'workshop',
    startTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 10.5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 12).toISOString(),
    room: 'Workshop Room A',
    capacity: 30,
    attendeeCount: 28,
    speakers: [
      { id: 's2', name: 'Jane Doe', title: 'Senior Developer', company: 'VueCo' }
    ],
    track: 'Frontend',
    level: 'intermediate',
    status: 'scheduled',
    isBreak: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    eventId: 'event-1',
    title: 'AI in Production: Real-world Case Studies',
    description: 'Panel discussion on deploying AI in production environments',
    type: 'panel',
    startTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 14).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 3600000 * 15).toISOString(),
    room: 'Main Hall',
    attendeeCount: 200,
    speakers: [
      { id: 's3', name: 'Alice Johnson', title: 'ML Engineer', company: 'AIStartup' },
      { id: 's4', name: 'Bob Williams', title: 'CTO', company: 'DataCorp' }
    ],
    track: 'AI/ML',
    level: 'advanced',
    status: 'scheduled',
    isBreak: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

const uniqueDates = computed(() => {
  const dates = new Set<string>()
  mySessions.value.forEach((session) => {
    dates.add(new Date(session.startTime).toDateString())
  })
  return Array.from(dates).sort()
})

const filteredSessions = computed(() => {
  if (!selectedDate.value) return mySessions.value

  return mySessions.value.filter((session) => {
    return new Date(session.startTime).toDateString() === selectedDate.value
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
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
  talk: 'i-lucide-presentation',
  networking: 'i-lucide-handshake',
  break: 'i-lucide-coffee',
  other: 'i-lucide-calendar'
}

onMounted(() => {
  if (uniqueDates.value.length > 0) {
    selectedDate.value = uniqueDates.value[0]
  }
})
</script>

<template>
  <div>
    <PageHeader
      title="My Schedule"
      description="Your personalized event schedule"
    >
      <template #actions>
        <UButton
          variant="outline"
          icon="i-lucide-download"
        >
          Export to Calendar
        </UButton>
      </template>
    </PageHeader>

    <!-- Date Tabs -->
    <div class="mb-6 flex flex-wrap gap-2">
      <UButton
        v-for="date in uniqueDates"
        :key="date"
        :color="selectedDate === date ? 'primary' : 'neutral'"
        :variant="selectedDate === date ? 'solid' : 'outline'"
        @click="selectedDate = date"
      >
        {{ formatDateLabel(date) }}
      </UButton>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="filteredSessions.length === 0"
      icon="i-lucide-calendar"
      title="No sessions scheduled"
      description="Browse events and add sessions to your schedule"
    >
      <template #actions>
        <UButton
          icon="i-lucide-search"
          to="/attendee/events"
        >
          Browse Events
        </UButton>
      </template>
    </EmptyState>

    <!-- Schedule Timeline -->
    <div
      v-else
      class="space-y-4"
    >
      <UCard
        v-for="session in filteredSessions"
        :key="session.id"
        :class="{ 'bg-gray-50 dark:bg-gray-900': session.isBreak }"
      >
        <div class="flex items-start gap-4">
          <!-- Time -->
          <div class="flex flex-col items-center text-center">
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-lg',
                session.isBreak ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-950'
              ]"
            >
              <UIcon
                :name="sessionTypeIcons[session.type] || 'i-lucide-calendar'"
                :class="[
                  'h-6 w-6',
                  session.isBreak ? 'text-gray-600' : 'text-primary-600'
                ]"
              />
            </div>
            <span class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              {{ getSessionDuration(session) }}min
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3
                  :class="[
                    'font-semibold',
                    session.isBreak ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                  ]"
                >
                  {{ session.title }}
                </h3>

                <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-clock"
                      class="h-4 w-4"
                    />
                    {{ formatSessionTime(session) }}
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
                </div>

                <p
                  v-if="session.description && !session.isBreak"
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
              </div>

              <div
                v-if="!session.isBreak"
                class="flex flex-wrap gap-2"
              >
                <UBadge
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ session.type }}
                </UBadge>
                <UBadge
                  v-if="session.level"
                  color="primary"
                  variant="soft"
                  size="xs"
                >
                  {{ session.level }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
