<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Payouts
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Settlement preferences and payout history will appear here once your payment provider is connected.
      </p>
    </div>

    <div class="rounded-2xl border border-dashed border-primary-500/30 bg-primary-500/5 dark:bg-primary-950/20 p-8 text-center">
      <AppLucideIcon name="payments" class="text-4xl text-primary-500 mx-auto" />
      <p class="mt-4 text-slate-700 dark:text-slate-200 font-medium">
        Payout module coming soon
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
        You can continue managing ticket sales and payments from the existing organizer pages.
      </p>
      <div class="flex flex-wrap justify-center gap-3 mt-6">
        <AppButton to="/organizer/ticket-sales">
          Ticket sales
        </AppButton>
        <AppButton to="/organizer/payments" color="neutral">
          Payments
        </AppButton>
      </div>
    </div>
  </div>
</template>
