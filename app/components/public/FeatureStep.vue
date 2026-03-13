<script setup lang="ts">
interface Props {
  step: number
  title: string
  description: string
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center text-center">
    <!-- Icon: purple rounded square -->
    <div class="size-20 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg mb-6">
      <span class="material-symbols-outlined text-4xl">{{ icon }}</span>
    </div>

    <!-- Title -->
    <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
      {{ step }}. {{ title }}
    </h4>

    <!-- Description -->
    <p class="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
      {{ description }}
    </p>
  </div>
</template>
