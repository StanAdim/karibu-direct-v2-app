<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { getFullName } from '~/types'
import UserAccountMenu from '~/components/common/UserAccountMenu.vue'
import ToastContainer from '~/components/common/ToastContainer.vue'

const { user, logout } = useAuth()
const route = useRoute()
const config = useRuntimeConfig()
const isMobileSidebarOpen = ref(false)
const isDark = useDark()
const adminHeaderSearch = useState<string>('adminHeaderSearch', () => '')

const brandName = computed(() => config.public.appName || 'KaribuDirect')

watch(
  () => route.path,
  (path) => {
    const keepSearch =
      path.startsWith('/admin/events')
      || path.startsWith('/admin/users')
        || path.startsWith('/admin/analytics')
        || path.startsWith('/admin/roles')
      || path.startsWith('/admin/settings')
    if (!keepSearch) {
      adminHeaderSearch.value = ''
    }
  }
)

const headerSearchPlaceholder = computed(() => {
  if (route.path.startsWith('/admin/events')) {
    return 'Search events, organizers...'
  }
  if (route.path.startsWith('/admin/users')) {
    return 'Search for users, emails, or IDs...'
  }
  if (route.path.startsWith('/admin/analytics')) {
    return 'Search transactions, entities...'
  }
  if (route.path.startsWith('/admin/settings')) {
    return 'Search configurations...'
  }
  if (route.path.startsWith('/admin/roles')) {
    return 'Search roles...'
  }
  return 'Search platform data...'
})

const navigationItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Users', icon: 'i-lucide-users', to: '/admin/users' },
  { label: 'Events', icon: 'i-lucide-calendar', to: '/admin/events' },
  { label: 'Finances', icon: 'i-lucide-wallet', to: '/admin/analytics' },
  { label: 'Roles', icon: 'i-lucide-check', to: '/admin/roles' },
  { label: 'System Settings', icon: 'i-lucide-settings', to: '/admin/settings' }
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

const moderatorSubtitle = computed(() => {
  const role = user.value?.primary_role?.name
  if (role === 'Admin') return 'Senior moderator'
  if (role === 'Organizer') return 'Organizer'
  return 'Team member'
})

function isActiveRoute(path: string): boolean {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

function toggleColorMode() {
  isDark.value = !isDark.value
}
</script>

<template>
  <div class="min-h-screen bg-[#e8edf5] dark:bg-gray-950">
    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 z-50 flex h-full w-[272px] flex-col border-r border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0"
      :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="px-4 pb-4 pt-6">
        <NuxtLink
          to="/admin"
          class="block"
          @click="closeMobileSidebar"
        >
          <p class="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
            {{ brandName }}
          </p>
          <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Backoffice Admin
          </p>
        </NuxtLink>
      </div>

      <nav class="flex flex-1 flex-col gap-1 px-4">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors',
            isActiveRoute(item.to)
              ? 'bg-white text-primary-600 shadow-md ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-primary-400 dark:ring-slate-700'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80'
          ]"
          @click="closeMobileSidebar"
        >
          <AppLucideIcon
            :name="item.icon"
            :size="20"
            class="opacity-90"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mt-auto space-y-3 px-4 pb-6">
        <div class="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <AppAvatar
              :src="user?.avatar"
              :alt="user ? getFullName(user) : 'Admin'"
              size="md"
              class="ring-2 ring-white dark:ring-slate-700"
            />
            <div class="min-w-0">
              <p class="truncate font-bold text-slate-900 dark:text-white">
                {{ user ? getFullName(user) : 'Admin User' }}
              </p>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {{ moderatorSubtitle }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
          <a
            href="mailto:support@karibudirect.com"
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <AppLucideIcon
              name="i-lucide-life-buoy"
              :size="16"
            />
            Support
          </a>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            @click="logout"
          >
            <AppLucideIcon
              name="i-lucide-log-out"
              :size="16"
            />
            Logout
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="lg:pl-[272px]">
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-5 lg:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open menu"
              @click="isMobileSidebarOpen = true"
            >
              <AppLucideIcon
                name="i-lucide-menu"
                :size="22"
              />
            </button>
          </div>

          <div class="min-w-0 flex-1">
            <AppSearchInput
              v-model="adminHeaderSearch"
              :placeholder="headerSearchPlaceholder"
              class="w-full max-w-2xl"
            />
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div class="relative">
              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <AppLucideIcon
                  name="i-lucide-bell"
                  :size="22"
                />
              </button>
              <span
                class="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              :title="isDark ? 'Light mode' : 'Dark mode'"
              @click="toggleColorMode"
            >
              <AppLucideIcon
                :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
                :size="22"
              />
            </button>

            <div class="hidden items-center gap-2 sm:flex">
              <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Admin Profile</span>
              <UserAccountMenu
                :items="userMenuItems"
                :avatar-alt="user ? getFullName(user) : 'Admin'"
                :avatar-src="user?.avatar"
                :user-email="user?.email"
                subtitle="Admin"
              />
            </div>
            <div class="sm:hidden">
              <UserAccountMenu
                :items="userMenuItems"
                :avatar-alt="user ? getFullName(user) : 'Admin'"
                :avatar-src="user?.avatar"
                :user-email="user?.email"
                subtitle="Admin"
              />
            </div>
          </div>
        </div>
      </header>

      <main class="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-5 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>
