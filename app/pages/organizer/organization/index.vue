<script setup lang="ts">
import ApplicationTimeline from '~/components/organizer/ApplicationTimeline.vue'
import OrganizationProfileEditModal from '~/components/organizer/OrganizationProfileEditModal.vue'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const workspace = useOrganizerWorkspaceStore()
const notifications = useNotifications()
const showEdit = ref(false)

onMounted(async () => {
  try {
    await workspace.fetchProfile()
  }
  catch {
    notifications.error({ title: 'Unable to load organization profile' })
  }
})

const profile = computed(() => workspace.profile)

const quickStats = computed(() => {
  if (!profile.value) return []
  return [
    { label: 'Registration #', value: profile.value.registration_number },
    { label: 'Tax #', value: profile.value.tax_number?.trim() || '—' }
  ]
})

const statTiles = computed(() => {
  const p = profile.value
  if (!p) return []
  return [
    { label: 'Organization type', value: p.organization_type, hint: 'Legal structure' },
    { label: 'Primary region', value: [p.region, p.district].filter(Boolean).join(' · ') || '—', hint: 'Location' },
    { label: 'Member since', value: formatDate(p.created_at), hint: 'Profile created' },
    { label: 'Last updated', value: formatDate(p.updated_at), hint: 'Workspace' }
  ]
})

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
  }
  catch {
    return iso
  }
}

const activityLogs = computed(() => workspace.workspaceLogs.slice(-12).reverse())

const statusLabel = computed(() => {
  const s = profile.value?.status
  if (!s) return ''
  const m: Record<string, string> = {
    PENDING: 'Application pending',
    UNDER_REVIEW: 'Under admin review',
    APPROVED: 'Approved — full workspace access',
    REJECTED: 'Rejected'
  }
  return m[s] || s
})
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          My Organization
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Your public profile, verification state, and media assets.
        </p>
      </div>
    </div>

    <div
      v-if="workspace.loadingProfile && !workspace.profileLoaded"
      class="rounded-2xl border border-primary-500/10 p-12 flex justify-center bg-white dark:bg-slate-900"
    >
      <div class="space-y-3 w-full max-w-md">
        <div class="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div class="h-36 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div class="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    </div>

    <template v-else-if="profile">
      <OrganizationHero
        :profile="profile"
        :quick-stats="quickStats"
        @edit="showEdit = true"
      />

      <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white">
          About
        </h2>
        <p class="text-slate-600 dark:text-slate-300 text-sm mt-3 whitespace-pre-wrap leading-relaxed">
          {{ profile.description }}
        </p>
      </section>

      <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white mb-3">
          Contact
        </h2>
        <dl class="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-slate-500">
              Email
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ profile.email }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">
              Phone
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ profile.phone_number }}
            </dd>
          </div>
          <div v-if="profile.website" class="sm:col-span-2">
            <dt class="text-slate-500">
              Website
            </dt>
            <dd>
              <a
                :href="profile.website.startsWith('http') ? profile.website : `https://${profile.website}`"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >{{ profile.website }}</a>
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-slate-500">
              Address
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ [profile.address, profile.ward, profile.district, profile.region, profile.country].filter(Boolean).join(', ') || '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white mb-3">
          Verification
        </h2>
        <div class="flex flex-wrap items-center gap-2">
          <OrganizationStatusBadge :status="profile.status" />
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ statusLabel }}</span>
        </div>
        <p
          v-if="profile.reviewed_at"
          class="text-xs text-slate-500 mt-3"
        >
          Reviewed {{ formatDate(profile.reviewed_at) }}
        </p>
      </section>

      <OrganizationDocuments :profile="profile" />

      <section>
        <h2 class="font-bold text-lg text-slate-900 dark:text-white mb-3">
          Organization statistics
        </h2>
        <OrganizationStats :items="statTiles.map(s => ({ label: s.label, value: s.value, hint: s.hint }))" />
      </section>

      <section class="space-y-3">
        <h2 class="font-bold text-lg text-slate-900 dark:text-white">
          Recent activities
        </h2>
        <ApplicationTimeline
          :logs="activityLogs.length ? activityLogs : null"
          :submitted-at="profile.created_at"
          :reviewed-at="profile.reviewed_at"
          :status-label="statusLabel"
        />
      </section>

      <OrganizationProfileEditModal
        v-model="showEdit"
        :profile="profile"
      />
    </template>

    <div
      v-else
      class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400"
    >
      No organization profile is linked to your account yet.
    </div>
  </div>
</template>
