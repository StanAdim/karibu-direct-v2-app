<script setup lang="ts">
interface Props {
  name: string
  image: string
  eventCount?: number
}

defineProps<Props>()

defineEmits<{
  click: [name: string]
}>()
</script>

<template>
  <button
    type="button"
    class="public-focus-ring group flex w-full max-w-[10rem] flex-col items-center text-center sm:max-w-none"
    @click="$emit('click', name)"
  >
    <div
      class="relative mx-auto aspect-square w-full max-w-[9.5rem] overflow-hidden rounded-full shadow-[var(--shadow-public-card)] ring-[3px] ring-white dark:ring-slate-900 sm:max-w-[8.5rem] lg:max-w-[9rem]"
    >
      <img
        :src="image"
        :alt="name"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      >
      <div
        class="absolute inset-0 rounded-full bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div
        class="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25"
        aria-hidden="true"
      />
    </div>

    <h4 class="mt-4 max-w-[11rem] text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 sm:text-base">
      {{ name }}
    </h4>
    <p v-if="eventCount != null" class="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
      {{ eventCount.toLocaleString() }} events
    </p>
  </button>
</template>
