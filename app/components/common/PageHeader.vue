<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()

defineSlots<{
  default?: () => unknown
  actions?: () => unknown
}>()
</script>

<template>
  <div class="mb-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-1 text-sm text-gray-600 dark:text-gray-400"
        >
          {{ description }}
        </p>
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="flex items-center gap-3"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
