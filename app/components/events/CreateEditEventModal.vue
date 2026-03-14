<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import EventForm from '~/components/events/EventForm.vue'
import type { Event, EventCreateInput, EventUpdateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  data?: Event
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: (EventCreateInput | EventUpdateInput) & { id?: string }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const isEditing = computed(() => !!props.data)

function handleSubmit(formData: EventCreateInput | EventUpdateInput) {
  const payload = (props.data
    ? { ...props.data, ...formData }
    : formData) as (EventCreateInput | EventUpdateInput) & { id?: string }

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
    max-width="xl"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-6 overflow-y-auto">
      <header class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          {{ isEditing ? 'Edit Event' : 'Create Event' }}
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Update event details' : 'Create a new event' }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure the core information, schedule, venue and settings for your event.
        </p>
      </header>

      <EventForm
        :event="data"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </AppModal>
</template>

