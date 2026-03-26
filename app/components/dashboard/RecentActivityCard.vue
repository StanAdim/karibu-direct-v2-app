<script setup lang="ts">
type ColorVariant = 'blue' | 'emerald' | 'amber'

interface RecentActivityItem {
  id: string | number
  title: string
  description?: string
  timeAgo?: string
  icon?: string
  /**
   * Optional color hint for the icon bubble.
   * Defaults to `blue` when not provided.
   */
  color?: ColorVariant
}

const props = withDefaults(defineProps<{
  title?: string
  items: RecentActivityItem[]
  viewAllTo?: string
  viewAllLabel?: string
  emptyLabel?: string
}>(), {
  title: 'Recent Activity',
  viewAllLabel: 'View All',
  emptyLabel: 'No recent activity yet.'
})

function formatDateTime(dateString?: string): string {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return dateString

  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} • ${d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`
}

function itemColor(item: RecentActivityItem): ColorVariant {
  if (item.color) {
    return item.color
  }
  return 'blue'
}

function itemIcon(item: RecentActivityItem): string {
  if (item.icon) {
    return item.icon
  }

  return 'activity_history'
}

function itemTitle(item: RecentActivityItem): string {
  if (!item.title) return 'Activity'
  return formatEnumLikeLabel(item.title)
}

function itemDescription(item: RecentActivityItem): string {
  return item.description || ''
}

function formatEnumLikeLabel(raw: string): string {
  if (!raw) return ''

  const cleaned = raw.trim()
  if (!cleaned.includes('_')) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
  }

  return cleaned
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function itemTimeAgo(item: RecentActivityItem): string | undefined {
  return formatDateTime(item.timeAgo)
}
</script>

<template>
  <aside class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2">
        <NuxtLink
          v-if="viewAllTo"
          :to="viewAllTo"
          class="hidden text-xs font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 md:inline-block"
        >
          {{ viewAllLabel }}
        </NuxtLink>
        <button
          type="button"
          class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
          aria-label="More options"
        >
          <span class="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>

    <div v-if="items.length === 0" class="py-8 px-5 text-center text-slate-400 dark:text-slate-500 text-sm">
      <p>{{ emptyLabel }}</p>
    </div>

    <ul
      v-else
      class="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span
          class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          :class="itemColor(item) === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'"
        />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {{ itemTitle(item) }}
          </p>
          <p
            v-if="itemDescription(item)"
            class="text-sm text-slate-500 dark:text-slate-400 truncate"
          >
            {{ itemDescription(item) }}
          </p>
        </div>
        <p
          v-if="itemTimeAgo(item)"
          class="shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wide"
        >
          {{ itemTimeAgo(item) }}
        </p>
      </li>
    </ul>
  </aside>
</template>

