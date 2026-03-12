<script setup lang="ts">
import type { Event } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const eventsStore = useEventsStore()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('')

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'education', label: 'Education' }
]

async function loadEvents() {
  await eventsStore.fetchEvents({
    status: 'published',
    visibility: 'public',
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined
  })
}

function handleViewEvent(event: Event) {
  router.push(`/attendee/events/${event.id}`)
}

watch([searchQuery, selectedCategory], loadEvents)

onMounted(loadEvents)
</script>

<template>
  <div>
    <PageHeader
      title="Browse Events"
      description="Discover and register for upcoming events"
    />

    <!-- Search & Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search events..."
            icon="i-lucide-search"
            size="lg"
          />
        </div>

        <USelect
          v-model="selectedCategory"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          placeholder="Category"
          class="w-44"
        />
      </div>
    </UCard>

    <!-- Loading State -->
    <div
      v-if="eventsStore.loading"
      class="py-12"
    >
      <LoadingState text="Loading events..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="eventsStore.events.length === 0"
      icon="i-lucide-calendar-search"
      title="No events found"
      description="Try adjusting your search or check back later for new events"
    />

    <!-- Events Grid -->
    <div
      v-else
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <EventCard
        v-for="event in eventsStore.events"
        :key="event.id"
        :event="event"
        @click="handleViewEvent"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="eventsStore.pagination.lastPage > 1"
      class="mt-8 flex justify-center"
    >
      <UPagination
        :model-value="eventsStore.pagination.page"
        :total="eventsStore.pagination.total"
        :page-count="eventsStore.pagination.perPage"
        @update:model-value="(page) => { eventsStore.setPage(page); loadEvents() }"
      />
    </div>
  </div>
</template>
