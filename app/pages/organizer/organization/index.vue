<script setup lang="ts">
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const store = useOrganizerApplicationStore()
const notifications = useNotifications()
const config = useRuntimeConfig()

function mediaHref(path: string | null | undefined): string | undefined {
  return resolveBackendMediaUrl(path, String(config.public.apiBase ?? ''))
}

onMounted(async () => {
  try {
    await store.fetchMine()
  }
  catch {
    notifications.error({ title: 'Unable to load organization profile' })
  }
})

const profile = computed(() => store.application)
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Organization
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Details from your approved organizer application.
      </p>
    </div>

    <div
      v-if="store.loadingMine && !store.mineLoaded"
      class="rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex justify-center bg-white dark:bg-slate-900"
    >
      <span class="size-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>

    <template v-else-if="profile">
      <OrganizationProfileCard :profile="profile" />

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 text-sm space-y-3">
        <h3 class="font-bold text-slate-900 dark:text-white">
          Contact & location
        </h3>
        <dl class="grid sm:grid-cols-2 gap-3">
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
          <div class="sm:col-span-2">
            <dt class="text-slate-500">
              Address
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ [profile.address, profile.ward, profile.district, profile.region, profile.country].filter(Boolean).join(', ') || '—' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <h3 class="font-bold text-slate-900 dark:text-white mb-3">
          Documents
        </h3>
        <ul class="space-y-2">
          <li class="flex justify-between gap-2">
            <span class="text-slate-600">Logo</span>
            <a
              v-if="profile.logo_url && mediaHref(profile.logo_url)"
              :href="mediaHref(profile.logo_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold"
            >View</a>
            <span v-else class="text-slate-400">—</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600">Certificate</span>
            <a
              v-if="profile.certificate_url && mediaHref(profile.certificate_url)"
              :href="mediaHref(profile.certificate_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold"
            >View</a>
            <span v-else class="text-slate-400">—</span>
          </li>
          <li class="flex justify-between gap-2">
            <span class="text-slate-600">Business license</span>
            <a
              v-if="profile.business_license_url && mediaHref(profile.business_license_url)"
              :href="mediaHref(profile.business_license_url)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold"
            >View</a>
            <span v-else class="text-slate-400">—</span>
          </li>
        </ul>
      </div>
    </template>

    <div
      v-else
      class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400"
    >
      No organization profile is linked to your account yet.
    </div>
  </div>
</template>
