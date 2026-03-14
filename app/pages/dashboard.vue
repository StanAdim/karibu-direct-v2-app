<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { user, isAuthenticated } = useAuth()
const { userName, userEmail, userRole, isAdmin } = useUser()

const stats = ref([
  { label: 'Total Users', value: '2,543', icon: 'i-lucide-users', change: '+12%' },
  { label: 'Active Sessions', value: '1,234', icon: 'i-lucide-activity', change: '+5%' },
  { label: 'Revenue', value: '$45,231', icon: 'i-lucide-dollar-sign', change: '+18%' },
  { label: 'Pending Tasks', value: '23', icon: 'i-lucide-list-todo', change: '-8%' }
])

const recentActivity = ref([
  { id: 1, action: 'New user registered', time: '2 minutes ago', icon: 'i-lucide-user-plus' },
  { id: 2, action: 'Payment received', time: '15 minutes ago', icon: 'i-lucide-credit-card' },
  { id: 3, action: 'Order shipped', time: '1 hour ago', icon: 'i-lucide-truck' },
  { id: 4, action: 'Support ticket resolved', time: '2 hours ago', icon: 'i-lucide-check-circle' }
])
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {{ userName }}!
      </h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Here's what's happening with your account today.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <AppCard
        v-for="stat in stats"
        :key="stat.label"
        hoverable
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {{ stat.value }}
            </p>
          </div>
          <div class="rounded-lg bg-primary-100 p-3 dark:bg-primary-900">
            <UIcon
              :name="stat.icon"
              class="size-6 text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>
        <div class="mt-3">
          <span
            :class="[
              'text-sm font-medium',
              stat.change.startsWith('+')
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            ]"
          >
            {{ stat.change }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400"> from last month</span>
        </div>
      </AppCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <AppCard
        title="User Profile"
        icon="i-lucide-user"
      >
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <UAvatar
              :alt="userName || 'User'"
              :src="user?.avatar"
              size="xl"
            />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ userName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ userEmail }}
              </p>
              <UBadge
                :color="isAdmin ? 'error' : 'primary'"
                variant="soft"
                class="mt-2"
              >
                {{ userRole }}
              </UBadge>
            </div>
          </div>

          <USeparator />

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Status
              </p>
              <p class="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                <span class="size-2 rounded-full bg-green-500" />
                Active
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Member Since
              </p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-3">
            <AppButton
              variant="outline"
              size="sm"
              icon="i-lucide-edit"
            >
              Edit Profile
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              icon="i-lucide-settings"
            >
              Settings
            </AppButton>
          </div>
        </template>
      </AppCard>

      <AppCard
        title="Recent Activity"
        icon="i-lucide-activity"
      >
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center gap-4"
          >
            <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
              <UIcon
                :name="activity.icon"
                class="size-5 text-gray-600 dark:text-gray-400"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ activity.action }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ activity.time }}
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <AppButton
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-right"
            icon-position="right"
          >
            View all activity
          </AppButton>
        </template>
      </AppCard>
    </div>

    <AppCard
      v-if="isAdmin"
      title="Admin Panel"
      description="Quick access to administrative functions"
      icon="i-lucide-shield"
      color="warning"
      variant="soft"
    >
      <div class="grid gap-4 sm:grid-cols-3">
        <AppButton
          variant="outline"
          icon="i-lucide-users"
        >
          Manage Users
        </AppButton>
        <AppButton
          variant="outline"
          icon="i-lucide-settings"
        >
          System Settings
        </AppButton>
        <AppButton
          variant="outline"
          icon="i-lucide-bar-chart"
        >
          View Analytics
        </AppButton>
      </div>
    </AppCard>

    <div
      v-if="!isAuthenticated"
      class="rounded-lg border pl-4 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950"
    >
      <p class="text-sm text-yellow-800 dark:text-yellow-200">
        You are viewing this page in demo mode. Some features may be limited.
      </p>
    </div>
  </div>
</template>
