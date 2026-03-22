<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const notifications = useNotifications()
const config = useRuntimeConfig()
const brand = computed(() => config.public.appName || 'KaribuDirect')

type TxType = 'SALE' | 'PAYOUT' | 'REFUND'
type TxStatus = 'completed' | 'pending' | 'failed'

interface Transaction {
  id: string
  entity: string
  entityInitials: string
  date: string
  type: TxType
  amount: number
  status: TxStatus
}

const rangePreset = ref<'oct23' | 'nov23' | 'q4'>('oct23')
const rangeLabel = computed(() => {
  if (rangePreset.value === 'oct23') return 'Oct 1, 2023 – Oct 31, 2023'
  if (rangePreset.value === 'nov23') return 'Nov 1, 2023 – Nov 30, 2023'
  return 'Oct 1, 2023 – Dec 31, 2023'
})

const filterType = ref<'all' | TxType>('all')
const filterStatus = ref<'all' | TxStatus>('all')

const allTransactions: Transaction[] = [
  { id: 'TXN-8F2A-991', entity: 'Neon Underground LLC', entityInitials: 'NU', date: '2023-10-28T14:22:00', type: 'SALE', amount: 4820, status: 'completed' },
  { id: 'TXN-7B1C-442', entity: 'Summit Events Co.', entityInitials: 'SE', date: '2023-10-27T09:15:00', type: 'PAYOUT', amount: -12000, status: 'pending' },
  { id: 'TXN-3D9E-118', entity: 'Urban Pulse Media', entityInitials: 'UP', date: '2023-10-26T18:40:00', type: 'SALE', amount: 1299.5, status: 'completed' },
  { id: 'TXN-1A2B-773', entity: 'Harbor Lights Ent.', entityInitials: 'HL', date: '2023-10-25T11:05:00', type: 'PAYOUT', amount: -8400, status: 'failed' },
  { id: 'TXN-9C4D-220', entity: 'Metro Arts Collective', entityInitials: 'MA', date: '2023-10-24T16:30:00', type: 'REFUND', amount: -215, status: 'completed' },
  { id: 'TXN-5E6F-881', entity: 'Electric Pulse Ent.', entityInitials: 'EP', date: '2023-10-23T10:00:00', type: 'SALE', amount: 34210, status: 'completed' },
  { id: 'TXN-2G8H-334', entity: 'Coastal Tickets Ltd', entityInitials: 'CT', date: '2023-10-22T13:45:00', type: 'SALE', amount: 1890, status: 'pending' },
  { id: 'TXN-4I0J-556', entity: 'Nightwave Promotions', entityInitials: 'NW', date: '2023-10-21T08:20:00', type: 'PAYOUT', amount: -5000, status: 'completed' }
]

const page = ref(1)
const perPage = 4
/** Representative platform total for footer copy (demo). */
const platformTxTotal = 1240

const filteredTx = computed(() => {
  return allTransactions.filter((t) => {
    if (filterType.value !== 'all' && t.type !== filterType.value) return false
    if (filterStatus.value !== 'all' && t.status !== filterStatus.value) return false
    return true
  })
})

const pagedTransactions = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredTx.value.slice(start, start + perPage)
})

const lastPage = computed(() => Math.max(1, Math.ceil(filteredTx.value.length / perPage)))

watch([filterType, filterStatus], () => {
  page.value = 1
})

function formatMoney(n: number): string {
  const abs = Math.abs(n)
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? `-$${s}` : `$${s}`
}

function formatTxDate(iso: string): string {
  try {
    return format(new Date(iso), 'MMM d, yyyy · h:mm a')
  }
  catch {
    return iso
  }
}

function typeBadge(t: TxType): { label: string; class: string } {
  if (t === 'SALE') return { label: 'SALE', class: 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300' }
  if (t === 'PAYOUT') return { label: 'PAYOUT', class: 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300' }
  return { label: 'REFUND', class: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' }
}

function statusDisplay(s: TxStatus): { label: string; dot: string; pill: string } {
  if (s === 'completed') {
    return { label: 'Completed', dot: 'bg-emerald-500', pill: 'text-emerald-700 dark:text-emerald-400' }
  }
  if (s === 'pending') {
    return { label: 'Pending', dot: 'bg-amber-500', pill: 'text-amber-700 dark:text-amber-400' }
  }
  return { label: 'Failed', dot: 'bg-rose-500', pill: 'text-rose-700 dark:text-rose-400' }
}

const commissionTarget = 30000
const commissionCurrent = 24147.5
const commissionPercent = computed(() => Math.min(100, (commissionCurrent / commissionTarget) * 100))

function visiblePages(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const out: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (p === 'ellipsis' && out[out.length - 1] === 'ellipsis') return
    out.push(p)
  }
  push(1)
  if (current > 3) push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) push(i)
  if (current < last - 2) push('ellipsis')
  push(last)
  return out
}

const pagesToShow = computed(() => visiblePages(page.value, lastPage.value))

function exportCsv() {
  const headers = ['Transaction ID', 'Entity', 'Date', 'Type', 'Amount', 'Status']
  const rows = pagedTransactions.value.map(t => [
    t.id,
    t.entity,
    t.date,
    t.type,
    String(t.amount),
    t.status
  ])
  const esc = (c: string) => `"${c.replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `financial-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notifications.success({ title: 'Export ready', description: 'CSV download started.' })
}

const openMenuId = ref<string | null>(null)

function closeMenu() {
  openMenuId.value = null
}

onMounted(() => {
  window.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenu)
})
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Financial reports
        </h1>
        <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Oversee all platform revenue streams and transaction integrity.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <select
            v-model="rangePreset"
            class="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-bold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="oct23">
              Oct 2023
            </option>
            <option value="nov23">
              Nov 2023
            </option>
            <option value="q4">
              Q4 2023
            </option>
          </select>
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
            />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <svg
            class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <span class="hidden text-xs font-semibold text-slate-500 sm:inline">{{ rangeLabel }}</span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          @click="exportCsv"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line
              x1="12"
              x2="12"
              y1="15"
              y2="3"
            />
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total revenue
            </p>
            <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              $482,950.00
            </p>
            <p class="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              +12.5% vs last month
            </p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Pending payouts
            </p>
            <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              $64,210.45
            </p>
            <p class="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              24 requests · Requires approval
            </p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
              <circle
                cx="12"
                cy="12"
                r="4"
              />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-2xl bg-primary-600 p-6 text-white shadow-lg shadow-primary-600/25 dark:bg-primary-700">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wide text-white/80">
              Platform commission
            </p>
            <p class="mt-2 text-3xl font-bold tracking-tight">
              $24,147.50
            </p>
            <p class="mt-2 text-xs font-semibold text-white/85">
              Target: $30k ({{ commissionPercent.toFixed(1) }}%)
            </p>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
              <div
                class="h-full rounded-full bg-white transition-all"
                :style="{ width: `${commissionPercent}%` }"
              />
            </div>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 2 1 3 1 3s-1 1.5-1 3c0 3.5 3.5 7 8 7 5 0 8-3.5 8-7 0-1.5-.5-2.5-1-3s1-1 1-3z" />
              <path d="M9.1 9a3 3 0 0 0 5.82 1c0-2-3-3-3-3" />
              <path d="M12 13h.01" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Recent transactions
        </h2>
        <div class="flex flex-wrap gap-2">
          <select
            v-model="filterType"
            class="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">
              Filter: All types
            </option>
            <option value="SALE">
              Sale
            </option>
            <option value="PAYOUT">
              Payout
            </option>
            <option value="REFUND">
              Refund
            </option>
          </select>
          <select
            v-model="filterStatus"
            class="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">
              Filter: Status
            </option>
            <option value="completed">
              Completed
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="failed">
              Failed
            </option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-[960px] w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/90 dark:bg-slate-800/50">
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Transaction ID
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Entity
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Type
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Amount
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th class="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedTransactions.length === 0">
              <td
                colspan="7"
                class="px-5 py-12 text-center text-sm font-medium text-slate-500"
              >
                No transactions match these filters.
              </td>
            </tr>
            <tr
              v-for="(t, i) in pagedTransactions"
              v-else
              :key="t.id"
              :class="[
                'border-t border-slate-100 dark:border-slate-800',
                i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/80'
              ]"
            >
              <td class="px-5 py-4 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                {{ t.id }}
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {{ t.entityInitials }}
                  </div>
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ t.entity }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {{ formatTxDate(t.date) }}
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  :class="typeBadge(t.type).class"
                >
                  {{ typeBadge(t.type).label }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm font-bold tabular-nums"
                  :class="t.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
              >
                {{ formatMoney(t.amount) }}
              </td>
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1.5 text-xs font-bold"
                      :class="statusDisplay(t.status).pill"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="statusDisplay(t.status).dot"
                  />
                  {{ statusDisplay(t.status).label }}
                </span>
              </td>
              <td class="relative px-5 py-4 text-right">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Actions"
                  @click.stop="openMenuId = openMenuId === t.id ? null : t.id"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="5"
                      r="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="2"
                    />
                    <circle
                      cx="12"
                      cy="19"
                      r="2"
                    />
                  </svg>
                </button>
                <div
                  v-if="openMenuId === t.id"
                  class="absolute right-4 top-full z-[60] mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  @click.stop
                >
                  <button
                    type="button"
                    class="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    @click="openMenuId = null; notifications.info({ title: 'Receipt', description: 'Download coming soon.' })"
                  >
                    View receipt
                  </button>
                  <button
                    type="button"
                    class="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    @click="openMenuId = null"
                  >
                    Flag review
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Showing {{ filteredTx.length === 0 ? 0 : (page - 1) * perPage + 1 }} to {{ Math.min(page * perPage, filteredTx.length) }} of {{ platformTxTotal.toLocaleString() }} transactions
        </p>
        <nav
          class="flex flex-wrap items-center justify-center gap-1"
          aria-label="Pagination"
        >
          <button
            type="button"
            class="rounded-lg px-2 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="page <= 1"
            @click="page = Math.max(1, page - 1)"
          >
            ‹
          </button>
          <template
            v-for="(p, idx) in pagesToShow"
            :key="idx"
          >
            <span
              v-if="p === 'ellipsis'"
              class="px-2 text-slate-400"
            >…</span>
            <button
              v-else
              type="button"
              :class="[
                'min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-bold',
                p === page
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              ]"
              @click="page = p"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="rounded-lg px-2 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="page >= lastPage"
            @click="page = Math.min(lastPage, page + 1)"
          >
            ›
          </button>
        </nav>
      </div>
    </div>

    <!-- Page footer -->
    <footer class="border-t border-slate-200/80 pt-8 dark:border-slate-800">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          © {{ new Date().getFullYear() }} {{ brand.toUpperCase() }} BACKOFFICE. ALL TRANSACTIONS ARE PCI-DSS COMPLIANT.
        </p>
        <div class="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <a
            href="#"
            class="hover:text-primary-600 dark:hover:text-primary-400"
            @click.prevent="notifications.info({ title: 'Privacy protocol', description: 'Documentation link TBD.' })"
          >Privacy protocol</a>
          <a
            href="#"
            class="hover:text-primary-600 dark:hover:text-primary-400"
            @click.prevent="notifications.success({ title: 'System status', description: 'All services operational.' })"
          >System status</a>
        </div>
      </div>
    </footer>
  </div>
</template>
