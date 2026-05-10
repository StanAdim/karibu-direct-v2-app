<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
</script>

<template>
  <PublicContentPage
    title="Help center"
    eyebrow="Support"
    subtitle="Answers to common questions about discovering events, tickets, and hosting on our platform."
  >
    <section class="space-y-3">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        Getting started
      </h2>
      <p>
        Browse events from the home page or open
        <NuxtLink to="/events" class="link font-semibold">Explore</NuxtLink>
        to filter by location, category, and date. Select an event to view details; ticketing flows are available when organizers enable them.
      </p>
    </section>
    <section class="space-y-3">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        Hosting an event
      </h2>
      <p>
        Organizers can sign in and use the dashboard to create events, manage ticket types, and track performance. Start from
        <NuxtLink to="/organizer/dashboard" class="link font-semibold">Host an event</NuxtLink>.
      </p>
    </section>
    <section id="community" class="scroll-mt-28 space-y-3">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        Community
      </h2>
      <p>
        We are building tools for local scenes and global communities alike. For partnership or press inquiries, reach out via
        <NuxtLink to="/support" class="link font-semibold">Contact</NuxtLink>.
      </p>
    </section>
  </PublicContentPage>
</template>
