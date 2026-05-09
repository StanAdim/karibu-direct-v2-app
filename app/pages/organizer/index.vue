<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

await navigateTo('/organizer/dashboard', { replace: true })
</script>

<template>
  <div class="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
    Redirecting…
  </div>
</template>
