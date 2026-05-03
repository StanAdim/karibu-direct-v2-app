<script setup lang="ts">
interface Props {
  label: string
  icon?: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="[
      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap',
      active
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:text-primary-500'
    ]"
    @click="$emit('click')"
  >
    <AppLucideIcon v-if="icon" :name="icon" class="text-lg" />
    {{ label }}
  </button>
</template>
