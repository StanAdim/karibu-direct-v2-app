<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { Event } from '~/types'

const props = defineProps<{
  event: Event
  capacityPercentage: number
}>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTimeRange(start: string, end: string): string {
  const startTime = new Date(start).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const endTime = new Date(end).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${startTime} – ${endTime}`
}

const venueLabel = computed(() => {
  const venue = props.event.venue
  if (!venue) return 'Venue TBA'
  if (venue.type === 'virtual') return 'Online event'
  return venue.name || venue.city || 'Venue TBA'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Hero + Layout Grid -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Main Content -->
      <div class="col-span-12 lg:col-span-8 space-y-6">
        <!-- Hero Section -->
        <section class="relative overflow-hidden bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
          <div class="relative h-56 sm:h-72 md:h-80">
            <img
              v-if="props.event.cover_image"
              :src="props.event.cover_image"
              :alt="props.event.title"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="h-full w-full bg-gradient-to-br from-primary-500 via-primary-400 to-sky-400"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100/90">
                    {{ venueLabel }}
                  </p>
                  <h1 class="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-white">
                    {{ props.event.title }}
                  </h1>
                  <p class="max-w-xl text-sm text-white/80">
                    {{ props.event.short_description || props.event.description }}
                  </p>
                </div>
                <div class="flex flex-col items-start gap-3 sm:items-end">
                  <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span class="uppercase tracking-[0.2em]">
                      {{ props.event.status }}
                    </span>
                  </div>
                  <div class="text-right text-xs text-white/80">
                    <p class="font-semibold">
                      {{ formatDate(props.event.start_date) }}
                    </p>
                    <p>
                      {{ formatTimeRange(props.event.start_date, props.event.end_date) }} · {{ props.event.timezone }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="h-3 w-3"
                  />
                  {{ venueLabel }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium">
                  <UIcon
                    name="i-lucide-calendar-clock"
                    class="h-3 w-3"
                  />
                  {{ formatDate(props.event.start_date) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section / At a Glance -->
        <section class="grid gap-6 md:grid-cols-2">
          <!-- Ticket Stats Card -->
          <div class="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <header class="flex items-center justify-between gap-4">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant/60">
                  Ticket Overview
                </p>
                <p class="mt-2 text-xs text-on-surface-variant">
                  Capacity and attendee distribution
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon
                  name="i-lucide-ticket-percent"
                  class="h-6 w-6"
                />
              </div>
            </header>

            <div class="mt-6 space-y-6">
              <div class="flex items-start justify-between gap-6">
                <div class="space-y-2">
                  <p class="text-5xl font-headline font-extrabold leading-none text-on-surface">
                    {{ (props.event.registered_count ?? 0).toLocaleString() }}
                  </p>
                  <p class="text-xs font-medium text-on-surface-variant">
                    Attendees registered
                  </p>
                  <p class="text-xs text-on-surface-variant">
                    Capacity {{ (props.event.capacity ?? 0).toLocaleString() }} · {{ capacityPercentage }}% filled
                  </p>
                </div>
                <div class="flex -space-x-2">
                  <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                    {{ props.event.title?.[0] ?? 'E' }}
                  </span>
                  <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    +
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between text-xs text-on-surface-variant">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                      Registered
                    </span>
                    <span>{{ capacityPercentage }}%</span>
                  </div>
                  <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
                    <div
                      class="h-full rounded-full bg-primary"
                      :class="[
                        capacityPercentage >= 90 ? 'w-full' :
                        capacityPercentage >= 75 ? 'w-11/12' :
                        capacityPercentage >= 60 ? 'w-9/12' :
                        capacityPercentage >= 40 ? 'w-7/12' :
                        capacityPercentage >= 25 ? 'w-5/12' :
                        capacityPercentage > 0 ? 'w-3/12' :
                        'w-0'
                      ]"
                    />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between text-xs text-on-surface-variant">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                      Remaining
                    </span>
                    <span>
                      {{ Math.max((props.event.capacity ?? 0) - (props.event.registered_count ?? 0), 0).toLocaleString() }}
                      seats
                    </span>
                  </div>
                  <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
                    <div class="h-full w-full rounded-full bg-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Check-in Card -->
          <div class="bg-surface-container-lowest rounded-[2rem] p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <header class="flex items-center justify-between gap-4">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant/60">
                  Check-in Status
                </p>
                <p class="mt-2 text-xs text-on-surface-variant">
                  Monitor on-site engagement
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon
                  name="i-lucide-badge-check"
                  class="h-6 w-6"
                />
              </div>
            </header>

            <div class="mt-6 space-y-6 text-sm text-on-surface-variant">
              <div class="flex items-center justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-5xl font-headline font-extrabold leading-none text-on-surface">
                    {{ props.event.checkin_count ?? 0 }} / {{ props.event.registered_count ?? 0 }}
                  </p>
                  <p class="text-xs font-medium text-on-surface-variant">
                    Attendees checked in
                  </p>
                </div>
                <div class="h-10 w-10 rounded-full bg-primary/10 text-xs flex items-center justify-center text-primary">
                  {{ capacityPercentage }}%
                </div>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
                <div class="h-full w-5/12 rounded-full bg-primary/80" />
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span class="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live check-in stream
                </span>
                <AppButton size="sm">
                  Open check-in
                </AppButton>
              </div>
            </div>
          </div>
        </section>

        <!-- Event Description + Venue -->
        <section class="grid gap-6 md:grid-cols-3">
          <!-- Description Card -->
          <div class="md:col-span-2 bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <header class="mb-4">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Event Description
              </p>
            </header>
            <p class="text-sm leading-relaxed text-on-surface-variant">
              {{ props.event.description || 'No description provided for this event yet.' }}
            </p>
          </div>

          <!-- Venue Card -->
          <div class="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <header class="flex items-center justify-between gap-4">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Venue
              </p>
              <UIcon
                name="i-lucide-map"
                class="h-5 w-5 text-on-surface-variant"
              />
            </header>
            <div class="mt-4 space-y-2 text-sm text-on-surface-variant">
              <p class="font-semibold text-on-surface">
                {{ venueLabel }}
              </p>
              <p v-if="props.event.venue?.address">
                {{ props.event.venue.address }}
              </p>
              <p v-if="props.event.venue?.city || props.event.venue?.country">
                {{ props.event.venue.city }}<span v-if="props.event.venue.city && props.event.venue.country">, </span>{{ props.event.venue.country }}
              </p>
              <p
                v-if="props.event.venue?.type === 'virtual'"
                class="text-xs text-on-surface-variant"
              >
                This is a virtual event. Access details will be shared with attendees.
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="col-span-12 lg:col-span-4 space-y-6">
        <!-- Revenue Card -->
        <section class="bg-primary text-on-primary rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
          <header class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-on-primary/70">
                Revenue
              </p>
              <p class="mt-2 text-2xl font-headline font-extrabold tracking-tight">
                {{ props.event.revenue_total ? `$${props.event.revenue_total.toLocaleString()}` : '$0' }}
              </p>
              <p class="mt-1 text-xs text-on-primary/70">
                Across all ticket types
              </p>
            </div>
            <div class="flex flex-col items-end gap-2 text-xs text-on-primary/80">
              <span class="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 backdrop-blur">
                <UIcon
                  name="i-lucide-trending-up"
                  class="h-3 w-3"
                />
                <span>+12.4%</span>
              </span>
              <span>vs last period</span>
            </div>
          </header>

          <div class="mt-6 space-y-3 text-xs text-on-primary/80">
            <div class="flex items-center justify-between">
              <span>Average ticket value</span>
              <span class="font-semibold">
                {{ props.event.average_ticket_price ? `$${props.event.average_ticket_price.toLocaleString()}` : '$0' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>Total orders</span>
              <span class="font-semibold">
                {{ props.event.order_count ?? 0 }}
              </span>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
          <header class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Recent Activity
              </p>
              <p class="mt-1 text-xs text-on-surface-variant">
                Key updates for this event.
              </p>
            </div>
            <AppButton size="sm" color="neutral">
              View all
            </AppButton>
          </header>

          <div class="space-y-4">
            <article
              v-for="item in 3"
              :key="item"
              class="flex gap-4 rounded-2xl border border-surface-container-low bg-surface-container-lowest px-4 py-3 text-xs shadow-sm dark:border-slate-800 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
            >
              <div class="w-1 rounded-full bg-primary" />
              <div class="flex-1">
                <p class="text-on-surface">
                  <span class="font-semibold">Registration activity</span>
                  · placeholder copy to be wired with live data.
                </p>
                <p class="mt-1 text-[11px] text-on-surface-variant">
                  Just now
                </p>
              </div>
            </article>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
          <header class="mb-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
              Quick Actions
            </p>
          </header>
          <div class="grid gap-2 text-xs">
            <AppButton block size="sm">
              Promote event
            </AppButton>
            <AppButton block size="sm" color="neutral">
              View attendees
            </AppButton>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

