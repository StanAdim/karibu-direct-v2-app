<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { SessionSpeaker } from '~/types'

interface SpeakerFormData {
  name: string
  email?: string
  title?: string
  organization?: string
  bio?: string
  photo?: string
}

const props = defineProps<{
  modelValue: boolean
  data?: SessionSpeaker
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: SpeakerFormData & { id?: string }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

const isEditing = computed(() => !!props.data)

const form = reactive<SpeakerFormData>({
  name: props.data?.name || '',
  email: props.data?.email,
  title: props.data?.title,
  organization: props.data?.company,
  bio: props.data?.bio,
  photo: props.data?.avatar
})

const errors = reactive<Record<keyof SpeakerFormData, string | undefined>>({
  name: undefined,
  email: undefined,
  title: undefined,
  organization: undefined,
  bio: undefined,
  photo: undefined
})

function validateForm(): boolean {
  const nextErrors: typeof errors = {
    name: undefined,
    email: undefined,
    title: undefined,
    organization: undefined,
    bio: undefined,
    photo: undefined
  }

  if (!form.name.trim()) {
    nextErrors.name = 'Full name is required'
  }

  Object.assign(errors, nextErrors)

  return Object.values(nextErrors).every(value => !value)
}

function submit() {
  if (!validateForm()) return

  const payload: SpeakerFormData & { id?: string } = {
    ...form,
    id: props.data?.id
  }

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
          {{ isEditing ? 'Edit Speaker' : 'Add Speaker' }}
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Update speaker profile' : 'Add a new speaker' }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Manage speaker details and profile information for this event.
        </p>
      </header>

      <form
        class="space-y-6"
        @submit.prevent="submit"
      >
        <div class="grid gap-6 sm:grid-cols-2">
          <AppInput
            v-model="form.name"
            label="Full Name"
            placeholder="Enter full name"
            required
            :error="errors.name"
          />

          <AppInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="speaker@example.com"
            :error="errors.email"
          />
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <AppInput
            v-model="form.title"
            label="Title"
            placeholder="e.g., Senior Developer"
          />

          <AppInput
            v-model="form.organization"
            label="Organization"
            placeholder="Company or affiliation"
          />
        </div>

        <AppInput
          v-model="form.photo"
          label="Photo URL"
          placeholder="https://example.com/photo.jpg"
        />

        <UFormField
          label="Bio"
          orientation="vertical"
          size="md"
        >
          <UTextarea
            v-model="form.bio"
            placeholder="Short speaker biography"
            :rows="4"
          />
        </UFormField>

        <div class="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <AppButton
            color="neutral"
            size="sm"
            type="button"
            @click="cancel"
          >
            Cancel
          </AppButton>
          <AppButton
            size="sm"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Save' }}
          </AppButton>
        </div>
      </form>
    </div>
  </AppModal>
</template>

