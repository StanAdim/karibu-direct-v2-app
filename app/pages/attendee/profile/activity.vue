<script setup lang="ts">
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import UserActivityLogPageContent from '~/components/profile/UserActivityLogPageContent.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Full account activity with pagination. Newest entries appear first.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/attendee/profile"
      preferences-to="/attendee/profile/setting"
      activity-to="/attendee/profile/activity"
    />

    <UserActivityLogPageContent :default-page-size="8" />
  </div>
</template>
