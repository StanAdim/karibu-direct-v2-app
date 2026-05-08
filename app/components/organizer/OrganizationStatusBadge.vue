<script setup lang="ts">
import type { ApplicationStatus } from '~/types/organizer'

const props = withDefaults(
  defineProps<{
    status: ApplicationStatus
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' }
)

const labels: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

const styles: Record<ApplicationStatus, string> = {
  PENDING:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 ring-1 ring-amber-200/80 dark:ring-amber-800/60',
  UNDER_REVIEW:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 ring-1 ring-blue-200/80 dark:ring-blue-800/60',
  APPROVED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 ring-1 ring-emerald-200/80 dark:ring-emerald-800/60',
  REJECTED:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 ring-1 ring-red-200/80 dark:ring-red-800/60'
}

const sizeCls = computed(() => (props.size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'))
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-full font-semibold', styles[status], sizeCls]"
    role="status"
  >
    {{ labels[status] }}
  </span>
</template>
