<script setup lang="ts">
import type { Session, SessionCreateInput, SessionLevel, SessionType, SessionUpdateInput } from '~/types'

interface Props {
  session?: Session
  event_id: string
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: SessionCreateInput | SessionUpdateInput]
  cancel: []
}>()

const isEditing = computed(() => !!props.session)

const form = reactive<SessionCreateInput>({
  event_id: props.event_id,
  title: props.session?.title || '',
  description: props.session?.description || '',
  type: props.session?.type || 'talk',
  start_time: props.session?.start_time || '',
  end_time: props.session?.end_time || '',
  location: props.session?.location || '',
  room: props.session?.room || '',
  capacity: props.session?.capacity,
  speakers: props.session?.speakers || [],
  track: props.session?.track || '',
  level: props.session?.level,
  is_break: props.session?.is_break || false
})

const errors = reactive<Record<string, string>>({})

const sessionTypes: { value: SessionType; label: string; icon: string }[] = [
  { value: 'keynote', label: 'Keynote', icon: 'i-lucide-mic-2' },
  { value: 'workshop', label: 'Workshop', icon: 'i-lucide-hammer' },
  { value: 'panel', label: 'Panel', icon: 'i-lucide-users' },
  { value: 'talk', label: 'Talk', icon: 'i-lucide-presentation' },
  { value: 'networking', label: 'Networking', icon: 'i-lucide-handshake' },
  { value: 'break', label: 'Break', icon: 'i-lucide-coffee' },
  { value: 'other', label: 'Other', icon: 'i-lucide-calendar' }
]

const sessionLevels: { value: SessionLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' }
]

watch(() => form.type, (newType) => {
  form.is_break = newType === 'break'
})

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!form.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!form.start_time) {
    newErrors.start_time = 'Start time is required'
  }

  if (!form.end_time) {
    newErrors.end_time = 'End time is required'
  }
  else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
    newErrors.end_time = 'End time must be after start time'
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
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <!-- Session Type -->
    <div class="space-y-2">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
        Session Type
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in sessionTypes"
          :key="type.value"
          type="button"
          :class="[
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            form.type === type.value
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          ]"
          @click="form.type = type.value"
        >
          <UIcon
            :name="type.icon"
            class="h-4 w-4"
          />
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Title -->
    <AppInput
      v-model="form.title"
      label="Session Title"
      placeholder="Enter session title"
      required
      :error="errors.title"
    />

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
        Description
      </label>
      <UTextarea
        v-model="form.description"
        placeholder="Session description"
        :rows="4"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
      />
    </div>

    <!-- Time -->
    <div class="grid gap-6 sm:grid-cols-2">
      <AppInput
        v-model="form.start_time"
        type="datetime-local"
        label="Start Time"
        required
        :error="errors.start_time"
      />

      <AppInput
        v-model="form.end_time"
        type="datetime-local"
        label="End Time"
        required
        :error="errors.end_time"
      />
    </div>

    <!-- Location -->
    <div class="grid gap-6 sm:grid-cols-2">
      <AppInput
        v-model="form.room"
        label="Room"
        placeholder="Room 101"
      />

      <AppInput
        v-model="form.track"
        label="Track"
        placeholder="e.g., Frontend, Backend"
      />
    </div>

    <!-- Level & Capacity (for non-break sessions) -->
      <div
        v-if="!form.is_break"
        class="grid gap-6 sm:grid-cols-2"
      >
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
            Level
          </label>
          <USelect
            v-model="form.level"
            :items="sessionLevels"
            value-key="value"
            label-key="label"
            placeholder="Select level"
            class="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <AppInput
          v-model.number="form.capacity"
          label="Capacity (optional)"
          type="number"
          placeholder="Leave empty for unlimited"
          :min="1"
        />
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
        {{ isEditing ? 'Update Session' : 'Create Session' }}
      </UButton>
    </div>
  </form>
</template>
