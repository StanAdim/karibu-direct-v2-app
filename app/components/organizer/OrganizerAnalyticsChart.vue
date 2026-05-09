<script setup lang="ts">
/**
 * Lightweight SVG trend visualization (no extra chart dependency).
 */
defineProps<{
  title: string
  subtitle?: string
  accentClass?: string
}>()

const pathD = 'M0 96 Q 40 88, 80 72 T 160 40 T 240 28 T 320 8 V 120 H 0 Z'
const lineD = 'M0 96 Q 40 88, 80 72 T 160 40 T 240 28 T 320 8'
</script>

<template>
  <article class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/10 shadow-sm">
    <div class="flex items-center justify-between gap-4 mb-4">
      <div>
        <h2 class="font-bold text-lg text-slate-900 dark:text-white">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-slate-400 text-xs mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div class="h-[180px] w-full flex flex-col gap-2">
      <svg
        class="flex-1 w-full min-h-[120px]"
        viewBox="0 0 320 120"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="org-dash-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" class="[stop-color:theme(colors.primary.500)]" />
            <stop offset="100%" class="[stop-color:theme(colors.primary.500)]" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          :d="pathD"
          fill="url(#org-dash-grad)"
          opacity="0.15"
        />
        <path
          :d="lineD"
          class="stroke-primary-500 dark:stroke-primary-400"
          stroke-width="2.5"
          stroke-linecap="round"
          fill="none"
        />
      </svg>
      <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  </article>
</template>
