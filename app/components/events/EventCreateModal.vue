<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { EventCreateInput, EventVisibility } from '~/types'
import { useNotifications } from '~/composables/useNotifications'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [payload: EventCreateInput]
}>()

const notifications = useNotifications()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const form = reactive<EventCreateInput>({
  title: '',
  description: '',
  short_description: '',
  start_date: '',
  end_date: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  venue: {
    type: 'physical',
    name: '',
    address: '',
    city: '',
    country: ''
  },
  visibility: 'public',
  capacity: 100,
  categories: [],
  tags: []
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

function resetForm() {
  form.title = ''
  form.description = 'Event in details description'
  form.short_description = ''
  form.start_date = ''
  form.end_date = ''
  form.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  form.venue = {
    type: 'physical',
    name: '',
    address: '',
    city: '',
    country: ''
  }
  form.visibility = 'public'
  form.capacity = 100
  form.categories = []
  form.tags = []
  Object.keys(errors).forEach(key => delete errors[key])
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
    }
  }
)

// Live-validate description so error disappears while typing
watch(
  () => form.description,
  (value) => {
    if (value && value.toString().trim()) {
      delete errors.description
    }
  }
)

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!form.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!form.description || !form.description.toString().trim()) {
    newErrors.description = 'Description is required'
  }

  if (!form.start_date) {
    newErrors.start_date = 'Start date is required'
  }

  if (!form.end_date) {
    newErrors.end_date = 'End date is required'
  }
  else if (form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
    newErrors.end_date = 'End date must be after start date'
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

  const hasErrors = Object.keys(newErrors).length > 0

  if (hasErrors) {
    const firstErrorKey = Object.keys(newErrors)[0]
    const firstMessage = newErrors[firstErrorKey]
    notifications.error({
      title: 'Please fix the highlighted fields',
      description: firstMessage
    })
  }

  return !hasErrors
}

function handleSubmit() {
  if (!validateForm()) return

  const payload: EventCreateInput = { ...form }
  emit('created', payload)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="xl"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-6 overflow-y-auto">
      <header class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          Create Event
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Create a new event
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure the core information, schedule, venue and settings for your event.
        </p>
      </header>

      <form
        class="space-y-8 m-4"
        @submit.prevent="handleSubmit"
      >
        <!-- Basic Information -->
        <div class="space-y-6 ">
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
            v-model="form.short_description"
            label="Short Description"
            placeholder="Brief summary for event cards"
            hint="Maximum 200 characters"
          />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Description
              <span class="text-red-500">*</span>
            </label>
            <Textarea
              v-model="form.description"
              placeholder="Detailed event description"
              :rows="6"
              class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none p-3"
            />
            <p
              v-if="errors.description"
              class="text-xs text-red-500 ml-1"
            >
              {{ errors.description }}
            </p>
          </div>
        </div>

        <!-- Date & Time -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Date & Time
          </h3>

          <div class="grid gap-6 sm:grid-cols-2">
            <AppInput
              v-model="form.start_date"
              type="datetime-local"
              label="Start Date & Time"
              required
              :error="errors.start_date"
            />

            <AppInput
              v-model="form.end_date"
              type="datetime-local"
              label="End Date & Time"
              required
              :error="errors.end_date"
            />
          </div>
        </div>

        <!-- Venue -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Venue
          </h3>

          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Event Type
            </p>
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
                @click="form.venue.type = type.value"
              >
                <UIcon
                  :name="type.icon"
                  class="h-4 w-4"
                />
                {{ type.label }}
              </button>
            </div>
          </div>

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
              v-model="form.venue.virtual_url"
              label="Virtual Event URL"
              placeholder="https://zoom.us/j/123456789"
            />
            <AppInput
              v-model="form.venue.virtual_platform"
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

          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Visibility
            </p>
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
          </div>

          <AppInput
            v-model.number="form.capacity"
            label="Maximum Capacity"
            type="number"
            min="1"
            placeholder="100"
            :error="errors.capacity"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <AppButton
            color="neutral"
            size="sm"
            type="button"
            @click="handleCancel"
          >
            Cancel
          </AppButton>
          <AppButton
            size="sm"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Creating...' : 'Create Event' }}
          </AppButton>
        </div>
      </form>
    </div>
  </AppModal>
</template>

