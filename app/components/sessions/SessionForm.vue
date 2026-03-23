<script setup lang="ts">
import type { Session, SessionCreateInput, SessionType, SessionUpdateInput } from '~/types'
import {
  formatTagsForInput,
  parseTagsInput,
  useSessionForm,
  type SessionInitialSchedule
} from '~/composables/useSessionForm'

interface Props {
  session?: Session
  eventId: string
  loading?: boolean
  initialSchedule?: SessionInitialSchedule
  showHeader?: boolean
  slotsUsed?: number
  slotsTotal?: number
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: false,
  slotsUsed: undefined,
  slotsTotal: undefined
})

const emit = defineEmits<{
  submit: [data: SessionCreateInput | SessionUpdateInput]
  cancel: []
}>()

const { form, errors, validate, isEditing } = useSessionForm({
  eventId: toRef(props, 'eventId'),
  session: toRef(props, 'session'),
  initialSchedule: toRef(props, 'initialSchedule')
})

const tagsLine = computed({
  get: () => formatTagsForInput(form.tags),
  set: (v: string) => {
    form.tags = parseTagsInput(v)
  }
})

const capacityText = computed({
  get: () =>
    form.capacity === undefined || form.capacity === null ? '' : String(form.capacity),
  set: (v: string) => {
    if (v === '') {
      form.capacity = undefined
      return
    }
    const n = Number(v)
    form.capacity = Number.isFinite(n) ? n : undefined
  }
})

const sessionTypes: { value: SessionType; label: string; icon: string }[] = [
  { value: 'keynote', label: 'Keynote', icon: 'i-lucide-mic-2' },
  { value: 'workshop', label: 'Workshop', icon: 'i-lucide-hammer' },
  { value: 'panel', label: 'Panel', icon: 'i-lucide-users' },
  { value: 'breakout', label: 'Breakout', icon: 'i-lucide-presentation' },
  { value: 'networking', label: 'Networking', icon: 'i-lucide-handshake' },
  { value: 'demo', label: 'Demo', icon: 'i-lucide-monitor-play' },
  { value: 'other', label: 'Other', icon: 'i-lucide-calendar' }
]

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form
    class="space-y-8"
    @submit.prevent="handleSubmit"
  >
    <header
      v-if="showHeader"
      class="space-y-2"
    >
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        NEW ENTRY
      </p>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? 'Edit Session' : 'Add Session' }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Fields match the session API: title, session_type, schedule, room, capacity, tags, and description.
      </p>
    </header>

    <!-- Basic information -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Basic information
      </h3>

      <AppInput
        v-model="form.title"
        label="Title"
        placeholder="e.g. Keynote: Future of AI"
        required
        :error="errors.title"
      />

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Description
        </label>
        <Textarea
          v-model="form.description"
          placeholder="Opening keynote on AI trends"
          :rows="5"
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

    <!-- Schedule -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Schedule
      </h3>

      <div class="grid gap-6 sm:grid-cols-2">
        <AppInput
          v-model="form.start_time"
          type="datetime-local"
          label="Start"
          required
          :error="errors.start_time"
        />

        <AppInput
          v-model="form.end_time"
          type="datetime-local"
          label="End"
          required
          :error="errors.end_time"
        />
      </div>
    </div>

    <!-- Room -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Room
      </h3>

      <AppInput
        v-model="form.room"
        label="Room"
        placeholder="e.g. Main Hall"
      />
    </div>

    <!-- Session type, capacity, tags -->
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Type & capacity
      </h3>

      <div class="space-y-2">
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Session type
          <span class="text-red-500">*</span>
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="st in sessionTypes"
            :key="st.value"
            type="button"
            :class="[
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              form.session_type === st.value
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            ]"
            @click="form.session_type = st.value"
          >
            <UIcon
              :name="st.icon"
              class="h-4 w-4"
            />
            {{ st.label }}
          </button>
        </div>
        <p
          v-if="errors.session_type"
          class="text-xs text-red-500 ml-1"
        >
          {{ errors.session_type }}
        </p>
      </div>

      <AppInput
        v-model="capacityText"
        label="Capacity"
        placeholder="e.g. 500"
        type="number"
        min="0"
        hint="Optional; max attendees for this session"
        :error="errors.capacity"
      />

      <AppInput
        v-model="tagsLine"
        label="Tags"
        placeholder="Comma-separated: ai, keynote"
        hint="Stored as a string array in the API"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
      <AppButton
        color="neutral"
        size="sm"
        type="button"
        @click="$emit('cancel')"
      >
        Cancel
      </AppButton>
      <AppButton
        size="sm"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? (isEditing ? 'Updating…' : 'Saving…') : (isEditing ? 'Update session' : 'Create session') }}
      </AppButton>
    </div>

    <div
      v-if="slotsTotal != null && slotsUsed != null"
      class="rounded-xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-900/50 dark:bg-primary-950/30"
    >
      <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
        {{ slotsUsed }}/{{ slotsTotal }}
      </p>
      <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-700/80 dark:text-primary-300/80">
        Slots used
      </p>
    </div>
  </form>
</template>
