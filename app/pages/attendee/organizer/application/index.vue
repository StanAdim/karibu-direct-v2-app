<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: ['attendee', 'organizer-application-attendee']
})

const organizerApplicationStore = useOrganizerApplicationStore()
const { startApplicationStatusPolling, stopPolling, shouldPollStatus } = useOrganizerApplication()
const notifications = useNotifications()
const authStore = useAuthStore()

const loading = computed(() => organizerApplicationStore.loadingMine && !organizerApplicationStore.mineLoaded)

onMounted(async () => {
  try {
    await organizerApplicationStore.fetchMine()
    const app = organizerApplicationStore.application
    if (app?.status === 'APPROVED') {
      await authStore.fetchUser()
    }
    const s = app?.status
    if (s && shouldPollStatus(s)) {
      startApplicationStatusPolling()
    }
  }
  catch {
    notifications.error({ title: 'Unable to load application' })
  }
})

onUnmounted(() => {
  stopPolling()
})

const application = computed(() => organizerApplicationStore.application)

const canEdit = computed(() => {
  const s = application.value?.status
  return s === 'PENDING' || s === 'UNDER_REVIEW' || s === 'REJECTED'
})

const statusLabel = computed(() => {
  if (!application.value) return ''
  const m: Record<string, string> = {
    PENDING: 'Pending — we will notify you when review starts.',
    UNDER_REVIEW: 'Under review — please apply requested updates if any.',
    APPROVED: 'Approved — you now have organizer access.',
    REJECTED: 'Rejected — you can update and resubmit.'
  }
  return m[application.value.status] || application.value.status
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Organizer application
      </h1>
      <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
        Track your submission or start a new application to host events on the platform.
      </p>
    </div>

    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex justify-center bg-white dark:bg-slate-900"
    >
      <span class="size-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>

    <template v-else-if="!application">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary-500/10 to-white dark:from-primary-900/20 dark:to-slate-900 p-6 sm:p-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Become an organizer
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-xl">
          Create your organization profile, upload verification documents, and submit for admin review.
          Once approved, the organizer dashboard unlocks automatically.
        </p>
        <AppButton
          to="/attendee/organizer/apply"
          class="mt-5"
        >
          Start application
        </AppButton>
      </div>
    </template>

    <template v-else>
      <OrganizationProfileCard :profile="application" />

      <div
        v-if="application.status === 'REJECTED' && application.rejection_reason"
        class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4"
      >
        <p class="text-sm font-bold text-red-800 dark:text-red-200">
          Rejection reason
        </p>
        <p class="text-sm text-red-900 dark:text-red-100 mt-1">
          {{ application.rejection_reason }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <AppButton
          v-if="canEdit"
          to="/attendee/organizer/application/edit"
        >
          Edit & resubmit
        </AppButton>
        <AppButton
          v-if="application.status === 'APPROVED'"
          to="/organizer"
          color="success"
        >
          Go to organizer dashboard
        </AppButton>
      </div>

      <ApplicationTimeline
        :submitted-at="application.created_at"
        :reviewed-at="application.reviewed_at"
        :status-label="statusLabel"
      />

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Documents
        </h3>
        <ul class="space-y-2 text-sm">
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Logo</span>
            <a
              v-if="application.logo_url"
              :href="application.logo_url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Certificate</span>
            <a
              v-if="application.certificate_url"
              :href="application.certificate_url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Business license</span>
            <a
              v-if="application.business_license_url"
              :href="application.business_license_url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
