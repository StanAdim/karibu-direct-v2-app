<script setup lang="ts">
import type { Event } from '~/types'

interface Props {
  relatedEvents: Event[]
  loading: boolean
  heroUrl: (ev: Event) => string
  formatWhen: (iso: string) => string
  priceLabel: (ev: Event) => string
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-5">
    <div class="flex justify-between items-center gap-4">
      <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        You might also like
      </h3>
      <NuxtLink to="/attendee/events" class="text-primary-500 font-bold hover:underline flex items-center gap-1 text-sm shrink-0">
        Browse all
        <AppLucideIcon name="arrow_forward" class="text-sm" />
      </NuxtLink>
    </div>

    <div v-if="loading" class="py-12 flex justify-center">
      <LoadingState text="Finding related events…" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="ev in relatedEvents"
        :key="ev.id"
        :to="`/attendee/events/${ev.id}`"
        class="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
      >
        <div
          class="h-40 bg-cover bg-center relative"
          :style="{ backgroundImage: `url('${heroUrl(ev)}')` }"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
          <span class="absolute left-3 top-3 rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-xs font-bold text-primary-600 dark:text-primary-400">
            {{ priceLabel(ev) }}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col gap-2">
          <h4 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {{ ev.title }}
          </h4>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
            {{ ev.short_description || ev.description }}
          </p>
          <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <AppLucideIcon name="calendar_month" class="text-sm" />
            {{ formatWhen(ev.start_date) }}
          </div>
        </div>
      </NuxtLink>
    </div>

    <p v-if="!loading && relatedEvents.length === 0" class="text-center text-slate-500 dark:text-slate-400 py-6 text-sm">
      More events are on the
      <NuxtLink to="/attendee/events" class="text-primary-500 font-semibold hover:underline">discovery page</NuxtLink>.
    </p>
  </section>
</template>
