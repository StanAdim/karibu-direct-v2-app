<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

type TicketMetric = {
  id: string
  label: string
  value: string
  helper: string
  trend?: string
}

type TicketFilterOption = {
  label: string
  value: string
}

type TicketTransaction = {
  id: string
  date: string
  time: string
  customer: string
  email: string
  initials: string
  ticketType: string
  method: string
  price: string
}

const metrics = ref<TicketMetric[]>([
  {
    id: 'gross',
    label: 'Gross Revenue',
    value: '$48,290.00',
    helper: 'Before fees & refunds',
    trend: '+12.4%'
  },
  {
    id: 'net',
    label: 'Net Revenue',
    value: '$41,540.00',
    helper: 'After fees & refunds',
    trend: '+8.2%'
  },
  {
    id: 'sold',
    label: 'Tickets Sold',
    value: '1,428',
    helper: 'Target: 2,000'
  }
])

const dateRanges: TicketFilterOption[] = [
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'This Month', value: 'month' }
]

const eventFilters: TicketFilterOption[] = [
  { label: 'All Events', value: 'all' },
  { label: 'Neon Pulse: Underground Techno Night', value: 'neon-pulse' },
  { label: 'Digital Horizon Summit 2025', value: 'digital-horizon' }
]

const ticketTypeFilters: TicketFilterOption[] = [
  { label: 'All Ticket Types', value: 'all' },
  { label: 'VIP Access', value: 'vip' },
  { label: 'General Admission', value: 'general' },
  { label: 'Early Bird', value: 'early-bird' }
]

const selectedDateRange = ref(dateRanges[0].value)
const selectedEventFilter = ref(eventFilters[0].value)
const selectedTicketTypeFilter = ref(ticketTypeFilters[0].value)

const transactions = ref<TicketTransaction[]>([
  {
    id: '1',
    date: 'Oct 24, 2024',
    time: '14:22 PM',
    customer: 'Jameson Dunhill',
    email: 'j.dunhill@example.com',
    initials: 'JD',
    ticketType: 'VIP Access',
    method: 'Card (•••• 4421)',
    price: '$250.00'
  },
  {
    id: '2',
    date: 'Oct 24, 2024',
    time: '13:05 PM',
    customer: 'Mila Kunis',
    email: 'mila.k@work.co',
    initials: 'MK',
    ticketType: 'Gen. Admission',
    method: 'Mobile Money',
    price: '$85.00'
  },
  {
    id: '3',
    date: 'Oct 23, 2024',
    time: '18:45 PM',
    customer: 'Robert Watson',
    email: 'robert.wd@domain.com',
    initials: 'RW',
    ticketType: 'Early Bird',
    method: 'Card (•••• 0019)',
    price: '$65.00'
  },
  {
    id: '4',
    date: 'Oct 23, 2024',
    time: '09:12 AM',
    customer: 'Sarah Lo',
    email: 's.lo@studio.io',
    initials: 'SL',
    ticketType: 'VIP Access',
    method: 'Mobile Money',
    price: '$250.00'
  }
])
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ticket Sales
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Real-time revenue and transaction overview across your events.
        </p>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <span class="material-symbols-outlined text-sm">file_download</span>
          Export Report
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          New Transaction
        </button>
      </div>
    </div>

    <!-- Metrics -->
    <section class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <article
        v-for="metric in metrics"
        :key="metric.id"
        class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ metric.label }}
            </p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {{ metric.value }}
            </p>
          </div>
          <div
            v-if="metric.trend"
            class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
          >
            <span class="material-symbols-outlined mr-0.5 text-[14px]">trending_up</span>
            {{ metric.trend }}
          </div>
        </div>
        <p class="mt-3 text-xs text-slate-400">
          {{ metric.helper }}
        </p>
      </article>
    </section>

    <!-- Filters -->
    <section class="rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/60 dark:ring-slate-800">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">
            <span class="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
            <select
              v-model="selectedDateRange"
              class="border-0 bg-transparent p-0 text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-100"
            >
              <option
                v-for="option in dateRanges"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">
            <span class="material-symbols-outlined text-sm text-slate-400">event</span>
            <select
              v-model="selectedEventFilter"
              class="border-0 bg-transparent p-0 text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-100"
            >
              <option
                v-for="option in eventFilters"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">
            <span class="material-symbols-outlined text-sm text-slate-400">confirmation_number</span>
            <select
              v-model="selectedTicketTypeFilter"
              class="border-0 bg-transparent p-0 text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-100"
            >
              <option
                v-for="option in ticketTypeFilters"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <span class="material-symbols-outlined mr-1 text-sm">refresh</span>
          Refresh
        </button>
      </div>
    </section>

    <!-- Recent Transactions -->
    <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800">
        <div>
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h2>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Detailed log of incoming funds for your events.
          </p>
        </div>
        <p class="hidden text-xs text-slate-400 sm:block">
          Displaying {{ transactions.length }} records
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3 sm:px-6">
                Date &amp; Time
              </th>
              <th class="px-4 py-3 sm:px-6">
                Customer
              </th>
              <th class="px-4 py-3 sm:px-6">
                Ticket Type
              </th>
              <th class="px-4 py-3 sm:px-6">
                Method
              </th>
              <th class="px-4 py-3 text-right sm:px-6">
                Price
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-xs sm:text-sm dark:divide-slate-800 dark:bg-slate-900">
            <tr
              v-for="tx in transactions"
              :key="tx.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <td class="whitespace-nowrap px-4 py-3 align-middle text-slate-700 sm:px-6 dark:text-slate-200">
                <div class="flex flex-col">
                  <span class="font-medium">
                    {{ tx.date }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ tx.time }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 align-middle sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {{ tx.initials }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      {{ tx.customer }}
                    </p>
                    <p class="text-[11px] text-slate-400">
                      {{ tx.email }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 align-middle text-slate-700 sm:px-6 dark:text-slate-200">
                <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  {{ tx.ticketType }}
                </span>
              </td>
              <td class="px-4 py-3 align-middle text-slate-600 sm:px-6 dark:text-slate-300">
                {{ tx.method }}
              </td>
              <td class="px-4 py-3 text-right align-middle font-semibold text-slate-900 sm:px-6 dark:text-white">
                {{ tx.price }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:px-6 dark:border-slate-800 dark:text-slate-400">
        <p>Showing {{ transactions.length }} of {{ transactions.length }} results</p>
        <div class="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <button
            type="button"
            class="rounded-full px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800"
          >
            ‹ Previous
          </button>
          <span class="mx-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
            1
          </span>
          <button
            type="button"
            class="rounded-full px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800"
          >
            Next ›
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

