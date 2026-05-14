<script setup lang="ts">
import { computed } from 'vue'
import type { Event, Participant } from '~/types'
import type { TicketType } from '~/stores/ticket_types'

const props = withDefaults(
  defineProps<{
    event: Event
    participants: Participant[]
    ticketTypes: TicketType[]
    loadingRegistrations?: boolean
  }>(),
  { loadingRegistrations: false }
)

const revenueFromAttendees = computed(() =>
  props.participants.reduce((sum, p) => {
    const ps = p.ticket.payment_status
    if (ps === 'completed' || ps === 'free')
      return sum + (Number(p.ticket.price) || 0)
    return sum
  }, 0)
)

const currency = computed(() => {
  const fromParticipant = props.participants[0]?.ticket.currency
  const fromTypes = props.ticketTypes[0]?.currency
  return (fromParticipant || fromTypes || 'USD').toUpperCase()
})

function formatMoney(amount: number, cur: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount)
  }
  catch {
    return `${amount} ${cur}`
  }
}

const checkInRate = computed(() => {
  const n = props.participants.length
  if (!n)
    return 0
  const ok = props.participants.filter(p => p.status === 'checked_in').length
  return Math.round((ok / n) * 100)
})

const ticketMix = computed(() => {
  const map = new Map<string, number>()
  for (const p of props.participants) {
    const name = p.ticket.ticket_type.name
    map.set(name, (map.get(name) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

const pendingPayments = computed(() =>
  props.participants.filter(p => p.ticket.payment_status === 'pending').length
)

const revenueReported = computed(() => props.event.revenue_total ?? null)
</script>

<template>
  <div class="space-y-8 text-[#0a1120] dark:text-slate-100">
    <header class="space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
        Insights
      </p>
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Event analytics
      </h2>
      <p class="max-w-xl text-sm text-slate-600 dark:text-slate-400">
        Snapshot of registrations, revenue signals, and check-in momentum for this event.
      </p>
    </header>

    <div
      v-if="loadingRegistrations && !participants.length"
      class="py-12"
    >
      <LoadingState text="Loading registration data..." />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total attendees
        </p>
        <p class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
          {{ participants.length.toLocaleString() }}
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Rows derived from ticket registrations
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Check-in rate
        </p>
        <p class="mt-2 text-3xl font-extrabold text-primary-600 dark:text-primary-400">
          {{ checkInRate }}%
        </p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-primary-500 transition-all"
            :style="{ width: `${checkInRate}%` }"
          />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Revenue (from attendees)
        </p>
        <p class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
          {{ formatMoney(revenueFromAttendees, currency) }}
        </p>
        <p
          v-if="revenueReported != null"
          class="mt-1 text-xs text-slate-500 dark:text-slate-400"
        >
          Event total field: {{ formatMoney(Number(revenueReported), currency) }}
        </p>
        <p
          v-else
          class="mt-1 text-xs text-slate-500 dark:text-slate-400"
        >
          Paid & free completions only
        </p>
      </div>

      <div class="rounded-2xl border border-primary-500/30 bg-primary-500/10 p-6 shadow-inner dark:bg-primary-950/30">
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary-800 dark:text-primary-200">
          Attention
        </p>
        <p class="mt-2 text-2xl font-extrabold text-primary-900 dark:text-primary-100">
          {{ pendingPayments }}
        </p>
        <p class="mt-1 text-xs font-medium text-primary-800/80 dark:text-primary-200/90">
          Pending payment rows (by ticket status)
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900">
        <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
          Ticket mix
        </h3>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Distribution across purchased ticket types.
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="[name, count] in ticketMix"
            :key="name"
            class="flex items-center justify-between gap-3 rounded-xl bg-[#e8efff]/40 px-4 py-3 dark:bg-slate-800/60"
          >
            <span class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ name }}</span>
            <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ count }}</span>
          </li>
          <li
            v-if="!ticketMix.length"
            class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            No registrations yet — analytics will populate after the first booking.
          </li>
        </ul>
      </div>

      <div class="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-primary-500/5 dark:border-slate-800 dark:bg-slate-900">
        <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
          Capacity context
        </h3>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Capacity
            </dt>
            <dd class="font-bold text-slate-900 dark:text-white">
              {{ (event.capacity ?? 0).toLocaleString() }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Registered (event)
            </dt>
            <dd class="font-bold text-slate-900 dark:text-white">
              {{ (event.registered_count ?? 0).toLocaleString() }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Orders (event)
            </dt>
            <dd class="font-bold text-slate-900 dark:text-white">
              {{ (event.order_count ?? 0).toLocaleString() }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
