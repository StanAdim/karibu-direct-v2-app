<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const marketingEmails = ref(false)
const securityAlerts = ref(true)
const salesNotifications = ref(true)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Settings
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage your professional identity and organizer portal preferences.
      </p>
    </div>

    <!-- Main Grid -->
    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Profile Details -->
      <article class="lg:col-span-2 space-y-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Profile Details
          </h2>

          <div class="mt-4 grid gap-6 md:grid-cols-[auto,1fr] md:items-start">
            <div class="flex flex-col items-center gap-3 md:items-start">
              <div class="relative">
                <div class="h-16 w-16 rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-md ring-4 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                  <div class="flex h-full items-center justify-center">
                    <span>OP</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm hover:bg-primary-600"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Logo recommended size 240×240px
              </p>
            </div>

            <form class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
                    placeholder="Alex Rivera"
                  >
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Business Name
                  </label>
                  <input
                    type="text"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
                    placeholder="Urban Pulse Events"
                  >
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bio
                </label>
                <textarea
                  rows="3"
                  class="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
                  placeholder="Share a short description about your brand and events."
                />
              </div>

              <div class="pt-2">
                <AppButton type="button">
                  Save Profile Changes
                </AppButton>
              </div>
            </form>
          </div>
        </div>

        <!-- Security -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Security
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Update your password and keep your organizer account secure.
          </p>

          <form class="mt-5 grid gap-4 md:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Password
              </label>
              <input
                type="password"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
                placeholder="••••••••••"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                New Password
              </label>
              <input
                type="password"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/40"
                placeholder="Min. 12 characters"
              >
            </div>
          </form>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <p>Use a strong password with a mix of letters, numbers and symbols.</p>
            <button
              type="button"
              class="text-primary-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </article>

      <!-- Side Column -->
      <aside class="space-y-6">
        <!-- Alerts -->
        <div class="rounded-2xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Alerts
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Choose which notifications you want to receive.
          </p>

          <div class="mt-5 space-y-4 text-sm">
            <label class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  New Sales
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Notify when tickets are sold.
                </p>
              </div>
              <input
                v-model="salesNotifications"
                type="checkbox"
                class="h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-300 transition peer checked:bg-primary-500"
              >
            </label>

            <label class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  Marketing Emails
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Tips and best practices to grow your events.
                </p>
              </div>
              <input
                v-model="marketingEmails"
                type="checkbox"
                class="h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-300 transition peer checked:bg-primary-500"
              >
            </label>

            <label class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  Security Alerts
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Important activity on your account.
                </p>
              </div>
              <input
                v-model="securityAlerts"
                type="checkbox"
                class="h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-300 transition peer checked:bg-primary-500"
              >
            </label>
          </div>
        </div>

        <!-- Payment Gateways -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">
            Payment Gateways
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Connect providers like Stripe, Paystack or mobile money.
          </p>

          <div class="mt-5 space-y-3 text-xs">
            <div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-sky-500">payments</span>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">
                    Stripe
                  </p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Connected • Active
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                Active
              </button>
            </div>

            <button
              type="button"
              class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary-400 hover:bg-primary-50/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              Add Gateway
            </button>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

