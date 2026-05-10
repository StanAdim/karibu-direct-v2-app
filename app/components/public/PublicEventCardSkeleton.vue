<template>
  <div
    class="animate-pulse overflow-hidden rounded-[var(--radius-public-card)] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
    role="status"
    aria-label="Loading event"
  >
    <div class="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
    <div class="space-y-3 p-5">
      <div class="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div class="h-5 w-full rounded bg-slate-200 dark:bg-slate-800" />
      <div class="h-4 max-w-[85%] rounded bg-slate-200 dark:bg-slate-800" />
      <div class="mt-4 flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <div class="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div class="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  </div>
</template>
