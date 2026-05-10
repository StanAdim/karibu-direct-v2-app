<script setup lang="ts">
definePageMeta({
  layout: 'public',
})
const year = new Date().getFullYear()
</script>

<template>
  <PublicContentPage
    title="Terms of Service"
    eyebrow="Legal"
    :subtitle="`Last updated ${year}. Replace with counsel-approved copy before production.`"
  >
    <p>
      These terms govern your use of the platform, including browsing public listings, purchasing tickets when enabled, and accessing organizer tools associated with your account.
    </p>
    <p>
      By using the service you agree to follow applicable laws, respect intellectual property, and use ticketing and payout features only for legitimate events. We may update these terms; continued use after changes constitutes acceptance.
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-500">
      This is placeholder content for demos and development. Consult qualified counsel for enforceable terms.
    </p>
  </PublicContentPage>
</template>
