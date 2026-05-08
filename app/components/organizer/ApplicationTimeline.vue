<script setup lang="ts">
import type { OrganizerApplicationLogEntry } from '~/types/organizer'

const props = defineProps<{
  logs?: OrganizerApplicationLogEntry[] | null
  /** When logs are not available (attendee API), show profile milestones. */
  submittedAt?: string | null
  reviewedAt?: string | null
  statusLabel?: string
}>()

const sortedLogs = computed(() => {
  if (!props.logs?.length) return []
  return [...props.logs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
})

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    CREATED: 'Application submitted',
    UPDATED: 'Application updated',
    DOCUMENT_UPLOADED: 'Document uploaded',
    STATUS_CHANGED: 'Status updated',
    REVIEW_APPROVED: 'Approved',
    REVIEW_REJECTED: 'Rejected',
    REVIEW_REQUEST_CHANGES: 'Changes requested'
  }
  return map[action] || action.replaceAll('_', ' ')
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  }
  catch {
    return iso
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">
      Timeline
    </h3>
    <ol
      v-if="sortedLogs.length"
      class="space-y-4"
    >
      <li
        v-for="log in sortedLogs"
        :key="log.id"
        class="relative pl-6 border-l-2 border-primary-500/30"
      >
        <span
          class="absolute -left-[7px] top-1 size-3 rounded-full bg-primary-500 shadow ring-4 ring-white dark:ring-slate-900"
          aria-hidden="true"
        />
        <p class="text-sm font-semibold text-slate-900 dark:text-white">
          {{ actionLabel(String(log.action)) }}
        </p>
        <p
          v-if="log.comment"
          class="text-sm text-slate-600 dark:text-slate-400 mt-1"
        >
          {{ log.comment }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ formatWhen(log.created_at) }}
        </p>
      </li>
    </ol>
    <ul
      v-else
      class="space-y-3 text-sm text-slate-600 dark:text-slate-400"
    >
      <li v-if="submittedAt">
        Submitted {{ formatWhen(submittedAt) }}
      </li>
      <li v-if="reviewedAt">
        Last review {{ formatWhen(reviewedAt) }}
      </li>
      <li v-if="statusLabel">
        Current status: {{ statusLabel }}
      </li>
      <li v-if="!submittedAt && !reviewedAt && !statusLabel">
        No timeline entries yet.
      </li>
    </ul>
  </div>
</template>
