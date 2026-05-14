<script setup lang="ts">
defineProps<{
  registered: number
  capacity: number
  capacityPct: number
  sessions: number
  checkpoints: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <div
      class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-3 shadow-sm transition-colors hover:border-primary/25 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Registered
        </p>
        <AppLucideIcon name="i-lucide-users" class="h-3.5 w-3.5 text-on-surface-variant/70" />
      </div>
      <p class="mt-1 font-headline text-xl font-bold tabular-nums text-on-surface">
        {{ registered.toLocaleString() }}
      </p>
    </div>

    <div
      class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-3 shadow-sm transition-colors hover:border-primary/25 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Capacity
        </p>
        <AppLucideIcon name="i-lucide-pie-chart" class="h-3.5 w-3.5 text-on-surface-variant/70" />
      </div>
      <p class="mt-1 font-headline text-xl font-bold tabular-nums text-on-surface">
        {{ capacity.toLocaleString() }}
        <span class="text-xs font-semibold text-on-surface-variant">· {{ capacityPct }}%</span>
      </p>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-800">
        <div
          class="h-full rounded-full bg-primary transition-all duration-300"
          :style="{ width: `${Math.min(100, Math.max(0, capacityPct))}%` }"
        />
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-3 shadow-sm transition-colors hover:border-primary/25 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Sessions
        </p>
        <AppLucideIcon name="i-lucide-presentation" class="h-3.5 w-3.5 text-on-surface-variant/70" />
      </div>
      <p class="mt-1 font-headline text-xl font-bold tabular-nums text-on-surface">
        {{ sessions.toLocaleString() }}
      </p>
    </div>

    <div
      class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-3 shadow-sm transition-colors hover:border-primary/25 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          Checkpoints
        </p>
        <AppLucideIcon name="i-lucide-qr-code" class="h-3.5 w-3.5 text-on-surface-variant/70" />
      </div>
      <p class="mt-1 font-headline text-xl font-bold tabular-nums text-on-surface">
        {{ checkpoints.toLocaleString() }}
      </p>
    </div>
  </div>
</template>
