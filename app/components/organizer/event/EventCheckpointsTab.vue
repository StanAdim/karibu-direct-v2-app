<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Checkpoint, CheckpointType } from '~/types'
import { getCheckpointTypeLabel } from '~/types'
import AppButton from '~/components/ui/AppButton.vue'

const props = withDefaults(
  defineProps<{
    eventId: string
    checkpoints: Checkpoint[]
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'create'): void
}>()

const router = useRouter()
const searchQuery = ref('')
const openMenuId = ref<string | null>(null)

function closeMenus() {
  openMenuId.value = null
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('[data-checkpoint-menu-root]')) {
    closeMenus()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const materialIconByType: Record<CheckpointType, string> = {
  entry: 'meeting_room',
  exit: 'logout',
  session: 'event_available',
  booth: 'storefront',
  custom: 'qr_code_2'
}

const iconSurfaceClasses = [
  'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300',
  'bg-[#dae2f9] text-[#2b47ab] dark:bg-indigo-950/40 dark:text-indigo-300'
]

const metricAccentClasses = [
  'bg-[#f0f4ff] border-slate-200/40 dark:bg-slate-800/80 dark:border-slate-700/50',
  'bg-fuchsia-50/80 border-fuchsia-200/30 dark:bg-fuchsia-950/20 dark:border-fuchsia-900/40',
  'bg-[#e8efff] border-slate-200/40 dark:bg-slate-800/60 dark:border-slate-700/50'
]

function materialIcon(type: CheckpointType): string {
  return materialIconByType[type]
}

function iconSurfaceClass(index: number): string {
  return iconSurfaceClasses[index % iconSurfaceClasses.length]!
}

function metricPairClass(index: number): string {
  return metricAccentClasses[index % metricAccentClasses.length]!
}

const filteredCheckpoints = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.checkpoints
  return props.checkpoints.filter(
    c =>
      c.name.toLowerCase().includes(q)
      || (c.location?.toLowerCase().includes(q) ?? false)
      || getCheckpointTypeLabel(c.type).toLowerCase().includes(q)
  )
})

const activeGates = computed(() => props.checkpoints.filter(c => c.is_active).length)

const totalScans = computed(() =>
  props.checkpoints.reduce((sum, c) => sum + (c.scan_count ?? 0), 0)
)

const busiestCheckpoint = computed((): Checkpoint | null => {
  const list = props.checkpoints
  if (!list.length) return null
  return list.reduce((a, b) => ((a.scan_count ?? 0) >= (b.scan_count ?? 0) ? a : b))
})

function isCrowdHotspot(cp: Checkpoint): boolean {
  const list = props.checkpoints
  if (list.length < 2) return false
  const sorted = [...list].sort((a, b) => (b.scan_count ?? 0) - (a.scan_count ?? 0))
  if (sorted[0]?.id !== cp.id) return false
  const top = sorted[0]?.scan_count ?? 0
  const second = sorted[1]?.scan_count ?? 0
  return top > 0 && top >= second * 1.4
}

function zoneSubtitle(cp: Checkpoint): string {
  const zone = cp.location?.trim() || getCheckpointTypeLabel(cp.type)
  const status = cp.is_active ? 'Active' : 'Inactive'
  return `${status} • ${zone}`
}

function secondaryMetricLabel(cp: Checkpoint): string {
  if (cp.settings?.max_capacity != null) return 'Capacity limit'
  if (cp.type === 'entry') return 'Queue time'
  return 'Checkpoint type'
}

function secondaryMetricValue(cp: Checkpoint): string {
  if (cp.settings?.max_capacity != null) return String(cp.settings.max_capacity)
  if (cp.type === 'entry') return '—'
  return getCheckpointTypeLabel(cp.type)
}

function openCheckpointsManager() {
  void router.push(`/organizer/checkpoints?event_id=${props.eventId}`)
}
</script>

<template>
  <div class="space-y-10 text-[#0a1120] dark:text-slate-100">
    <!-- Hero -->
    <section class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl space-y-1">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
          Core logistics
        </p>
        <h2 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-none">
          Checkpoints <span class="text-primary-500/40">Management</span>
        </h2>
        <p class="mt-3 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Control the flow of your event. Monitor entry points and internal zones in real-time.
        </p>
      </div>
      <AppButton
        icon="add"
        class="shrink-0 self-start !px-8 !py-3.5 !text-sm !font-bold !shadow-xl !shadow-primary-500/30 lg:self-auto"
        @click="emit('create')"
      >
        Add Checkpoint
      </AppButton>
    </section>

    <!-- Toolbar search (matches reference; filters local list) -->
    <div class="relative max-w-xl">
      <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
        search
      </span>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search checkpoints, staff, or locations..."
        class="w-full rounded-full border-0 bg-[#e8efff]/90 py-2.5 pl-12 pr-4 text-sm text-slate-900 shadow-inner outline-none ring-1 ring-slate-200/60 placeholder:text-slate-500/70 focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800/90 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500"
        autocomplete="off"
      >
    </div>

    <div
      v-if="props.loading"
      class="py-12"
    >
      <LoadingState text="Loading checkpoints..." />
    </div>

    <template v-else>
      <!-- Stats bento -->
      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          class="flex h-40 flex-col justify-between rounded-[2rem] bg-white p-6 shadow-xl shadow-primary-500/5 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <span class="material-symbols-outlined">sensors</span>
            </div>
            <span class="rounded-full bg-primary-500/10 px-2 py-1 text-[10px] font-bold text-primary-600 dark:text-primary-400">
              LIVE
            </span>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
              {{ activeGates }}
            </p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active gates
            </p>
          </div>
        </div>

        <div
          class="flex h-40 flex-col justify-between rounded-[2rem] bg-white p-6 shadow-xl shadow-primary-500/5 dark:bg-slate-900"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#dae2f9] text-[#2b47ab] dark:bg-indigo-950/50 dark:text-indigo-300">
            <span class="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-slate-900 dark:text-white">
              {{ totalScans.toLocaleString() }}
            </p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total scans
            </p>
          </div>
        </div>

        <div
          class="relative flex h-40 flex-col justify-between overflow-hidden rounded-[2rem] bg-primary-500 p-6 text-white shadow-xl shadow-primary-500/25 md:col-span-2"
        >
          <div class="relative z-10">
            <p class="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-80">
              Peak traffic
            </p>
            <template v-if="busiestCheckpoint">
              <p class="text-2xl font-extrabold">
                {{ busiestCheckpoint.name }}
              </p>
              <p class="mt-1 text-xs font-medium opacity-90">
                {{ (busiestCheckpoint.scan_count ?? 0).toLocaleString() }} scans · busiest checkpoint
              </p>
            </template>
            <template v-else>
              <p class="text-xl font-extrabold opacity-95">
                No checkpoints yet
              </p>
              <p class="mt-1 text-xs opacity-90">
                Add a checkpoint to start tracking scans.
              </p>
            </template>
          </div>
          <div class="relative z-10 flex items-end gap-1">
            <div class="h-8 w-3 rounded-t-sm bg-white/20" />
            <div class="h-12 w-3 rounded-t-sm bg-white/20" />
            <div class="h-16 w-3 rounded-t-sm bg-white/40" />
            <div class="h-20 w-3 rounded-t-sm bg-white" />
            <div class="h-14 w-3 rounded-t-sm bg-white/60" />
            <div class="h-10 w-3 rounded-t-sm bg-white/20" />
          </div>
          <div class="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </div>
      </section>

      <!-- Active nodes -->
      <section class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">
            Active nodes
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full bg-[#dee7ff]/90 px-4 py-2 text-xs font-bold text-slate-600 opacity-60 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400"
              disabled
              title="Coming soon"
            >
              Filter: All zones
            </button>
            <button
              type="button"
              class="rounded-full bg-[#dee7ff]/90 px-4 py-2 text-xs font-bold text-slate-600 opacity-60 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400"
              disabled
              title="Coming soon"
            >
              Sort: Highest traffic
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div
            v-for="(checkpoint, index) in filteredCheckpoints"
            :key="checkpoint.id"
            class="group rounded-[2.5rem] bg-white p-8 shadow-xl shadow-primary-500/5 transition-all hover:shadow-primary-500/10 dark:bg-slate-900"
            :class="isCrowdHotspot(checkpoint) ? 'ring-2 ring-primary-500/15 dark:ring-primary-500/25' : ''"
          >
            <div class="mb-8 flex items-start justify-between gap-3">
              <div class="flex min-w-0 gap-4">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                  :class="iconSurfaceClass(index)"
                >
                  <span
                    class="material-symbols-outlined text-4xl"
                    style="font-variation-settings: 'FILL' 1"
                  >{{ materialIcon(checkpoint.type) }}</span>
                </div>
                <div class="min-w-0">
                  <h4 class="truncate text-2xl font-extrabold text-slate-900 dark:text-white">
                    {{ checkpoint.name }}
                  </h4>
                  <div class="mt-1 flex items-center gap-2">
                    <span
                      class="h-2 w-2 shrink-0 rounded-full"
                      :class="checkpoint.is_active ? 'animate-pulse bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
                    />
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {{ zoneSubtitle(checkpoint) }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                data-checkpoint-menu-root
                class="relative shrink-0"
              >
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-[#e8efff] dark:hover:bg-slate-800"
                  :aria-expanded="openMenuId === checkpoint.id"
                  aria-label="Checkpoint actions"
                  @click.stop="openMenuId = openMenuId === checkpoint.id ? null : checkpoint.id"
                >
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div
                  v-if="openMenuId === checkpoint.id"
                  class="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  role="menu"
                  @click.stop
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#e8efff] dark:text-slate-200 dark:hover:bg-slate-800"
                    @click="closeMenus(); openCheckpointsManager()"
                  >
                    <span class="material-symbols-outlined text-base text-slate-500">open_in_new</span>
                    Manage checkpoints
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-4">
              <div
                class="rounded-2xl border p-4"
                :class="metricPairClass(index)"
              >
                <p class="mb-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  Total scans
                </p>
                <p class="text-xl font-extrabold text-slate-900 dark:text-white">
                  {{ (checkpoint.scan_count ?? 0).toLocaleString() }}
                </p>
              </div>
              <div
                class="rounded-2xl border p-4"
                :class="metricPairClass(index + 1)"
              >
                <p class="mb-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  {{ secondaryMetricLabel(checkpoint) }}
                </p>
                <p class="text-xl font-extrabold text-slate-900 dark:text-white">
                  {{ secondaryMetricValue(checkpoint) }}
                </p>
              </div>
            </div>

            <div
              v-if="isCrowdHotspot(checkpoint)"
              class="rounded-2xl bg-primary-500/10 p-4 dark:bg-primary-500/15"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-primary-600 dark:text-primary-400">Crowd density warning</span>
                <span class="material-symbols-outlined text-sm text-primary-600 dark:text-primary-400">warning</span>
              </div>
              <p class="mt-1 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                This checkpoint leads scan volume versus others. Consider balancing entry points or opening an alternate route.
              </p>
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Recent activity
              </p>
              <p class="border-b border-slate-200/80 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Per-scan history appears on the checkpoints page after attendees check in.
              </p>
            </div>
          </div>

          <!-- Create placeholder -->
          <button
            type="button"
            class="group flex min-h-[280px] flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-300/80 bg-[#e8efff]/40 p-8 transition-all hover:border-primary-500/40 hover:bg-[#e8efff]/60 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-primary-500/30"
            @click="emit('create')"
          >
            <div
              class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#d4dfff] text-slate-500 shadow-inner transition-all group-hover:bg-primary-500 group-hover:text-white dark:bg-slate-800 dark:text-slate-400"
            >
              <span class="material-symbols-outlined text-4xl">add</span>
            </div>
            <h4 class="text-xl font-extrabold text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Create new checkpoint
            </h4>
            <p class="mt-2 max-w-[220px] text-center text-sm text-slate-500/80 dark:text-slate-500">
              Define a new entry, exit, or internal access point.
            </p>
          </button>
        </div>

        <p
          v-if="!props.loading && props.checkpoints.length > 0 && filteredCheckpoints.length === 0"
          class="text-center text-sm text-slate-500 dark:text-slate-400"
        >
          No checkpoints match “{{ searchQuery }}”.
        </p>
      </section>
    </template>
  </div>
</template>
