<script setup lang="ts">
import type { Event, EventStatus } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import { getFullName } from '~/types'
import { format } from 'date-fns'

interface Props {
  events: Event[]
  loading?: boolean
  actionLoadingId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  actionLoadingId: null
})

const emit = defineEmits<{
  view: [event: Event]
  approve: [event: Event]
  reject: [event: Event]
}>()

function formatSubmitted(iso: string): string {
  try {
    return format(new Date(iso), 'MMM d, yyyy, HH:mm')
  }
  catch {
    return '—'
  }
}

function formatEventTime(iso: string): string {
  try {
    return format(new Date(iso), 'hh:mm a')
  }
  catch {
    return ''
  }
}

function venueLine(event: Event): string {
  const v = event.venue
  const place = v?.name || v?.city || (v?.type === 'virtual' ? 'Online' : 'TBD')
  const t = formatEventTime(event.start_date)
  return t ? `${place} • ${t}` : place
}

function organizerName(event: Event): string {
  return event.organizer ? getFullName(event.organizer) : 'Unknown organizer'
}

function primaryCategory(event: Event): string {
  const c = event.categories?.[0]
  return c ? c.replace(/-/g, ' ').toUpperCase() : 'GENERAL'
}

function categoryPillClass(event: Event): string {
  const raw = (event.categories?.[0] || '').toLowerCase()
  if (raw.includes('night') || raw.includes('club') || raw.includes('music')) {
    return 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
  }
  if (raw.includes('conference') || raw.includes('tech') || raw.includes('summit')) {
    return 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300'
  }
  if (raw.includes('social') || raw.includes('network')) {
    return 'bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

type ReviewLabel = 'PENDING' | 'REJECTED' | 'LIVE' | 'ENDED'

function reviewStatus(event: Event): { label: ReviewLabel; dotClass: string; textClass: string } {
  switch (event.status) {
    case 'draft':
      return {
        label: 'PENDING',
        dotClass: 'bg-amber-400',
        textClass: 'text-amber-700 dark:text-amber-400'
      }
    case 'published':
      return {
        label: 'LIVE',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-700 dark:text-emerald-400'
      }
    case 'cancelled':
      return {
        label: 'REJECTED',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-700 dark:text-rose-400'
      }
    case 'completed':
      return {
        label: 'ENDED',
        dotClass: 'bg-slate-400',
        textClass: 'text-slate-600 dark:text-slate-400'
      }
    case 'archived':
    default:
      return {
        label: 'ENDED',
        dotClass: 'bg-slate-400',
        textClass: 'text-slate-600 dark:text-slate-400'
      }
  }
}

function canModerate(status: EventStatus): boolean {
  return status === 'draft'
}
const config = useRuntimeConfig()

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(event.cover_image, String(config.public.apiBase))
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="overflow-x-auto">
      <table class="min-w-[920px] w-full border-collapse text-left">
        <thead>
          <tr class="bg-primary-50/70 dark:bg-primary-950/30">
            <th class="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Event name
            </th>
            <th class="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Organizer
            </th>
            <th class="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Submitted date
            </th>
            <th class="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Category
            </th>
            <th class="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Review status
            </th>
            <th class="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              colspan="6"
              class="px-5 py-16"
            >
              <LoadingState text="Loading submissions..." />
            </td>
          </tr>
          <tr v-else-if="events.length === 0">
            <td
              colspan="6"
              class="px-5 py-12"
            >
              <EmptyState
                icon="i-lucide-calendar-days"
                title="No submissions match"
                description="Try adjusting filters or sync to refresh the queue."
              />
            </td>
          </tr>
          <tr
            v-for="(event, index) in events"
            v-else
            :key="event.id"
            :class="[
              'border-t border-slate-100 transition-colors dark:border-slate-800',
              index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/80'
            ]"
          >
            <td class="px-5 py-4 align-middle">
              <div class="flex items-center gap-3">
                <div class="h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <img
                    v-if="event.cover_image"
                    :src="getEventImage(event)"
                    :alt="event.title"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="flex h-full items-center justify-center"
                  >
                    <AppLucideIcon
                      name="i-lucide-image"
                      :size="20"
                      class="text-slate-400"
                    />
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 dark:text-white">
                    {{ event.title }}
                  </p>
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {{ venueLine(event) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 align-middle">
              <div class="flex items-center gap-2">
                <AppAvatar
                  :src="event.organizer?.avatar"
                  :alt="organizerName(event)"
                  size="sm"
                  class="ring-2 ring-white dark:ring-slate-800"
                />
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ organizerName(event) }}
                </span>
              </div>
            </td>
            <td class="px-5 py-4 align-middle text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {{ formatSubmitted(event.created_at) }}
            </td>
            <td class="px-5 py-4 align-middle">
              <span
                class="inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
                :class="categoryPillClass(event)"
              >
                {{ primaryCategory(event) }}
              </span>
            </td>
            <td class="px-5 py-4 align-middle">
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="reviewStatus(event).dotClass"
                />
                <span
                  class="text-xs font-bold tracking-wide"
                  :class="reviewStatus(event).textClass"
                >
                  {{ reviewStatus(event).label }}
                </span>
              </div>
            </td>
            <td class="px-5 py-4 align-middle text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="View"
                  @click="emit('view', event)"
                >
                  <AppLucideIcon
                    name="i-lucide-eye"
                    :size="18"
                  />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-30 dark:hover:bg-emerald-950/30"
                  title="Approve"
                  :disabled="!canModerate(event.status) || actionLoadingId === `${event.id}-approve`"
                  @click="emit('approve', event)"
                >
                  <AppLucideIcon
                    v-if="actionLoadingId === `${event.id}-approve`"
                    name="i-lucide-loader-2"
                    :size="18"
                    class="animate-spin"
                  />
                  <AppLucideIcon
                    v-else
                    name="i-lucide-check"
                    :size="18"
                  />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/30"
                  title="Reject"
                  :disabled="!canModerate(event.status) || actionLoadingId === `${event.id}-reject`"
                  @click="emit('reject', event)"
                >
                  <AppLucideIcon
                    v-if="actionLoadingId === `${event.id}-reject`"
                    name="i-lucide-loader-2"
                    :size="18"
                    class="animate-spin"
                  />
                  <AppLucideIcon
                    v-else
                    name="i-lucide-x"
                    :size="18"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
