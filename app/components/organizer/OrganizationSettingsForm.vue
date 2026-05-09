<script setup lang="ts">
const notificationsEmail = ref(true)
const marketingEmail = ref(false)
const payoutNotify = ref(true)
const twoFactorHint = ref(false)
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 class="font-bold text-slate-900 dark:text-white">
        Notifications
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Control how we reach you about sales, check-ins, and reviews.
      </p>
      <div class="space-y-3">
        <label class="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-sm text-slate-700 dark:text-slate-300">Transactional email</span>
          <USwitch v-model="notificationsEmail" />
        </label>
        <label class="flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-sm text-slate-700 dark:text-slate-300">Product updates & tips</span>
          <USwitch v-model="marketingEmail" />
        </label>
        <label class="flex items-center justify-between gap-3 py-2">
          <span class="text-sm text-slate-700 dark:text-slate-300">Payout & balance alerts</span>
          <USwitch v-model="payoutNotify" />
        </label>
      </div>
    </section>

    <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 class="font-bold text-slate-900 dark:text-white">
        Security
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Account protection is managed from your profile password flow.
      </p>
      <label class="flex items-center justify-between gap-3">
        <span class="text-sm text-slate-700 dark:text-slate-300">Two-factor authentication (coming soon)</span>
        <USwitch v-model="twoFactorHint" disabled />
      </label>
    </section>

    <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 class="font-bold text-slate-900 dark:text-white">
        Organization branding
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Logo, banner, and public description are managed from
        <NuxtLink to="/organizer/organization" class="text-primary-500 font-semibold hover:underline">
          My Organization
        </NuxtLink>.
      </p>
    </section>
  </div>
</template>
