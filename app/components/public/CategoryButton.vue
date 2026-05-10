<script setup lang="ts">
interface Props {
  label: string
  icon?: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    :class="[
      'public-focus-ring inline-flex snap-start items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300',
      active
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/35 ring-2 ring-primary-300/50 ring-offset-2 ring-offset-white dark:ring-primary-400/40 dark:ring-offset-slate-950'
        : 'border border-slate-200/90 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm hover:border-primary-300 hover:bg-primary-50/80 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-primary-500/40 dark:hover:bg-primary-500/10 dark:hover:text-primary-300',
    ]"
    :aria-pressed="active"
    @click="$emit('click')"
  >
    <AppLucideIcon v-if="icon" :name="icon" class="text-lg opacity-90" aria-hidden="true" />
    {{ label }}
  </button>
</template>
