<script setup lang="ts">
import type { TicketType } from '~/types'
import TicketQuantitySelector from '~/components/attendee/events/TicketQuantitySelector.vue'

interface Props {
  ticket: TicketType
  quantity: number
  maxQuantity: number
  disabled?: boolean
  statusNote?: string | null
}

defineProps<Props>()

defineEmits<{
  'update:quantity': [value: number]
}>()

function formatMoney(amount: number, currency: string): string {
  if (amount <= 0) return 'Free'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'TZS' }).format(amount)
  }
  catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

function formatSalesWindow(start: string, end: string): string {
  const a = new Date(start)
  const b = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  return `${a.toLocaleString(undefined, opts)} – ${b.toLocaleString(undefined, opts)}`
}
</script>

<template>
  <div
    class="rounded-2xl border p-4 transition-all"
    :class="[
      disabled
        ? 'border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 opacity-90'
        : quantity > 0
          ? 'border-primary-500 ring-1 ring-primary-500/25 bg-primary-500/[0.06]'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500/40'
    ]"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <h4 class="font-bold text-slate-900 dark:text-white truncate">
            {{ ticket.name }}
          </h4>
          <span
            v-if="Number(ticket.price) <= 0"
            class="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
          >
            Free
          </span>
          <span
            v-else
            class="rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
          >
            Paid
          </span>
        </div>
        <p v-if="ticket.description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {{ ticket.description }}
        </p>
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Sales: {{ formatSalesWindow(ticket.sales_start, ticket.sales_end) }}</span>
          <span>Max / order: {{ ticket.max_per_order }}</span>
        </div>
        <p v-if="statusNote" class="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {{ statusNote }}
        </p>
      </div>
      <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
        <p class="text-lg font-black tabular-nums text-slate-900 dark:text-white">
          {{ formatMoney(Number(ticket.price), ticket.currency) }}
        </p>
        <TicketQuantitySelector
          :model-value="quantity"
          :max="maxQuantity"
          :disabled="disabled"
          @update:model-value="$emit('update:quantity', $event)"
        />
      </div>
    </div>
  </div>
</template>
