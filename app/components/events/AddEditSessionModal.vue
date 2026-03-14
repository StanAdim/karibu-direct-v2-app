<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import SessionForm from '~/components/sessions/SessionForm.vue'
import type { ScheduleSessionPayload } from '~/components/events/ScheduleSessionModal.vue'
import type { Session, SessionCreateInput, SessionUpdateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  data?: Session
  eventId: string
  loading?: boolean
  /** Prefill start/end from Schedule Session modal. */
  initialSchedule?: Pick<ScheduleSessionPayload, 'date' | 'startTime' | 'endTime'>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: (SessionCreateInput | SessionUpdateInput) & { id?: string; event_id?: string }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const isEditing = computed(() => !!props.data)

function handleSubmit(formData: SessionCreateInput | SessionUpdateInput) {
  const base = {
    ...formData,
    event_id: 'event_id' in formData && formData.event_id ? formData.event_id : props.eventId
  }

  const payload = (props.data
    ? { ...props.data, ...base }
    : base) as (SessionCreateInput | SessionUpdateInput) & { id?: string; event_id?: string }

  emit('saved', payload)
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="lg"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-6 overflow-y-auto">
      <header class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          {{ isEditing ? 'Edit Session' : 'Add Session' }}
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Update session details' : 'Add a new session' }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Define the schedule, format, and capacity for this session.
        </p>
      </header>

      <SessionForm
        :session="data"
        :event-id="eventId"
        :initial-schedule="initialSchedule"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </AppModal>
</template>

