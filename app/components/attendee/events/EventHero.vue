<script setup lang="ts">
import type { Event } from '~/types'
import { isEventLive, isEventUpcoming } from '~/types/event'

interface Props {
  event: Event
  heroImageUrl: string
  organizerLabel: string | null
  locationLabel: string
  formattedRange: string
  ticketStatusLabel: string
  capacityPercent: number
}

defineProps<Props>()

function categoryName(cat: unknown): string | null {
  if (!cat) return null
  if (typeof cat === 'string') return cat
  if (typeof cat === 'object' && 'name' in cat && typeof (cat as { name?: unknown }).name === 'string') {
    return (cat as { name: string }).name
  }
  return null
}

function categoryKey(cat: unknown, idx: number): string {
  return categoryName(cat) ?? `cat-${idx}`
}

function badgeForEvent(ev: Event): { label: string; class: string } {
  if (ev.status === 'cancelled') {
    return { label: 'Cancelled', class: 'bg-red-500/90 text-white' }
  }
  if (isEventLive(ev)) {
    return { label: 'Live now', class: 'bg-red-500/90 text-white' }
  }
  if (isEventUpcoming(ev)) {
    return { label: 'Upcoming', class: 'bg-emerald-500/90 text-white' }
  }
  return { label: 'Event', class: 'bg-slate-900/75 text-white' }
}
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
    <div class="relative min-h-[220px] sm:min-h-[320px]">
      <div
        class="absolute inset-0 bg-cover bg-center scale-105"
        :style="{ backgroundImage: `url('${heroImageUrl}')` }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/20" />

      <div class="relative z-[1] p-5 sm:p-8 lg:p-10 flex flex-col justify-end min-h-[220px] sm:min-h-[320px] gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="(cat, idx) in (event.categories || []).slice(0, 4)"
            :key="categoryKey(cat, idx)"
            class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide bg-white/15 text-white backdrop-blur-sm border border-white/10"
          >
            {{ categoryName(cat) }}
          </span>
          <span
            :class="['rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm', badgeForEvent(event).class]"
          >
            {{ badgeForEvent(event).label }}
          </span>
        </div>

        <div class="space-y-3 max-w-3xl">
          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
            {{ event.title }}
          </h1>
          <p v-if="event.short_description" class="text-sm sm:text-base text-white/85 line-clamp-3 leading-relaxed">
            {{ event.short_description }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-white/95 text-sm">
          <div class="flex items-start gap-2">
            <AppLucideIcon name="calendar_today" class="text-primary-300 shrink-0 mt-0.5" />
            <div>
              <p class="text-[11px] uppercase font-bold text-white/60 tracking-wide">
                When
              </p>
              <p class="font-semibold leading-snug">
                {{ formattedRange }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2 min-w-0">
            <AppLucideIcon name="location_on" class="text-primary-300 shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-[11px] uppercase font-bold text-white/60 tracking-wide">
                Venue
              </p>
              <p class="font-semibold leading-snug truncate">
                {{ locationLabel }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2 min-w-0">
            <AppLucideIcon name="groups" class="text-primary-300 shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-[11px] uppercase font-bold text-white/60 tracking-wide">
                Organizer
              </p>
              <p class="font-semibold leading-snug truncate">
                {{ organizerLabel || '—' }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <AppLucideIcon name="confirmation_number" class="text-primary-300 shrink-0 mt-0.5" />
            <div>
              <p class="text-[11px] uppercase font-bold text-white/60 tracking-wide">
                Tickets
              </p>
              <p class="font-semibold leading-snug">
                {{ ticketStatusLabel }}
              </p>
              <div class="mt-2 h-1 rounded-full bg-white/15 overflow-hidden max-w-[140px]">
                <div
                  class="h-full rounded-full bg-primary-400 transition-all duration-500"
                  :style="{ width: `${capacityPercent}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
