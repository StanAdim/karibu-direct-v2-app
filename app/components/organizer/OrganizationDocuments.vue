<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'

const props = defineProps<{
  profile: OrganizationProfile
}>()

const config = useRuntimeConfig()

function href(path: string | null | undefined): string | undefined {
  return resolveBackendMediaUrl(path, String(config.public.apiBase ?? ''))
}

const rows = computed(() => [
  { label: 'Logo', url: href(props.profile.logo_url) },
  { label: 'Banner', url: href(props.profile.banner_url) },
  { label: 'Certificate', url: href(props.profile.certificate_url) },
  { label: 'Business license', url: href(props.profile.business_license_url) },
  { label: 'Verification document', url: href(props.profile.verification_document_url) }
])
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
    <h3 class="font-bold text-slate-900 dark:text-white mb-3">
      Uploaded documents
    </h3>
    <ul class="space-y-2">
      <li
        v-for="row in rows"
        :key="row.label"
        class="flex justify-between gap-2 text-sm"
      >
        <span class="text-slate-600 dark:text-slate-400">{{ row.label }}</span>
        <a
          v-if="row.url"
          :href="row.url"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
        >View</a>
        <span v-else class="text-slate-400">—</span>
      </li>
    </ul>
  </div>
</template>
