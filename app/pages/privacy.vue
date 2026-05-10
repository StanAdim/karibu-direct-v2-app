<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
const year = new Date().getFullYear()
</script>

<template>
  <PublicContentPage
    title="Privacy Policy"
    eyebrow="Legal"
    :subtitle="`Last updated ${year}. Replace with counsel-approved copy before production.`"
  >
    <p>
      We describe what information the platform may collect (such as account details, device data, and transaction metadata), how it is used to operate and improve the service, and the choices available to you.
    </p>
    <p>
      Organizers are responsible for their own attendee communications and compliance with local privacy regulations when exporting or marketing to lists.
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-500">
      Placeholder text for development and investor demos only.
    </p>
  </PublicContentPage>
</template>
