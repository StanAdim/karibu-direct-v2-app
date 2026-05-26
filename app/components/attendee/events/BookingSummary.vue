<script setup lang="ts">
import { computed } from 'vue'
import type { TicketType } from '~/types'

interface SummaryLine {
  ticket_type_id: string
  quantity: number
}

interface Props {
  lines: SummaryLine[]
  typesById: Map<string, TicketType>
  feeNote?: string
  dense?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  feeNote: 'Fees are confirmed at checkout. Inventory is reserved while you pay.',
  dense: false,
})

function formatMoney(amount: number, currency: string): string {
  if (amount <= 0) return 'Free'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'TZS' }).format(amount)
  }
  catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

const currency = computed(() => {
  for (const line of props.lines) {
    const tt = props.typesById.get(line.ticket_type_id)
    if (tt) return tt.currency || 'TZS'
  }
  return 'TZS'
})

const paidSubtotal = computed(() => {
  let sum = 0
  for (const line of props.lines) {
    const tt = props.typesById.get(line.ticket_type_id)
    if (!tt || Number(tt.price) <= 0) continue
    sum += Number(tt.price) * line.quantity
  }
  return sum
})

const hasPaid = computed(() => paidSubtotal.value > 0)
</script>

<template>
  <div
    :class="[
      'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
      dense ? 'p-3 space-y-2' : 'p-4 space-y-3',
    ]"
  >
    <div class="flex items-center justify-between">
      <h3 :class="dense ? 'text-xs font-bold' : 'text-sm font-bold'" class="text-slate-900 dark:text-white">
        Order summary
      </h3>
      <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Live total
      </span>
    </div>
    <ul class="space-y-2">
      <li v-for="line in lines" :key="line.ticket_type_id" class="flex justify-between gap-3 text-sm">
        <span class="text-slate-600 dark:text-slate-400 min-w-0">
          <span class="font-semibold text-slate-900 dark:text-white">{{ line.quantity }}×</span>
          {{ typesById.get(line.ticket_type_id)?.name || 'Ticket' }}
        </span>
        <span class="tabular-nums font-semibold text-slate-900 dark:text-white shrink-0">
          {{
            formatMoney(
              Number(typesById.get(line.ticket_type_id)?.price ?? 0) * line.quantity,
              typesById.get(line.ticket_type_id)?.currency || currency,
            )
          }}
        </span>
      </li>
    </ul>
    <div class="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
      <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white">
        <span>{{ hasPaid ? 'Subtotal' : 'Total' }}</span>
        <span class="tabular-nums">{{ formatMoney(paidSubtotal, currency) }}</span>
      </div>
      <p v-if="hasPaid" class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        {{ feeNote }}
      </p>
    </div>
  </div>
</template>
