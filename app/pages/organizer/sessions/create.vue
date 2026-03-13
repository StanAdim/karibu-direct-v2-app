<script setup lang="ts">
import type { SessionCreateInput } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const sessionsStore = useSessionsStore()
const eventsStore = useEventsStore()
const notifications = useNotifications()
const router = useRouter()

const eventId = computed(() => route.query.eventId as string || '')
const loading = ref(false)
const eventsLoading = ref(false)

const selectedEventId = ref(eventId.value)

async function loadEvents() {
  eventsLoading.value = true
  try {
    await eventsStore.fetchEvents()
  }
  finally {
    eventsLoading.value = false
  }
}

const eventOptions = computed(() =>
  eventsStore.events.map(event => ({
    value: event.id,
    label: event.title
  }))
)

async function handleSubmit(data: SessionCreateInput) {
  if (!selectedEventId.value) {
    notifications.error('Please select an event')
    return
  }

  loading.value = true

  try {
    const sessionData = { ...data, eventId: selectedEventId.value }
    const session = await sessionsStore.createSession(sessionData)
    notifications.success('Session created successfully')
    router.push(`/organizer/sessions/${session.id}`)
  }
  catch {
    notifications.error('Failed to create session')
  }
  finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/organizer/sessions')
}

onMounted(() => {
  if (!eventId.value) {
    loadEvents()
  }
})
</script>

<template>
  <div>
    <PageHeader
      title="Create Session"
      description="Add a new session to your event"
    />

    <UCard>
      <!-- Event Selection (if not pre-selected) -->
      <div
        v-if="!eventId"
        class="mb-6"
      >
        <UFormField
          label="Event"
          required
          orientation="vertical"
          size="md"
        >
          <USelect
            v-model="selectedEventId"
            :items="eventOptions"
            value-key="value"
            label-key="label"
            placeholder="Select an event"
            :loading="eventsLoading"
          />
        </UFormField>
      </div>

      <SessionForm
        :event-id="selectedEventId"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </UCard>
  </div>
</template>
