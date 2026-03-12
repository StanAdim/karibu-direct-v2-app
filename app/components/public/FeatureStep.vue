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
    <!-- Icon Container -->
    <div class="relative mb-6">
      <!-- Step Number -->
      <div class="absolute -top-2 -right-2 size-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center z-10">
        {{ step }}
      </div>

      <!-- Icon Circle -->
      <div class="size-20 rounded-2xl bg-primary-500/10 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-primary-500">{{ icon }}</span>
      </div>
    </div>

    <!-- Title -->
    <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
      {{ title }}
    </h4>

    <!-- Description -->
    <p class="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
      {{ description }}
    </p>
  </div>
</template>
