<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { Registration, Session } from '~/types'

const props = defineProps<{
  modelValue: boolean
  session: Session | null
  registrations: Registration[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [registrationId: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const selectedRegistrationId = ref<string>('')

const registrationItems = computed(() =>
  props.registrations.map((r) => {
    const nested = r.participants?.length
      ? r.participants.map(p => `${p.first_name} ${p.last_name} · ${p.email}`).join('; ')
      : ''
    const flat = [r.user_name, r.user_email].filter(Boolean).join(' · ')
    const label = nested || flat || `Ticket ${r.ticket_number || r.id}`
    return {
      value: r.id,
      label
    }
  })
)

const isFull = computed(() => {
  const s = props.session
  if (!s?.capacity) return false
  return s.attendee_count >= s.capacity
})

watch(
  () => [props.modelValue, props.registrations] as const,
  ([open]) => {
    if (open) {
      selectedRegistrationId.value = props.registrations[0]?.id ?? ''
    }
  },
  { immediate: true }
)

function handleCancel() {
  isOpen.value = false
}

function handleSubmit() {
  if (!selectedRegistrationId.value) return
  emit('submit', selectedRegistrationId.value)
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
          Registration
        </p>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Session registration
        </h2>
        <p
          v-if="session"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          {{ session.title }}
        </p>
      </header>

      <div
        v-if="session"
        class="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/40"
      >
        <div class="flex flex-wrap gap-4">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Registered
            </p>
            <p class="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
              {{ session.attendee_count }}
              <span
                v-if="session.capacity"
                class="text-slate-500"
              > / {{ session.capacity }}</span>
            </p>
          </div>
          <div v-if="isFull">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-amber-600">
              Capacity
            </p>
            <p class="mt-0.5 text-amber-800 dark:text-amber-200">
              Session is full. Waitlist can be enabled when your API supports it.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Event registration
        </label>
        <select
          v-model="selectedRegistrationId"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-primary-500/30 focus:border-primary-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
          :disabled="!registrationItems.length || isFull"
        >
          <option
            value=""
            disabled
          >
            Select a registration
          </option>
          <option
            v-for="item in registrationItems"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
        <p
          v-if="!registrationItems.length"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          No event registrations loaded. Open the Attendee tab or refresh the event to load registrations.
        </p>
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
          :disabled="!selectedRegistrationId || isFull || !registrationItems.length"
          @click="handleSubmit"
        >
          Link to session
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
