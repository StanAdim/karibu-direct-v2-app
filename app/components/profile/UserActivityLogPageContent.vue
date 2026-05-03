<script setup lang="ts">
import type { ActivityLog } from '~/types'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** Initial and default rows per page (API `size` query). */
  defaultPageSize?: number
}>(), {
  defaultPageSize: 15
})

const usersStore = useUsersStore()
const { user } = useAuth()

const items = ref<ActivityLog[]>([])
const page = ref(1)
const perPage = ref(props.defaultPageSize)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)

const lastPage = computed(() => Math.max(1, totalPages.value))

const paginationFrom = computed(() => {
  if (total.value === 0) return 0
  return (page.value - 1) * perPage.value + 1
})

const paginationTo = computed(() => Math.min(page.value * perPage.value, total.value))

function visiblePages(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 1) return [1]
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (pages.length && pages[pages.length - 1] === p && p === 'ellipsis') return
    pages.push(p)
  }
  push(1)
  if (current > 3) push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    push(i)
  }
  if (current < last - 2) push('ellipsis')
  push(last)
  return pages
}

const pagesToShow = computed(() => visiblePages(page.value, lastPage.value))

function formatEnumLikeLabel(raw: string): string {
  if (!raw) return ''
  const cleaned = raw.trim()
  if (!cleaned.includes('_')) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
  }
  return cleaned
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function actionLabel(log: ActivityLog): string {
  const raw = (log.action as string) || (log.title as string) || (log.type as string) || 'Activity'
  return formatEnumLikeLabel(String(raw))
}

function formatWhen(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatEntity(log: ActivityLog): string {
  const type = log.entity_type ? String(log.entity_type) : ''
  const id = log.entity_id != null ? String(log.entity_id) : ''
  if (type && id) return `${type} · ${id}`
  if (type) return type
  if (id) return id
  return '—'
}

function formatMeta(meta: unknown): string {
  if (meta == null) return '—'
  if (typeof meta === 'object' && meta !== null && Object.keys(meta as object).length === 0) return '—'
  try {
    const s = JSON.stringify(meta)
    return s.length > 140 ? `${s.slice(0, 137)}…` : s
  }
  catch {
    return '—'
  }
}

function statusClass(log: ActivityLog): string {
  const s = String(log.status ?? '').toLowerCase()
  if (s === 'success') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
  if (s === 'failed') return 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
}

function statusLabel(log: ActivityLog): string {
  const s = log.status != null ? String(log.status) : ''
  return s ? formatEnumLikeLabel(s) : '—'
}

async function load(): Promise<void> {
  const uid = user.value?.id
  if (!uid) {
    items.value = []
    total.value = 0
    totalPages.value = 1
    return
  }
  loading.value = true
  try {
    const res = await usersStore.fetchUserActivityLogsPaginated(uid, {
      page: page.value,
      size: perPage.value
    })
    items.value = res.items
    total.value = res.pagination.total
    totalPages.value = Math.max(1, res.pagination.total_pages)
  }
  catch {
    items.value = []
    total.value = 0
    totalPages.value = 1
  }
  finally {
    loading.value = false
  }
}

function goPage(p: number): void {
  if (p < 1 || p > lastPage.value) return
  page.value = p
  void load()
}

onMounted(() => void load())

watch(
  () => user.value?.id,
  (id) => {
    if (id) {
      page.value = 1
      void load()
    }
  }
)

watch(perPage, () => {
  page.value = 1
  void load()
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
    <div class="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Activity log
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Signed actions and audit events for your account (newest first).
        </p>
      </div>
      <div class="flex items-center gap-2">
        <label class="sr-only" for="activity-per-page">Rows per page</label>
        <select
          id="activity-per-page"
          v-model.number="perPage"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option :value="8">
            8 / page
          </option>
          <option :value="10">
            10 / page
          </option>
          <option :value="15">
            15 / page
          </option>
          <option :value="25">
            25 / page
          </option>
          <option :value="50">
            50 / page
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="py-16 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
      Loading activity…
    </div>

    <div
      v-else-if="items.length === 0"
      class="py-16 px-5 text-center text-sm text-slate-500 dark:text-slate-400"
    >
      No activity recorded yet.
    </div>

    <template v-else>
      <!-- Mobile cards -->
      <ul class="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
        <li
          v-for="log in items"
          :key="String(log.id ?? `${log.created_at}-${log.action}`)"
          class="px-5 py-4"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ actionLabel(log) }}
            </p>
            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
              :class="statusClass(log)"
            >
              {{ statusLabel(log) }}
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {{ formatWhen(log.created_at as string | undefined) }}
          </p>
          <dl class="mt-3 space-y-1 text-xs">
            <div class="flex gap-2">
              <dt class="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                Entity
              </dt>
              <dd class="text-slate-700 dark:text-slate-300 break-all">
                {{ formatEntity(log) }}
              </dd>
            </div>
            <div class="flex gap-2">
              <dt class="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                Metadata
              </dt>
              <dd class="text-slate-700 dark:text-slate-300 break-all font-mono">
                {{ formatMeta(log.metadata) }}
              </dd>
            </div>
            <div
              v-if="log.ip_address"
              class="flex gap-2"
            >
              <dt class="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                IP
              </dt>
              <dd class="text-slate-700 dark:text-slate-300 break-all">
                {{ log.ip_address }}
              </dd>
            </div>
            <div
              v-if="log.user_agent"
              class="flex gap-2"
            >
              <dt class="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                Agent
              </dt>
              <dd class="text-slate-700 dark:text-slate-300 break-all">
                {{ String(log.user_agent).length > 80 ? `${String(log.user_agent).slice(0, 77)}…` : log.user_agent }}
              </dd>
            </div>
          </dl>
        </li>
      </ul>

      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th class="whitespace-nowrap px-5 py-3">
                When
              </th>
              <th class="whitespace-nowrap px-5 py-3">
                Action
              </th>
              <th class="whitespace-nowrap px-5 py-3">
                Status
              </th>
              <th class="whitespace-nowrap px-5 py-3">
                Entity
              </th>
              <th class="min-w-[200px] px-5 py-3">
                Metadata
              </th>
              <th class="whitespace-nowrap px-5 py-3">
                IP
              </th>
              <th class="min-w-[160px] px-5 py-3">
                User agent
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="log in items"
              :key="String(log.id ?? `${log.created_at}-${log.action}`)"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
            >
              <td class="whitespace-nowrap px-5 py-3.5 text-slate-600 dark:text-slate-300">
                {{ formatWhen(log.created_at as string | undefined) }}
              </td>
              <td class="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                {{ actionLabel(log) }}
              </td>
              <td class="whitespace-nowrap px-5 py-3.5">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                  :class="statusClass(log)"
                >
                  {{ statusLabel(log) }}
                </span>
              </td>
              <td class="max-w-[200px] px-5 py-3.5 text-slate-600 dark:text-slate-300">
                <span class="line-clamp-2 break-all">{{ formatEntity(log) }}</span>
              </td>
              <td class="max-w-[280px] px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                <span class="line-clamp-3 break-all">{{ formatMeta(log.metadata) }}</span>
              </td>
              <td class="whitespace-nowrap px-5 py-3.5 text-slate-600 dark:text-slate-300">
                {{ log.ip_address ? String(log.ip_address) : '—' }}
              </td>
              <td class="max-w-[220px] px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                <span class="line-clamp-2 break-all">{{ log.user_agent ? String(log.user_agent) : '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="lastPage > 1 || total > 0"
        class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <template v-if="total === 0">0 entries</template>
          <template v-else>
            Showing {{ paginationFrom }}-{{ paginationTo }} of {{ total.toLocaleString() }} entries
          </template>
        </p>
        <nav
          v-if="lastPage > 1"
          class="flex flex-wrap items-center justify-center gap-1"
          aria-label="Pagination"
        >
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="page <= 1"
            @click="goPage(page - 1)"
          >
            ‹
          </button>
          <template
            v-for="(p, i) in pagesToShow"
            :key="i"
          >
            <span
              v-if="p === 'ellipsis'"
              class="px-2 text-slate-400"
            >…</span>
            <button
              v-else
              type="button"
              :class="[
                'min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-bold transition',
                p === page
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              ]"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="page >= lastPage"
            @click="goPage(page + 1)"
          >
            ›
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>
