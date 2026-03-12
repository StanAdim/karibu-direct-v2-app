<script setup lang="ts">
import { getFullName } from '~/types'

const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)

const navigationItems = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/organizer'
  },
  {
    label: 'Events',
    icon: 'i-lucide-calendar',
    to: '/organizer/events',
    children: [
      { label: 'All Events', to: '/organizer/events' },
      { label: 'Create Event', to: '/organizer/events/create' }
    ]
  },
  {
    label: 'Sessions',
    icon: 'i-lucide-presentation',
    to: '/organizer/sessions',
    children: [
      { label: 'All Sessions', to: '/organizer/sessions' },
      { label: 'Create Session', to: '/organizer/sessions/create' }
    ]
  },
  {
    label: 'Checkpoints',
    icon: 'i-lucide-qr-code',
    to: '/organizer/checkpoints'
  },
  {
    label: 'Participants',
    icon: 'i-lucide-users',
    to: '/organizer/participants'
  },
  {
    label: 'Analytics',
    icon: 'i-lucide-bar-chart-3',
    to: '/organizer/analytics'
  }
]

const userMenuItems = computed(() => [
  [{
    label: user.value ? getFullName(user.value) : 'Organizer',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/organizer/profile'
  }, {
    label: 'Organization',
    icon: 'i-lucide-building',
    to: '/organizer/organization'
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/organizer/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    click: logout
  }]
])

function isActiveRoute(path: string): boolean {
  if (path === '/organizer') {
    return route.path === '/organizer'
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
          to="/organizer"
          class="flex items-center gap-3"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
            <UIcon
              name="i-lucide-calendar-check"
              class="h-5 w-5"
            />
          </div>
          <span
            v-if="isSidebarOpen"
            class="text-lg font-bold text-gray-900 dark:text-white"
          >
            Organizer
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
      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <template
          v-for="item in navigationItems"
          :key="item.to"
        >
          <NuxtLink
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

          <!-- Sub-navigation -->
          <div
            v-if="item.children && isSidebarOpen && isActiveRoute(item.to)"
            class="ml-8 mt-1 space-y-1"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              :class="[
                'block rounded-lg px-3 py-2 text-sm transition-colors',
                route.path === child.to
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              ]"
              @click="closeMobileSidebar"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
        </template>
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
              to="/organizer/events/create"
              icon="i-lucide-plus"
              size="sm"
            >
              <span class="hidden sm:inline">New Event</span>
            </UButton>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-bell"
            />

            <UDropdownMenu :items="userMenuItems">
              <UButton
                color="neutral"
                variant="ghost"
                class="gap-2"
              >
                <UAvatar
                  :alt="user ? getFullName(user) : 'Organizer'"
                  :src="user?.avatar"
                  size="xs"
                />
                <span class="hidden sm:inline">{{ user ? getFullName(user) : 'Organizer' }}</span>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="h-4 w-4"
                />
              </UButton>
            </UDropdownMenu>
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
