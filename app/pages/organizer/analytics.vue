<script setup lang="ts">
definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const workspace = useOrganizerWorkspaceStore()

onMounted(() => {
  void workspace.refreshDashboardSummary().catch(() => {})
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Analytics
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Growth and sales insights for your organizer account.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <OrganizerAnalyticsChart
        title="Tickets sold"
        subtitle="Last 7 days (preview)"
      />
      <OrganizerAnalyticsChart
        title="Revenue trend"
        subtitle="Connect reporting API for live numbers"
      />
    </div>

    <OrganizationStats
      :items="[
        { label: 'Total events', value: workspace.dashboardSummary ? String(workspace.dashboardSummary.totalEvents) : '—', hint: 'Workspace scope' },
        { label: 'Published', value: workspace.dashboardSummary ? String(workspace.dashboardSummary.publishedEvents) : '—', hint: 'Live listings' },
        { label: 'Tickets (reg.)', value: workspace.dashboardSummary ? String(workspace.dashboardSummary.ticketsSold) : '—', hint: 'Registration count' },
        { label: 'Upcoming', value: workspace.dashboardSummary ? String(workspace.dashboardSummary.upcomingEvents) : '—', hint: 'Scheduled ahead' },
      ]"
    />
  </div>
</template>
