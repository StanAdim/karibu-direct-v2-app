<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import SessionForm from '~/components/sessions/SessionForm.vue'
import type { Session, SessionCreateInput, SessionUpdateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  data: Session
  eventId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: [payload: SessionUpdateInput]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

/** Remount SessionForm when the modal opens or the session row changes. */
const formKey = ref(0)

watch(
  () => [props.modelValue, props.data.id] as const,
  ([open]) => {
    if (open) {
      formKey.value += 1
    }
  }
)

function handleSubmit(formData: SessionCreateInput | SessionUpdateInput) {
  const { event_id: _e, ...rest } = formData as SessionCreateInput
  emit('updated', rest)
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
          Edit Session
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Update session details
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Adjust the schedule, format, and capacity for this session.
        </p>
      </header>

      <div class="m-4">
        <SessionForm
          :key="formKey"
          :session="data"
          :event-id="eventId"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </AppModal>
</template>
