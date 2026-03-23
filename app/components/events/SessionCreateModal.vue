<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import SessionForm from '~/components/sessions/SessionForm.vue'
import type { ScheduleSessionPayload } from '~/components/events/ScheduleSessionModal.vue'
import type { SessionCreateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  eventId: string
  loading?: boolean
  /** Prefill start/end from Schedule Session modal. */
  initialSchedule?: Pick<ScheduleSessionPayload, 'date' | 'startTime' | 'endTime'>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [payload: SessionCreateInput]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

/** Remount SessionForm when the modal opens so state matches props (same idea as EventCreateModal reset). */
const formKey = ref(0)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      formKey.value += 1
    }
  }
)

function handleSubmit(formData: SessionCreateInput) {
  emit('created', {
    ...formData,
    event_id: props.eventId
  })
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
          Create Session
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Create a new session
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Define the schedule, format, and capacity for this session.
        </p>
      </header>

      <div class="m-4">
        <SessionForm
          :key="formKey"
          :event-id="eventId"
          :initial-schedule="initialSchedule"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </AppModal>
</template>
