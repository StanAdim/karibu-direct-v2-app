<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { Session, SessionSpeaker, SessionUpdateInput } from '~/types'

const props = defineProps<{
  modelValue: boolean
  session: Session | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: SessionUpdateInput]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const name = ref('')
const email = ref('')
const title = ref('')
const company = ref('')
const role = ref('speaker')

const speakerRoles = [
  { value: 'speaker', label: 'Speaker' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'host', label: 'Host' },
  { value: 'panelist', label: 'Panelist' }
]

function resetFromSession(s: Session | null) {
  const primary = s?.speakers?.[0]
  name.value = primary?.name ?? ''
  email.value = primary?.email ?? ''
  title.value = primary?.title ?? ''
  company.value = primary?.company ?? ''
  role.value = primary?.role ?? 'speaker'
}

watch(
  () => [props.modelValue, props.session] as const,
  ([open, s]) => {
    if (open) resetFromSession(s)
  },
  { immediate: true }
)

function handleCancel() {
  isOpen.value = false
}

function handleSave() {
  if (!props.session) return
  if (!name.value.trim()) return

  const primary: Omit<SessionSpeaker, 'id'> = {
    name: name.value.trim(),
    email: email.value.trim() || undefined,
    title: title.value.trim() || undefined,
    company: company.value.trim() || undefined,
    role: role.value
  }

  const tail = (props.session.speakers ?? []).slice(1).map(({ id: _id, ...rest }) => rest as Omit<SessionSpeaker, 'id'>)

  emit('saved', { speakers: [primary, ...tail] })
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="lg"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-5 overflow-y-auto">
      <header class="space-y-1">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          Speaker
        </p>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Assign speaker
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Updates the primary speaker for this session. Additional speakers on the session are preserved.
        </p>
      </header>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <AppInput
          v-model="name"
          label="NAME"
          placeholder="Speaker name"
          required
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
        <AppInput
          v-model="email"
          label="EMAIL"
          placeholder="Optional"
          type="email"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
        <AppInput
          v-model="title"
          label="TITLE"
          placeholder="Job title"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
        <AppInput
          v-model="company"
          label="COMPANY"
          placeholder="Organization"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
        <div class="flex flex-col gap-1.5">
          <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            ROLE
          </label>
          <USelect
            v-model="role"
            :items="speakerRoles"
            value-key="value"
            label-key="label"
            class="h-12 rounded-xl border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          @click="handleCancel"
        >
          Cancel
        </button>
        <AppButton
          type="button"
          :loading="loading"
          :disabled="!session || !name.trim()"
          @click="handleSave"
        >
          Save
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
