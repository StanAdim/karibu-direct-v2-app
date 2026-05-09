<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const workspace = useOrganizerWorkspaceStore()

onMounted(() => {
  void workspace.fetchProfile().catch(() => {})
})
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Settings
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Notifications, security preferences, and branding shortcuts.
      </p>
    </div>

    <div
      v-if="workspace.profile"
      class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div class="size-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
        <AppLucideIcon name="business" class="text-2xl" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-bold text-slate-900 dark:text-white truncate">
          {{ workspace.profile.organization_name }}
        </p>
        <p class="text-sm text-slate-500">
          Public profile &amp; uploads are edited from My Organization.
        </p>
      </div>
      <AppButton to="/organizer/organization">
        Manage profile
      </AppButton>
    </div>

    <OrganizationSettingsForm />
  </div>
</template>
