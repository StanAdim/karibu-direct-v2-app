<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Participant } from '~/types'
import { getParticipantFullName } from '~/types'
import AppButton from '~/components/ui/AppButton.vue'
import AppAvatar from '~/components/common/AppAvatar.vue'

const props = withDefaults(
  defineProps<{
    participants: Participant[]
    /** Shown in hero (e.g. event title). */
    eventTitle?: string
    eventCapacity?: number
    eventRegistered?: number
  }>(),
  {
    eventTitle: '',
    eventCapacity: undefined,
    eventRegistered: undefined
  }
)

const notifications = useNotifications()

const searchQuery = ref('')
const selectedTicketTypeId = ref<string>('all')
const selectedPayment = ref<'all' | 'paid' | 'pending' | 'other'>('all')
const currentPage = ref(1)
const pageSize = 10
const openMenuId = ref<string | null>(null)

function closeMenus() {
  openMenuId.value = null
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('[data-attendee-menu-root]')) {
    closeMenus()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const ticketTypeOptions = computed(() => {
  const map = new Map<string, string>()
  for (const p of props.participants) {
    const id = p.ticket.ticket_type.id
    if (!map.has(id)) {
      map.set(id, p.ticket.ticket_type.name)
    }
  }
  return [
    { value: 'all', label: 'All Categories' },
    ...[...map.entries()].map(([value, label]) => ({ value, label }))
  ]
})

function matchesPayment(p: Participant): boolean {
  if (selectedPayment.value === 'all') return true
  const ps = p.ticket.payment_status
  if (selectedPayment.value === 'paid') {
    return ps === 'completed' || ps === 'free'
  }
  if (selectedPayment.value === 'pending') {
    return ps === 'pending'
  }
  return ps !== 'completed' && ps !== 'free' && ps !== 'pending'
}

const filteredParticipants = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return props.participants.filter((p) => {
    const matchesSearch =
      !q
      || getParticipantFullName(p).toLowerCase().includes(q)
      || p.email.toLowerCase().includes(q)
      || p.ticket.ticket_number.toLowerCase().includes(q)

    const matchesTicket =
      selectedTicketTypeId.value === 'all'
      || p.ticket.ticket_type.id === selectedTicketTypeId.value

    return matchesSearch && matchesTicket && matchesPayment(p)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredParticipants.value.length / pageSize))
)

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredParticipants.value.slice(start, start + pageSize)
})

watch(
  () => filteredParticipants.value.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }
)

watch(
  [searchQuery, selectedTicketTypeId, selectedPayment],
  () => {
    currentPage.value = 1
  }
)

const stats = computed(() => {
  const total = props.participants.length
  const checkedIn = props.participants.filter(p => p.status === 'checked_in').length
  const rate = total ? Math.round((checkedIn / total) * 100) : 0
  return { total, checkedIn, rate }
})

const vipParticipants = computed(() =>
  props.participants.filter(p => /vip/i.test(p.ticket.ticket_type.name))
)

const vipRemaining = computed(() =>
  vipParticipants.value.filter(p => p.status !== 'checked_in').length
)

const vipTotalSold = computed(() => vipParticipants.value.length)

const revenueTotal = computed(() =>
  props.participants.reduce((sum, p) => {
    const ps = p.ticket.payment_status
    if (ps === 'completed' || ps === 'free') {
      return sum + (Number(p.ticket.price) || 0)
    }
    return sum
  }, 0)
)

const primaryCurrency = computed(() => {
  const p = props.participants[0]
  return p?.ticket.currency?.toUpperCase() || 'USD'
})

function formatCompactRevenue(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount)
}

const goalReached = computed(() => {
  const cap = props.eventCapacity
  const reg = props.eventRegistered
  if (cap == null || reg == null || cap <= 0) return false
  return reg >= cap * 0.95
})

function ticketBadgeClass(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('vip')) {
    return 'bg-[#fad8fd] text-[#28132e] dark:bg-fuchsia-950/40 dark:text-fuchsia-200'
  }
  if (n.includes('early')) {
    return 'bg-primary-500/15 text-[#001a40] dark:bg-primary-400/20 dark:text-primary-200'
  }
  return 'bg-[#e8efff] text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

function paymentDisplay(p: Participant): { dot: string; label: string; labelClass: string } {
  const ps = p.ticket.payment_status
  if (ps === 'completed' || ps === 'free') {
    return { dot: 'bg-emerald-500', label: 'Paid', labelClass: 'text-emerald-600 dark:text-emerald-400' }
  }
  if (ps === 'pending') {
    return { dot: 'bg-amber-500', label: 'Pending', labelClass: 'text-amber-600 dark:text-amber-400' }
  }
  if (ps === 'failed') {
    return { dot: 'bg-red-500', label: 'Failed', labelClass: 'text-red-600 dark:text-red-400' }
  }
  if (ps === 'refunded') {
    return { dot: 'bg-slate-400', label: 'Refunded', labelClass: 'text-slate-500 dark:text-slate-400' }
  }
  return { dot: 'bg-slate-400', label: ps, labelClass: 'text-slate-600 dark:text-slate-400' }
}

function isCheckedIn(p: Participant): boolean {
  return p.status === 'checked_in'
}

function participantDisplayId(p: Participant): string {
  const raw = p.ticket.ticket_number || p.id
  const short = raw.slice(-6).toUpperCase()
  return `#${short}`
}

function goPage(p: number) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value)
}

async function copyEmail(email: string) {
  closeMenus()
  try {
    await navigator.clipboard.writeText(email)
    notifications.success('Email copied')
  }
  catch {
    notifications.error('Could not copy email')
  }
}

function exportCsv() {
  const rows = filteredParticipants.value
  const headers = [
    'Name',
    'Email',
    'Ticket Type',
    'Ticket Number',
    'Payment',
    'Participant Status',
    'Checked In'
  ]
  const lines = [
    headers.join(','),
    ...rows.map((p) => {
      const pay = paymentDisplay(p)
      const cells = [
        `"${getParticipantFullName(p).replace(/"/g, '""')}"`,
        `"${p.email.replace(/"/g, '""')}"`,
        `"${p.ticket.ticket_type.name.replace(/"/g, '""')}"`,
        `"${p.ticket.ticket_number.replace(/"/g, '""')}"`,
        `"${pay.label}"`,
        `"${p.status}"`,
        `"${isCheckedIn(p) ? 'Yes' : 'No'}"`
      ]
      return cells.join(',')
    })
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendees-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notifications.success('CSV exported')
}
</script>

<template>
  <div class="space-y-8 text-[#0a1120] dark:text-slate-100">
    <!-- Hero -->
    <section class="space-y-2">
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {{ eventTitle || 'Attendee list' }}
      </h2>
      <p class="font-medium text-slate-600 dark:text-slate-400">
        Manage your guest list and track real-time check-ins.
      </p>
    </section>

    <!-- Search + export row -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative max-w-xl flex-1">
        <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search attendees, tickets, or orders..."
          class="w-full rounded-full border-0 bg-[#e8efff]/90 py-2.5 pl-12 pr-4 text-sm text-slate-900 shadow-inner outline-none ring-1 ring-slate-200/60 placeholder:text-slate-500/70 focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800/90 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500"
          autocomplete="off"
        >
      </div>
      <AppButton
        icon="download"
        class="shrink-0 self-start !rounded-full !px-6 !py-2.5 !text-sm !font-bold !shadow-xl !shadow-primary-500/20"
        @click="exportCsv"
      >
        Export CSV
      </AppButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-3">
        <div
          class="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ticket:</span>
          <select
            v-model="selectedTicketTypeId"
            class="cursor-pointer border-0 bg-transparent text-sm font-bold text-slate-900 focus:ring-0 dark:text-white"
          >
            <option
              v-for="opt in ticketTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div
          class="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status:</span>
          <select
            v-model="selectedPayment"
            class="cursor-pointer border-0 bg-transparent text-sm font-bold text-slate-900 focus:ring-0 dark:text-white"
          >
            <option value="all">
              Any status
            </option>
            <option value="paid">
              Paid
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="other">
              Other
            </option>
          </select>
        </div>
      </div>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ filteredParticipants.length.toLocaleString() }}</span>
        attendees
      </p>
    </div>

    <!-- Table -->
    <div
      class="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead class="bg-[#e8efff]/50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-8">
                Name
              </th>
              <th class="px-4 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Email
              </th>
              <th class="px-4 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Ticket type
              </th>
              <th class="px-4 py-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6">
                Payment
              </th>
              <th
                class="px-4 py-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-6"
              >
                Check-in
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:px-8"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="filteredParticipants.length === 0">
              <tr>
                <td
                  colspan="6"
                  class="px-8 py-14 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No attendees match your filters.
                </td>
              </tr>
            </template>
            <tr
              v-for="p in paginatedParticipants"
              v-else
              :key="p.id"
              class="group transition-colors hover:bg-primary-500/5"
            >
              <td class="px-6 py-4 sm:px-8">
                <div class="flex items-center gap-3">
                  <AppAvatar
                    :src="p.user?.avatar ?? null"
                    :alt="getParticipantFullName(p)"
                    size="md"
                    class="shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ getParticipantFullName(p) }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      ID: {{ participantDisplayId(p) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="max-w-[200px] truncate px-4 py-4 text-sm text-slate-600 dark:text-slate-400 sm:px-6">
                {{ p.email }}
              </td>
              <td class="px-4 py-4 sm:px-6">
                <span
                  class="inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-tight"
                  :class="ticketBadgeClass(p.ticket.ticket_type.name)"
                >
                  {{ p.ticket.ticket_type.name }}
                </span>
              </td>
              <td class="px-4 py-4 sm:px-6">
                <div class="flex items-center gap-2">
                  <div
                    class="h-2 w-2 shrink-0 rounded-full"
                    :class="paymentDisplay(p).dot"
                  />
                  <span
                    class="text-sm font-semibold"
                    :class="paymentDisplay(p).labelClass"
                  >
                    {{ paymentDisplay(p).label }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 text-center sm:px-6">
                <div class="flex justify-center">
                  <span
                    v-if="isCheckedIn(p)"
                    class="material-symbols-outlined text-emerald-500"
                    style="font-variation-settings: 'FILL' 1"
                  >check_circle</span>
                  <span
                    v-else
                    class="material-symbols-outlined text-slate-300 dark:text-slate-600"
                    style="font-variation-settings: 'wght' 200"
                  >circle</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right sm:px-8">
                <div
                  data-attendee-menu-root
                  class="relative inline-flex justify-end"
                >
                  <button
                    type="button"
                    class="rounded-full p-2 text-slate-400 opacity-0 transition-opacity hover:bg-[#e8efff] group-hover:opacity-100 dark:hover:bg-slate-800"
                    aria-label="Row actions"
                    @click.stop="openMenuId = openMenuId === p.id ? null : p.id"
                  >
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                  <div
                    v-if="openMenuId === p.id"
                    class="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    role="menu"
                    @click.stop
                  >
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-[#e8efff] dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="copyEmail(p.email)"
                    >
                      Copy email
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredParticipants.length > 0"
        class="flex flex-col gap-4 border-t border-slate-200/60 bg-[#e8efff]/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-slate-800 dark:bg-slate-800/30"
      >
        <span class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200/80 p-2 transition-colors hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
            :disabled="currentPage <= 1"
            aria-label="Previous page"
            @click="goPage(currentPage - 1)"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200/80 p-2 transition-colors hover:bg-[#e8efff] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
            :disabled="currentPage >= totalPages"
            aria-label="Next page"
            @click="goPage(currentPage + 1)"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats bento -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        class="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Check-in rate
        </p>
        <div class="flex flex-wrap items-baseline gap-2">
          <h4 class="text-3xl font-extrabold text-primary-500">
            {{ stats.rate }}%
          </h4>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {{ stats.checkedIn }} of {{ stats.total }} in
          </span>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          VIP remaining
        </p>
        <div class="flex flex-wrap items-baseline gap-2">
          <h4 class="text-3xl font-extrabold text-[#7b2f86] dark:text-fuchsia-300">
            {{ vipTotalSold ? vipRemaining : '—' }}
          </h4>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
            <template v-if="vipTotalSold">
              of {{ vipTotalSold }} VIP
            </template>
            <template v-else>
              No VIP tickets
            </template>
          </span>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900"
      >
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Revenue
        </p>
        <div class="flex flex-wrap items-baseline gap-2">
          <h4 class="text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ formatCompactRevenue(revenueTotal, primaryCurrency) }}
          </h4>
          <span
            class="text-xs font-bold"
            :class="goalReached ? 'text-primary-500' : 'text-slate-500 dark:text-slate-400'"
          >
            {{ goalReached ? 'Goal reached' : 'Paid registrations' }}
          </span>
        </div>
      </div>

      <div
        class="flex flex-col justify-center rounded-3xl bg-primary-500 p-6 text-white shadow-xl shadow-primary-500/20"
      >
        <p class="mb-1 text-xs font-bold uppercase tracking-widest text-white/80">
          Live update
        </p>
        <p class="text-sm font-bold">
          Scanning active
        </p>
        <div class="mt-2 flex items-center gap-1">
          <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        </div>
      </div>
    </div>
  </div>
</template>
