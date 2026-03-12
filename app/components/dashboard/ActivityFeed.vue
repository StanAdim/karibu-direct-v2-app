<script setup lang="ts">
interface ActivityItem {
  id: string
  type: 'registration' | 'checkin' | 'event' | 'session' | 'user' | 'system'
  title: string
  description?: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  link?: string
}

interface Props {
  items: ActivityItem[]
  title?: string
  maxItems?: number
  loading?: boolean
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Recent Activity',
  maxItems: 5,
  loading: false,
  showViewAll: true
})

defineEmits<{
  viewAll: []
}>()

const displayedItems = computed(() => {
  return props.items.slice(0, props.maxItems)
})

const activityIcons: Record<string, { icon: string; color: string }> = {
  registration: { icon: 'i-lucide-user-plus', color: 'text-emerald-500' },
  checkin: { icon: 'i-lucide-check-circle', color: 'text-blue-500' },
  event: { icon: 'i-lucide-calendar', color: 'text-purple-500' },
  session: { icon: 'i-lucide-presentation', color: 'text-amber-500' },
  user: { icon: 'i-lucide-user', color: 'text-gray-500' },
  system: { icon: 'i-lucide-settings', color: 'text-gray-500' }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <UButton
          v-if="showViewAll && items.length > maxItems"
          variant="ghost"
          size="sm"
          @click="$emit('viewAll')"
        >
          View all
        </UButton>
      </div>
    </template>

    <div
      v-if="loading"
      class="space-y-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-start gap-4"
      >
        <USkeleton class="h-10 w-10 rounded-full" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </div>
    </div>

    <div
      v-else-if="displayedItems.length === 0"
      class="py-8 text-center"
    >
      <UIcon
        name="i-lucide-activity"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        No recent activity
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <component
        :is="item.link ? 'NuxtLink' : 'div'"
        v-for="item in displayedItems"
        :key="item.id"
        :to="item.link"
        :class="[
          'flex items-start gap-4 rounded-lg p-2 -mx-2 transition-colors',
          item.link ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''
        ]"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <UAvatar
            v-if="item.user?.avatar"
            :src="item.user.avatar"
            :alt="item.user.name"
            size="sm"
          />
          <UIcon
            v-else
            :name="activityIcons[item.type]?.icon || 'i-lucide-activity'"
            :class="['h-5 w-5', activityIcons[item.type]?.color || 'text-gray-500']"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ item.title }}
          </p>
          <p
            v-if="item.description"
            class="text-sm text-gray-600 dark:text-gray-400 truncate"
          >
            {{ item.description }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ formatTime(item.timestamp) }}
          </p>
        </div>
      </component>
    </div>
  </UCard>
</template>
