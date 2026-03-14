<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()

const stats = ref([
  { title: 'Total Users', value: '2,847', icon: 'i-lucide-users', trend: { value: 12, isPositive: true }, color: 'primary' as const },
  { title: 'Active Events', value: '156', icon: 'i-lucide-calendar', trend: { value: 8, isPositive: true }, color: 'success' as const },
  { title: 'Total Tickets', value: '12,456', icon: 'i-lucide-ticket', trend: { value: 5, isPositive: true }, color: 'info' as const },
  { title: 'Revenue', value: '$84,234', icon: 'i-lucide-dollar-sign', trend: { value: 15, isPositive: true }, color: 'warning' as const }
])

const recentActivity = ref([
  { id: '1', type: 'user' as const, title: 'New user registered', description: 'John Doe joined as an attendee', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', type: 'event' as const, title: 'Event published', description: 'Tech Conference 2026 is now live', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', type: 'registration' as const, title: 'Bulk registration', description: '50 attendees registered for DevSummit', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '4', type: 'system' as const, title: 'System update', description: 'Platform upgraded to v2.1.0', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
])

const quickActions = [
  { label: 'Add User', icon: 'i-lucide-user-plus', to: '/admin/users/create' },
  { label: 'View Events', icon: 'i-lucide-calendar', to: '/admin/events' },
  { label: 'Analytics', icon: 'i-lucide-bar-chart-3', to: '/admin/analytics' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/settings' }
]
</script>

<template>
  <div>
    <PageHeader
      title="Admin Dashboard"
      :description="`Welcome back, ${user?.first_name || 'Admin'}. Here's what's happening.`"
    />

    <!-- Stats -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Content Grid -->
    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Activity Feed -->
      <div class="lg:col-span-2">
        <ActivityFeed
          :items="recentActivity"
          title="Recent Activity"
        />
      </div>

      <!-- Quick Actions -->
      <div>
        <QuickActions
          :actions="quickActions"
          title="Quick Actions"
        />
      </div>
    </div>
  </div>
</template>
