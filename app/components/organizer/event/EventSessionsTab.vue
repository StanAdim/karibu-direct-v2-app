<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import { getSessionDuration, isSessionLive, type Session } from '~/types'
import AppButton from '~/components/ui/AppButton.vue'
import AppAvatar from '~/components/common/AppAvatar.vue'
import { useSessionSchedule } from '~/composables/useSessionSchedule'

const props = defineProps<{
  sessions: Session[]
}>()

const emit = defineEmits<{
  'schedule-session': []
  'add-session': []
  'edit-session': [session: Session]
  'assign-speaker': [session: Session]
  'session-register': [session: Session]
  'session-checkin': [session: Session]
  'sessions-changed': []
}>()

const sessionsStore = useSessionsStore()
const notifications = useNotifications()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()

const deleteLoading = ref(false)
const sessionToDelete = ref<Session | null>(null)
const openMenuId = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = 8

const sessionsRef = toRef(props, 'sessions')
const { hasOverlap } = useSessionSchedule(sessionsRef)

function closeMenus() {
  openMenuId.value = null
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('[data-session-actions-root]')) {
    closeMenus()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const totalSessions = computed(() => props.sessions.length)

const contentSessions = computed(() => props.sessions.filter(s => !s.is_break))

const uniqueSpeakerCount = computed(() => {
  const ids = new Set<string>()
  for (const s of props.sessions) {
    for (const sp of s.speakers ?? []) {
      ids.add(sp.id)
    }
  }
  return ids.size
})

const speakerCapacityLabel = computed(() => {
  const total = contentSessions.value.length
  if (!total) return '—'
  const withSpeaker = contentSessions.value.filter(s => (s.speakers?.length ?? 0) > 0).length
  const pct = Math.round((withSpeaker / total) * 100)
  return `${pct}% assigned`
})

const uniqueVenues = computed(() => {
  const rooms = new Set<string>()
  for (const s of contentSessions.value) {
    const r = s.room || s.location
    if (r) rooms.add(r)
  }
  return rooms
})

const venueUtilizationPct = computed(() => {
  const total = contentSessions.value.length
  if (!total) return 0
  const withRoom = contentSessions.value.filter(s => Boolean(s.room || s.location)).length
  return Math.round((withRoom / total) * 100)
})

const liveSession = computed(() =>
  props.sessions.find(s => !s.is_break && isSessionLive(s))
)

const sessionsStartingToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setHours(23, 59, 59, 999)
  return props.sessions.filter(s => {
    const st = new Date(s.start_time)
    return st >= today && st <= end
  }).length
})

const totalPages = computed(() => Math.max(1, Math.ceil(props.sessions.length / pageSize)))

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.sessions.slice(start, start + pageSize)
})

const pageLabelFrom = computed(() =>
  props.sessions.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1
)

const pageLabelTo = computed(() =>
  Math.min(currentPage.value * pageSize, props.sessions.length)
)

watch(
  () => props.sessions.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }
)

watch(
  () => props.sessions,
  () => closeMenus(),
  { deep: true }
)

async function handleDeleteSession(session: Session) {
  closeMenus()
  sessionToDelete.value = session
  const ok = await confirm({
    title: 'Delete session',
    message: `Delete "${session.title}"? This cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (!ok || !sessionToDelete.value) {
    sessionToDelete.value = null
    return
  }

  deleteLoading.value = true
  try {
    await sessionsStore.deleteSession(sessionToDelete.value.id)
    notifications.success('Session deleted')
    emit('sessions-changed')
  }
  catch {
    notifications.error('Failed to delete session')
  }
  finally {
    deleteLoading.value = false
    sessionToDelete.value = null
  }
}

function rowClass(session: Session): string {
  const overlap = hasOverlap(session.id)
    ? 'bg-amber-50/90 dark:bg-amber-950/25 ring-1 ring-inset ring-amber-200/80 dark:ring-amber-800/50'
    : 'hover:bg-[#e8efff]/60 dark:hover:bg-slate-800/60'
  return `group transition-colors ${overlap}`
}

function formatStartTime(session: Session): string {
  return new Date(session.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatLiveSubtitle(session: Session): string {
  const start = new Date(session.start_time)
  const mins = Math.max(0, Math.round((Date.now() - start.getTime()) / 60000))
  const venue = session.room || session.location || 'Main venue'
  if (mins < 1) return `${venue} • just started`
  return `${venue} • Started ${mins}m ago`
}

function statusBadge(session: Session): { label: string; class: string } {
  if (session.is_break) {
    return {
      label: 'Break',
      class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }
  }
  if (session.status === 'cancelled') {
    return {
      label: 'Cancelled',
      class: 'bg-[#fad8fd] text-[#705575] dark:bg-fuchsia-950/40 dark:text-fuchsia-200'
    }
  }
  if (isSessionLive(session) || session.status === 'in_progress') {
    return {
      label: 'Live Now',
      class: 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
    }
  }
  if (session.status === 'completed') {
    return {
      label: 'Completed',
      class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    }
  }
  return {
    label: 'Confirmed',
    class: 'bg-primary-500/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-300'
  }
}

function primarySpeaker(session: Session) {
  return session.speakers?.[0] ?? null
}

function speakerLine(session: Session): string {
  const names = session.speakers?.map(s => s.name).filter(Boolean) ?? []
  if (!names.length) return 'TBA'
  if (names.length === 1) return names[0]!
  return `${names[0]!} +${names.length - 1}`
}

function sessionThumbClass(session: Session): string {
  const hues = [
    'from-sky-400 to-indigo-500',
    'from-violet-400 to-fuchsia-500',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-500'
  ]
  const i = session.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length
  return `bg-gradient-to-br ${hues[i]}`
}

function goPage(p: number) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value)
}

function formatSessionTypeLabel(session: Session): string {
  return session.session_type.replace(/_/g, ' ')
}
</script>

<template>
  <div class="space-y-8 text-[#0a1120] dark:text-slate-100">
    <!-- Header -->
    <header class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-1">
        <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-500">
          Live overview
        </span>
        <h3 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Event Sessions
        </h3>
        <p class="max-w-md text-sm text-slate-600 dark:text-slate-400">
          Orchestrate schedules, speakers, and venue capacity. Manage registration and check-in from each row.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition active:scale-[0.98] hover:bg-[#e8efff]/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 opacity-60 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <span class="material-symbols-outlined text-lg text-slate-500">filter_list</span>
          Filter
        </button>
        <AppButton
          color="neutral"
          size="sm"
          icon="calendar_month"
          class="!shadow-sm !bg-white !text-slate-800 border border-slate-200/80 hover:!bg-[#e8efff]/80 dark:!bg-slate-900 dark:border-slate-700 dark:!text-slate-100"
          @click="emit('schedule-session')"
        >
          Schedule
        </AppButton>
        <AppButton
          size="sm"
          icon="add"
          class="!px-6 !py-2.5 !font-bold !shadow-xl !shadow-primary-500/30"
          @click="emit('add-session')"
        >
          Add Session
        </AppButton>
      </div>
    </header>

    <p
      v-if="sessions.some(s => hasOverlap(s.id))"
      class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <span class="font-bold">Overlap:</span>
      sessions on the same track share a time window. Adjust times or tracks to resolve.
    </p>

    <!-- Stats -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        class="rounded-2xl border-b-4 border-primary-500 bg-white p-6 shadow-xl shadow-primary-500/5 dark:bg-slate-900 dark:border-primary-400"
      >
        <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total sessions
        </p>
        <div class="flex flex-wrap items-baseline gap-2">
          <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ totalSessions }}</span>
          <span
            v-if="sessionsStartingToday > 0"
            class="text-xs font-bold text-primary-600 dark:text-primary-400"
          >
            +{{ sessionsStartingToday }} today
          </span>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-6 shadow-xl shadow-primary-500/5 dark:bg-slate-900">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Speakers
        </p>
        <div class="flex flex-wrap items-baseline gap-2">
          <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ uniqueSpeakerCount }}</span>
          <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300">{{ speakerCapacityLabel }}</span>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-6 shadow-xl shadow-primary-500/5 dark:bg-slate-900">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Venue utilization
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ venueUtilizationPct }}%</span>
          <div
            v-if="uniqueVenues.size"
            class="flex -space-x-2"
          >
            <div
              v-for="(v, idx) in [...uniqueVenues].slice(0, 3)"
              :key="v"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/15 text-[10px] font-bold text-primary-700 ring-2 ring-white dark:bg-primary-400/20 dark:text-primary-200 dark:ring-slate-900"
            >
              {{ idx + 1 }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl bg-[#004ca5] p-6 text-white shadow-xl shadow-primary-500/20 dark:bg-[#003875]"
      >
        <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
          Current activity
        </p>
        <template v-if="liveSession">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span class="text-lg font-bold leading-tight">{{ liveSession.title }}</span>
          </div>
          <p class="mt-2 text-[11px] text-white/60">
            {{ formatLiveSubtitle(liveSession) }}
          </p>
        </template>
        <template v-else>
          <p class="text-sm font-semibold text-white/90">
            No session live right now
          </p>
          <p class="mt-2 text-[11px] text-white/60">
            Live badge appears when a session is in its scheduled window.
          </p>
        </template>
      </div>
    </section>

    <!-- Table card -->
    <div
      class="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-800">
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-8">
                Title
              </th>
              <th
                class="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6"
              >
                Time
              </th>
              <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Speaker
              </th>
              <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Venue
              </th>
              <th class="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Status
              </th>
              <th
                class="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-8"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="sessions.length === 0">
              <tr>
                <td
                  colspan="6"
                  class="px-8 py-14 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No sessions yet. Use <span class="font-semibold text-slate-700 dark:text-slate-300">Add Session</span>
                  or <span class="font-semibold text-slate-700 dark:text-slate-300">Schedule</span> to build your agenda.
                </td>
              </tr>
            </template>
            <tr
              v-for="session in paginatedSessions"
              v-else
              :key="session.id"
              :class="rowClass(session)"
            >
              <td class="px-6 py-5 sm:px-8">
                <div class="flex min-w-0 items-center gap-4">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-extrabold text-white shadow-inner"
                    :class="sessionThumbClass(session)"
                  >
                    {{ session.title.trim().charAt(0).toUpperCase() || '•' }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="truncate font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400"
                    >
                      {{ session.title }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ session.track || formatSessionTypeLabel(session) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-5 text-center sm:px-6">
                <div
                  class="inline-flex flex-col items-center justify-center rounded-lg bg-[#e8efff]/90 px-3 py-1.5 dark:bg-slate-800/90"
                >
                  <span class="text-xs font-bold text-slate-900 dark:text-white">{{ formatStartTime(session) }}</span>
                  <span class="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    {{ getSessionDuration(session) }} min
                  </span>
                </div>
              </td>
              <td class="px-4 py-5 sm:px-6">
                <div class="flex min-w-0 items-center gap-3">
                  <AppAvatar
                    v-if="primarySpeaker(session)"
                    :src="primarySpeaker(session)?.avatar ?? null"
                    :alt="primarySpeaker(session)?.name ?? 'Speaker'"
                    size="sm"
                    class="grayscale transition-all group-hover:grayscale-0"
                  />
                  <div
                    v-else
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800"
                  >
                    ?
                  </div>
                  <span class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {{ speakerLine(session) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-5 sm:px-6">
                <div class="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined shrink-0 text-lg text-slate-400">location_on</span>
                  <span class="truncate text-sm">{{ session.room || session.location || 'Main venue' }}</span>
                </div>
              </td>
              <td class="px-4 py-5 sm:px-6">
                <span
                  class="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight"
                  :class="statusBadge(session).class"
                >
                  {{ statusBadge(session).label }}
                </span>
              </td>
              <td class="px-6 py-5 text-right sm:px-8">
                <div
                  data-session-actions-root
                  class="relative flex items-center justify-end gap-1"
                >
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label="Edit session"
                    @click.stop="closeMenus(); emit('edit-session', session)"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Delete session"
                    @click.stop="closeMenus(); void handleDeleteSession(session)"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                  <div class="relative">
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      :aria-expanded="openMenuId === session.id"
                      aria-label="More session actions"
                      @click.stop="openMenuId = openMenuId === session.id ? null : session.id"
                    >
                      <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                    <div
                      v-if="openMenuId === session.id"
                      class="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                      role="menu"
                      @click.stop
                    >
                      <button
                        type="button"
                        role="menuitem"
                        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        :disabled="session.is_break"
                        @click="emit('assign-speaker', session); closeMenus()"
                      >
                        <span class="material-symbols-outlined text-base text-slate-500">person_add</span>
                        Assign speaker
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        :disabled="session.is_break"
                        @click="emit('session-register', session); closeMenus()"
                      >
                        <span class="material-symbols-outlined text-base text-slate-500">how_to_reg</span>
                        Registration
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        :disabled="session.is_break"
                        @click="emit('session-checkin', session); closeMenus()"
                      >
                        <span class="material-symbols-outlined text-base text-slate-500">qr_code_scanner</span>
                        Check-in
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="sessions.length > 0"
        class="flex flex-col gap-4 border-t border-slate-200/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-slate-800"
      >
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
          Showing
          <span class="font-bold text-slate-900 dark:text-white">{{ pageLabelFrom }}-{{ pageLabelTo }}</span>
          of {{ sessions.length }} sessions
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 transition hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            :disabled="currentPage <= 1"
            aria-label="Previous page"
            @click="goPage(currentPage - 1)"
          >
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            class="h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition"
            :class="p === currentPage
              ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
              : 'border border-slate-200/80 hover:bg-[#e8efff] dark:border-slate-700 dark:hover:bg-slate-800'"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 transition hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            :disabled="currentPage >= totalPages"
            aria-label="Next page"
            @click="goPage(currentPage + 1)"
          >
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bento -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div
        class="relative overflow-hidden rounded-3xl bg-[#dae2f9]/40 p-8 dark:bg-indigo-950/30 lg:col-span-2"
      >
        <div class="relative z-10 max-w-lg">
          <h4 class="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            Speaker engagement
          </h4>
          <p class="mb-6 text-sm text-slate-600 dark:text-slate-400">
            Keep speakers briefed and on time. Use Assign speaker and Check-in from each row to tighten the loop before doors open.
          </p>
          <button
            type="button"
            class="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition active:scale-[0.98] hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 opacity-60 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            Notify all speakers
          </button>
        </div>
        <span
          class="material-symbols-outlined pointer-events-none absolute -bottom-8 -right-8 rotate-12 text-[180px] text-slate-900/[0.06] transition group-hover:rotate-0 dark:text-white/[0.08]"
        >mic</span>
      </div>

      <div
        class="flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-[#e8efff]/50 p-8 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div>
          <h4 class="mb-1 text-xl font-extrabold text-slate-900 dark:text-white">
            Venue map
          </h4>
          <p class="mb-4 text-xs text-slate-600 dark:text-slate-400">
            Live occupancy tracking
          </p>
        </div>
        <div
          class="relative h-32 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-200/80 to-indigo-300/60 dark:from-primary-900/40 dark:to-indigo-950/60"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative flex h-8 w-8 items-center justify-center">
              <div class="absolute h-4 w-4 animate-ping rounded-full bg-primary-500 opacity-40" />
              <div class="h-3 w-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
            </div>
          </div>
        </div>
        <button
          type="button"
          class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-600 opacity-60 cursor-not-allowed dark:text-primary-400"
          disabled
          title="Coming soon"
        >
          Open map manager
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>

    <ConfirmModal
      :open="isOpen"
      :title="options?.title || ''"
      :message="options?.message || ''"
      :confirm-text="options?.confirmText"
      :variant="options?.variant"
      :loading="deleteLoading"
      @update:open="handleCancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>
