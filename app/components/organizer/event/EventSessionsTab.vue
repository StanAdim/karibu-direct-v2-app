<script setup lang="ts">
import { computed } from 'vue'
import type { Session } from '~/types'
import { formatSessionTime } from '~/types'
import AppButton from '~/components/ui/AppButton.vue'

const props = defineProps<{
  eventId: string
  sessions: Session[]
  /** When set, shows "Schedule Session" button that opens the schedule modal. */
  onScheduleSession?: () => void
}>()

const totalSessions = computed(() => props.sessions.length)
const nonBreakSessions = computed(() => props.sessions.filter(s => !s.is_break))
</script>

<template>
  <div class="space-y-8">
    <!-- Header row -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500">
          Event Sessions
        </p>
        <h3 class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
          Sessions
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage schedule, speakers, and venues for this event.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <AppButton
          color="neutral"
          size="sm"
          class="flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">
            filter_list
          </span>
          Filter
        </AppButton>
        <AppButton
          size="sm"
          class="flex items-center gap-2"
          @click="onScheduleSession && onScheduleSession()"
        >
          <span class="material-symbols-outlined text-sm">
            add
          </span>
          Add Session
        </AppButton>
      </div>
    </div>

    <!-- Sessions list card -->
    <div class="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      <div class="border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
        <div class="grid grid-cols-[2.2fr,1.1fr,1.4fr,1.3fr,1fr,0.8fr] gap-4 items-center">
          <span>Title &amp; Track</span>
          <span>Time</span>
          <span>Speaker</span>
          <span>Venue</span>
          <span>Status</span>
          <span class="text-right">
            Actions
          </span>
        </div>
      </div>

      <div
        v-if="props.sessions.length === 0"
        class="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        No sessions created yet for this event. Use “Add Session” to start building your agenda.
      </div>

      <div
        v-else
        class="divide-y divide-slate-100 dark:divide-slate-800"
      >
        <div
          v-for="session in props.sessions"
          :key="session.id"
          class="px-6 py-4 text-sm hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
        >
          <div class="grid grid-cols-[2.2fr,1.1fr,1.4fr,1.3fr,1fr,0.8fr] gap-4 items-center">
            <!-- Title & track -->
            <div class="space-y-1 min-w-0">
              <p class="font-medium text-slate-900 dark:text-slate-100 truncate">
                {{ session.title }}
              </p>
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {{ session.track || 'General' }}
              </p>
            </div>

            <!-- Time -->
            <div class="text-xs text-slate-600 dark:text-slate-400">
              {{ formatSessionTime(session) }}
            </div>

            <!-- Speaker -->
            <div class="text-xs text-slate-700 dark:text-slate-300 truncate">
              {{ session.speakers?.map(s => s.name).join(', ') || 'TBA' }}
            </div>

            <!-- Venue / room -->
            <div class="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
              <span class="material-symbols-outlined text-[16px] text-slate-400">
                location_on
              </span>
              <span>{{ session.room || 'Main venue' }}</span>
            </div>

            <!-- Status -->
            <div>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                :class="[
                  session.is_break
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                ]"
              >
                {{ session.is_break ? 'Break' : 'Confirmed' }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 text-slate-400">
              <button
                type="button"
                class="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
              <button
                type="button"
                class="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-[18px]">
                  more_vert
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom metric cards row -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-3xl bg-primary-500 text-white p-5 shadow-lg shadow-primary-500/30">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-100/90">
          Registration Pace
        </p>
        <p class="mt-2 text-3xl font-extrabold">
          +124%
        </p>
        <p class="mt-2 text-xs text-primary-100/90">
          Sessions are trending for strong attendance.
        </p>
      </div>

      <div class="rounded-3xl bg-slate-50 p-5 shadow-sm border border-white dark:bg-slate-900 dark:border-slate-800">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Total Sessions
        </p>
        <p class="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {{ totalSessions }}
        </p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Includes {{ nonBreakSessions.length }} content sessions plus breaks.
        </p>
      </div>

      <div class="rounded-3xl bg-slate-50 p-5 shadow-sm border border-white dark:bg-slate-900 dark:border-slate-800">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Venue Utilization
        </p>
        <div class="mt-3 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full bg-primary-500"
            :style="{ width: '78%' }"
          />
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>78%</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300"
          >
            Optimize
            <span class="material-symbols-outlined text-[14px]">
              trending_up
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

