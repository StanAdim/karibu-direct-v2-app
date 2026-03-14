<script setup lang="ts">
import { getFullName } from '~/types'
import UserAccountMenu from '~/components/common/UserAccountMenu.vue'

const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)

const navigationItems = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin'
  },
  {
    label: 'Users',
    icon: 'i-lucide-users',
    to: '/admin/users'
  },
  {
    label: 'Events',
    icon: 'i-lucide-calendar',
    to: '/admin/events'
  },
  {
    label: 'Analytics',
    icon: 'i-lucide-bar-chart-3',
    to: '/admin/analytics'
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }
]

const userMenuItems = computed(() => [
  [{
    label: user.value ? getFullName(user.value) : 'Admin',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/admin/profile'
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    click: logout
  }]
])

function isActiveRoute(path: string): boolean {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Mobile sidebar backdrop -->
    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-40 bg-gray-950/50 lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-3"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
            <UIcon
              name="i-lucide-shield"
              class="h-5 w-5"
            />
          </div>
          <span
            v-if="isSidebarOpen"
            class="text-lg font-bold text-gray-900 dark:text-white"
          >
            Admin
          </span>
        </NuxtLink>
        <UButton
          v-if="isSidebarOpen"
          color="neutral"
          variant="ghost"
          icon="i-lucide-panel-left-close"
          size="sm"
          class="hidden lg:flex"
          @click="isSidebarOpen = false"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 p-4">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActiveRoute(item.to)
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          ]"
          @click="closeMobileSidebar"
        >
          <UIcon
            :name="item.icon"
            class="h-5 w-5 shrink-0"
          />
          <span v-if="isSidebarOpen">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Expand button -->
      <div
        v-if="!isSidebarOpen"
        class="hidden border-t border-gray-200 p-4 dark:border-gray-800 lg:block"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-panel-left-open"
          size="sm"
          @click="isSidebarOpen = true"
        />
      </div>
    </aside>

    <!-- Main content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      ]"
    >
      <!-- Header -->
      <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6">
          <div class="flex items-center gap-4">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              class="lg:hidden"
              @click="isMobileSidebarOpen = true"
            />
          </div>

          <div class="flex items-center gap-4">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-bell"
            />

            <UserAccountMenu
              :items="userMenuItems"
              :avatar-alt="user ? getFullName(user) : 'Admin'"
              :avatar-src="user?.avatar"
              :user-email="user?.email"
              subtitle="Admin"
            />
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
