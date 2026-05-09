<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'
import type { OrganizationProfile, OrganizerApplicationLogEntry } from '~/types/organizer'

definePageMeta({
  layout: 'attendee',
  middleware: ['attendee', 'organizer-application-attendee']
})

const organizerApplicationStore = useOrganizerApplicationStore()
const { application, applicationLogs } = storeToRefs(organizerApplicationStore)
const { startApplicationStatusPolling, stopPolling, shouldPollStatus } = useOrganizerApplication()
const notifications = useNotifications()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const REVIEW_LOG_ACTIONS = new Set([
  'REVIEW_APPROVED',
  'REVIEW_REJECTED',
  'REVIEW_REQUEST_CHANGES'
])

function mediaHref(path: string | null | undefined): string | undefined {
  return resolveBackendMediaUrl(path, String(config.public.apiBase ?? ''))
}

function reviewerNoteFromApi(
  app: OrganizationProfile,
  logs: OrganizerApplicationLogEntry[]
): string | null {
  if (app.status === 'REJECTED' && app.rejection_reason?.trim()) {
    return app.rejection_reason.trim()
  }
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i]
    if (REVIEW_LOG_ACTIONS.has(String(log.action)) && log.comment?.trim()) {
      return log.comment!.trim()
    }
  }
  return null
}

function formatReviewedWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }
  catch {
    return iso
  }
}

const loading = computed(() => organizerApplicationStore.loadingMine && !organizerApplicationStore.mineLoaded)

onMounted(async () => {
  try {
    await organizerApplicationStore.fetchMine()
    const app = organizerApplicationStore.application
    if (app?.status === 'APPROVED') {
      await authStore.fetchUser()
      await navigateTo('/organizer/dashboard', { replace: true })
      return
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

const hasAdminReviewOutcome = computed(() => {
  const s = application.value?.status
  return s === 'UNDER_REVIEW' || s === 'APPROVED' || s === 'REJECTED'
})

const adminReviewerNote = computed(() => {
  const app = application.value
  if (!app) return null
  return reviewerNoteFromApi(app, applicationLogs.value)
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
        v-if="hasAdminReviewOutcome"
        :class="[
          'rounded-2xl border p-4 sm:p-5',
          application.status === 'REJECTED'
            ? 'border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/20'
            : application.status === 'APPROVED'
              ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20'
              : 'border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20'
        ]"
      >
        <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Application status
        </h2>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <OrganizationStatusBadge :status="application.status" />
          <p class="text-sm text-slate-700 dark:text-slate-300 min-w-0 flex-1">
            {{ statusLabel }}
          </p>
        </div>
        <p
          v-if="application.reviewed_at"
          class="text-xs text-slate-600 dark:text-slate-400 mt-3"
        >
          Last review: {{ formatReviewedWhen(application.reviewed_at) }}
        </p>
        <div
          v-if="adminReviewerNote"
          :class="[
            'mt-4 rounded-xl p-3 text-sm',
            application.status === 'REJECTED'
              ? 'bg-white/80 dark:bg-slate-900/50 text-red-900 dark:text-red-100 border border-red-100 dark:border-red-900/40'
              : 'bg-white/80 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700'
          ]"
        >
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Message from reviewer
          </p>
          <p class="mt-1.5 leading-relaxed whitespace-pre-wrap">
            {{ adminReviewerNote }}
          </p>
        </div>
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
          to="/organizer/dashboard"
          color="success"
        >
          Go to organizer dashboard
        </AppButton>
      </div>

      <ApplicationTimeline
        :logs="applicationLogs.length ? applicationLogs : null"
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
              v-if="application.logo_url && mediaHref(application.logo_url)"
              :href="mediaHref(application.logo_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Verification document</span>
            <a
              v-if="application.verification_document_url && mediaHref(application.verification_document_url)"
              :href="mediaHref(application.verification_document_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Certificate</span>
            <a
              v-if="application.certificate_url && mediaHref(application.certificate_url)"
              :href="mediaHref(application.certificate_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
            >View</a>
            <span v-else class="text-slate-400">Not uploaded</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">Business license</span>
            <a
              v-if="application.business_license_url && mediaHref(application.business_license_url)"
              :href="mediaHref(application.business_license_url)"
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
