<script setup lang="ts">
export interface OverviewTicketRow {
  id: string
  name: string
  price: number
  currency: string
  quantity: number
  sold_count: number
  status: string
}

defineProps<{
  tickets: OverviewTicketRow[]
}>()

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(amount)
  }
  catch {
    return `${amount} ${currency}`
  }
}

function statusClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'available')
    return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
  if (s === 'sold_out')
    return 'bg-amber-500/15 text-amber-900 dark:text-amber-200'
  if (s === 'expired')
    return 'bg-gray-200/90 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  if (s === 'hidden' || s === 'unavailable')
    return 'bg-gray-200/90 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  return 'bg-gray-200/90 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}
</script>

<template>
  <article class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <header class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Ticket types
      </h3>
      <AppLucideIcon name="i-lucide-ticket" class="h-4 w-4 text-on-surface-variant/70" />
    </header>

    <div
      v-if="!tickets.length"
      class="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-on-surface-variant dark:border-gray-700"
    >
      No ticket types configured yet.
    </div>

    <!-- Desktop table -->
    <div
      v-else
      class="hidden overflow-x-auto md:block"
    >
      <table class="w-full min-w-[520px] text-left text-xs">
        <thead>
          <tr class="border-b border-gray-200 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant dark:border-gray-800">
            <th class="pb-2 pr-3 font-semibold">
              Name
            </th>
            <th class="pb-2 pr-3 font-semibold">
              Price
            </th>
            <th class="pb-2 pr-3 font-semibold">
              Qty
            </th>
            <th class="pb-2 pr-3 font-semibold">
              Sold
            </th>
            <th class="pb-2 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="tt in tickets"
            :key="tt.id"
            class="text-on-surface"
          >
            <td class="max-w-[180px] truncate py-2 pr-3 font-medium">
              {{ tt.name }}
            </td>
            <td class="py-2 pr-3 tabular-nums">
              {{ formatMoney(tt.price, tt.currency) }}
            </td>
            <td class="py-2 pr-3 tabular-nums">
              {{ tt.quantity.toLocaleString() }}
            </td>
            <td class="py-2 pr-3 tabular-nums">
              {{ tt.sold_count.toLocaleString() }}
            </td>
            <td class="py-2">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                :class="statusClass(tt.status)"
              >
                {{ tt.status.replace(/_/g, ' ') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <ul
      v-if="tickets.length"
      class="space-y-2 md:hidden"
    >
      <li
        v-for="tt in tickets"
        :key="tt.id"
        class="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-950/50"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-on-surface">
            {{ tt.name }}
          </p>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
            :class="statusClass(tt.status)"
          >
            {{ tt.status.replace(/_/g, ' ') }}
          </span>
        </div>
        <div class="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <p class="text-on-surface-variant">
              Price
            </p>
            <p class="font-medium tabular-nums text-on-surface">
              {{ formatMoney(tt.price, tt.currency) }}
            </p>
          </div>
          <div>
            <p class="text-on-surface-variant">
              Qty
            </p>
            <p class="font-medium tabular-nums text-on-surface">
              {{ tt.quantity.toLocaleString() }}
            </p>
          </div>
          <div>
            <p class="text-on-surface-variant">
              Sold
            </p>
            <p class="font-medium tabular-nums text-on-surface">
              {{ tt.sold_count.toLocaleString() }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </article>
</template>
