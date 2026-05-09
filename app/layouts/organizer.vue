<script setup lang="ts">
import { getFullName } from '~/types'
import type { OrganizerNavItem } from '~/types/organizer'
import UserAccountMenu from '~/components/common/UserAccountMenu.vue'
import ToastContainer from '~/components/common/ToastContainer.vue'
import OrganizerSidebar from '~/components/organizer/OrganizerSidebar.vue'
import OrganizerHeader from '~/components/organizer/OrganizerHeader.vue'

const config = useRuntimeConfig()
const { user, logout } = useAuth()
const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const searchQuery = ref('')

const navigationItems: OrganizerNavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', to: '/organizer/dashboard' },
  { id: 'organization', label: 'My Organization', icon: 'i-lucide-building', to: '/organizer/organization' },
  { id: 'account', label: 'My account', icon: 'person', to: '/organizer/profile' },
  { id: 'events', label: 'Events', icon: 'calendar_today', to: '/organizer/events' },
  { id: 'tickets', label: 'Tickets', icon: 'confirmation_number', to: '/organizer/ticket-sales' },
  { id: 'attendees', label: 'Attendees', icon: 'group', to: '/organizer/participants' },
  { id: 'analytics', label: 'Analytics', icon: 'i-lucide-bar-chart', to: '/organizer/analytics' },
  { id: 'payouts', label: 'Payouts', icon: 'i-lucide-wallet', to: '/organizer/payouts' },
  { id: 'payments', label: 'Payments', icon: 'payments', to: '/organizer/payments' },
  { id: 'settings', label: 'Settings', icon: 'i-lucide-settings', to: '/organizer/settings' }
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
    label: 'Account settings',
    icon: 'i-lucide-user-cog',
    to: '/organizer/profile/setting'
  }, {
    label: 'Activity',
    icon: 'i-lucide-history',
    to: '/organizer/profile/activity'
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

function activePathForItem(item: OrganizerNavItem): string {
  if (item.id === 'overview') {
    return '/organizer/dashboard'
  }
  return item.to
}

function isActiveRoute(path: string): boolean {
  if (path === '/organizer/dashboard') {
    return route.path === '/organizer/dashboard' || route.path === '/organizer'
  }
  return route.path.startsWith(path)
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

const pageTitle = computed(() => {
  if (route.path.startsWith('/organizer/profile/setting')) return 'Profile settings'
  if (route.path.startsWith('/organizer/profile')) return 'Profile'
  if (route.path.startsWith('/organizer/organization')) return 'My Organization'
  if (route.path.startsWith('/organizer/settings')) return 'Settings'
  if (route.path.startsWith('/organizer/analytics')) return 'Analytics'
  if (route.path.startsWith('/organizer/payouts')) return 'Payouts'
  if (route.path.startsWith('/organizer/dashboard') || route.path === '/organizer') return 'Overview'
  const currentItem = navigationItems.find(item => isActiveRoute(activePathForItem(item)))
  return currentItem?.label || 'Overview'
})
</script>

<template>
  <div class="flex min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark">
    <button
      class="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      type="button"
      aria-label="Toggle sidebar"
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <AppLucideIcon
        :name="isMobileSidebarOpen ? 'close' : 'menu'"
        class="text-xl text-slate-700 dark:text-slate-200"
      />
    </button>

    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
        @click="closeMobileSidebar"
      />
    </Transition>

    <OrganizerSidebar
      :app-name="config.public.appName"
      :items="navigationItems"
      :is-sidebar-open="isSidebarOpen"
      :is-mobile-open="isMobileSidebarOpen"
      :active-path-for-item="activePathForItem"
      :is-active-route="isActiveRoute"
      :user="user"
      @toggle-collapse="isSidebarOpen = !isSidebarOpen"
      @close-mobile="closeMobileSidebar"
    />

    <main class="flex-1 flex flex-col min-w-0">
      <OrganizerHeader
        :title="pageTitle"
        v-model:search="searchQuery"
      >
        <template #actions>
          <UserAccountMenu
            :items="userMenuItems"
            :avatar-alt="user ? getFullName(user) : 'Organizer'"
            :avatar-src="user?.avatar"
            :user-email="user?.email"
            subtitle="Organizer"
          />
        </template>
      </OrganizerHeader>

      <div class="p-4 lg:p-6 space-y-4 flex-1">
        <slot />
      </div>

      <footer class="mt-auto p-4 lg:p-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p class="text-xs text-slate-400 font-medium">
          &copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. Built for professional organizers.
          <a href="#" class="text-primary-500 ml-1 underline underline-offset-2">Terms & Support</a>
        </p>
      </footer>
    </main>

    <ToastContainer />
  </div>
</template>
