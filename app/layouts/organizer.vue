<script setup lang="ts">
import { getFullName } from '~/types'
import UserAccountMenu from '~/components/common/UserAccountMenu.vue'

const config = useRuntimeConfig()
const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const searchQuery = ref('')

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/organizer' },
  { id: 'events', label: 'Events', icon: 'calendar_today', to: '/organizer/events' },
  { id: 'sessions', label: 'Sessions', icon: 'schedule', to: '/organizer/sessions' },
  { id: 'checkpoints', label: 'Checkpoints', icon: 'qr_code_scanner', to: '/organizer/checkpoints' },
  { id: 'participants', label: 'Participants', icon: 'group', to: '/organizer/participants' },
  { id: 'payments', label: 'Payments', icon: 'payments', to: '/organizer/payments' },
  { id: 'settings', label: 'Settings', icon: 'settings', to: '/organizer/settings' }
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

const pageTitle = computed(() => {
  const currentItem = navigationItems.find(item => isActiveRoute(item.to))
  return currentItem?.label || 'Overview'
})
</script>

<template>
  <div class="flex min-h-screen overflow-x-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
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
        'fixed lg:static flex-shrink-0 border-r border-primary-500/10 bg-white dark:bg-slate-900 flex flex-col h-full z-40 transition-all duration-300 lg:translate-x-0',
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Brand -->
      <div class="p-6 flex items-center gap-3">
        <NuxtLink to="/organizer" class="flex items-center gap-3">
          <div class="size-10 bg-primary-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <span class="material-symbols-outlined">event_seat</span>
          </div>
          <div v-if="isSidebarOpen" class="overflow-hidden">
            <h1 class="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">{{ config.public.appName }}</h1>
            <p class="text-xs text-primary-500 font-semibold uppercase tracking-wider">Organizer</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-500 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          ]"
          :title="!isSidebarOpen ? item.label : undefined"
          @click="closeMobileSidebar"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="font-medium text-sm">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Collapse/Expand Button -->
      <div class="hidden lg:block p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          class="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span class="material-symbols-outlined">{{ isSidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
        </button>
      </div>

      <!-- User Card -->
      <div v-if="user && isSidebarOpen" class="p-4">
        <div class="bg-primary-500/5 rounded-xl p-4 border border-primary-500/10">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Organizer Portal</p>
          <div class="flex items-center gap-3">
            <UAvatar
              v-if="user.avatar"
              :src="user.avatar"
              :alt="getFullName(user)"
              size="sm"
            />
            <div v-else class="size-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
              <span class="material-symbols-outlined">business</span>
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold truncate text-slate-900 dark:text-white">{{ getFullName(user) }}</p>
              <p class="text-xs text-slate-500 truncate">{{ user.roles?.[0] || 'Organizer' }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-primary-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div class="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ pageTitle }}</h2>

          <!-- Search -->
          <div class="max-w-md w-full ml-4 relative hidden md:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events or attendees..."
              class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <button class="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
            <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
            <span class="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </button>

          <!-- Create Event Button -->
          <NuxtLink
            to="/organizer/events/create"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span class="hidden sm:inline">Create Event</span>
          </NuxtLink>

          <!-- User Menu -->
          <UserAccountMenu
            :items="userMenuItems"
            :avatar-alt="user ? getFullName(user) : 'Organizer'"
            :avatar-src="user?.avatar"
            :user-email="user?.email"
            subtitle="Organizer"
          />
        </div>
      </header>

      <!-- Page content -->
      <div class="p-4 lg:p-8 space-y-8 flex-1">
        <slot />
      </div>

      <!-- Footer -->
      <footer class="mt-auto p-4 lg:p-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p class="text-xs text-slate-400 font-medium">
          &copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. Built for professional organizers.
          <a href="#" class="text-primary-500 ml-1 underline underline-offset-2">Terms & Support</a>
        </p>
      </footer>
    </main>
  </div>
</template>
