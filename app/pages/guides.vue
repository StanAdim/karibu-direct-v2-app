<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
</script>

<template>
  <PublicContentPage
    title="Local guides"
    eyebrow="Discover"
    subtitle="Ideas for exploring cities through live experiences."
  >
    <p>
      Start from city-based filters on the home page, then refine by category and date. Guides highlight how to mix dining, culture, and nightlife around the events you already love.
    </p>
    <p>
      <NuxtLink to="/events" class="link font-semibold">Browse all events →</NuxtLink>
    </p>
  </PublicContentPage>
</template>
