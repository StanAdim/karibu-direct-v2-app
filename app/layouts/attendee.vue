<script setup lang="ts">
import { getFullName } from '~/types'
import UserAccountMenu from '~/components/common/UserAccountMenu.vue'

const config = useRuntimeConfig()
const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const searchQuery = ref('')

const mainNavItems = [
  { id: 'overview', label: 'Overview', icon: 'grid_view', to: '/attendee' },
  { id: 'events', label: 'Explore Events', icon: 'explore', to: '/attendee/events' },
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
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Mobile menu button -->
    <button
      type="button"
      class="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
      aria-label="Toggle menu"
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">{{ isMobileSidebarOpen ? 'close' : 'menu' }}</span>
    </button>

    <!-- Mobile sidebar backdrop -->
    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Sidebar: fixed on mobile (drawer), static on desktop -->
    <aside
      :class="[
        'fixed lg:static h-full z-40 transition-transform duration-300 ease-out lg:translate-x-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0',
        isSidebarOpen ? 'w-[260px]' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Brand: logo + app name + Attendee Hub -->
      <div class="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <NuxtLink to="/attendee" class="flex items-center gap-3 min-w-0" @click="closeMobileSidebar">
          <div class="size-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-xl">confirmation_number</span>
          </div>
          <div v-if="isSidebarOpen" class="overflow-hidden min-w-0">
            <h1 class="text-slate-900 dark:text-white font-bold text-lg leading-tight truncate">
              {{ config.public.appName }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-xs">Attendee Hub</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in mainNavItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          :title="!isSidebarOpen ? item.label : undefined"
          @click="closeMobileSidebar"
        >
          <span class="material-symbols-outlined text-[22px]">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="text-sm flex-1 truncate">{{ item.label }}</span>
        </NuxtLink>

        <!-- ACCOUNT section -->
        <div
          v-if="isSidebarOpen"
          class="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
        >
          Account
        </div>

        <NuxtLink
          v-for="item in accountNavItems"
          :key="item.id"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
            isActiveRoute(item.to)
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          :title="!isSidebarOpen ? item.label : undefined"
          @click="closeMobileSidebar"
        >
          <span class="material-symbols-outlined text-[22px]">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="text-sm flex-1 truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Collapse (desktop only) -->
      <div class="hidden lg:block p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          class="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span class="material-symbols-outlined">{{ isSidebarOpen ? 'chevron_left' : 'chevron_right' }}</span>
        </button>
      </div>

      <!-- User block at bottom -->
      <div v-if="user && isSidebarOpen" class="p-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <UAvatar
            v-if="user.avatar"
            :src="user.avatar"
            :alt="getFullName(user)"
            size="sm"
            class="border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div
            v-else
            class="size-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0"
          >
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="overflow-hidden min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {{ getFullName(user) }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 min-h-screen flex flex-col min-w-0">
      <!-- Header: search + actions -->
      <header class="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div class="relative flex-1 min-w-0 order-2 sm:order-1 pl-12 sm:pl-0 max-w-full sm:max-w-md">
          <span class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:inline ml-1">search</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search events, venues, or bookings..."
            class="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>

        <div class="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 ml-auto">
          <button
            type="button"
            class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
            aria-label="Notifications"
          >
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <button
            type="button"
            class="hidden sm:flex p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Help"
          >
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <NuxtLink
            to="/attendee/events"
            class="flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Find Events
          </NuxtLink>
          <UserAccountMenu
            :items="userMenuItems"
            :avatar-alt="user ? getFullName(user) : 'Attendee'"
            :avatar-src="user?.avatar"
            :user-email="user?.email"
            subtitle="Attendee"
          />
        </div>
      </header>

      <!-- Page content: consistent padding for all attendee routes -->
      <div class="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>
