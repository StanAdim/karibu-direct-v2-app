<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  materialIcon?: string
  trend?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
  }
  subtitle?: string
  description?: string
  variant?: 'blue' | 'purple' | 'amber' | 'emerald' | 'slate' | 'primary'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-activity',
  variant: 'blue',
  loading: false
})

const variantClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <!-- Icon -->
      <div class="p-2 rounded-lg" :class="variantClasses[variant]">
        <span v-if="materialIcon" class="material-symbols-outlined">{{ materialIcon }}</span>
        <UIcon v-else :name="icon" class="h-6 w-6" />
      </div>

      <!-- Trend -->
      <span
        v-if="trend"
        class="text-xs font-bold flex items-center gap-1"
        :class="{
          'text-emerald-500': trend.direction === 'up',
          'text-red-500': trend.direction === 'down',
          'text-slate-400': trend.direction === 'neutral'
        }"
      >
        <span v-if="trend.direction !== 'neutral'" class="material-symbols-outlined text-sm">
          {{ trend.direction === 'up' ? 'trending_up' : 'trending_down' }}
        </span>
        {{ trend.value }}
      </span>
    </div>

    <!-- Loading State -->
    <template v-if="loading">
      <USkeleton class="h-4 w-20 mb-2" />
      <USkeleton class="h-8 w-24" />
    </template>

    <!-- Content -->
    <template v-else>
      <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">{{ title }}</p>
      <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ value }}</p>
      <p v-if="subtitle || description" class="text-xs text-slate-400 mt-2">{{ subtitle || description }}</p>
    </template>
  </div>
</template>
