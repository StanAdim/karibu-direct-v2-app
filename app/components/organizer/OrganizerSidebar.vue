<script setup lang="ts">
import type { User } from '~/types'
import { getFullName } from '~/types'
import type { OrganizerNavItem } from '~/types/organizer'

const props = defineProps<{
  appName: string
  items: OrganizerNavItem[]
  isSidebarOpen: boolean
  isMobileOpen: boolean
  user: User | null
  activePathForItem: (item: OrganizerNavItem) => string
  isActiveRoute: (path: string) => boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
  'close-mobile': []
}>()
</script>

<template>
  <aside
    :class="[
      'fixed lg:static shrink-0 border-r border-primary-500/10 bg-white dark:bg-slate-900 flex flex-col h-full z-40 transition-all duration-300 lg:translate-x-0',
      isSidebarOpen ? 'w-64' : 'w-20',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="p-4 flex items-center gap-3">
      <NuxtLink
        to="/organizer/dashboard"
        class="flex items-center gap-3"
        @click="emit('close-mobile')"
      >
        <div class="size-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shrink-0">
          <AppLucideIcon name="event_seat" class="text-white text-xl" />
        </div>
      <div v-if="isSidebarOpen" class="overflow-hidden">
          <h1 class="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">{{ appName }}</h1>
          <p class="text-xs text-primary-500 font-semibold uppercase tracking-wider">Organizer</p>
        </div>
      </NuxtLink>
    </div>

    <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="activePathForItem(item)"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-colors',
          isActiveRoute(activePathForItem(item))
            ? 'bg-primary-500/10 text-primary-500 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
        :title="!isSidebarOpen ? item.label : undefined"
        @click="emit('close-mobile')"
      >
        <AppLucideIcon :name="item.icon" class="text-xl shrink-0 text-slate-600 dark:text-slate-400" />
        <span v-if="isSidebarOpen" class="font-medium text-sm truncate">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="hidden lg:block p-4 border-t border-slate-100 dark:border-slate-800">
      <button
        type="button"
        class="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        @click="emit('toggle-collapse')"
      >
        <AppLucideIcon
          :name="isSidebarOpen ? 'chevron_left' : 'chevron_right'"
          class="text-slate-500"
        />
      </button>
    </div>

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
            <AppLucideIcon name="business" class="text-primary-500 text-xl" />
          </div>
          <div class="overflow-hidden min-w-0">
            <p class="text-sm font-bold truncate text-slate-900 dark:text-white">{{ getFullName(user) }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user.primary_role?.name || 'Organizer' }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
