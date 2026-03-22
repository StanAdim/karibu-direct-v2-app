<script setup lang="ts">
interface Props {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  text: 'Loading...',
  size: 'md'
})

const sizeClasses = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64'
}
</script>

<template>
  <div :class="['flex flex-col items-center justify-center', sizeClasses[size]]">
    <AppLucideIcon
      name="i-lucide-loader-2"
      :size="32"
      class="animate-spin text-primary-500"
    />
    <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      {{ text }}
    </p>
  </div>
</template>
