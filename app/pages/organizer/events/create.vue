<script setup lang="ts">
import type { EventCreateInput } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const eventsStore = useEventsStore()
const notifications = useNotifications()
const router = useRouter()

const loading = ref(false)

async function handleSubmit(data: EventCreateInput) {
  loading.value = true

  try {
    const event = await eventsStore.createEvent(data)
    notifications.success('Event created successfully')
    router.push(`/organizer/events/${event.id}`)
  }
  catch {
    notifications.error('Failed to create event')
  }
  finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/organizer/events')
}
</script>

<template>
  <div>
    <PageHeader
      title="Create Event"
      description="Fill in the details to create a new event"
    />

    <UCard>
      <EventForm
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </UCard>
  </div>
</template>
