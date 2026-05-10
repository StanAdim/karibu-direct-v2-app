<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
const year = new Date().getFullYear()
</script>

<template>
  <PublicContentPage
    title="Cookie settings"
    eyebrow="Legal"
    :subtitle="`Summary as of ${year}. Wire to your consent management platform in production.`"
  >
    <p>
      Essential cookies keep you signed in and protect the service. Analytics or personalization cookies may be added with your consent where required by law.
    </p>
    <p>
      You can control cookies through your browser and, when available, through an in-product preference center.
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-500">
      Placeholder copy; integrate with your real cookie banner and policy.
    </p>
  </PublicContentPage>
</template>
