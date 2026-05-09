<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'

const props = defineProps<{
  profile: OrganizationProfile
  dense?: boolean
}>()

const config = useRuntimeConfig()
const logoSrc = computed(() =>
  resolveBackendMediaUrl(props.profile.logo_url, String(config.public.apiBase ?? ''))
)
</script>

<template>
  <div
    :class="[
      'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden',
      dense ? 'p-4' : 'p-5 sm:p-6'
    ]"
  >
    <div class="flex flex-col sm:flex-row sm:items-start gap-4">
      <div
        class="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700"
      >
        <img
          v-if="logoSrc"
          :src="logoSrc"
          alt=""
          class="size-full object-cover"
        >
        <AppLucideIcon
          v-else
          name="apartment"
          class="text-3xl text-slate-400"
        />
      </div>
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">
            {{ profile.organization_name }}
          </h3>
          <OrganizationStatusBadge :status="profile.status" size="sm" />
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {{ profile.description }}
        </p>
        <dl class="grid gap-2 sm:grid-cols-2 text-sm">
          <div>
            <dt class="text-slate-500 dark:text-slate-400">
              Type
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ profile.organization_type }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500 dark:text-slate-400">
              Registration
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
              {{ profile.registration_number }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
