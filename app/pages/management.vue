<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
</script>

<template>
  <PublicContentPage
    title="Event management"
    eyebrow="Operations"
    subtitle="Check-ins, payouts, sessions, and attendee tools in one place."
  >
    <p>
      After you publish an event, use the organizer workspace to coordinate staff, reconcile sales, and monitor real-time activity. Availability of modules depends on your account configuration.
    </p>
    <p>
      <NuxtLink to="/organizer/dashboard" class="link font-semibold">Manage events →</NuxtLink>
    </p>
  </PublicContentPage>
</template>
