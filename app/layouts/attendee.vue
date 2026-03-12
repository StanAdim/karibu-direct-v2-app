<script setup lang="ts">
import { getFullName } from '~/types'

const config = useRuntimeConfig()
const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const searchQuery = ref('')

const mainNavItems = [
  { id: 'overview', label: 'Overview', icon: 'grid_view', to: '/attendee' },
  { id: 'tickets', label: 'My Tickets', icon: 'confirmation_number', to: '/attendee/tickets' },
  { id: 'saved', label: 'Saved Events', icon: 'favorite', to: '/attendee/saved' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar_today', to: '/attendee/schedule' }
]

const accountNavItems = [
  { id: 'profile', label: 'Profile', icon: 'person', to: '/attendee/profile' },
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/attendee/settings' }
]

const userMenuItems = computed(() => [
  [{
    label: user.value ? getFullName(user.value) : 'Attendee',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/attendee/profile'
  }, {
    label: 'My Tickets',
    icon: 'i-lucide-ticket',
    to: '/attendee/tickets'
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/attendee/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    click: logout
  }]
])

function isActiveRoute(path: string): boolean {
  if (path === '/attendee') {
    return route.path === '/attendee'
  }
  return route.path.startsWith(path)
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
    <!-- Mobile menu button -->
    <button
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <span class="material-symbols-outlined">{{ isMobileSidebarOpen ? 'close' : 'menu' }}</span>
    </button>

    <!-- Mobile sidebar backdrop -->
    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static h-full z-40 transition-all duration-300 lg:translate-x-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col',
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Brand -->
      <div class="p-6 flex items-center gap-3">
        <NuxtLink to="/attendee" class="flex items-center gap-3">
          <div class="bg-primary-500 rounded-lg p-2 text-white flex-shrink-0">
            <span class="material-symbols-outlined">confirmation_number</span>
          </div>
          <div v-if="isSidebarOpen" class="overflow-hidden">
            <h1 class="text-slate-900 dark:text-white font-bold text-lg leading-tight truncate">
              {{ config.public.appName }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-xs">Attendee Hub</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        <NuxtLink
          v-for="item in mainNavItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          :title="!isSidebarOpen ? item.label : undefined"
          @click="closeMobileSidebar"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="font-medium text-sm flex-1">{{ item.label }}</span>
        </NuxtLink>

        <!-- Account Section -->
        <div
          v-if="isSidebarOpen"
          class="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
        >
          Account
        </div>

        <NuxtLink
          v-for="item in accountNavItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          :title="!isSidebarOpen ? item.label : undefined"
          @click="closeMobileSidebar"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="font-medium text-sm flex-1">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Collapse Button -->
      <div class="hidden lg:block p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          class="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span class="material-symbols-outlined">{{ isSidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
        </button>
      </div>

      <!-- User Card -->
      <div v-if="user && isSidebarOpen" class="p-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-3 p-2">
          <UAvatar
            v-if="user.avatar"
            :src="user.avatar"
            :alt="getFullName(user)"
            size="sm"
            class="border border-slate-200 dark:border-slate-700"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0"
          >
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {{ getFullName(user) }}
            </p>
            <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 min-h-screen flex flex-col lg:ml-0">
      <!-- Header -->
      <header class="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <!-- Search -->
        <div class="relative w-full max-w-md ml-12 lg:ml-0">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events, venues, or bookings..."
            class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          />
        </div>

        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <button class="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>

          <!-- Help -->
          <button class="hidden sm:flex p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <span class="material-symbols-outlined">help_outline</span>
          </button>

          <div class="hidden sm:block h-6 w-px bg-slate-200 dark:border-slate-700 mx-2" />

          <!-- Find Events Button -->
          <NuxtLink
            to="/attendee/events"
            class="hidden sm:flex bg-primary-500 hover:bg-primary-500/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            Find Events
          </NuxtLink>

          <!-- User Menu -->
          <UDropdownMenu :items="userMenuItems" class="hidden sm:block">
            <UButton
              color="neutral"
              variant="ghost"
              class="gap-2"
            >
              <UAvatar
                :alt="user ? getFullName(user) : 'Attendee'"
                :src="user?.avatar"
                size="xs"
              />
              <UIcon
                name="i-lucide-chevron-down"
                class="h-4 w-4"
              />
            </UButton>
          </UDropdownMenu>
        </div>
      </header>

      <!-- Page content -->
      <div class="p-4 lg:p-8 flex-1">
        <slot />
      </div>
    </main>
  </div>
</template>
