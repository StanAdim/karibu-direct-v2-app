<script setup lang="ts">
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import UserActivityLogPageContent from '~/components/profile/UserActivityLogPageContent.vue'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Full account activity with pagination. Newest entries appear first.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/organizer/profile"
      preferences-to="/organizer/profile/setting"
      activity-to="/organizer/profile/activity"
    />

    <UserActivityLogPageContent :default-page-size="8" />
  </div>
</template>
