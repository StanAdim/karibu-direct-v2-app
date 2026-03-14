<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

type PayoutMethod = {
  id: string
  name: string
  description: string
  type: 'bank' | 'wallet'
  isPrimary?: boolean
}

type PaymentStat = {
  id: string
  label: string
  value: string
  helper: string
}

type PaymentTransaction = {
  id: string
  label: string
  date: string
  time: string
  direction: 'incoming' | 'outgoing'
  amount: string
  status: 'completed' | 'processing'
}

const balanceStats = ref<PaymentStat[]>([
  {
    id: 'pending',
    label: 'Pending',
    value: '$12,400.00',
    helper: 'Awaiting settlement'
  },
  {
    id: 'total',
    label: 'Total Earned',
    value: '$142,920.00',
    helper: 'Lifetime earnings'
  }
])

const payoutMethods = ref<PayoutMethod[]>([
  {
    id: '1',
    name: 'Chase Business Platinum',
    description: 'Ending in •••• 8829',
    type: 'bank',
    isPrimary: true
  },
  {
    id: '2',
    name: 'Mobile Money Wallet',
    description: '+255 712 345 678',
    type: 'wallet'
  }
])

const transactions = ref<PaymentTransaction[]>([
  {
    id: '1',
    label: 'Neon Nights Festival - Ticket Sales',
    date: 'Oct 24, 2024',
    time: '14:32 PM',
    direction: 'incoming',
    amount: '+$8,420.00',
    status: 'completed'
  },
  {
    id: '2',
    label: 'Payout to Chase Bank (•••• 8829)',
    date: 'Oct 22, 2024',
    time: '09:15 AM',
    direction: 'outgoing',
    amount: '-$15,000.00',
    status: 'processing'
  }
])
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">
          Financial Overview
        </p>
        <h1 class="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Payments &amp; Payouts
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor incoming ticket revenue and manage how funds are paid out to you.
        </p>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <AppButton
          color="neutral"
          size="sm"
          icon="account_balance"
        >
          Manage Accounts
        </AppButton>
        <AppButton
          size="sm"
          icon="payments"
        >
          Request Payout
        </AppButton>
      </div>
    </div>

    <!-- Top Grid -->
    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Balance Card -->
      <article class="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-slate-50 shadow-lg">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
              Available Balance
            </p>
            <p class="mt-3 text-4xl font-extrabold tracking-tight">
              $24,850.42
            </p>
          </div>
          <span class="rounded-full bg-slate-800/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
            Available Now
          </span>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div
            v-for="stat in balanceStats"
            :key="stat.id"
            class="rounded-xl bg-slate-900/60 p-4 ring-1 ring-slate-800"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              {{ stat.label }}
            </p>
            <p class="mt-2 text-lg font-semibold">
              {{ stat.value }}
            </p>
            <p class="mt-1 text-[11px] text-slate-500">
              {{ stat.helper }}
            </p>
          </div>
        </div>

        <p class="mt-4 text-[11px] text-slate-500">
          Funds are settled every Tuesday and Friday to your primary payout method.
        </p>
      </article>

      <!-- Payout Methods -->
      <aside class="space-y-4">
        <div
          v-for="method in payoutMethods"
          :key="method.id"
          class="rounded-2xl bg-slate-900 text-slate-50 shadow-md ring-1 ring-slate-800"
          :class="method.type === 'wallet' ? 'bg-slate-950/90' : 'bg-slate-900'"
        >
          <div class="flex items-center justify-between gap-3 px-5 py-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl"
                :class="method.type === 'wallet' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-sky-500/10 text-sky-300'"
              >
                <span class="material-symbols-outlined text-[18px]">
                  {{ method.type === 'wallet' ? 'account_balance_wallet' : 'credit_card' }}
                </span>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {{ method.type === 'wallet' ? 'Mobile Wallet' : 'Bank Account' }}
                </p>
                <p class="text-sm font-semibold text-slate-50">
                  {{ method.name }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ method.description }}
                </p>
              </div>
            </div>

            <span
              v-if="method.isPrimary"
              class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
            >
              Primary
            </span>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 hover:border-primary-400 hover:bg-primary-50/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          Add New Method
        </button>
      </aside>
    </section>

    <!-- Transaction History -->
    <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
        <div>
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Detailed log of all incoming and outgoing funds.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <AppButton
            color="neutral"
            size="sm"
            icon="filter_list"
          >
            Filter
          </AppButton>
          <AppButton
            color="neutral"
            size="sm"
            icon="file_download"
          >
            Export
          </AppButton>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3 sm:px-6">
                Transaction
              </th>
              <th class="px-4 py-3 sm:px-6">
                Date
              </th>
              <th class="px-4 py-3 sm:px-6">
                Direction
              </th>
              <th class="px-4 py-3 text-right sm:px-6">
                Amount
              </th>
              <th class="px-4 py-3 text-right sm:px-6">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-xs sm:text-sm dark:divide-slate-800 dark:bg-slate-900">
            <tr
              v-for="tx in transactions"
              :key="tx.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3 align-middle text-slate-900 sm:px-6 dark:text-white">
                {{ tx.label }}
              </td>
              <td class="px-4 py-3 align-middle text-slate-600 sm:px-6 dark:text-slate-300">
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
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="tx.direction === 'incoming'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'"
                >
                  <span class="material-symbols-outlined mr-0.5 text-[14px]">
                    {{ tx.direction === 'incoming' ? 'arrow_downward' : 'arrow_upward' }}
                  </span>
                  {{ tx.direction === 'incoming' ? 'Incoming' : 'Outgoing' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right align-middle font-semibold sm:px-6">
                <span
                  :class="tx.direction === 'incoming' ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'"
                >
                  {{ tx.amount }}
                </span>
              </td>
              <td class="px-4 py-3 text-right align-middle sm:px-6">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="tx.status === 'completed'
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'"
                >
                  {{ tx.status === 'completed' ? 'Completed' : 'Processing' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

