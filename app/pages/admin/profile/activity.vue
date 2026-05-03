<script setup lang="ts">
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import UserActivityLogPageContent from '~/components/profile/UserActivityLogPageContent.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Profile
      </h1>
      <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
        Full activity on your admin account with pagination.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/admin/profile"
      activity-to="/admin/profile/activity"
    />

    <UserActivityLogPageContent />
  </div>
</template>
