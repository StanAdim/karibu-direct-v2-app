<script setup lang="ts">
const props = withDefaults(defineProps<{
  profileTo: string
  profileLabel?: string
  /** When set, a middle tab (e.g. notifications & security) is shown. */
  preferencesTo?: string
  preferencesLabel?: string
  activityTo: string
  activityLabel?: string
}>(), {
  profileLabel: 'Profile',
  preferencesLabel: 'Settings',
  activityLabel: 'Activity',
  preferencesTo: ''
})

const route = useRoute()

function normalizePath(path: string): string {
  return path.replace(/\/$/, '') || '/'
}

function isProfileActive(): boolean {
  return normalizePath(route.path) === normalizePath(props.profileTo)
}

function isPreferencesActive(): boolean {
  if (!props.preferencesTo) return false
  const p = normalizePath(route.path)
  const t = normalizePath(props.preferencesTo)
  return p === t || route.path.startsWith(`${props.preferencesTo}/`)
}

function isActivityActive(): boolean {
  return route.path === props.activityTo || route.path.startsWith(`${props.activityTo}/`)
}

const linkBase =
  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors'
const linkInactive =
  'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
const linkActive =
  'bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20'
</script>

<template>
  <nav
    class="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800"
    aria-label="Profile sections"
  >
    <NuxtLink
      :to="profileTo"
      :class="[linkBase, isProfileActive() ? linkActive : linkInactive]"
    >
      <AppLucideIcon name="person" class="text-lg opacity-90" />
      {{ profileLabel }}
    </NuxtLink>
    <NuxtLink
      v-if="preferencesTo"
      :to="preferencesTo"
      :class="[linkBase, isPreferencesActive() ? linkActive : linkInactive]"
    >
      <AppLucideIcon name="i-lucide-settings" class="text-lg opacity-90" />
      {{ preferencesLabel }}
    </NuxtLink>
    <NuxtLink
      :to="activityTo"
      :class="[linkBase, isActivityActive() ? linkActive : linkInactive]"
    >
      <AppLucideIcon name="activity_history" class="text-lg opacity-90" />
      {{ activityLabel }}
    </NuxtLink>
  </nav>
</template>
