<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-activity',
  color: 'primary',
  loading: false
})

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  error: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  neutral: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ title }}
        </p>

        <div
          v-if="loading"
          class="mt-2"
        >
          <USkeleton class="h-8 w-24" />
        </div>
        <div
          v-else
          class="mt-2 flex items-baseline gap-2"
        >
          <span class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ value }}
          </span>

          <span
            v-if="trend"
            :class="[
              'inline-flex items-center text-sm font-medium',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            ]"
          >
            <UIcon
              :name="trend.isPositive ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              class="mr-1 h-4 w-4"
            />
            {{ trend.value }}%
          </span>
        </div>

        <p
          v-if="description"
          class="mt-1 text-sm text-gray-500 dark:text-gray-500"
        >
          {{ description }}
        </p>
      </div>

      <div :class="['flex h-12 w-12 items-center justify-center rounded-lg', colorClasses[color]]">
        <UIcon
          :name="icon"
          class="h-6 w-6"
        />
      </div>
    </div>
  </UCard>
</template>
