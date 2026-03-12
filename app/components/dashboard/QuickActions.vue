<script setup lang="ts">
interface QuickAction {
  label: string
  icon: string
  to?: string
  onClick?: () => void
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

interface Props {
  actions: QuickAction[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Quick Actions'
})
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h3>
    </template>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <component
        :is="action.to ? 'NuxtLink' : 'button'"
        v-for="action in actions"
        :key="action.label"
        :to="action.to"
        class="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-primary-500 hover:bg-primary-50 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/50"
        @click="action.onClick"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900">
          <UIcon
            :name="action.icon"
            class="h-5 w-5 text-primary-500"
          />
        </div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ action.label }}
        </span>
      </component>
    </div>
  </UCard>
</template>
