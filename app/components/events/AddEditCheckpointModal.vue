<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import type { Checkpoint, CheckpointCreateInput, CheckpointType, CheckpointUpdateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  data?: Checkpoint
  eventId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: (CheckpointCreateInput | CheckpointUpdateInput) & { id?: string; event_id?: string }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const isEditing = computed(() => !!props.data)

const form = reactive<{
  name: string
  description?: string
  type: CheckpointType
  location?: string
}>({
  name: props.data?.name || '',
  description: props.data?.description,
  type: props.data?.type || 'entry',
  location: props.data?.location
})

const errors = reactive<Record<string, string>>({})

const checkpointTypes: { value: CheckpointType; label: string }[] = [
  { value: 'entry', label: 'Entry Point' },
  { value: 'exit', label: 'Exit Point' },
  { value: 'session', label: 'Session Check-in' },
  { value: 'booth', label: 'Booth Visit' },
  { value: 'custom', label: 'Custom' }
]

function validateForm(): boolean {
  const nextErrors: Record<string, string> = {}

  if (!form.name.trim()) {
    nextErrors.name = 'Checkpoint name is required'
  }

  Object.assign(errors, nextErrors)
  Object.keys(errors).forEach((key) => {
    if (!nextErrors[key]) {
      delete errors[key]
    }
  })

  return Object.keys(nextErrors).length === 0
}

function submit() {
  if (!validateForm()) return

  const base: CheckpointCreateInput = {
    event_id: props.eventId,
    name: form.name,
    description: form.description,
    type: form.type,
    location: form.location
  }

  const payload = (props.data
    ? ({ ...props.data, ...base } as CheckpointUpdateInput & { id?: string; event_id?: string })
    : (base as CheckpointCreateInput & { id?: string; event_id?: string }))

  emit('saved', payload)
  emit('update:modelValue', false)
}

function cancel() {
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
          {{ isEditing ? 'Edit Checkpoint' : 'Add Checkpoint' }}
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Update checkpoint details' : 'Create a new checkpoint' }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure locations where attendees can be checked in or tracked.
        </p>
      </header>

      <form
        class="space-y-6"
        @submit.prevent="submit"
      >
        <AppInput
          v-model="form.name"
          label="Checkpoint Name"
          placeholder="e.g., Main Entrance"
          required
          :error="errors.name"
        />

        <UFormField
          label="Type"
          orientation="vertical"
          size="md"
        >
          <USelect
            v-model="form.type"
            :items="checkpointTypes"
            value-key="value"
            label-key="label"
          />
        </UFormField>

        <AppInput
          v-model="form.location"
          label="Location"
          placeholder="e.g., Building A, Ground Floor"
        />

        <UFormField
          label="Description"
          orientation="vertical"
          size="md"
        >
          <UTextarea
            v-model="form.description"
            placeholder="Optional description"
            :rows="3"
          />
        </UFormField>

        <div class="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <UButton
            color="neutral"
            variant="outline"
            type="button"
            @click="cancel"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
          >
            Save
          </UButton>
        </div>
      </form>
    </div>
  </AppModal>
</template>

