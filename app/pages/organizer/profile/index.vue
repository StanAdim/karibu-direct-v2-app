<script setup lang="ts">
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import { getFullName } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const { user } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Account overview for {{ user ? getFullName(user) : 'your organizer account' }}.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/organizer/profile"
      activity-to="/organizer/profile/activity"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <NuxtLink
        to="/organizer/organization"
        class="group rounded-2xl border border-primary-500/10 bg-white p-5 shadow-sm transition hover:border-primary-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-3">
          <span class="flex size-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <AppLucideIcon name="business" class="text-xl" />
          </span>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">
              Organization
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Branding, team, and billing settings
            </p>
          </div>
        </div>
        <p class="mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
          Open organization →
        </p>
      </NuxtLink>

      <NuxtLink
        to="/organizer/profile/activity"
        class="group rounded-2xl border border-primary-500/10 bg-white p-5 shadow-sm transition hover:border-primary-500/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-3">
          <span class="flex size-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <AppLucideIcon name="activity_history" class="text-xl" />
          </span>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">
              Activity log
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Full history of actions on your account
            </p>
          </div>
        </div>
        <p class="mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
          View activity →
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
