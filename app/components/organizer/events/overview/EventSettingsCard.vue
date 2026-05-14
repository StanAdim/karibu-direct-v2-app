<script setup lang="ts">
import type { EventSettings } from '~/types'

defineProps<{
  settings: EventSettings
}>()

function chip(ok: boolean): string {
  return ok
    ? 'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
    : 'bg-gray-200/80 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const rows = [
  { key: 'require_approval' as const, label: 'Require approval' },
  { key: 'allow_waitlist' as const, label: 'Allow waitlist' },
  { key: 'show_attendee_count' as const, label: 'Show attendee count' },
  { key: 'enable_check_in' as const, label: 'Enable check-in' },
  { key: 'enable_notifications' as const, label: 'Enable notifications' }
]
</script>

<template>
  <article class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <header class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Event settings
      </h3>
      <AppLucideIcon name="i-lucide-settings" class="h-4 w-4 text-on-surface-variant/70" />
    </header>

    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <li
        v-for="row in rows"
        :key="row.key"
        class="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
      >
        <span class="text-sm text-on-surface">{{ row.label }}</span>
        <span
          class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          :class="chip(settings[row.key])"
        >
          {{ settings[row.key] ? 'On' : 'Off' }}
        </span>
      </li>
    </ul>
  </article>
</template>
