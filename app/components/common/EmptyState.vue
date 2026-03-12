<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox'
})

defineSlots<{
  default?: () => unknown
  actions?: () => unknown
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/50">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <UIcon
        :name="icon"
        class="h-8 w-8 text-gray-400 dark:text-gray-500"
      />
    </div>

    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </h3>

    <p
      v-if="description"
      class="mt-1 max-w-sm text-sm text-gray-600 dark:text-gray-400"
    >
      {{ description }}
    </p>

    <slot />

    <div
      v-if="$slots.actions"
      class="mt-6"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
