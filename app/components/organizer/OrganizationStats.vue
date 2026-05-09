<script setup lang="ts">
defineProps<{
  items: { label: string; value: string; hint?: string }[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <article
      v-for="(item, i) in items"
      :key="i"
      class="rounded-xl border border-primary-500/10 bg-white dark:bg-slate-900 p-4 shadow-sm"
    >
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {{ item.label }}
      </p>
      <p class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
        {{ item.value }}
      </p>
      <p v-if="item.hint" class="text-xs text-slate-400 mt-1">
        {{ item.hint }}
      </p>
    </article>
  </div>
</template>
