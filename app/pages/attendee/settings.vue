<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Settings
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Manage your notification and privacy preferences
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-400 text-sm">
          Settings and preferences will be available here.
        </p>
      </div>
    </div>
  </div>
</template>
