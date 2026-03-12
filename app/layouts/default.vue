<script setup lang="ts">
const { user, logout } = useAuth()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8">
          <NuxtLink
            to="/dashboard"
            class="text-xl font-bold text-gray-900 dark:text-white"
          >
            KaribuDirect
          </NuxtLink>

          <nav class="hidden items-center gap-1 md:flex">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              active-class="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            >
              <UIcon
                :name="item.icon"
                class="size-4"
              />
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <UDropdownMenu
            :items="[
              [
                { label: user?.name || 'User', type: 'label' as const }
              ],
              [
                { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
                { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
              ],
              [
                { label: 'Logout', icon: 'i-lucide-log-out', click: logout }
              ]
            ]"
          >
            <UButton
              color="neutral"
              variant="ghost"
              class="rounded-full"
            >
              <UAvatar
                :alt="user?.name || 'User'"
                :src="user?.avatar"
                size="sm"
              />
            </UButton>
          </UDropdownMenu>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} KaribuDirect. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
