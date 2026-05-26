<script setup lang="ts">
import type { Event } from '~/types'

interface Props {
  event: Event
  locationLine: string
  fullAddress: string
  directionsHref: string
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-4">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white">
      Venue
    </h3>
    <div class="rounded-xl overflow-hidden h-56 sm:h-72 relative border border-primary-500/10 bg-slate-200 dark:bg-slate-800">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/15 to-slate-900/40 flex items-center justify-center">
        <div class="flex flex-col items-center gap-2 px-4 text-center">
          <AppLucideIcon name="location_on" class="text-4xl text-primary-500" />
          <span class="font-bold text-slate-700 dark:text-slate-200">{{ event.venue?.name || locationLine }}</span>
        </div>
      </div>
    </div>
    <div
      v-if="event.venue?.type !== 'virtual'"
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-primary-500/5 rounded-xl border border-primary-500/10"
    >
      <div class="min-w-0">
        <p class="font-bold text-slate-900 dark:text-white">
          {{ event.venue?.name || 'Venue' }}
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ fullAddress || locationLine }}
        </p>
      </div>
      <a
        :href="directionsHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-primary-500 font-bold hover:underline shrink-0"
      >
        <AppLucideIcon name="directions" class="text-sm" />
        Directions
      </a>
    </div>
    <div
      v-else
      class="p-4 bg-primary-500/5 rounded-xl border border-primary-500/10 text-slate-600 dark:text-slate-400 text-sm"
    >
      Online event<span v-if="event.venue?.virtual_url"> —
        <a :href="event.venue.virtual_url" class="text-primary-500 font-semibold hover:underline" target="_blank" rel="noopener">Join link</a>
      </span>.
    </div>
  </section>
</template>
