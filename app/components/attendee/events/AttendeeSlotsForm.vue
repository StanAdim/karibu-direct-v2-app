<script setup lang="ts">
import type { AttendeeSlotInput } from '~/composables/useAttendeeEventBooking'
import Input from '~/components/ui/Input.vue'

interface Props {
  attendees: AttendeeSlotInput[]
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:attendees': [value: AttendeeSlotInput[]]
}>()

function patch(idx: number, partial: Partial<AttendeeSlotInput>) {
  const next = props.attendees.map((row, i) =>
    i === idx ? { ...row, ...partial } : row,
  )
  emit('update:attendees', next)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">
        Attendee details
      </h3>
      <span class="text-xs text-slate-500 dark:text-slate-400">
        {{ attendees.length }} ticket{{ attendees.length === 1 ? '' : 's' }}
      </span>
    </div>
    <div
      v-for="(row, i) in attendees"
      :key="i"
      class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4 space-y-3"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
        Ticket {{ i + 1 }}
      </p>
      <Input
        :model-value="row.attendee_name"
        label="Full name"
        placeholder="Name on ticket"
        icon="person"
        autocomplete="name"
        :disabled="disabled"
        @update:model-value="patch(i, { attendee_name: String($event) })"
      />
      <Input
        :model-value="row.attendee_email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        icon="mail"
        autocomplete="email"
        :disabled="disabled"
        @update:model-value="patch(i, { attendee_email: String($event) })"
      />
      <Input
        :model-value="row.attendee_phone ?? ''"
        type="tel"
        label="Phone"
        placeholder="Optional"
        icon="call"
        autocomplete="tel"
        :disabled="disabled"
        @update:model-value="patch(i, { attendee_phone: String($event) || undefined })"
      />
    </div>
  </div>
</template>
