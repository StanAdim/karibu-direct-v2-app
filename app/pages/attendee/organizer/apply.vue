<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: ['attendee', 'organizer-application-attendee']
})

const organizerApplicationStore = useOrganizerApplicationStore()

const ready = ref(false)

onMounted(async () => {
  await organizerApplicationStore.fetchMine()
  if (organizerApplicationStore.application) {
    await navigateTo('/attendee/organizer/application', { replace: true })
    return
  }
  ready.value = true
})
</script>

<template>
  <div>
    <div
      v-if="!ready"
      class="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex justify-center bg-white dark:bg-slate-900"
    >
      <span class="size-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
    <OrganizerWizard
      v-else
      variant="create"
    />
  </div>
</template>
