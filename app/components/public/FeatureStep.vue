<script setup lang="ts">
interface Props {
  step: number
  title: string
  description: string
  icon: string
  /** Horizontal connector toward the next step (desktop). */
  showConnectorTail?: boolean
}

withDefaults(defineProps<Props>(), {
  showConnectorTail: false,
})
</script>

<template>
  <div class="relative flex flex-col items-center text-center md:px-2">
    <div
      v-if="showConnectorTail"
      class="absolute left-[calc(50%+2.75rem)] top-[2.125rem] z-0 hidden h-px w-[calc(100%-1.75rem)] bg-gradient-to-r from-primary-400/40 via-primary-300/25 to-transparent md:block dark:from-primary-500/35 dark:via-primary-500/15"
      aria-hidden="true"
    />

    <div
      class="relative z-[1] mb-6 flex size-[5.25rem] items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-xl shadow-primary-500/25 ring-4 ring-primary-500/10 transition-transform duration-300 hover:scale-105"
    >
      <AppLucideIcon :name="icon" class="text-4xl" aria-hidden="true" />
      <span
        class="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-white text-xs font-black text-primary-600 shadow-md dark:bg-slate-900 dark:text-primary-400"
      >
        {{ step }}
      </span>
    </div>

    <h4 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
      {{ title }}
    </h4>
    <p class="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
      {{ description }}
    </p>
  </div>
</template>
