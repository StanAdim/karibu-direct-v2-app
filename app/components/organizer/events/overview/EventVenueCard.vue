<script setup lang="ts">
import type { EventVenue } from '~/types'

defineProps<{
  venue: EventVenue | undefined
  timezone: string
}>()

function venueTypeLabel(type: EventVenue['type'] | undefined): string {
  if (!type) return '—'
  const map = { physical: 'Physical', virtual: 'Virtual', hybrid: 'Hybrid' }
  return map[type]
}
</script>

<template>
  <article class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <header class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Venue
      </h3>
      <AppLucideIcon name="i-lucide-map-pin" class="h-4 w-4 text-on-surface-variant/70" />
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <span
        v-if="venue?.type === 'virtual'"
        class="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200"
      >
        Virtual
      </span>
      <span
        v-else-if="venue?.type === 'hybrid'"
        class="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
      >
        Hybrid
      </span>
      <span
        v-else-if="venue?.type === 'physical'"
        class="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
      >
        Physical
      </span>
    </div>

    <dl class="mt-3 space-y-2 text-sm">
      <div>
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Type
        </dt>
        <dd class="font-medium text-on-surface">
          {{ venueTypeLabel(venue?.type) }}
        </dd>
      </div>
      <div>
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Name
        </dt>
        <dd class="font-medium text-on-surface">
          {{ venue?.name?.trim() || '—' }}
        </dd>
      </div>
      <div v-if="venue?.city || venue?.country">
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          City / Region
        </dt>
        <dd class="text-on-surface">
          {{ venue?.city }}<template v-if="venue?.city && venue?.country">, </template>{{ venue?.country }}
        </dd>
      </div>
      <div v-if="venue?.address">
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Address
        </dt>
        <dd class="leading-snug text-on-surface">
          {{ venue.address }}
        </dd>
      </div>
      <div>
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Event timezone
        </dt>
        <dd class="text-on-surface">
          {{ timezone }}
        </dd>
      </div>
      <div v-if="venue?.virtual_platform || venue?.virtual_url">
        <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Virtual access
        </dt>
        <dd class="break-all text-sm text-on-surface">
          <span v-if="venue.virtual_platform">{{ venue.virtual_platform }}</span>
          <span v-if="venue.virtual_url" class="block text-xs text-on-surface-variant">{{ venue.virtual_url }}</span>
        </dd>
      </div>
    </dl>
  </article>
</template>
