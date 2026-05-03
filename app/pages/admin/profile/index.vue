<script setup lang="ts">
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import { getFullName } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Profile
      </h1>
      <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
        Backoffice account for {{ user ? getFullName(user) : 'your admin user' }}.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/admin/profile"
      activity-to="/admin/profile/activity"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Account
        </h2>
        <p class="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          {{ user ? getFullName(user) : '—' }}
        </p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {{ user?.email }}
        </p>
        <p class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {{ user?.primary_role?.name || 'Role' }}
        </p>
      </div>

      <NuxtLink
        to="/admin/settings"
        class="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-primary-500/40 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-3">
          <span class="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
            <AppLucideIcon name="i-lucide-settings" :size="22" />
          </span>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">
              System settings
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Platform configuration and tools
            </p>
          </div>
        </div>
        <p class="mt-4 text-sm font-bold text-primary-600 dark:text-primary-400">
          Open settings →
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
