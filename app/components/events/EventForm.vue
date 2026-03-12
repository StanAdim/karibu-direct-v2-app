<script setup lang="ts">
import type { Event, EventCreateInput, EventUpdateInput, EventVisibility } from '~/types'

interface Props {
  event?: Event
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: EventCreateInput | EventUpdateInput]
  cancel: []
}>()

const isEditing = computed(() => !!props.event)

const form = reactive<EventCreateInput>({
  title: props.event?.title || '',
  description: props.event?.description || '',
  shortDescription: props.event?.shortDescription || '',
  coverImage: props.event?.coverImage || '',
  startDate: props.event?.startDate || '',
  endDate: props.event?.endDate || '',
  timezone: props.event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  venue: props.event?.venue || {
    type: 'physical',
    name: '',
    address: '',
    city: '',
    country: ''
  },
  visibility: props.event?.visibility || 'public',
  capacity: props.event?.capacity || 100,
  categories: props.event?.categories || [],
  tags: props.event?.tags || []
})

const errors = reactive<Record<string, string>>({})

const visibilityOptions: { value: EventVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone can view and register' },
  { value: 'private', label: 'Private', description: 'Only invited attendees' },
  { value: 'unlisted', label: 'Unlisted', description: 'Only accessible via direct link' }
]

const venueTypes = [
  { value: 'physical', label: 'In-Person', icon: 'i-lucide-map-pin' },
  { value: 'virtual', label: 'Virtual', icon: 'i-lucide-video' },
  { value: 'hybrid', label: 'Hybrid', icon: 'i-lucide-monitor-smartphone' }
]

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!form.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!form.description.trim()) {
    newErrors.description = 'Description is required'
  }

  if (!form.startDate) {
    newErrors.startDate = 'Start date is required'
  }

  if (!form.endDate) {
    newErrors.endDate = 'End date is required'
  }
  else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
    newErrors.endDate = 'End date must be after start date'
  }

  if (form.capacity < 1) {
    newErrors.capacity = 'Capacity must be at least 1'
  }

  Object.assign(errors, newErrors)
  Object.keys(errors).forEach((key) => {
    if (!newErrors[key]) {
      delete errors[key]
    }
  })

  return Object.keys(newErrors).length === 0
}

function handleSubmit() {
  if (!validateForm()) return
  emit('submit', form)
}
</script>

<template>
  <form
    class="space-y-8"
    @submit.prevent="handleSubmit"
  >
    <!-- Basic Information -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Basic Information
      </h3>

      <AppInput
        v-model="form.title"
        label="Event Title"
        placeholder="Enter event title"
        required
        :error="errors.title"
      />

      <AppInput
        v-model="form.shortDescription"
        label="Short Description"
        placeholder="Brief summary for event cards"
        hint="Maximum 200 characters"
      />

      <UFormField
        label="Description"
        required
        :error="errors.description"
      >
        <UTextarea
          v-model="form.description"
          placeholder="Detailed event description"
          :rows="6"
        />
      </UFormField>

      <AppInput
        v-model="form.coverImage"
        label="Cover Image URL"
        placeholder="https://example.com/image.jpg"
        hint="Recommended size: 1200x630 pixels"
      />
    </div>

    <!-- Date & Time -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Date & Time
      </h3>

      <div class="grid gap-6 sm:grid-cols-2">
        <UFormField
          label="Start Date & Time"
          required
          :error="errors.startDate"
        >
          <UInput
            v-model="form.startDate"
            type="datetime-local"
          />
        </UFormField>

        <UFormField
          label="End Date & Time"
          required
          :error="errors.endDate"
        >
          <UInput
            v-model="form.endDate"
            type="datetime-local"
          />
        </UFormField>
      </div>
    </div>

    <!-- Venue -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Venue
      </h3>

      <UFormField label="Event Type">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="type in venueTypes"
            :key="type.value"
            type="button"
            :class="[
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              form.venue.type === type.value
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            ]"
            @click="form.venue.type = type.value as 'physical' | 'virtual' | 'hybrid'"
          >
            <UIcon
              :name="type.icon"
              class="h-4 w-4"
            />
            {{ type.label }}
          </button>
        </div>
      </UFormField>

      <div
        v-if="form.venue.type !== 'virtual'"
        class="grid gap-6 sm:grid-cols-2"
      >
        <AppInput
          v-model="form.venue.name"
          label="Venue Name"
          placeholder="Conference Center"
        />
        <AppInput
          v-model="form.venue.city"
          label="City"
          placeholder="New York"
        />
        <AppInput
          v-model="form.venue.address"
          label="Address"
          placeholder="123 Main St"
          class="sm:col-span-2"
        />
      </div>

      <div
        v-if="form.venue.type !== 'physical'"
        class="grid gap-6 sm:grid-cols-2"
      >
        <AppInput
          v-model="form.venue.virtualUrl"
          label="Virtual Event URL"
          placeholder="https://zoom.us/j/123456789"
        />
        <AppInput
          v-model="form.venue.virtualPlatform"
          label="Platform"
          placeholder="Zoom, Google Meet, etc."
        />
      </div>
    </div>

    <!-- Settings -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Settings
      </h3>

      <UFormField label="Visibility">
        <div class="space-y-2">
          <label
            v-for="option in visibilityOptions"
            :key="option.value"
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-950': form.visibility === option.value }"
          >
            <input
              v-model="form.visibility"
              type="radio"
              :value="option.value"
              class="mt-1"
            >
            <div>
              <span class="font-medium text-gray-900 dark:text-white">{{ option.label }}</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ option.description }}
              </p>
            </div>
          </label>
        </div>
      </UFormField>

      <UFormField
        label="Maximum Capacity"
        :error="errors.capacity"
      >
        <UInput
          v-model.number="form.capacity"
          type="number"
          min="1"
          placeholder="100"
        />
      </UFormField>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
      <UButton
        color="neutral"
        variant="outline"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="loading"
      >
        {{ isEditing ? 'Update Event' : 'Create Event' }}
      </UButton>
    </div>
  </form>
</template>
