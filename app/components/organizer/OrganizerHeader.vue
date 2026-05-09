<script setup lang="ts">
const props = defineProps<{
  title: string
}>()

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <header class="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-primary-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
    <div class="flex items-center gap-3 flex-1 ml-12 lg:ml-0 min-w-0">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white truncate">
        {{ props.title }}
      </h2>

      <div class="max-w-md w-full ml-3 relative hidden md:block">
        <AppLucideIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          v-model="search"
          type="search"
          placeholder="Search events or attendees..."
          class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <button
        type="button"
        class="size-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
        aria-label="Notifications"
      >
        <AppLucideIcon name="notifications" class="text-slate-600 dark:text-slate-300 text-lg" />
        <span class="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
      </button>
      <slot name="actions" />
    </div>
  </header>
</template>
