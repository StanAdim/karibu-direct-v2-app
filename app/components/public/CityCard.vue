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
    class="group flex flex-col items-center text-center"
    @click="$emit('click', name)"
  >
    <!-- Circular image -->
    <div class="relative w-full max-w-[140px] aspect-square mx-auto overflow-hidden rounded-full ring-4 ring-slate-100 dark:ring-slate-800 shadow-lg">
      <img
        :src="image"
        :alt="name"
        class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
      >
    </div>

    <!-- City name below -->
    <h4 class="mt-4 font-bold text-slate-900 dark:text-white text-base group-hover:text-primary-500 transition-colors">
      {{ name }}
    </h4>
    <p v-if="eventCount" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ eventCount }} events
    </p>
  </button>
</template>
