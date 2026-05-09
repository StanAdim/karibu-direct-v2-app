<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'
import OrganizationStatusBadge from '~/components/organizer/OrganizationStatusBadge.vue'

const props = defineProps<{
  profile: OrganizationProfile
  quickStats?: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  edit: []
}>()

const config = useRuntimeConfig()
const bannerSrc = computed(() =>
  resolveBackendMediaUrl(props.profile.banner_url, String(config.public.apiBase ?? ''))
)
const logoSrc = computed(() =>
  resolveBackendMediaUrl(props.profile.logo_url, String(config.public.apiBase ?? ''))
)

const defaults = computed(() => [
  { label: 'Type', value: props.profile.organization_type },
  { label: 'Region', value: [props.profile.region, props.profile.district].filter(Boolean).join(' · ') || '—' }
])

const stats = computed(() =>
  props.quickStats?.length ? props.quickStats : defaults.value
)
</script>

<template>
  <section class="rounded-2xl border border-primary-500/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
    <div
      class="relative h-36 sm:h-44 bg-gradient-to-br from-primary-500/25 via-slate-200 to-slate-100 dark:from-primary-900/40 dark:via-slate-800 dark:to-slate-900"
    >
      <img
        v-if="bannerSrc"
        :src="bannerSrc"
        alt=""
        class="absolute inset-0 size-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
    </div>

    <div class="px-4 sm:px-6 pb-5 -mt-10 relative">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
        <div
          class="size-24 sm:size-28 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-lg overflow-hidden shrink-0"
        >
          <img
            v-if="logoSrc"
            :src="logoSrc"
            alt=""
            class="size-full object-cover"
          >
          <div
            v-else
            class="size-full flex items-center justify-center text-slate-400"
          >
            <AppLucideIcon name="business" class="text-4xl" />
          </div>
        </div>

        <div class="flex-1 min-w-0 pt-2 sm:pb-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
              {{ profile.organization_name }}
            </h1>
            <OrganizationStatusBadge :status="profile.status" size="sm" />
            <span
              v-if="profile.status === 'APPROVED'"
              class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"
            >
              <AppLucideIcon name="check_circle" class="text-sm" />
              Verified
            </span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {{ profile.description }}
          </p>

          <div class="flex flex-wrap gap-3 mt-4">
            <div
              v-for="s in stats"
              :key="s.label"
              class="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 px-3 py-2 min-w-[120px]"
            >
              <p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {{ s.label }}
              </p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ s.value }}
              </p>
            </div>
          </div>
        </div>

        <div class="sm:self-end sm:ml-auto">
          <AppButton type="button" @click="emit('edit')">
            Edit profile
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
